import { useEffect, useState } from 'react'

const API_URL = 'https://kooz-backend.onrender.com'

export default function App() {
  const [status, setStatus] = useState('Загрузка...')

  useEffect(() => {
    // Проверяем, открыто ли через Telegram
    const tg = (window as any).Telegram?.WebApp
    if (!tg) {
      setStatus('Откройте через Telegram')
      return
    }

    tg.ready()
    tg.expand()

    const initData = tg.initData
    if (!initData) {
      setStatus('Ошибка: нет initData')
      return
    }

    setStatus('Авторизация...')

    fetch(`${API_URL}/api/auth/telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    })
      .then(r => {
        if (!r.ok) throw new Error(`Сервер ответил ${r.status}`)
        return r.json()
      })
      .then(data => {
        if (data.error) throw new Error(data.error)
        setStatus(`Привет, ${data.user?.firstName || 'друг'}! Данные загружены.`)
      })
      .catch(err => {
        setStatus(`Ошибка: ${err.message}`)
      })
  }, [])

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Kooz</h1>
      <p style={{ marginTop: 20, fontSize: 18 }}>{status}</p>
    </div>
  )
}
