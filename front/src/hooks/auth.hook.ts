import {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
  Dispatch,
  SetStateAction,
} from 'react'
import { useSnackbar } from 'notistack'
import useRouter from './router.hook'
import useApi from './api.hook'
import { User } from '../types'

export const LOCAL_STORAGE_TOKEN_KEY = 'token'

export interface Auth {
  user: User | null
  isAuthenticated: boolean
  login(email: string, secret: string): Promise<void>
  register(email: string, secret: string): Promise<void>
  setUser: Dispatch<SetStateAction<null>>
  logout(): void
}

const AuthContext = createContext<Auth>({
  user: null,
  isAuthenticated: false,
  login: () => {
    throw new Error('AuthContextProvider missing...')
  },
  register: () => {
    throw new Error('AuthContextProvider missing...')
  },
  logout: () => {
    throw new Error('AuthContextProvider missing...')
  },
  setUser: () => {
    throw new Error('AuthContextProvider missing...')
  },
})

export function useAuthProvider(): Auth {
  const { history } = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [user, setUser] = useState(null)
  const authToken = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)
  const isAuthenticated = authToken !== undefined && authToken !== null
  const { getAuthUser, post } = useApi()

  const fetchUser = useCallback(async () => {
    try {
      if (!user) {
        const response = await getAuthUser()

        if (!response) {
          setUser(null)
        } else {
          setUser(response.data)
        }
      }
    } catch (error) {
      if (error.response) {
        enqueueSnackbar(error.response.data.message, { variant: 'error' })
      }
    }
  }, [user, getAuthUser, enqueueSnackbar])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = useCallback(
    async (email, password) => {
      const response = await post('/login', { email, password })
      if (!response) {
        setUser(null)
      } else {
        localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, response.data.token)
        setUser(response.data)
        history.replace('/')
      }
    },
    [post, history]
  )

  const register = useCallback(
    async (email: string, password: string) => {
      await post('/register', { email, password })
    },
    [post]
  )

  const logout = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY)
    setUser(null)
    history.replace('/login')
  }, [history])

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    setUser,
  }
}

export function useAuth(): Auth {
  return useContext(AuthContext)
}

export const AuthContextProvider = AuthContext.Provider
