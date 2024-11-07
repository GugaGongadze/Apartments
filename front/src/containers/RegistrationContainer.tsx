import React, { useState, MouseEvent } from 'react'
import { Link, Redirect } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import { useAuth } from '../hooks/auth.hook'
import { isValidEmail } from '../utils'

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  confirm: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}))

function RegistrationContainer() {
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const { register, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (isAuthenticated) {
    return <Redirect to="/" />
  }

  if (hasSubmitted) {
    enqueueSnackbar('Please check your email address to verify your account', {
      variant: 'success',
    })
    return <Redirect to="/login" />
  }

  const onRegistration = async (e: MouseEvent<HTMLElement>) => {
    try {
      e.preventDefault()

      await register(email, password)
      setHasSubmitted(true)
    } catch (error) {
      if (error.response && error.response.data) {
        enqueueSnackbar(error.response.data.message, { variant: 'error' })
      } else {
        enqueueSnackbar(error.message, { variant: 'error' })
      }
    }
  }

  const isPasswordValid = password.length >= 6

  return (
    <Container component="main" maxWidth="xs">
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <form noValidate>
          <TextField
            value={email}
            onChange={e => setEmail(e.target.value)}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            error={email.length > 0 && !isValidEmail(email)}
            helperText={
              isValidEmail(email) ? '' : 'Make sure to enter valid email'
            }
            autoComplete="email"
            autoFocus
          />
          <TextField
            value={password}
            onChange={e => setPassword(e.target.value)}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            error={password.length > 0 && !isPasswordValid}
            helperText={
              isPasswordValid
                ? ''
                : 'Password should be at least 6 characters long'
            }
            autoComplete="current-password"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={onRegistration}
            disabled={!isValidEmail(email) || !isPasswordValid}
          >
            Sign Up
          </Button>
        </form>
        <Grid container justify="flex-end">
          <Grid item>
            <Link to="/login">Already have an account? Sign in</Link>
          </Grid>
        </Grid>
      </div>
    </Container>
  )
}

export default RegistrationContainer
