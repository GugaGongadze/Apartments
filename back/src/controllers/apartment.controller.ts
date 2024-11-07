import ApartmentRepository from '../repositories/apartment.repository'
import { Request, Response, NextFunction } from 'express'
import { ErrorHandler } from '../error'
import {
  ErrorCode,
  SuccessCode,
  UserPermission,
  RequestWithUser,
} from '../types'

class ApartmentController {
  constructor(private apartmentRepository: ApartmentRepository) {}

  public async listApartments(
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const isClient = req.user!.permission === UserPermission.Client

      const apartments = await this.apartmentRepository.listApartments(isClient)
      return res.status(SuccessCode.OK).send(apartments)
    } catch (error) {
      return next(error)
    }
  }

  public async createApartment(
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const {
        name,
        description,
        area,
        price,
        rooms,
        longitude,
        latitude,
        rentable,
        user,
      } = req.body

      const isAdminCreatingApartment =
        req.user!.permission === UserPermission.Admin

      if (
        name === undefined ||
        description === undefined ||
        area === undefined ||
        price === undefined ||
        rooms === undefined ||
        longitude === undefined ||
        latitude === undefined ||
        (isAdminCreatingApartment && user === undefined)
      ) {
        throw new ErrorHandler(ErrorCode.Forbidden, 'Missing Values')
      }

      if (
        name.length === 0 ||
        description.length === 0 ||
        area < 1 ||
        price < 1 ||
        rooms < 1 ||
        longitude < -180 ||
        longitude > 180 ||
        latitude < -90 ||
        latitude > 90
      ) {
        throw new ErrorHandler(ErrorCode.BadRequest, 'Incorrect values')
      }

      const apartment = await this.apartmentRepository.createApartment({
        name,
        description,
        area,
        price,
        rooms,
        longitude,
        latitude,
        rentable,
        realtor: isAdminCreatingApartment ? user : req.user!._id,
      })

      return res.status(SuccessCode.Created).send(apartment)
    } catch (error) {
      return next(error)
    }
  }

  public async updateApartment(
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { apartmentId } = req.params

      if (!apartmentId) {
        throw new ErrorHandler(ErrorCode.Forbidden, 'Missing values')
      }

      const {
        name,
        description,
        area,
        price,
        rooms,
        longitude,
        latitude,
      } = req.body

      if (
        (name && name.length === 0) ||
        (description && description.length === 0) ||
        area < 1 ||
        price < 1 ||
        rooms < 1 ||
        longitude < -180 ||
        longitude > 180 ||
        latitude < -90 ||
        latitude > 90
      ) {
        throw new ErrorHandler(ErrorCode.BadRequest, 'Incorrect values')
      }

      const isAdminUpdatingApartment =
        req.user!.permission === UserPermission.Admin

      const updatedApartment = await this.apartmentRepository.updateApartment(
        apartmentId,
        {
          ...req.body,
          realtor: isAdminUpdatingApartment ? req.body.user : req.user!._id,
        },
      )

      return res.status(SuccessCode.OK).send(updatedApartment)
    } catch (error) {
      return next(error)
    }
  }

  public async deleteApartment(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { apartmentId } = req.params

      if (!apartmentId) {
        throw new ErrorHandler(ErrorCode.Forbidden, 'Missing values')
      }

      await this.apartmentRepository.deleteApartment(apartmentId)
      return res.status(SuccessCode.NoContent).end()
    } catch (error) {
      return next(error)
    }
  }
}

export default ApartmentController
