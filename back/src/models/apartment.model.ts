import mongoose from 'mongoose'
import { Apartment } from '../types'

const apartmentSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    area: Number,
    price: Number,
    rooms: Number,
    longitude: Number,
    latitude: Number,
    realtor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rentable: { type: Boolean, default: true },
  },
  { timestamps: true },
)

const Apartment = mongoose.model<Apartment>('Apartment', apartmentSchema)

export default Apartment
