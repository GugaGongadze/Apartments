import React from 'react'
import { NavLink } from 'react-router-dom'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import MailIcon from '@material-ui/icons/Mail'
import { makeStyles } from '@material-ui/styles'
import { Hidden, Theme } from '@material-ui/core'
import { User, UserPermission } from '../types'

const useStyles = makeStyles((theme: Theme) => ({
  drawer: {
    [theme.breakpoints.up('md')]: {
      width: 240,
      flexShrink: 0,
    },
  },
  drawerPaper: {
    width: 240,
  },
  toolbar: theme.mixins.toolbar,
  navItem: {
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    color: '#333',
    fontWeight: 'bold',
  },
}))

interface SidebarProps {
  user: User | null
  mobileOpen: boolean
  onDrawerToggle: () => void
}

function Sidebar(props: SidebarProps) {
  const classes = useStyles()
  const { user, mobileOpen, onDrawerToggle } = props

  const drawerContent = (
    <>
      <div className={classes.toolbar} />
      <List>
        <ListItem button>
          <NavLink
            to="/profile"
            activeStyle={{ color: '#3f50b5' }}
            className={classes.navItem}
          >
            <ListItemIcon>
              <MailIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </NavLink>
        </ListItem>
        <ListItem button>
          <NavLink
            to="/apartments"
            activeStyle={{ color: '#3f50b5' }}
            className={classes.navItem}
          >
            <ListItemIcon>
              <MailIcon />
            </ListItemIcon>
            <ListItemText primary="Apartments" />
          </NavLink>
        </ListItem>
        {user && user.permission === UserPermission.Admin && (
          <ListItem button>
            <NavLink
              to="/users"
              activeStyle={{ color: '#3f50b5' }}
              className={classes.navItem}
            >
              <ListItemIcon>
                <MailIcon />
              </ListItemIcon>
              <ListItemText primary="Users" />
            </NavLink>
          </ListItem>
        )}
      </List>
    </>
  )

  return (
    <nav className={classes.drawer} aria-label="Sidebar">
      <Hidden smUp implementation="css">
        <Drawer
          className={classes.drawer}
          variant="temporary"
          open={mobileOpen}
          onClose={onDrawerToggle}
          classes={{ paper: classes.drawerPaper }}
          ModalProps={{ keepMounted: true }}
        >
          {drawerContent}
        </Drawer>
      </Hidden>
      <Hidden smDown implementation="css">
        <Drawer
          className={classes.drawer}
          variant="permanent"
          classes={{ paper: classes.drawerPaper }}
        >
          {drawerContent}
        </Drawer>
      </Hidden>
    </nav>
  )
}

export default Sidebar
