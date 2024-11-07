import React, { useState } from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import EditIcon from '@material-ui/icons/Edit'
import { Tooltip, Avatar } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import Pagination from './Pagination'
import { UserPermission, User } from '../types'

const useStyles = makeStyles({
  permission: {
    textTransform: 'capitalize',
  },
  usersTable: {
    margin: '20px 0',
  },
  edit: {
    cursor: 'pointer',
  },
  avatar: {
    width: 30,
    borderRadius: '50%',
  },
})

interface UserListProps {
  users: User[]
  user: User
  onEditUser: (user: User) => void
}

const USERS_PER_PAGE = 10

function UserList(props: UserListProps) {
  const classes = useStyles()
  const [page, setPage] = useState<number>(0)

  const chunkUsers = (users: User[]) => {
    return users.slice(
      page * USERS_PER_PAGE,
      page * USERS_PER_PAGE + USERS_PER_PAGE
    )
  }

  const numberOfPages = Math.ceil(props.users.length / 10)
  const placeholderImage =
    'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png'

  return (
    <>
      <Table className={classes.usersTable} size="small">
        <TableHead>
          <TableRow>
            <TableCell>Avatar</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Permission</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {chunkUsers(props.users).map(user => (
            <TableRow
              key={user._id}
              style={{
                cursor:
                  props.user.permission === UserPermission.Admin
                    ? 'pointer'
                    : undefined,
              }}
            >
              <TableCell>
                <Avatar
                  style={{ width: 30, height: 30 }}
                  src={user.avatar || placeholderImage}
                />
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell className={classes.permission}>
                {user.permission}
              </TableCell>
              <TableCell>
                {props.user.permission === UserPermission.Admin && (
                  <Tooltip title="Edit" placement="top">
                    <EditIcon
                      className={classes.edit}
                      color="secondary"
                      onClick={e => {
                        e.stopPropagation()
                        props.onEditUser(user)
                      }}
                    />
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination page={page} setPage={setPage} numberOfPages={numberOfPages} />
    </>
  )
}

export default React.memo(UserList)
