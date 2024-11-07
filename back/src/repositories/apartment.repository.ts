import { Model } from 'mongoose'
import { Apartment } from '../types'

class ApartmentRepository {
  constructor(private apartmentModel: Model<Apartment, {}>) {}

  public async getApartmentById(
    apartmentId: string,
  ): Promise<Apartment | null> {
    return await this.apartmentModel.findOne({
      _id: apartmentId,
    })
  }

  public async listApartments(isClient: boolean): Promise<Apartment[]> {
    return await this.apartmentModel
      .find(isClient ? { rentable: true } : {})
      .populate('realtor', 'email avatar permission')
      .sort({ updatedAt: -1 })
  }

  public async createApartment(data: Partial<Apartment>): Promise<Apartment> {
    const apartment = new this.apartmentModel(data)
    return await apartment.save()
  }

  public async updateApartment(
    apartmentId: string,
    data: Partial<Apartment>,
  ): Promise<Apartment | null> {
    return await this.apartmentModel.findOneAndUpdate(
      { _id: apartmentId },
      data,
      {
        new: true,
      },
    )
  }

  public async deleteApartment(apartmentId: string) {
    await this.apartmentModel.findOneAndDelete({ _id: apartmentId })
  }
}

export default ApartmentRepository
