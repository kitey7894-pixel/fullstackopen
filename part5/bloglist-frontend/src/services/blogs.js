import axios from 'axios'

const baseUrl = '/api/blogs'

let token = null

const setToken = newToken => {
  token = `Bearer ${newToken}`
}

const getAll = () => {
  return axios.get(baseUrl).then(response => response.data)
}

const create = newBlog => {
  const config = { headers: { Authorization: token } }
  return axios.post(baseUrl, newBlog, config).then(response => response.data)
}

const update = (id, updatedBlog) => {
  return axios.put(`${baseUrl}/${id}`, updatedBlog).then(response => response.data)
}

const remove = id => {
  const config = { headers: { Authorization: token } }
  return axios.delete(`${baseUrl}/${id}`, config).then(response => response.data)
}

export default { getAll, create, update, remove, setToken }
