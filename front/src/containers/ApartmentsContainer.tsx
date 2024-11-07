import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Modal from '@material-ui/core/Modal'
import DialogContent from '@material-ui/core/DialogContent'
import Container from '@material-ui/core/Container'
import { Theme } from '@material-ui/core'
import Drawer from '@material-ui/core/Drawer'
import { makeStyles } from '@material-ui/styles'
import useApi from '../hooks/api.hook'
import ApartmentsList from '../components/ApartmentsList'
import ApartmentDetail from '../components/ApartmentDetail'
import ApartmentFilters from '../components/ApartmentFilters'
import MapView from '../components/MapView'
import { Apartment, UserPermission, User, ListingFilters } from '../types'
import { useSnackbar } from 'notistack'

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    marginTop: theme.spacing(8),
    marginLeft: 24,
    padding: theme.spacing(3),
  },
  mapContainer: {
    width: '50vw',
  },
}))

interface ApartmentsContainerProps {
  user: User
}

export default function ApartmentsContainer(props: ApartmentsContainerProps) {
  const classes = useStyles()
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [currApartment, setCurrApartment] = useState<Apartment | null>(null)
  const [newApartmentModalOpen, setNewApartmentModalOpen] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const { listApartments, listUsers } = useApi()
  const [users, setUsers] = useState<User[]>([])

  const [filters, setFilters] = useState<ListingFilters>({
    areaFrom: 0,
    areaTo: 1000,
    rooms: 0,
    priceFrom: 0,
    priceTo: 100_000,
  })

  const getApartments = useCallback(async () => {
    const res = await listApartments()

    if (!res) {
      setApartments([])
    } else {
      setApartments(res.data)
    }
  }, [listApartments])

  const getUsers = useCallback(async () => {
    try {
      const response = await listUsers('/users')
      if (response) {
        setUsers(response.data)
      }
    } catch (error) {
      enqueueSnackbar(error.response.data.message, { variant: 'error' })
    }
  }, [listUsers, enqueueSnackbar])

  const isClient = props.user.permission === UserPermission.Client
  const isAdmin = props.user.permission === UserPermission.Admin
  const isRealtor = props.user.permission === UserPermission.Realtor

  useEffect(() => {
    getApartments()
  }, [getApartments])

  useEffect(() => {
    if (isAdmin) {
      getUsers()
    }
  }, [getUsers])

  const onEditApartment = useCallback(apartment => {
    setCurrApartment(apartment)
    setNewApartmentModalOpen(true)
  }, [])

  const filteredApartments = useMemo(
    () =>
      apartments.filter(apartment => {
        if (apartment.area < filters.areaFrom) return false
        if (apartment.area > filters.areaTo) return false
        if (apartment.price < filters.priceFrom) return false
        if (apartment.price > filters.priceTo) return false

        // If specific rooms filter was provided filter by it
        // else return all apartments with more than 5 rooms
        if (filters.rooms > 0) {
          return filters.rooms > 4
            ? apartment.rooms >= 5
            : apartment.rooms === filters.rooms
        }

        return true
      }),
    [apartments, filters]
  )

  const onApartmentSubmit = () => {
    getApartments()
    setCurrApartment(null)
    setNewApartmentModalOpen(false)
  }

  const realtors = users.filter(
    user => user.permission === UserPermission.Realtor
  )

  return (
    <Container className={classes.container}>
      <ApartmentFilters
        isClient={isClient}
        areTheAnyRealtors={isRealtor || realtors.length > 0}
        filters={filters}
        setFilters={setFilters}
        setMapOpen={setMapOpen}
        setNewApartmentModalOpen={setNewApartmentModalOpen}
      />
      <ApartmentsList
        apartments={filteredApartments}
        onEditApartment={onEditApartment}
        isClient={isClient}
      />
      <Drawer anchor="right" open={mapOpen} onClose={() => setMapOpen(false)}>
        <div className={classes.mapContainer} role="presentation">
          <MapView filteredApartments={filteredApartments} />
        </div>
      </Drawer>
      {!isClient && (
        <Modal
          open={newApartmentModalOpen}
          onClose={() => {
            setCurrApartment(null)
            setNewApartmentModalOpen(false)
          }}
        >
          <DialogContent>
            <ApartmentDetail
              apartment={currApartment}
              onApartmentSubmit={onApartmentSubmit}
              user={props.user}
              realtors={realtors}
            />
          </DialogContent>
        </Modal>
      )}
    </Container>
  )
}
