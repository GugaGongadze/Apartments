import { Document } from 'mongoose'
import { Request } from 'express'

export enum SocialLoginProvider {
  GitHub = 'GitHub',
  Facebook = 'Facebook',
}

export enum SuccessCode {
  OK = 200,
  Created = 201,
  NoContent = 204,
}

export enum ErrorCode {
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
}

export enum UserPermission {
  Client = 'client',
  Realtor = 'realtor',
  Admin = 'admin',
}

export interface User extends Document {
  email: string
  password: string
  token: string
  invitationToken: string
  avatar: string
  permission: UserPermission
  isVerified: boolean
}

export interface AwsOptions {
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  prefix: string
}

export interface Apartment extends Document {
  name: string
  description: string
  area: number
  price: number
  rooms: number
  longitude: number
  latitude: number
  realtor: string
  rentable: boolean
}

export interface RequestWithUser extends Request {
  user?: User
}
