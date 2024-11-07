import React, { useState, useEffect, useCallback } from 'react'
import { Redirect } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { Container, Theme } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import Modal from '@material-ui/core/Modal'
import DialogContent from '@material-ui/core/DialogContent'
import { makeStyles } from '@material-ui/styles'
import UserDetail from '../components/UserDetail'
import useApi from '../hooks/api.hook'
import UserList from '../components/UserList'
import { User, UserPermission } from '../types'

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    marginTop: theme.spacing(8),
    marginLeft: 24,
    padding: theme.spacing(3),
  },
}))

interface UsersContainerProps {
  user: User
}

function UsersContainer(props: UsersContainerProps) {
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const [users, setUsers] = useState<User[]>([])
  const [newUserModalOpen, setNewUserModalOpen] = useState(false)
  const [currUser, setCurrUser] = useState(null)
  const { listUsers } = useApi()

  const getUsers = useCallback(async () => {
    try {
      const response = await listUsers('/users')
      if (response) {
        setUsers(response.data)
      }
    } catch (error) {
      enqueueSnackbar(error.response.data.message, { variant: 'error' })
    }
  }, [listUsers, enqueueSnackbar])

  useEffect(() => {
    getUsers()
  }, [getUsers])

  const onEditUser = useCallback(user => {
    setCurrUser(user)
    setNewUserModalOpen(true)
  }, [])

  const onUserActionSubmit = () => {
    getUsers()
    setCurrUser(null)
    setNewUserModalOpen(false)
  }

  if (props.user.permission !== UserPermission.Admin) {
    return <Redirect to="/" />
  }

  const numberOfAdmins = users.filter(
    user => user.permission === UserPermission.Admin
  ).length

  return (
    <Container className={classes.container}>
      <Button
        onClick={() => setNewUserModalOpen(true)}
        variant="outlined"
        color="primary"
        style={{ float: 'right' }}
      >
        Create User
      </Button>
      <UserList user={props.user} users={users} onEditUser={onEditUser} />
      <Modal
        open={newUserModalOpen}
        onClose={() => {
          setCurrUser(null)
          setNewUserModalOpen(false)
        }}
      >
        <DialogContent>
          <UserDetail
            authUser={props.user}
            currUser={currUser}
            onUserActionSubmit={onUserActionSubmit}
            refetchUsers={getUsers}
            numberOfAdmins={numberOfAdmins}
          />
        </DialogContent>
      </Modal>
    </Container>
  )
}

export default UsersContainer
