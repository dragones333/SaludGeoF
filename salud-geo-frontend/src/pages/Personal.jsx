import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

const EMPTY_FORM = { fullName: '', specialty: '', phone: '', status: 'Activo', assignedLocation: '' }

function Personal() {
  const navigate = useNavigate()

  const [staff, setStaff] = useState([])
  const [locations, setLocations] = useState([])
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!api.isAuthenticated()) navigate('/login')
  }, [navigate])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [staffData, locationData] = await Promise.all([api.getStaff(), api.getLocations()])
      setStaff(staffData)
      setLocations(locationData)
    } catch (err) {
      alert('Error al cargar datos: ' + err.message)
      if (!api.isAuthenticated()) navigate('/login')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const resetForm = () => {
    setFormData(EMPTY_FORM)
    setEditId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.assignedLocation) {
      alert('Debes asignar una sede (Hospital/Clínica) al personal.')
      return
    }
    try {
      if (editId) {
        await api.updateStaff(editId, formData)
      } else {
        await api.createStaff(formData)
      }
      resetForm()
      await loadData()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleEdit = (member) => {
    setEditId(member._id)
    setFormData({
      fullName: member.fullName,
      specialty: member.specialty,
      phone: member.phone || '',
      status: member.status,
      assignedLocation: member.assignedLocation?._id || '',
    })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar a este miembro del personal de salud?')) return
    try {
      await api.deleteStaff(id)
      if (editId === id) resetForm()
      await loadData()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="dashboard-container">
      <header className="main-header">
        <h1>Administración de Personal de Salud</h1>
        <button className="btn-primary" onClick={() => navigate('/')}>
          Volver al Mapa
        </button>
      </header>

      <aside className="sidebar">
        <h3 style={{ marginTop: 0 }}>{editId ? 'Editar registro' : 'Registrar personal'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: 'var(--text-muted)' }}>Nombre completo</label>
            <input name="fullName" className="form-control" value={formData.fullName} onChange={handleChange} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: 'var(--text-muted)' }}>Especialidad</label>
            <input name="specialty" className="form-control" value={formData.specialty} onChange={handleChange} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: 'var(--text-muted)' }}>Teléfono</label>
            <input name="phone" className="form-control" value={formData.phone} onChange={handleChange} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: 'var(--text-muted)' }}>Estado</label>
            <select name="status" className="form-control" value={formData.status} onChange={handleChange}>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: 'var(--text-muted)' }}>Sede asignada</label>
            <select name="assignedLocation" className="form-control" value={formData.assignedLocation} onChange={handleChange} required>
              <option value="">-- Seleccionar sede --</option>
              {locations.map((loc) => (
                <option key={loc._id} value={loc._id}>{loc.name}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: 6 }}>
            {editId ? 'Actualizar datos' : 'Guardar personal'}
          </button>
          {editId && (
            <button
              type="button"
              onClick={resetForm}
              style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '10px 16px', borderRadius: 6, cursor: 'pointer' }}
            >
              Cancelar edición
            </button>
          )}
        </form>
      </aside>

      <main className="main-content">
        <div className="data-table-wrapper">
          <h3 style={{ marginTop: 0 }}>Listado de personal</h3>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Especialidad</th>
                <th>Teléfono</th>
                <th>Sede asignada</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member._id}>
                  <td>{member.fullName}</td>
                  <td>{member.specialty}</td>
                  <td>{member.phone || '—'}</td>
                  <td>
                    {member.assignedLocation ? (
                      member.assignedLocation.name
                    ) : (
                      <span style={{ color: '#ef4444' }}>No asignada</span>
                    )}
                  </td>
                  <td>{member.status}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(member)}
                      style={{ background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', marginRight: 6 }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(member._id)}
                      style={{ background: '#7f1d1d', color: '#fecaca', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}
                    >
                      Borrar
                    </button>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
                    {loading ? 'Cargando personal...' : 'No hay personal de salud registrado.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

export default Personal
