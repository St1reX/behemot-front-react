import axios from 'axios'
import { appConfig } from '@/config/app.config'

export const apiHttp = axios.create({
  baseURL: appConfig.apiBaseUrl,
  headers: { Accept: 'application/json' },
  timeout: 30_000,
  withCredentials: true,
})
