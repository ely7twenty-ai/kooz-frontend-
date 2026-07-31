import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://kooz-backend.onrender.com'

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void
        expand: () => void
        initData: string
        initDataUnsafe: { user?: { id: number; first_name: string } }
      }
    }
  }
}

export default function App() {
  const [user, setUser] = useState<any>(null)
  const [masters, setMasters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const tg = window.Telegram.WebApp
    tg.ready()
    tg.expand()

    const initData = tg.initData
    if (!initData) {
      setError('Откройте через Telegram')
      setLoading(false)
      return
    }

    fetch(`${API_URL}/api/auth/telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setUser(data.user)
        localStorage.setItem('token', data.token)
        return fetch(`${API_URL}/api/masters`)
      })
      .then(r => r.json())
      .then(data => {
        setMasters(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message || 'Ошибка')
        setLoading(false)
      })
  }, [])

  if (loading) return <div style={{ textAlign: 'center', marginTop: 100 }}>Загрузка...</div>
  if (error) return <div style={{ textAlign: 'center', marginTop: 100, color: 'red' }}>{error}</div>

  return (
    <div>
      <h2>Привет, {user?.firstName}!</h2>
      <p style={{ margin: '16px 0' }}>Мастера:</p>
      {masters.length === 0 && <p>Пока нет мастеров</p>}
      {masters.map((m: any) => (
        <div key={m.id} className="card">
          <h3>{m.title}</h3>
          <p>{m.description || 'Нет описания'}</p>
          <p style={{ opacity: 0.7, fontSize: 14 }}>
            {m.user?.firstName} {m.user?.lastName}
          </p>
        </div>
      ))}
    </div>
  )
}
