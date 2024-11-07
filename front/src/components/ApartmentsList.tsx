import React, { useState } from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Tooltip from '@material-ui/core/Tooltip'
import EditIcon from '@material-ui/icons/Edit'
import { makeStyles } from '@material-ui/styles'
import Pagination from './Pagination'
import { Apartment } from '../types'

const useStyles = makeStyles({
  apartmentsTable: {
    margin: '20px 0',
  },
  edit: {
    cursor: 'pointer',
  },
})

interface ApartmentsListProps {
  apartments: Apartment[]
  onEditApartment: (apartment: Apartment) => void
  isClient: boolean
}

const APARTMENTS_PER_PAGE = 10

function ApartmentsList(props: ApartmentsListProps) {
  const { apartments, onEditApartment, isClient } = props

  const classes = useStyles()
  const [page, setPage] = useState<number>(0)

  const filterFn = (apartment: Apartment) => {
    if (isClient && apartment.rentable === false) {
      return false
    }

    return true
  }

  const chunkApartments = (apartments: Apartment[]) => {
    return apartments.slice(
      page * APARTMENTS_PER_PAGE,
      page * APARTMENTS_PER_PAGE + APARTMENTS_PER_PAGE
    )
  }

  const filteredInventoryItems = apartments.filter(filterFn)

  const numberOfPages = Math.ceil(filteredInventoryItems.length / 10)

  return (
    <>
      <Table className={classes.apartmentsTable} size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Area</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Rooms</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Realtor</TableCell>
            <TableCell>Date Created</TableCell>
            {!isClient && <TableCell>Edit</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {chunkApartments(filteredInventoryItems).map(
            (apartment: Apartment) => {
              const date = new Date(apartment.createdAt)
              const formattedDate = `${date.getDate()}/${date.getMonth() +
                1}/${date.getFullYear()}`
              return (
                <TableRow key={apartment._id}>
                  <TableCell>{apartment.name}</TableCell>
                  <TableCell>{apartment.description}</TableCell>
                  <TableCell>{apartment.area}</TableCell>
                  <TableCell>{apartment.price}</TableCell>
                  <TableCell>{apartment.rooms}</TableCell>
                  <TableCell>
                    {apartment.longitude} {apartment.latitude}
                  </TableCell>
                  <TableCell>
                    {apartment.realtor ? apartment.realtor.email : 'Unowned'}
                  </TableCell>
                  <TableCell>{formattedDate}</TableCell>
                  {!isClient && (
                    <TableCell>
                      <Tooltip title="Edit" placement="top">
                        <EditIcon
                          className={classes.edit}
                          color="secondary"
                          onClick={() => onEditApartment(apartment)}
                        />
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              )
            }
          )}
        </TableBody>
      </Table>
      <Pagination page={page} setPage={setPage} numberOfPages={numberOfPages} />
    </>
  )
}

export default React.memo(ApartmentsList)
