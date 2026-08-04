import { useEffect, useState } from 'react'

const API_URL = 'https://kooz-backend.onrender.com'

export default function App() {
  const [status, setStatus] = useState('Загрузка...')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp

    if (!tg) {
      setStatus('Откройте через Telegram Mini App')
      return
    }

    tg.ready()
    tg.expand()

    const initData = tg.initData

    if (!initData) {
      setStatus('Ошибка: нет initData. Перезапустите через бота.')
      return
    }

    setStatus('Авторизация...')

    fetch(`${API_URL}/api/auth/telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    })
      .then(async (r) => {
        if (!r.ok) {
          const text = await r.text()
          throw new Error(`Сервер ${r.status}: ${text}`)
        }
        return r.json()
      })
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setUser(data.user)
        setStatus('ok')
      })
      .catch((err) => {
        setStatus(`Ошибка: ${err.message}`)
      })
  }, [])

  if (status === 'ok' && user) {
    return (
      <div style={{ padding: 20, fontFamily: 'sans-serif', background: '#f5f5f5', minHeight: '100vh' }}>
        <h1>👋 Привет, {user.firstName || 'друг'}!</h1>
        <div style={{ background: 'white', padding: 16, borderRadius: 12, marginTop: 20 }}>
          <h3>🎨 Салон красоты "Анна"</h3>
          <p>Услуга: Маникюр с покрытием</p>
          <p style={{ color: '#666', fontSize: 14 }}>Цена: 1500 ₽</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif', textAlign: 'center', marginTop: 100 }}>
      <h1>Kooz</h1>
      <p style={{ marginTop: 20, fontSize: 16, color: '#666' }}>{status}</p>
    </div>
  )
}
