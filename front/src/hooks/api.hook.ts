import { useCallback } from 'react'
import axios from 'axios'

export const LOCAL_STORAGE_TOKEN_KEY = 'token'

function useApi() {
  const getToken = () => localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)

  const axs = useCallback(
    axios.create({
      baseURL: 'http://localhost:4000',
      headers: {
        'Content-Type': 'application/json',
      },
    }),
    []
  )

  axs.interceptors.request.use(request => {
    request.headers.authorization = `Bearer ${getToken()}`
    return request
  })

  const getAuthUser = useCallback(async () => {
    try {
      if (getToken() === null) return null
      return await axs.get('/auth')
    } catch (error) {}
  }, [axs])

  const listApartments = useCallback(() => {
    try {
      return axs.get(`/apartments`)
    } catch (error) {}
  }, [axs])

  const listUsers = useCallback(
    async url => {
      try {
        return await axs.get(`${url}`)
      } catch (error) {}
    },
    [axs]
  )

  const post = useCallback(
    async (url = '', data = {}) => {
      return axs.post(url, data)
    },
    [axs]
  )

  const put = useCallback(
    async (url = '', param, data = {}) => {
      try {
        return await axs.put(`${url}/${param}`, data)
      } catch (error) {}
    },
    [axs]
  )

  const del = useCallback(
    async (url = '', param) => {
      try {
        await axs.delete(`${url}/${param}`)
      } catch (error) {}
    },
    [axs]
  )

  const uploadImage = useCallback(
    async (userId: string, formData: FormData) => {
      return axs.post(`/users/${userId}/image-upload`, formData)
    },
    [axs]
  )

  return {
    getAuthUser,
    listApartments,
    listUsers,
    post,
    put,
    del,
    uploadImage,
  }
}

export default useApi
