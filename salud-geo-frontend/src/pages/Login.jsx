import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

function Login() {
  const [isRegister, setIsRegister] = useState(false)

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isRegister) {
        // Crea el usuario en MongoDB (password encriptado con bcrypt en el backend).
        await api.register({ username, email, password })
        alert('Cuenta creada con éxito. Ahora puedes iniciar sesión.')
        setIsRegister(false)
        setPassword('')
      } else {
        // Valida credenciales contra MongoDB; api.login guarda el JWT en localStorage.
        await api.login({ username, password })
        navigate('/')
      }
    } catch (err) {
      setError(err.message || 'Ocurrió un error en el proceso.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 style={{ marginTop: 0, textAlign: 'center', color: '#fff' }}>
          {isRegister ? 'Registro de Personal Sanitario' : 'Gestión Geográfica de Salud'}
        </h2>

        {error && (
          <div style={{ background: '#7f1d1d', color: '#fecaca', padding: '10px', borderRadius: 6, marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: 'var(--text-muted)' }}>Usuario</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: jorge_admin"
              required
            />
          </div>

          {isRegister && (
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: 'var(--text-muted)' }}>Correo electrónico</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@salud.gob.mx"
                required
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, color: 'var(--text-muted)' }}>Contraseña</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Procesando...' : isRegister ? 'Crear cuenta' : 'Ingresar al sistema'}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: 14, color: 'var(--text-muted)', textAlign: 'center' }}>
          {isRegister ? '¿Ya tienes una cuenta?' : '¿Eres nuevo en la plataforma?'}
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError('') }}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', marginLeft: 6, textDecoration: 'underline' }}
          >
            {isRegister ? 'Inicia sesión' : 'Regístrate aquí'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Login
