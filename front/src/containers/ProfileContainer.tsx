import React, { useState } from 'react'
import { useSnackbar } from 'notistack'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import CircularProgress from '@material-ui/core/CircularProgress'
import Button from '@material-ui/core/Button'
import { Paper, TextField } from '@material-ui/core'
import useApi from '../hooks/api.hook'
import { useAuth } from '../hooks/auth.hook'
import ImageUploader from '../components/ImageUploader'
import { isValidEmail } from '../utils'
import { User } from '../types'

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(3),
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  loading: {
    position: 'absolute',
    zIndex: 1,
  },
}))

export interface ProfileContainerProps {
  user: User
}

function ProfileContainer(props: ProfileContainerProps) {
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const [email, setEmail] = useState(props.user.email)
  const [password, setPassword] = useState('')
  const [imageLoading, setImageLoading] = useState(false)
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const { put, uploadImage } = useApi()
  const { setUser } = useAuth()

  const onUpdateEmail = async () => {
    try {
      const response = await put('/users', props.user._id, { email })
      if (response) {
        enqueueSnackbar('Email successfully updated!', { variant: 'success' })
        setUser(response.data)
      }
    } catch (error) {
      enqueueSnackbar('Error updating your email', { variant: 'error' })
    }
  }

  const onUpdatePassword = async () => {
    try {
      const response = await put('/users', props.user._id, { password })
      if (response) {
        enqueueSnackbar('Password successfully updated!', {
          variant: 'success',
        })
        setUser(response.data)
      }
    } catch (error) {
      enqueueSnackbar('Error updating your password', { variant: 'error' })
    }
  }

  const onImageUpload = async (file: File) => {
    try {
      setImageLoading(true)
      const formData = new FormData()

      formData.append('file', file)

      const response = await uploadImage(props.user._id, formData)

      if (response) {
        setUser(response.data)
        setImageLoading(false)
        enqueueSnackbar('Profile image successfully uploaded!', {
          variant: 'success',
        })
      }
    } catch (error) {
      setImageLoading(false)
      enqueueSnackbar('Error uploading image', { variant: 'error' })
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <Paper className={classes.paper}>
        {imageLoading && (
          <CircularProgress
            className={classes.loading}
            size={200}
            color="secondary"
          />
        )}
        <ImageUploader
          avatar={props.user.avatar}
          onImageUpload={onImageUpload}
        />
        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            error={!isValidEmail(email)}
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            disabled={!isValidEmail(email) || imageLoading}
            onClick={e => {
              e.preventDefault()
              onUpdateEmail()
            }}
          >
            Update Email
          </Button>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            type="password"
            id="secret"
            label="Password"
            name="secret"
            autoComplete="secret"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            type="password"
            id="secretConfirmation"
            label="Confirm Password"
            name="secretConfirmation"
            autoComplete="secretConfirmation"
            value={passwordConfirmation}
            onChange={e => setPasswordConfirmation(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            disabled={
              password !== passwordConfirmation ||
              password.length < 6 ||
              imageLoading
            }
            onClick={e => {
              e.preventDefault()
              onUpdatePassword()
            }}
          >
            Update Password
          </Button>
        </form>
      </Paper>
    </Container>
  )
}

export default ProfileContainer
