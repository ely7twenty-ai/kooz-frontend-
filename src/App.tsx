import { useEffect, useState } from 'react'

const API_URL = 'https://kooz-backend.onrender.com'

export default function App() {
  const [user, setUser] = useState<any>(null)
  const [masters, setMasters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (!tg) {
      setError('Откройте через Telegram')
      setLoading(false)
      return
    }
    tg.ready()
    tg.expand()

    const initData = tg.initData
    if (!initData) {
      setError('Откройте через Telegram (нет initData)')
      setLoading(false)
      return
    }

    fetch(`${API_URL}/api/auth/telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(data => {
        if (data.error) throw new Error(data.error)
        setUser(data.user)
        localStorage.setItem('token', data.token)
        return fetch(`${API_URL}/api/masters`)
      })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(data => {
        setMasters(data || [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message || 'Ошибка загрузки')
        setLoading(false)
      })
  }, [])

  if (loading) return <div style={{ padding: 100, textAlign: 'center' }}>Загрузка...</div>
  if (error) return <div style={{ padding: 100, textAlign: 'center', color: 'red' }}>{error}</div>

  return (
    <div style={{ padding: 16 }}>
      <h2>Привет, {user?.firstName || 'Гость'}!</h2>
      <p style={{ margin: '16px 0' }}>Мастера:</p>
      {masters.length === 0 && <p>Пока нет мастеров</p>}
      {masters.map((m: any) => (
        <div key={m.id} style={{ background: '#f5f5f5', borderRadius: 12, padding: 16, marginBottom: 12 }}>
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
