import chai from 'chai'
import chaiHttp from 'chai-http'

import {
  host,
  testClientToken,
  newApartment,
  testRealtorToken,
  testAdminToken,
  testRealtorId,
} from './test.utils'
import { ErrorCode, SuccessCode } from '../types'

chai.should()
chai.use(chaiHttp)

describe('Apartments', () => {
  describe('GET Apartments', () => {
    it('should not let unauthorized user list apartments', done => {
      chai
        .request(host)
        .get('/apartments')
        .end((err, res) => {
          res.should.have.status(ErrorCode.Unauthorized)
          done()
        })
    })

    it('should let users list all apartments', done => {
      chai
        .request(host)
        .get('/apartments')
        .set('authorization', `Bearer ${testRealtorToken}`)
        .end((err, res) => {
          res.should.have.status(SuccessCode.OK)
          res.body.should.be.an('array')
          done()
        })
    })
  })
  describe('POST Apartments', () => {
    it('should not let client create an apartment listing', done => {
      chai
        .request(host)
        .post('/apartments')
        .send(newApartment)
        .set('authorization', `Bearer ${testClientToken}`)
        .end((err, res) => {
          res.should.have.status(ErrorCode.Forbidden)
          done()
        })
    })

    it('should let realtors create an apartment listing', done => {
      chai
        .request(host)
        .post('/apartments')
        .send(newApartment)
        .set('authorization', `Bearer ${testRealtorToken}`)
        .end((err, res) => {
          res.should.have.status(SuccessCode.Created)
          res.body.should.have.property('name')
          done()
        })
    })

    it('should let admins create an apartment listing', done => {
      chai
        .request(host)
        .post('/apartments')
        .send({ ...newApartment, user: testRealtorId })
        .set('authorization', `Bearer ${testAdminToken}`)
        .end((err, res) => {
          res.should.have.status(SuccessCode.Created)
          res.body.should.have.property('name')
          done()
        })
    })

    it('should not let one create listing with incorrect area', done => {
      chai
        .request(host)
        .post('/apartments')
        .send({ ...newApartment, area: 0 })
        .set('authorization', `Bearer ${testRealtorToken}`)
        .end((err, res) => {
          res.should.have.status(ErrorCode.BadRequest)
          res.body.should.be.an('object')
          res.body.should.have.property('message')
          res.body.message.should.eql('Incorrect values')

          done()
        })
    })

    it('should not let one create listing with incorrect price', done => {
      chai
        .request(host)
        .post('/apartments')
        .send({ ...newApartment, price: 0 })
        .set('authorization', `Bearer ${testRealtorToken}`)
        .end((err, res) => {
          res.should.have.status(ErrorCode.BadRequest)
          res.body.should.be.an('object')
          res.body.should.have.property('message')
          res.body.message.should.eql('Incorrect values')

          done()
        })
    })

    it('should not let one create listing with incorrect rooms', done => {
      chai
        .request(host)
        .post('/apartments')
        .send({ ...newApartment, rooms: 0 })
        .set('authorization', `Bearer ${testRealtorToken}`)
        .end((err, res) => {
          res.should.have.status(ErrorCode.BadRequest)
          res.body.should.be.an('object')
          res.body.should.have.property('message')
          res.body.message.should.eql('Incorrect values')

          done()
        })
    })

    it('should not let one create listing with incorrect longitude', done => {
      chai
        .request(host)
        .post('/apartments')
        .send({ ...newApartment, longitude: 200 })
        .set('authorization', `Bearer ${testRealtorToken}`)
        .end((err, res) => {
          res.should.have.status(ErrorCode.BadRequest)
          res.body.should.be.an('object')
          res.body.should.have.property('message')
          res.body.message.should.eql('Incorrect values')

          done()
        })
    })

    it('should not let one create listing with incorrect latitude', done => {
      chai
        .request(host)
        .post('/apartments')
        .send({ ...newApartment, latitude: 100 })
        .set('authorization', `Bearer ${testRealtorToken}`)
        .end((err, res) => {
          res.should.have.status(ErrorCode.BadRequest)
          res.body.should.be.an('object')
          res.body.should.have.property('message')
          res.body.message.should.eql('Incorrect values')

          done()
        })
    })
  })

  describe('PUT Apartments', () => {
    it('should not let clients edit apartment listings', done => {
      chai
        .request(host)
        .post('/apartments')
        .send(newApartment)
        .set('authorization', `Bearer ${testRealtorToken}`)
        .then(postResponse => {
          chai
            .request(host)
            .put(`/apartments/${postResponse.body._id}`)
            .send({ rooms: 5 })
            .set('authorization', `Bearer ${testClientToken}`)
            .end((err, res) => {
              res.should.have.status(ErrorCode.Forbidden)
              done()
            })
        })
    })

    it('should let non clients edit apartment listings', done => {
      chai
        .request(host)
        .post('/apartments')
        .send(newApartment)
        .set('authorization', `Bearer ${testRealtorToken}`)
        .then(postResponse => {
          chai
            .request(host)
            .put(`/apartments/${postResponse.body._id}`)
            .send({ rooms: 5 })
            .set('authorization', `Bearer ${testRealtorToken}`)
            .end((err, res) => {
              res.should.have.status(SuccessCode.OK)
              res.body.should.have.property('rooms')
              res.body.rooms.should.eql(5)
              done()
            })
        })
    })
  })
  describe('DELETE Apartments', () => {
    it('should not let clients delete apartment listings', done => {
      chai
        .request(host)
        .post('/apartments')
        .send(newApartment)
        .set('authorization', `Bearer ${testRealtorToken}`)
        .then(postResponse => {
          chai
            .request(host)
            .delete(`/apartments/${postResponse.body._id}`)
            .set('authorization', `Bearer ${testClientToken}`)
            .end((err, res) => {
              res.should.have.status(ErrorCode.Forbidden)
              done()
            })
        })
    })

    it('should let non clients delete apartment listings', done => {
      chai
        .request(host)
        .post('/apartments')
        .send(newApartment)
        .set('authorization', `Bearer ${testRealtorToken}`)
        .then(postResponse => {
          chai
            .request(host)
            .delete(`/apartments/${postResponse.body._id}`)
            .set('authorization', `Bearer ${testAdminToken}`)
            .end((err, res) => {
              res.should.have.status(SuccessCode.NoContent)
              done()
            })
        })
    })
  })
})
