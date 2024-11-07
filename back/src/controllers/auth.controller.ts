import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import UserRepository from '../repositories/user.repository'
import { ErrorHandler } from '../error'
import {
  SocialLoginProvider,
  ErrorCode,
  SuccessCode,
  User,
  UserPermission,
} from '../types'

const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

class AuthController {
  constructor(
    private uuid: () => string,
    private userRepository: UserRepository,
    private JWT_ENCRYPTION: string,
    private JWT_EXPIRES_IN_SECS: number,
    private SALT_LENGTH_TO_GENERATE: number,
    private sgMail: any,
  ) {}

  public async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, permission } = req.body as User

      if (!email || !password) {
        throw new ErrorHandler(ErrorCode.Forbidden, 'Missing values')
      }

      if (password.length < 6) {
        throw new ErrorHandler(
          ErrorCode.Forbidden,
          'Password must be at least 6 characters long',
        )
      }

      const isValidEmail = emailRegex.test(email)

      if (!isValidEmail) {
        throw new ErrorHandler(ErrorCode.Forbidden, 'Invalid email address')
      }

      const existingUser = await this.userRepository.getUserByEmail(email)

      if (existingUser !== null) {
        throw new ErrorHandler(ErrorCode.Forbidden, 'Email already exists')
      }

      const hashedPassword = bcrypt.hashSync(
        password,
        this.SALT_LENGTH_TO_GENERATE,
      )

      const newUser = await this.userRepository.register({
        email,
        password: hashedPassword,
        permission: permission ? permission : UserPermission.Client,
      })

      const invitationToken = this.uuid()
      const url = `http://localhost:4000/confirm/${invitationToken}`

      const msg = {
        to: email,
        from: 'no_reply@example.com',
        subject: 'No Reply',
        html: `
          <a href="${url}">
            Confirm Email Address
          </a>
        `,
      }

      try {
        await this.sgMail.send(msg)
      } catch (error) {
        console.error('Unable to send confirmation email')
      }

      const userWithToken = await this.userRepository.updateUser(newUser._id, {
        invitationToken,
      })

      return res.status(SuccessCode.Created).send(userWithToken)
    } catch (error) {
      return next(error)
    }
  }

  public async registerWithGithub(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const token = await this.registerWithSocialMedia(
        SocialLoginProvider.GitHub,
        req.query.code,
      )

      return res.redirect(
        `http://localhost:3000/login?${
          token ? 'token=' + token : 'social=success'
        }`,
      )
    } catch (error) {
      return next(error)
    }
  }

  public async registerWithFacebook(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const token = await this.registerWithSocialMedia(
        SocialLoginProvider.Facebook,
        req.query.code,
      )

      return res.redirect(
        `http://localhost:3000/login?${
          token ? 'token=' + token : 'social=success'
        }`,
      )
    } catch (error) {
      return next(error)
    }
  }

  public async confirmEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { confirmationToken } = req.params

      if (!confirmationToken) {
        throw new ErrorHandler(ErrorCode.Forbidden, 'No token provided')
      }

      const user = await this.userRepository.getUserByInvitationToken(
        confirmationToken,
      )

      if (user === null) {
        throw new ErrorHandler(ErrorCode.Forbidden, 'Invalid token provided')
      }

      const token = this.createSecureTokenFor(user._id)

      await this.userRepository.updateUser(user._id, {
        token,
        isVerified: true,
      })

      return res.redirect(`http://localhost:3000/login?token=${token}`)
    } catch (error) {
      return next(error)
    }
  }

  public async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body as Partial<User>

      if (!email || !password) {
        throw new ErrorHandler(ErrorCode.Forbidden, 'Missing values')
      }

      const user = await this.userRepository.getUserByEmail(email)

      if (user === null) {
        throw new ErrorHandler(
          ErrorCode.Forbidden,
          'Invalid email/password combination',
        )
      }

      if (!user.isVerified) {
        throw new ErrorHandler(ErrorCode.Forbidden, 'Unverified user')
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password)

      if (!isPasswordCorrect) {
        throw new ErrorHandler(
          ErrorCode.Forbidden,
          'Invalid email/password combination',
        )
      }

      const token = this.createSecureTokenFor(user._id)

      await this.userRepository.setToken(user._id, token)

      return res.status(SuccessCode.OK).send({
        _id: user._id,
        email: user.email,
        avatar: user.avatar,
        permission: user.permission,
        isVerified: user.isVerified,
        token: user.token,
      })
    } catch (error) {
      return next(error)
    }
  }

  public async loginWithToken(token: string) {
    try {
      const data = jwt.verify(token, this.JWT_ENCRYPTION) as {
        userId: string
        exp: string
      }

      if (!('userId' in data)) {
        throw new ErrorHandler(
          ErrorCode.Forbidden,
          'Token does not contain userId.',
        )
      }

      if (!data.hasOwnProperty('exp')) {
        throw new ErrorHandler(
          ErrorCode.Forbidden,
          'Token does not contain expiration date.',
        )
      }

      const now = Date.now()
      const exp = new Date(data.exp).getTime() * 1000 // Format to milliseconds

      const isExpired = exp < now

      if (isExpired) {
        throw new ErrorHandler(ErrorCode.Forbidden, 'Token is expired.')
      }

      return await this.userRepository.getUserById(data.userId)
    } catch (error) {
      return null
    }
  }

  private async registerWithSocialMedia(
    provider: SocialLoginProvider,
    oauthCode: string,
  ) {
    try {
      const accessToken =
        provider === SocialLoginProvider.GitHub
          ? await this.getAccessTokenFromGithub(oauthCode)
          : await this.getAccessTokenFromFacebook(oauthCode)

      const [email, avatar] =
        provider === SocialLoginProvider.GitHub
          ? await this.getUserDataFromGithub(accessToken)
          : await this.getUserDataFromFacebook(accessToken)

      const user = await this.userRepository.getUserByEmail(email)

      if (user) {
        return user.token
      }

      const newUser = await this.userRepository.register({
        email,
        avatar,
      })

      const token = this.createSecureTokenFor(newUser._id)
      const password = this.uuid()
      const hashedPassword = bcrypt.hashSync(
        password,
        this.SALT_LENGTH_TO_GENERATE,
      )

      const invitationToken = this.uuid()
      const url = `http://localhost:4000/confirm/${invitationToken}`

      const msg = {
        to: email,
        from: 'no_reply@example.com',
        subject: 'No Reply',
        html: `
            <a href="${url}">
              Confirm Email Address
            </a>
            <br />
            <span>This is your temporary password: ${password}</span>
            <br />
            <span>It is recommended that you change it immediately.</span>
          `,
      }

      try {
        await this.sgMail.send(msg)
      } catch (error) {
        console.error('Unable to send confirmation email')
      }

      await this.userRepository.updateUser(newUser._id, {
        token,
        password: hashedPassword,
        invitationToken,
      })

      return null
    } catch (error) {
      throw new Error(error)
    }
  }

  private async getAccessTokenFromGithub(
    requestToken: string,
  ): Promise<string> {
    try {
      const { data } = await axios({
        method: 'post',
        url: `https://github.com/login/oauth/access_token?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}&code=${requestToken}`,
        headers: {
          accept: 'application/json',
        },
      })

      if (!data.access_token) {
        throw new Error('Missing token from OAuth provider')
      }

      return data.access_token
    } catch (error) {
      throw new Error(error)
    }
  }

  private async getAccessTokenFromFacebook(
    requestToken: string,
  ): Promise<string> {
    try {
      const { data } = await axios({
        method: 'get',
        url: `https://graph.facebook.com/v5.0/oauth/access_token?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=http://localhost:4000/register/facebook&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&code=${requestToken}`,
      })

      if (!data.access_token) {
        throw new Error('Missing token from OAuth provider')
      }

      return data.access_token
    } catch (error) {
      throw new Error(error)
    }
  }

  private async getUserDataFromGithub(
    accessToken: string,
  ): Promise<[string, string]> {
    try {
      const response = await axios({
        method: 'get',
        url: `https://api.github.com/user`,
        headers: {
          Authorization: `token ${accessToken}`,
        },
      })

      const { email, avatar_url } = response.data
      return [email, avatar_url]
    } catch (error) {
      throw new Error(error)
    }
  }

  private async getUserDataFromFacebook(
    accessToken: string,
  ): Promise<[string, string]> {
    const userResponse = await axios({
      method: 'get',
      url: `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${process.env.FACEBOOK_CLIENT_ID}|${process.env.FACEBOOK_CLIENT_SECRET}`,
    })

    const userId = userResponse.data.data.user_id
    const emailURL = `https://graph.facebook.com/v5.0/${userId}?access_token=${accessToken}&fields=email`
    const pictureURL = `https://graph.facebook.com/v5.0/${userId}/picture?access_token=${accessToken}&height=500&redirect=false`

    const [emailResponse, pictureResponse] = await Promise.all([
      await axios({
        method: 'get',
        url: emailURL,
      }),
      await axios({
        method: 'get',
        url: pictureURL,
      }),
    ])

    const { email } = emailResponse.data
    const avatar = pictureResponse.data.data.url

    return [email, avatar]
  }

  private createSecureTokenFor(userId: string) {
    return jwt.sign({ userId }, this.JWT_ENCRYPTION, {
      expiresIn: this.JWT_EXPIRES_IN_SECS,
    })
  }
}

export default AuthController
