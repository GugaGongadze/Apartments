import React, { Dispatch, SetStateAction } from 'react'
import { makeStyles } from '@material-ui/styles'
import { Button, ButtonGroup } from '@material-ui/core'

const useStyles = makeStyles({
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
  },
})

interface PaginationProps {
  numberOfPages: number
  page: number
  setPage: Dispatch<SetStateAction<number>>
}

function Pagination(props: PaginationProps) {
  const { page, setPage, numberOfPages } = props
  const classes = useStyles()

  return (
    <div className={classes.pagination}>
      <Button
        onClick={() => setPage(page - 1)}
        variant="outlined"
        color="primary"
        disabled={page === 0}
      >
        Previous Page
      </Button>

      <ButtonGroup color="primary" aria-label="outlined primary button group">
        {new Array(numberOfPages).fill(null).map((_, key) => (
          <Button
            key={key}
            onClick={() => setPage(key)}
            disabled={page === key}
          >
            {key + 1}
          </Button>
        ))}
      </ButtonGroup>
      <Button
        onClick={() => setPage(page + 1)}
        variant="outlined"
        color="primary"
        disabled={page >= numberOfPages - 1}
      >
        Next Page
      </Button>
    </div>
  )
}

export default Pagination
