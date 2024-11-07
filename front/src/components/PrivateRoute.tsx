import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import DashboardContainer from '../containers/DashboardContainer'
import { useAuth } from '../hooks/auth.hook'
import { User, UserPermission } from '../types'

export interface PrivateRouteProps {
  component: React.ComponentType<any>
  path: string | string[]
  me?: User
  exact?: boolean
  permission: UserPermission[]
}

function PrivateRoute(privateRouteProps: PrivateRouteProps) {
  const { isAuthenticated } = useAuth()
  const { component: Component, ...rest } = privateRouteProps

  return (
    <Route
      {...rest}
      render={props =>
        isAuthenticated ? (
          <DashboardContainer {...rest}>
            <Component {...props} />
          </DashboardContainer>
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: props.location },
            }}
          />
        )
      }
    />
  )
}

export default PrivateRoute
