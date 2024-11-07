export enum UserPermission {
  Client = 'client',
  Realtor = 'realtor',
  Admin = 'admin',
}

export interface User {
  _id: string
  email: string
  password: string
  token: string
  avatar: string
  isVerified: boolean
  permission: UserPermission
}

export interface Apartment {
  _id: string
  createdAt: string
  name: string
  description: string
  area: number
  price: number
  rooms: number
  longitude: number
  latitude: number
  realtor: User
  rentable: boolean
}

export type ApartmentDetails = Omit<
  Apartment,
  '_id' | 'realtor' | 'createdAt'
> & { realtorId: string }

export interface ListingFilters {
  areaFrom: number
  areaTo: number
  rooms: number
  priceFrom: number
  priceTo: number
}
