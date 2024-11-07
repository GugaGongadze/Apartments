import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import 'typeface-roboto'
import { SnackbarProvider } from 'notistack'
import { ThemeProvider } from '@material-ui/styles'
import { createMuiTheme } from '@material-ui/core'
import CssBaseline from '@material-ui/core/CssBaseline'
import LoginContainer from './containers/LoginContainer'
import RegistrationContainer from './containers/RegistrationContainer'
import AuthProvider from './containers/AuthProvider'
import PrivateRoute from './components/PrivateRoute'
import ApartmentsContainer from './containers/ApartmentsContainer'
import ProfileContainer from './containers/ProfileContainer'
import UsersContainer from './containers/UsersContainer'
import { UserPermission } from './types'

const theme = createMuiTheme({
  typography: {
    fontFamily: [
      'Muli',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
})

const rootElement = document.getElementById('root')
ReactDOM.render(
  <>
    <CssBaseline />
    <Router>
      <ThemeProvider theme={theme}>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <AuthProvider>
            <Route path="/login/" component={LoginContainer} />
            <Route path="/register/" component={RegistrationContainer} />
            <PrivateRoute
              exact
              path="/"
              component={ApartmentsContainer}
              permission={[
                UserPermission.Client,
                UserPermission.Realtor,
                UserPermission.Admin,
              ]}
            />
            <PrivateRoute
              path={['/apartments/', '/apartments/:userId']}
              component={ApartmentsContainer}
              permission={[
                UserPermission.Client,
                UserPermission.Realtor,
                UserPermission.Admin,
              ]}
            />
            <PrivateRoute
              path="/profile/"
              component={ProfileContainer}
              permission={[
                UserPermission.Client,
                UserPermission.Realtor,
                UserPermission.Admin,
              ]}
            />
            <PrivateRoute
              path="/users/"
              component={UsersContainer}
              permission={[UserPermission.Realtor, UserPermission.Admin]}
            />
          </AuthProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </Router>
  </>,
  rootElement
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
