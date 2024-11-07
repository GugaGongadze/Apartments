import React, { useState } from 'react'
import ReactMapboxGl, { Layer, Feature } from 'react-mapbox-gl'
import Geocoder from 'react-geocoder-autocomplete'
import { makeStyles } from '@material-ui/styles'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import {
  Theme,
  Checkbox,
  FormControlLabel,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@material-ui/core'
import useApi from '../hooks/api.hook'
import { User, Apartment, ApartmentDetails, UserPermission } from '../types'

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    left: '50%',
    outline: 'none',
    padding: theme.spacing(4),
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    display: 'flex',
    flexDirection: 'column',
  },
  actionButton: {
    marginTop: theme.spacing(1),
  },
  result: {
    boxShadow: '0px 0.5px #ddd',
    paddingTop: 10,
    paddingBottom: 10,
    width: '100%',
    padding: '10px 20px 10px 20px',
    display: 'flex',
    alignItems: 'center',
    float: 'left',
    textDecoration: 'none',
    color: 'rgba(0, 0, 0, 0.87)',
  },
  results: {
    position: 'absolute',
    zIndex: 3,
    margin: 0,
    padding: 0,
    backgroundColor: '#fff',
    fontSize: 14,
    listStyleType: 'none',
    borderRadius: 3,
  },
  input: {
    width: '100%',
    textIndent: 20,
    height: 40,
    fontSize: 15,
    border: '1px solid #d3d3d3',
    borderRadius: 3,
  },
  resultFocus: {
    backgroundColor: '#F2FAFC',
    borderRadius: 3,
  },
  infoContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '16px 0',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}))

interface ApartmentDetailProps {
  apartment: Apartment | null
  onApartmentSubmit: () => void
  user: User
  realtors: User[]
}

const Map = ReactMapboxGl({
  accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN!,
  maxZoom: 20,
})

