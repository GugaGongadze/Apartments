import React, { useState, useLayoutEffect } from 'react'
import ReactMapboxGl, { Layer, Feature, Popup } from 'react-mapbox-gl'
import { makeStyles } from '@material-ui/styles'
import { Apartment } from '../types'

const useStyles = makeStyles({
  apartment: {
    background: '$fff',
    color: '#3f618c',
    fontWeight: 400,
    padding: 5,
    borderRadius: 2,
  },
})

interface MapViewProps {
  filteredApartments: Apartment[]
}

const Map = ReactMapboxGl({
  accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN!,
  maxZoom: 15,
})

function MapView(props: MapViewProps) {
  const classes = useStyles()
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    44.71475489027783,
    41.720954310968324,
  ])

  const [selectedApartment, setSelectedApartment] = useState<
    Apartment | undefined
  >(undefined)

  useLayoutEffect(() => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords

        setMapCenter([longitude, latitude])
      },
      err => {
        console.error('Cannot retrieve your current position', err)
      }
    )
  }, [])

  return (
    <>
      <Map
        style="mapbox://styles/mapbox/streets-v9"
        containerStyle={{
          height: '100vh',
          width: '100%',
        }}
        center={mapCenter}
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
          {props.filteredApartments.map(apartment => (
            <Feature
              key={apartment._id}
              onClick={() => setSelectedApartment(apartment)}
              coordinates={[apartment.longitude, apartment.latitude]}
            />
          ))}
        </Layer>
        {selectedApartment && (
          <Popup
            key={selectedApartment._id}
            coordinates={[
              selectedApartment.longitude,
              selectedApartment.latitude,
            ]}
            onClick={() => setSelectedApartment(undefined)}
          >
            <div className={classes.apartment}>
              <div>Name: {selectedApartment.name}</div>
              <div>Description: {selectedApartment.description}</div>
              <div>Area: {selectedApartment.area}㎡</div>
              <div>Price: ${selectedApartment.price}</div>
              <div>Rooms: {selectedApartment.rooms}</div>
            </div>
          </Popup>
        )}
      </Map>
    </>
  )
}

export default MapView
