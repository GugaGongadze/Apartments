import React from 'react'
import Typography from '@material-ui/core/Typography'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Button from '@material-ui/core/Button'
import Hidden from '@material-ui/core/Hidden'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import { makeStyles } from '@material-ui/core/styles'
import { useAuth } from '../hooks/auth.hook'
import { User } from '../types'

const useStyles = makeStyles(theme => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  toolbarContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
}))

interface HeaderProps {
  user: User | null
  onDrawerToggle: () => void
}

function Header(props: HeaderProps) {
  const classes = useStyles()
  const { logout } = useAuth()

  return (
    <AppBar position="fixed" className={classes.appBar}>
      <Toolbar className={classes.toolbarContainer}>
        <Hidden mdUp implementation="css">
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="Menu"
            onClick={props.onDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
        </Hidden>
        <Typography component="h1" variant="h6" color="inherit">
          Dashboard
        </Typography>
        {props.user && (
          <Typography component="h1" variant="h6" color="inherit">
            {props.user.email} - {props.user.permission}
          </Typography>
        )}
        <Button variant="contained" color="secondary" onClick={logout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  )
}

export default Header
