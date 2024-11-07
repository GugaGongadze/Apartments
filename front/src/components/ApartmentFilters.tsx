import React, { useState, MouseEvent, Dispatch, SetStateAction } from 'react'
import { makeStyles, Theme } from '@material-ui/core/styles'
import MapIcon from '@material-ui/icons/Map'
import Button from '@material-ui/core/Button'
import Popover from '@material-ui/core/Popover'
import Typography from '@material-ui/core/Typography'
import {
  Container,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  ButtonGroup,
  Tooltip,
} from '@material-ui/core'
import { ListingFilters } from '../types'

const useStyles = makeStyles((theme: Theme) => ({
  filterButton: {
    margin: theme.spacing(1),
  },
  typography: {
    padding: theme.spacing(2),
  },
  margin: {
    margin: theme.spacing(1),
  },
  container: {
    marginBottom: theme.spacing(2),
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapControl: {
    display: 'flex',
    alignItems: 'center',
  },
  mapIcon: {
    fontSize: 36,
    marginLeft: 10,
    cursor: 'pointer',
  },
}))

interface ApartmentFiltersProps {
  isClient: boolean
  filters: ListingFilters
  setFilters: Dispatch<SetStateAction<ListingFilters>>
  setMapOpen: Dispatch<SetStateAction<boolean>>
  setNewApartmentModalOpen: Dispatch<SetStateAction<boolean>>
  areTheAnyRealtors: boolean
}

function ApartmentFilters(props: ApartmentFiltersProps) {
  const {
    isClient,
    filters,
    setFilters,
    setMapOpen,
    areTheAnyRealtors,
    setNewApartmentModalOpen,
  } = props

  const classes = useStyles()
  const [activePopover, setActivePopover] = useState<string | null>(null)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  const handleClick = (
    event: MouseEvent<HTMLButtonElement>,
    popoverId: string
  ) => {
    setActivePopover(popoverId)
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setActivePopover(null)
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)

  return (
    <div>
      <div className={classes.controls}>
        <div>
          <Button
            className={classes.filterButton}
            variant="outlined"
            color="primary"
            onClick={(e: MouseEvent<HTMLButtonElement>) =>
              handleClick(e, 'area-popover')
            }
          >
            Area
          </Button>
          <Button
            className={classes.filterButton}
            variant="outlined"
            color="primary"
            onClick={(e: MouseEvent<HTMLButtonElement>) =>
              handleClick(e, 'price-popover')
            }
          >
            Price
          </Button>
        </div>
        <div className={classes.mapControl}>
          {!isClient && areTheAnyRealtors && (
            <Button
              onClick={() => setNewApartmentModalOpen(true)}
              variant="outlined"
              color="primary"
            >
              Add Apartment
            </Button>
          )}
          <Tooltip title="View on map" aria-label="View on map">
            <MapIcon
              onClick={() => setMapOpen(true)}
              color="primary"
              className={classes.mapIcon}
            />
          </Tooltip>
        </div>
      </div>
      <div>
        <Popover
          id="area-popover"
          open={open && activePopover === 'area-popover'}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <Typography className={classes.typography}>Area:</Typography>
          <Container>
            <FormControl className={classes.margin} variant="outlined">
              <InputLabel htmlFor="area-from">From</InputLabel>
              <OutlinedInput
                id="area-from"
                value={filters.areaFrom}
                type="number"
                onChange={e =>
                  setFilters({
                    ...filters,
                    areaFrom: Math.abs(parseFloat(e.target.value)) || 0,
                  })
                }
                endAdornment={
                  <InputAdornment position="end">㎡</InputAdornment>
                }
                labelWidth={40}
              />
            </FormControl>
            <FormControl className={classes.margin} variant="outlined">
              <InputLabel htmlFor="area-to">To</InputLabel>
              <OutlinedInput
                id="area-to"
                type="number"
                value={filters.areaTo}
                onChange={e =>
                  setFilters({
                    ...filters,
                    areaTo: Math.abs(parseFloat(e.target.value)) || 0,
                  })
                }
                endAdornment={
                  <InputAdornment position="end">㎡</InputAdornment>
                }
                labelWidth={20}
              />
            </FormControl>
          </Container>
          <Typography className={classes.typography}>
            Number of rooms:
          </Typography>
          <Container className={classes.container}>
            <ButtonGroup size="large" aria-label="small outlined button group">
              <Button
                onClick={() => setFilters({ ...filters, rooms: 0 })}
                disabled={filters.rooms === 0}
              >
                All
              </Button>
              <Button
                onClick={() => setFilters({ ...filters, rooms: 1 })}
                disabled={filters.rooms === 1}
              >
                1
              </Button>
              <Button
                onClick={() => setFilters({ ...filters, rooms: 2 })}
                disabled={filters.rooms === 2}
              >
                2
              </Button>
              <Button
                onClick={() => setFilters({ ...filters, rooms: 3 })}
                disabled={filters.rooms === 3}
              >
                3
              </Button>
              <Button
                onClick={() => setFilters({ ...filters, rooms: 4 })}
                disabled={filters.rooms === 4}
              >
                4
              </Button>
              <Button
                onClick={() => setFilters({ ...filters, rooms: 5 })}
                disabled={filters.rooms === 5}
              >
                5+
              </Button>
            </ButtonGroup>
          </Container>
        </Popover>
        <Popover
          id="price-popover"
          open={open && activePopover === 'price-popover'}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <Typography className={classes.typography}>Price:</Typography>
          <Container>
            <FormControl className={classes.margin} variant="outlined">
              <InputLabel htmlFor="price-from">From</InputLabel>
              <OutlinedInput
                id="price-from"
                value={filters.priceFrom}
                type="number"
                onChange={e =>
                  setFilters({
                    ...filters,
                    priceFrom: Math.abs(parseFloat(e.target.value)) || 0,
                  })
                }
                endAdornment={<InputAdornment position="end">$</InputAdornment>}
                labelWidth={40}
              />
            </FormControl>
            <FormControl className={classes.margin} variant="outlined">
              <InputLabel htmlFor="price-to">To</InputLabel>
              <OutlinedInput
                id="price-to"
                type="number"
                value={filters.priceTo}
                onChange={e =>
                  setFilters({
                    ...filters,
                    priceTo: Math.abs(parseFloat(e.target.value)) || 0,
                  })
                }
                endAdornment={<InputAdornment position="end">$</InputAdornment>}
                labelWidth={20}
              />
            </FormControl>
          </Container>
        </Popover>
      </div>
    </div>
  )
}

export default ApartmentFilters
