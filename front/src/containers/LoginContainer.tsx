import React, { useState, MouseEvent, useEffect } from 'react'
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
import { LOCAL_STORAGE_TOKEN_KEY } from '../hooks/api.hook'
import useRouter from '../hooks/router.hook'
import githubIcon from '../images/github.png'
import fbIcon from '../images/fb.png'

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
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  fbLogin: {
    width: 300,
  },
  githubLogin: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 300,
    color: '#fff',
    backgroundColor: '#444',
    borderColor: 'rgba(0,0,0,0.2)',
    padding: 10,
    margin: 10,
    fontWeight: 'bold',
    textDecoration: 'none',
    fontSize: 20,
    lineHeight: 1.3333333,
    borderRadius: 6,
  },
}))

function LoginContainer() {
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const { login, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { history } = useRouter()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')

    const social = urlParams.get('social')

    if (social) {
      enqueueSnackbar(
        "We've emailed you your temporary password along with confirmation link",
        { variant: 'success' }
      )
    }

    if (token) {
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, token)
      history.replace('/')
    }
  }, [history])

  if (isAuthenticated) {
    return <Redirect to="/" />
  }

  const onLogin = async (e: MouseEvent<HTMLElement>) => {
    try {
      e.preventDefault()

      await login(email, password)
    } catch (error) {
      enqueueSnackbar(error.response.data.message, { variant: 'error' })
    }
  }

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_GITHUB_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_GITHUB_REDIRECT_URI}&scope=read:user&allow_signup=true`

  const facebookAuthUrl = `https://www.facebook.com/v5.0/dialog/oauth?client_id=${process.env.REACT_APP_FACEBOOK_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_FACEBOOK_REDIRECT_URI}&scope=email`

  return (
    <Container component="main" maxWidth="xs">
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <a className={classes.githubLogin} href={githubAuthUrl}>
          <img src={githubIcon} style={{ width: 30 }} alt="Github Login" />
          <span>Sign in with GitHub</span>
        </a>
        <br />
        <br />
        <a href={facebookAuthUrl}>
          <img className={classes.fbLogin} src={fbIcon} alt="Facebook Login" />
        </a>
        <br />
        <br />
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
            autoComplete="current-password"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={onLogin}
            disabled={email === '' || password === ''}
          >
            Sign In
          </Button>
        </form>
        <Grid container justify="flex-end">
          <Grid item>
            <Link to="/register">Don't have an account? Sign Up</Link>
          </Grid>
        </Grid>
      </div>
    </Container>
  )
}

export default LoginContainer
