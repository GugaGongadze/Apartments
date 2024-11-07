import React, { useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { useSnackbar } from 'notistack'
import {
  FormControl,
  MenuItem,
  InputLabel,
  Select,
  Theme,
  CircularProgress,
  Paper,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
} from '@material-ui/core'
import useApi from '../hooks/api.hook'
import ImageUploader from './ImageUploader'
import { useAuth } from '../hooks/auth.hook'
import { UserPermission, User } from '../types'
import { isValidEmail } from '../utils'
import useRouter from '../hooks/router.hook'

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    left: '50%',
    outline: 'none',
    padding: theme.spacing(4),
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    display: 'flex',
    flexDirection: 'column',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  actionButton: {
    marginTop: theme.spacing(1),
  },
  centerSelf: {
    alignSelf: 'center',
  },
  loading: {
    position: 'absolute',
    zIndex: 1,
  },
}))

interface UserDetailProps {
  authUser: User
  currUser: User | null
  onUserActionSubmit: () => void
  refetchUsers: () => void
  numberOfAdmins: number
}

function UserDetail(props: UserDetailProps) {
  const {
    authUser,
    currUser,
    onUserActionSubmit,
    refetchUsers,
    numberOfAdmins,
  } = props
  const classes = useStyles()
  const [email, setEmail] = useState(currUser ? currUser.email : '')
  const { history } = useRouter()
  const [isVerified, setIsVerified] = useState(
    currUser ? currUser.isVerified : false
  )
  const [permission, setPermission] = useState(
    currUser ? currUser.permission : UserPermission.Client
  )
  const [password, setPassword] = useState('')
  const { post, put, del, uploadImage } = useApi()
  const { logout, setUser } = useAuth()
  const { enqueueSnackbar } = useSnackbar()
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)

  const isEditMode = currUser !== null
  const isAdminChangingOwnAccount = currUser && authUser._id === currUser._id

  const onUserSubmit = async () => {
    try {
      if (isEditMode) {
        // Update user
        const newUserData = {
          email,
          permission,
          password,
          isVerified,
        }

        // If admin is self-demoting refetch user and redirect to home page
        if (permission !== authUser.permission && isAdminChangingOwnAccount) {
          const response = await put('/users', currUser!._id, newUserData)

          if (!response) {
            setUser(null)
          } else {
            setUser(response.data)
          }

          history.replace('/')
          return
        }
        await put('/users', currUser!._id, newUserData)
        enqueueSnackbar('Account successfully updated!', {
          variant: 'success',
        })
      } else {
        // Create user
        await post('/users', {
          email,
          permission,
          password,
          isVerified,
        })
        enqueueSnackbar('Account successfully created!', {
          variant: 'success',
        })
      }
    } catch (error) {
      enqueueSnackbar(error.response.data.message, {
        variant: 'error',
      })
    }
    onUserActionSubmit()
  }

  const onUserDelete = async () => {
    await del('/users', currUser!._id)

    setDeleteConfirmationOpen(false)
    // If admin is deleting own account just logout
    if (isAdminChangingOwnAccount) {
      logout()
    } else {
      onUserActionSubmit()
    }
  }

  const onImageUpload = async (file: File) => {
    try {
      setIsImageLoading(true)
      const formData = new FormData()

      formData.append('file', file)

      const response = await uploadImage(currUser!._id, formData)

      if (response) {
        refetchUsers()
        setIsImageLoading(false)
        enqueueSnackbar('Profile image successfully uploaded!', {
          variant: 'success',
        })
      }
    } catch (error) {
      setIsImageLoading(false)
      enqueueSnackbar('Error uploading image', { variant: 'error' })
    }
  }

  return (
    <Paper className={classes.paper}>
      <Typography>{isEditMode ? 'Edit' : 'Create'} user</Typography>
      {isEditMode && (
        <div className={classes.centerSelf}>
          {isImageLoading && (
            <CircularProgress
              className={classes.loading}
              size={200}
              color="secondary"
            />
          )}
          <ImageUploader
            avatar={currUser && currUser.avatar}
            onImageUpload={onImageUpload}
          />
        </div>
      )}
      <TextField
        variant="outlined"
        margin="normal"
        required={true}
        id="email"
        label="Email"
        name="email"
        error={email.length > 0 && !isValidEmail(email)}
        autoComplete="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <FormControl className={classes.formControl}>
        <InputLabel shrink htmlFor="permission">
          Permission
        </InputLabel>
        <Select
          value={permission}
          onChange={e => setPermission(e.target.value as UserPermission)}
          name="permission"
        >
          <MenuItem value={UserPermission.Client}>Client</MenuItem>
          <MenuItem value={UserPermission.Realtor}>Realtor</MenuItem>
          <MenuItem value={UserPermission.Admin}>Admin</MenuItem>
        </Select>
      </FormControl>
      {isEditMode && (
        <>
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
          <FormControlLabel
            control={
              <Checkbox
                checked={isVerified}
                onChange={() => setIsVerified(!isVerified)}
              />
            }
            label="Verified"
          />
        </>
      )}
      <Button
        className={classes.actionButton}
        variant="contained"
        color="primary"
        onClick={onUserSubmit}
        disabled={
          !isValidEmail(email) ||
          (password !== '' && password.length < 6) ||
          isImageLoading
        }
      >
        Save
      </Button>
      {isEditMode && (
        <>
          <Button
            className={classes.actionButton}
            variant="contained"
            color="secondary"
            onClick={() => setDeleteConfirmationOpen(true)}
            disabled={isImageLoading || numberOfAdmins < 2}
          >
            Delete
          </Button>

          <Dialog
            open={deleteConfirmationOpen}
            onClose={() => setDeleteConfirmationOpen(false)}
            aria-labelledby="delete-confirmation"
          >
            <DialogTitle id="delete-confirmation">
              Delete user {currUser!.email}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Are you sure you want to delete{' '}
                {isAdminChangingOwnAccount ? 'your account' : 'this user'}?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setDeleteConfirmationOpen(false)}
                color="primary"
              >
                Cancel
              </Button>
              <Button onClick={onUserDelete} color="primary" autoFocus>
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Paper>
  )
}

export default UserDetail
