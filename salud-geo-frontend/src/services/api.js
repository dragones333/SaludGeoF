
const BASE_URL = '/api'

const TOKEN_KEY = 'token'
const USER_KEY = 'username'

function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

function setSession(token, username) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  if (username) localStorage.setItem(USER_KEY, username)
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

/**
 * @param {string} path 
 * @param {object} opts 
 */
async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }

  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      clearSession()
    }
    const message = (data && data.message) || `Error ${res.status}`
    throw new Error(message)
  }

  return data
}

export const api = {
  isAuthenticated: () => !!getToken(),
  getCurrentUser: () => localStorage.getItem(USER_KEY),
  logout: () => clearSession(),

  register: (payload) =>
    request('/auth/register', { method: 'POST', body: payload, auth: false }),

  login: async (payload) => {
    const data = await request('/auth/login', { method: 'POST', body: payload, auth: false })
    if (data?.token) setSession(data.token, data.user?.username)
    return data
  },

  getLocations: (name) =>
    request(`/locations${name ? `?name=${encodeURIComponent(name)}` : ''}`),
  createLocation: (payload) => request('/locations', { method: 'POST', body: payload }),
  updateLocation: (id, changes) =>
    request(`/locations/${id}`, { method: 'PATCH', body: changes }),
  deleteLocation: (id) => request(`/locations/${id}`, { method: 'DELETE' }),

  getStaff: () => request('/staff'),
  createStaff: (payload) => request('/staff', { method: 'POST', body: payload }),
  updateStaff: (id, changes) => request(`/staff/${id}`, { method: 'PATCH', body: changes }),
  deleteStaff: (id) => request(`/staff/${id}`, { method: 'DELETE' }),

  getZones: () => request('/zones'),
  createZone: (payload) => request('/zones', { method: 'POST', body: payload }),
  deleteZone: (id) => request(`/zones/${id}`, { method: 'DELETE' }),
}

export default api
