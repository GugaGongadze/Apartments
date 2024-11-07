import { Express, Request, Response, NextFunction } from 'express'
import { Application } from './app'
import { SuccessCode, RequestWithUser } from './types'

export default function injectRoutes(app: Application, server: Express) {
  server.get('/ping', (_, res) => res.end('ok'))

  server.get('/auth', (req: RequestWithUser, res) =>
    res.status(SuccessCode.OK).send(req.user),
  )
  server.post('/login', (req, res, next) =>
    app.authController.login(req, res, next),
  )
  server.post('/register', (req, res, next) =>
    app.authController.register(req, res, next),
  )
  server.get('/confirm/:confirmationToken', (req, res, next) =>
    app.authController.confirmEmail(req, res, next),
  )
  server.get('/register/github', (req, res, next) =>
    app.authController.registerWithGithub(req, res, next),
  )
  server.get('/register/facebook', (req, res, next) =>
    app.authController.registerWithFacebook(req, res, next),
  )

  server.get('/apartments', (req, res, next) =>
    app.apartmentController.listApartments(req, res, next),
  )
  server.post('/apartments', (req, res, next) =>
    app.apartmentController.createApartment(req, res, next),
  )
  server.put('/apartments/:apartmentId', (req, res, next) =>
    app.apartmentController.updateApartment(req, res, next),
  )
  server.delete('/apartments/:apartmentId', (req, res, next) =>
    app.apartmentController.deleteApartment(req, res, next),
  )

  server.get('/users', (req, res, next) =>
    app.userController.listUsers(req, res, next),
  )
  server.post('/users', (req, res, next) =>
    app.userController.createUser(req, res, next),
  )
  server.put('/users/:userId', (req, res, next) =>
    app.userController.updateUser(req, res, next),
  )
  server.delete('/users/:userId', (req, res, next) =>
    app.userController.deleteUser(req, res, next),
  )

  server.post(
    '/users/:userId/image-upload',
    (req: Request, res: Response, next: NextFunction) =>
      app.awsController.uploadImage(req, res, next),
  )
}
