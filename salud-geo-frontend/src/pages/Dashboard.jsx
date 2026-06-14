import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { api } from '../services/api'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const CENTER = [21.1256, -101.6807]

function MapClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function Dashboard() {
  const navigate = useNavigate()
  const username = api.getCurrentUser() || 'Usuario'

  const [locations, setLocations] = useState([])
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(false)

  const [searchName, setSearchName] = useState('')
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')

  const [isDrawingZone, setIsDrawingZone] = useState(false)
  const [tempPoints, setTempPoints] = useState([])
  const [zoneName, setZoneName] = useState('')
  const [zoneDesc, setZoneDesc] = useState('')

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [tableOpen, setTableOpen] = useState(true)

  useEffect(() => {
    if (!api.isAuthenticated()) navigate('/login')
  }, [navigate])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [locData, zoneData] = await Promise.all([api.getLocations(), api.getZones()])
      setLocations(locData)
      setZones(zoneData)
    } catch (err) {
      alert('Error al cargar datos del mapa: ' + err.message)
      if (!api.isAuthenticated()) navigate('/login')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredLocations = useMemo(
    () => locations.filter((loc) => loc.name.toLowerCase().includes(searchName.toLowerCase())),
    [locations, searchName]
  )

  const handleMapClick = async (lat, lng) => {
    if (isDrawingZone) {
      setTempPoints((prev) => [...prev, [lat, lng]])
      return
    }

    if (!newName.trim()) {
      alert('Por favor, introduce un nombre en el panel lateral antes de pulsar en el mapa.')
      return
    }

    try {
      await api.createLocation({ name: newName, description: newDesc, lat, lng })
      setNewName('')
      setNewDesc('')
      await loadData()
    } catch (err) {
      alert(err.message)
    }
  }

  const startEdit = (loc) => {
    setEditId(loc._id)
    setEditName(loc.name)
    setEditDesc(loc.description || '')
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await api.updateLocation(editId, { name: editName, description: editDesc })
      setEditId(null)
      await loadData()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDeleteLocation = async (id) => {
    if (!window.confirm('¿Eliminar esta ubicación de forma permanente?')) return
    try {
      await api.deleteLocation(id)
      await loadData()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleSaveZone = async (e) => {
    e.preventDefault()
    if (tempPoints.length < 3) {
      alert('Traza al menos 3 puntos en el mapa para formar una zona.')
      return
    }
    if (!zoneName.trim()) {
      alert('Asigna un nombre a la zona.')
      return
    }
    try {
      await api.createZone({ name: zoneName, description: zoneDesc, coordinates: tempPoints })
      setZoneName('')
      setZoneDesc('')
      setTempPoints([])
      setIsDrawingZone(false)
      await loadData()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDeleteZone = async (id) => {
    if (!window.confirm('¿Borrar esta zona trazada?')) return
    try {
      await api.deleteZone(id)
      await loadData()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleLogout = () => {
    api.logout()
    navigate('/login')
  }

  return (
    <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <header className="main-header" style={{ flexShrink: 0 }}>
        <h1>Mapa General</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <span style={{ color: 'var(--text-muted)' }}>
            Bienvenido, <strong style={{ color: 'var(--text-main)' }}>{username}</strong>
          </span>
          <button className="btn-primary" onClick={() => navigate('/personal')}>
            Personal de Salud
          </button>
          <button
            onClick={handleLogout}
            style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '10px 16px', borderRadius: 6, cursor: 'pointer' }}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden' }}>
        
        <aside 
          className="sidebar" 
          style={{ 
            width: sidebarOpen ? '300px' : '0px',
            minWidth: sidebarOpen ? '300px' : '0px',
            transition: 'all 0.3s ease',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: sidebarOpen ? '20px' : '0px',
            borderRight: sidebarOpen ? '1px solid var(--border)' : 'none',
            position: 'relative'
          }}
        >
          {sidebarOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '260px' }}>
              <div>
                <h3 style={{ marginTop: 0 }}>Buscar ubicación</h3>
                <input
                  type="text"
                  className="search-input"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Filtrar por nombre..."
                />
                {searchName && (
                  <button className="btn-primary" style={{ marginTop: 10, width: '100%' }} onClick={() => setSearchName('')}>
                    Limpiar búsqueda
                  </button>
                )}
              </div>

              <div>
                <h3>Registrar punto</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 10 }}>
                  Llena los datos y haz clic en el mapa para guardar la ubicación exacta.
                </p>
                <input
                  type="text"
                  className="form-control"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nombre (ej. Hospital General)"
                  style={{ marginBottom: 10 }}
                />
                <input
                  type="text"
                  className="form-control"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Descripción / especialidad"
                />
              </div>

              <div>
                <h3>Trazar zona</h3>
                {!isDrawingZone ? (
                  <button className="btn-primary" style={{ width: '100%' }} onClick={() => setIsDrawingZone(true)}>
                    Activar modo trazo
                  </button>
                ) : (
                  <form onSubmit={handleSaveZone} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <p style={{ color: 'var(--accent)', fontSize: 13 }}>
                      Haz clic en el mapa para delimitar el área ({tempPoints.length} puntos).
                    </p>
                    <input
                      type="text"
                      className="form-control"
                      value={zoneName}
                      onChange={(e) => setZoneName(e.target.value)}
                      placeholder="Nombre de la zona"
                      required
                    />
                    <input
                      type="text"
                      className="form-control"
                      value={zoneDesc}
                      onChange={(e) => setZoneDesc(e.target.value)}
                      placeholder="Descripción de cobertura/riesgo"
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                        Guardar figura
                      </button>
                      <button
                        type="button"
                        onClick={() => { setIsDrawingZone(false); setTempPoints([]) }}
                        style={{ flex: 1, background: '#7f1d1d', color: '#fecaca', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div>
                <h3>Resumen</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                  Ubicaciones: <strong style={{ color: 'var(--accent)' }}>{locations.length}</strong>
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                  Zonas trazadas: <strong style={{ color: 'var(--accent)' }}>{zones.length}</strong>
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                  Coincidencias: <strong style={{ color: 'var(--accent)' }}>{filteredLocations.length}</strong>
                </p>
              </div>
            </div>
          )}
        </aside>

        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'absolute',
            left: sidebarOpen ? '300px' : '0px',
            top: '10px',
            zIndex: 1000,
            background: 'var(--bg-main, #1e1e1e)',
            color: 'var(--text-main, #ffffff)',
            border: '1px solid var(--border, #333)',
            borderRadius: '0 6px 6px 0',
            padding: '12px 8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '2px 0 5px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={sidebarOpen ? "Ocultar panel lateral" : "Mostrar panel lateral"}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
          
          <div style={{ flex: 1, width: '100%', height: '100%', position: 'relative' }}>
            <MapContainer center={CENTER} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <MapClickHandler onClick={handleMapClick} />

              {filteredLocations.map((loc) => (
                <Marker key={loc._id} position={[loc.lat, loc.lng]}>
                  <Popup>
                    {editId === loc._id ? (
                      <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 160 }}>
                        <input value={editName} onChange={(e) => setEditName(e.target.value)} required placeholder="Nombre" />
                        <input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Descripción" />
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button type="submit">Guardar</button>
                          <button type="button" onClick={() => setEditId(null)}>Cancelar</button>
                        </div>
                      </form>
                    ) : (
                      <div style={{ minWidth: 150 }}>
                        <strong>{loc.name}</strong>
                        <br />
                        {loc.description || 'Sin descripción'}
                        <br />
                        <small>{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</small>
                        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                          <button onClick={() => startEdit(loc)}>Editar</button>
                          <button onClick={() => handleDeleteLocation(loc._id)}>Borrar</button>
                        </div>
                      </div>
                    )}
                  </Popup>
                </Marker>
              ))}

              {zones.map((zone) => (
                <Polygon key={zone._id} positions={zone.coordinates} pathOptions={{ color: '#ef4444' }}>
                  <Popup>
                    <strong>Zona: {zone.name}</strong>
                    <br />
                    {zone.description || 'Sin descripción'}
                    <br />
                    <button onClick={() => handleDeleteZone(zone._id)} style={{ marginTop: 8 }}>Eliminar zona</button>
                  </Popup>
                </Polygon>
              ))}

              {tempPoints.length > 0 && (
                <Polygon positions={tempPoints} pathOptions={{ color: '#3b82f6', dashArray: '5, 5' }} />
              )}
            </MapContainer>
          </div>

          <button 
            onClick={() => setTableOpen(!tableOpen)}
            style={{
              position: 'absolute',
              bottom: tableOpen ? '250px' : '0px',
              right: '20px',
              zIndex: 1000,
              background: 'var(--bg-main, #1e1e1e)',
              color: 'var(--text-main, #ffffff)',
              border: '1px solid var(--border, #333)',
              borderRadius: '6px 6px 0 0',
              padding: '8px 16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 -2px 5px rgba(0,0,0,0.3)',
              fontWeight: 'bold',
              fontSize: '13px'
            }}
          >
            {tableOpen ? '▼ Ocultar Tabla' : '▲ Mostrar Tabla'}
          </button>

          <div 
            className="data-table-wrapper" 
            style={{ 
              height: tableOpen ? '250px' : '0px',
              minHeight: tableOpen ? '250px' : '0px',
              transition: 'all 0.3s ease',
              overflowY: 'auto',
              background: 'var(--bg-sidebar, #121212)',
              borderTop: tableOpen ? '1px solid var(--border)' : 'none',
              padding: tableOpen ? '15px 20px' : '0px 20px'
            }}
          >
            {tableOpen && (
              <>
                <h3 style={{ marginTop: 0, marginBottom: 12 }}>Ubicaciones registradas</h3>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Latitud</th>
                      <th>Longitud</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLocations.map((loc) => (
                      <tr key={loc._id}>
                        <td>{loc.name}</td>
                        <td>{loc.description || 'Sin descripción'}</td>
                        <td>{loc.lat}</td>
                        <td>{loc.lng}</td>
                      </tr>
                    ))}
                    {filteredLocations.length === 0 && (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
                          {loading ? 'Cargando ubicaciones...' : 'No hay ubicaciones registradas o encontradas.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard