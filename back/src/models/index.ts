import mongoose from 'mongoose'
import User from './user.model'
import Apartment from './apartment.model'

const connectDb = () => {
  return mongoose.connect(process.env.DATABASE_URL!, {
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
}

const models = { User, Apartment }

export { connectDb }

export default models
