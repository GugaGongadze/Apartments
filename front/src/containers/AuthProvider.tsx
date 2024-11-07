import React, { ReactNode } from 'react'
import { useAuthProvider, AuthContextProvider } from '../hooks/auth.hook'

interface AuthProviderProps {
  children: ReactNode
}

function AuthProvider(props: AuthProviderProps) {
  const auth = useAuthProvider()

  return (
    <AuthContextProvider value={auth}>{props.children}</AuthContextProvider>
  )
}

export default AuthProvider
