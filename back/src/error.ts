import { Response } from 'express'

export class ErrorHandler extends Error {
  public statusCode: number
  public message: string

  constructor(statusCode: number, message: string) {
    super()
    this.statusCode = statusCode
    this.message = message
  }
}

export const handleError = (err: ErrorHandler, res: Response) => {
  const { statusCode, message } = err
  console.log('ERROR', message)
  if (!res.headersSent) {
    return res.status(statusCode).json({
      message,
    })
  }
  return
}