function ApartmentDetail(props: ApartmentDetailProps) {
  const classes = useStyles()

  const { apartment, onApartmentSubmit, user, realtors } = props

  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
  const [apartmentDetails, setApartmentDetails] = useState<ApartmentDetails>(
    apartment
      ? {
          name: apartment.name,
          description: apartment.description,
          area: apartment.area,
          price: apartment.price,
          rooms: apartment.rooms,
          longitude: apartment.longitude,
          latitude: apartment.latitude,
          rentable: apartment.rentable,
          realtorId: apartment.realtor._id,
        }
      : {
          name: '',
          description: '',
          area: 0,
          price: 0,
          rooms: 0,
          longitude: (undefined as unknown) as number,
          latitude: (undefined as unknown) as number,
          rentable: true,
          realtorId: '',
        }
  )

  const { post, put, del } = useApi()

  const onSubmit = async () => {
    if (apartment === null) {
      await post('/apartments', {
        ...apartmentDetails,
        user:
          apartmentDetails.realtorId !== ''
            ? apartmentDetails.realtorId
            : user._id,
      })
      // Create apartment
    } else {
      // Update apartment
      await put('/apartments', apartment._id, {
        ...apartmentDetails,
        user:
          apartmentDetails.realtorId !== ''
            ? apartmentDetails.realtorId
            : user._id,
      })
    }
    onApartmentSubmit()
  }

  const onApartmentDelete = async () => {
    await del('/apartments', apartment!._id)
    onApartmentSubmit()
  }

  const onSelect = (value: any) => {
    const [lng, lat] = value.geometry.coordinates
    setApartmentDetails({ ...apartmentDetails, longitude: lng, latitude: lat })
  }

  const onDragEnd = (res: any) => {
    setApartmentDetails({
      ...apartmentDetails,
      longitude: res.lngLat.lng,
      latitude: res.lngLat.lat,
    })
  }

  const detailsAreValid =
    apartmentDetails.name.length > 0 &&
    apartmentDetails.description.length > 0 &&
    apartmentDetails.area > 0 &&
    apartmentDetails.price > 0 &&
    apartmentDetails.rooms > 0 &&
    apartmentDetails.latitude !== undefined &&
    apartmentDetails.longitude !== undefined &&
    (user.permission === UserPermission.Admin
      ? apartmentDetails.realtorId !== ''
      : true)

  return (
    <div className={classes.paper}>
      <Typography>{apartment ? 'Edit' : 'Create'} Apartment</Typography>
      <TextField
        variant="outlined"
        margin="normal"
        required={true}
        id="name"
        label="Name"
        name="name"
        autoComplete="name"
        value={apartmentDetails.name}
        onChange={e =>
          setApartmentDetails({ ...apartmentDetails, name: e.target.value })
        }
      />
      <TextField
        variant="outlined"
        margin="normal"
        required={true}
        multiline
        rows="3"
        id="description"
        label="Description"
        name="description"
        autoComplete="description"
        value={apartmentDetails.description}
        onChange={e =>
          setApartmentDetails({
            ...apartmentDetails,
            description: e.target.value,
          })
        }
      />
      <div className={classes.infoContainer}>
        <TextField
          variant="outlined"
          size="small"
          required={true}
          id="area"
          label="Floor Area"
          name="area"
          autoComplete="area"
          type="number"
          value={apartmentDetails.area}
          onChange={e =>
            setApartmentDetails({
              ...apartmentDetails,
              area: Math.abs(parseFloat(e.target.value)),
            })
          }
        />
        <TextField
          variant="outlined"
          size="small"
          required={true}
          id="price"
          label="Price"
          name="price"
          autoComplete="price"
          type="number"
          style={{ marginLeft: 5, marginRight: 5 }}
          value={apartmentDetails.price}
          onChange={e =>
            setApartmentDetails({
              ...apartmentDetails,
              price: Math.abs(parseFloat(e.target.value)),
            })
          }
        />
        <TextField
          variant="outlined"
          size="small"
          required={true}
          id="rooms"
          label="Rooms"
          name="rooms"
          autoComplete="rooms"
          type="number"
          value={apartmentDetails.rooms}
          onChange={e =>
            setApartmentDetails({
              ...apartmentDetails,
              rooms: Math.abs(parseInt(e.target.value)),
            })
          }
        />
      </div>
      {user.permission === UserPermission.Admin && (
        <FormControl className={classes.formControl}>
          <InputLabel shrink htmlFor="permission">
            Realtor
          </InputLabel>
          <Select
            value={apartmentDetails.realtorId}
            onChange={e =>
              setApartmentDetails({
                ...apartmentDetails,
                realtorId: String(e.target.value),
              })
            }
            name="permission"
          >
            {realtors.map(realtor => (
              <MenuItem key={realtor._id} value={realtor._id}>
                {realtor.email}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      <Geocoder
        accessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
        onSelect={onSelect}
        showLoader={true}
        resultClass={classes.result}
        resultsClass={classes.results}
        inputClass={classes.input}
        resultFocusClass={classes.resultFocus}
        inputPlaceholder="Location"
        defaultInputValue={
          apartmentDetails.longitude && apartmentDetails.latitude
            ? `${apartmentDetails.longitude}, ${apartmentDetails.latitude}`
            : ''
        }
      />
      {apartmentDetails.longitude && apartmentDetails.latitude && (
        <Map
          style="mapbox://styles/mapbox/streets-v9"
          containerStyle={{
            height: '200px',
            width: '100%',
          }}
          center={[apartmentDetails.longitude, apartmentDetails.latitude]}
        >
          <Layer
            type="circle"
            id="marker"
            paint={{
              'circle-stroke-width': 4,
              'circle-radius': 10,
              'circle-blur': 0.15,
              'circle-color': '#3770C6',
              'circle-stroke-color': 'white',
            }}
          >
            <Feature
              key={apartmentDetails.name}
              coordinates={[
                apartmentDetails.longitude,
                apartmentDetails.latitude,
              ]}
              draggable
              onDragEnd={onDragEnd}
            />
          </Layer>
        </Map>
      )}
      <FormControlLabel
        control={
          <Checkbox
            checked={apartmentDetails.rentable}
            onChange={() =>
              setApartmentDetails({
                ...apartmentDetails,
                rentable: !apartmentDetails.rentable,
              })
            }
            value="checkedA"
          />
        }
        label="Rentable"
      />

      <Button
        className={classes.actionButton}
        variant="contained"
        color="primary"
        onClick={onSubmit}
        disabled={!detailsAreValid}
      >
        Save
      </Button>
      {apartment && (
        <Button
          className={classes.actionButton}
          variant="contained"
          color="secondary"
          onClick={() => setDeleteConfirmationOpen(true)}
        >
          Delete
        </Button>
      )}
      {apartment && (
        <Dialog
          open={deleteConfirmationOpen}
          onClose={() => setDeleteConfirmationOpen(false)}
          aria-labelledby="delete-confirmation"
        >
          <DialogTitle id="delete-confirmation">
            Delete apartment listing
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete this listing?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDeleteConfirmationOpen(false)}
              color="primary"
            >
              Cancel
            </Button>
            <Button onClick={onApartmentDelete} color="primary" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  )
}

export default ApartmentDetail
