import axios from 'axios'
import { env } from '../common/env'

console.log(import.meta.env)

const config = {
  timeout: 1000 * 10,
}

if (env.dev) {
  config.baseURL = 'http://127.0.0.1:8081'
}

const service = axios.create(config)

service.interceptors.request.use((config) => {
  return config
})

export default service
