import axios from 'axios';

// Create an Axios instance with custom configuration
const api = axios.create({
  baseURL: 'http://localhost:8081',
  withCredentials: true,
  }
);




export default api;