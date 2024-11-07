import uuid from 'uuid/v4'
import sgMail from '@sendgrid/mail'
import UserController from './controllers/user.controller'
import UserRepository from './repositories/user.repository'
import ApartmentRepository from './repositories/apartment.repository'
import models from './models'
import ApartmentController from './controllers/apartment.controller'
import { Aws } from './controllers/aws.controller'
import AuthController from './controllers/auth.controller'

export interface Application {
  userRepository: UserRepository
  userController: UserController
  apartmentRepository: ApartmentRepository
  apartmentController: ApartmentController
  awsController: Aws
  authController: AuthController
}

export function createApp(): Application {
  const jwt = {
    privateKey: process.env.JWT_ENCRYPTION!,
    expiresInSec: 14 * 24 * 60 * 60, // 2 weeks
    saltLength: 10,
  }

  const aws = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    bucket: 'apartment-listings',
    prefix: 'uploads/',
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

  const userRepository = new UserRepository(models.User)
  const apartmentRepository = new ApartmentRepository(models.Apartment)

  const authController = new AuthController(
    uuid,
    userRepository,
    jwt.privateKey,
    jwt.expiresInSec,
    jwt.saltLength,
    sgMail,
  )
  const userController = new UserController(
    uuid,
    sgMail,
    userRepository,
    jwt.saltLength,
  )
  const apartmentController = new ApartmentController(apartmentRepository)
  const awsController = new Aws(aws, userRepository, uuid)

  return {
    userRepository,
    userController,
    apartmentRepository,
    apartmentController,
    awsController,
    authController,
  }
}
