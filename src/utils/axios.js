import axios from 'axios'

const instance = axios.create({
    baseURL: 'https://staff-backend-production-f69f.up.railway.app/api'
})

export default instance