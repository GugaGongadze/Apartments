import { S3 } from 'aws-sdk'
import multer from 'multer'
import multerS3 from 'multer-s3'
import path from 'path'
import { Request, Response, NextFunction } from 'express'
import UserRepository from '../repositories/user.repository'
import { ErrorHandler } from '../error'
import { ErrorCode, AwsOptions } from '../types'

export class Aws {
  public s3: S3
  public bucket: string
  public prefix: string

  constructor(
    options: AwsOptions,
    private userRepository: UserRepository,
    private uuid: () => string,
  ) {
    this.s3 = new S3({
      accessKeyId: options.accessKeyId,
      secretAccessKey: options.secretAccessKey,
      region: 'eu-central-1',
    })
    this.bucket = options.bucket
    this.prefix = options.prefix
  }

  public async uploadImage(
    request: Request,
    response: Response,
    next: NextFunction,
  ) {
    try {
      const { userId } = request.params
      const singleUpload = this.upload().single('file')

      singleUpload(request, response, async err => {
        if (err) {
          throw new ErrorHandler(
            ErrorCode.BadRequest,
            'Unable to upload image.',
          )
        }

        const file = response.req!.file as Express.MulterS3.File

        const updatedUser = await this.userRepository.updateUser(userId, {
          avatar: file.location,
        })

        return response.send(updatedUser)
      })
    } catch (error) {
      return next(error)
    }
  }

  public upload(): multer.Instance {
    const uuid = this.uuid
    const s3 = this.s3
    const bucket = this.bucket
    const prefix = this.prefix

    return multer({
      limits: {
        files: 1,
        // fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter(_, file, callback) {
        const whiteList = [
          { ext: '.jpg', mimeType: 'image/jpeg' },
          { ext: '.jpeg', mimeType: 'image/jpeg' },
          { ext: '.png', mimeType: 'image/png' },
        ]

        const ext = path.extname(file.originalname)
        const mimeType = file.mimetype

        const match = whiteList.find(
          x => x.ext === ext && x.mimeType === mimeType,
        )

        if (match === undefined) {
          callback(
            new Error(`Unsupported image format: (${mimeType}, ${ext})`),
            false,
          )
        } else {
          callback(null, true)
        }
      },
      storage: multerS3({
        s3,
        bucket,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata(req, file, cb) {
          cb(null)
        },
        key(_, file, cb) {
          const ext = file.mimetype.slice(file.mimetype.indexOf('/') + 1)
          const fileName = `${prefix}${uuid()}.${ext}`
          cb(null, fileName)
        },
      }),
    })
  }
}
