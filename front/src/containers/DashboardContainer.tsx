import React, { useState, useCallback, ReactElement } from 'react'
import { Redirect } from 'react-router-dom'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../hooks/auth.hook'
import { makeStyles } from '@material-ui/styles'
import { UserPermission, User } from '../types'

interface DashboardContainerProps {
  children: ReactElement<any>
  path: string | string[]
  me?: User
  exact?: boolean
  permission: UserPermission[]
}

const useStyles = makeStyles({
  root: {
    display: 'flex',
  },
})

function DashboardContainer(props: DashboardContainerProps) {
  const classes = useStyles()
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const onDrawerToggle = useCallback(() => {
    setMobileOpen(!mobileOpen)
  }, [mobileOpen])

  return (
    <div className={classes.root}>
      <Header user={user} onDrawerToggle={onDrawerToggle} />
      <Sidebar
        user={user}
        mobileOpen={mobileOpen}
        onDrawerToggle={onDrawerToggle}
      />
      {user &&
        React.Children.map(props.children, child => {
          if (props.permission.includes(user.permission)) {
            return React.cloneElement(child, { user })
          }

          return (
            <Redirect
              to={{
                pathname: '/',
              }}
            />
          )
        })}
    </div>
  )
}

export default DashboardContainer
