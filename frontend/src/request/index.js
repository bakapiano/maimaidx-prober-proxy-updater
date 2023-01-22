import axios from 'axios'

// const HOST = "http://127.0.0.1:8081"

const service = axios.create({
    // baseURL: HOST,
    timeout: 1000 * 10,
})

service.interceptors.request.use(config => {
    return config
})

export default service
