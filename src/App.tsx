import { useEffect, useState } from 'react'

const API_URL = 'https://kooz-backend.onrender.com'

export default function App() {
  const [status, setStatus] = useState('Загрузка...')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp

    // Если открыто НЕ через Telegram (в браузере) — показываем заглушку
    if (!tg) {
      setStatus('Откройте через Telegram Mini App')
      return
    }

    tg.ready()
    tg.expand()

    const initData = tg.initData

    if (!initData) {
      setStatus('Ошибка: нет initData. Закройте и откройте заново через бота.')
      return
    }

    setStatus('Авторизация...')

    // Таймаут 10 секунд — если backend спит, не ждём вечно
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    fetch(`${API_URL}/api/auth/telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
      signal: controller.signal,
    })
      .then(async (r) => {
        clearTimeout(timeoutId)
        if (!r.ok) {
          const text = await r.text()
          throw new Error(`Сервер ответил ${r.status}: ${text}`)
        }
        return r.json()
      })
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setUser(data.user)
        setStatus('ok')
      })
      .catch((err) => {
        if (err.name === 'AbortError') {
          setStatus('Сервер долго не отвечает. Backend на Render, скорее всего, просыпается. Подождите 30 сек и обновите.')
        } else {
          setStatus(`Ошибка: ${err.message}`)
        }
      })
  }, [])

  // Если всё загрузилось — показываем приветствие
  if (status === 'ok' && user) {
    return (
      <div style={{ padding: 20, fontFamily: 'sans-serif', background: '#f5f5f5', minHeight: '100vh' }}>
        <h1>👋 Привет, {user.firstName || 'друг'}!</h1>
        <div style={{ background: 'white', padding: 16, borderRadius: 12, marginTop: 20 }}>
          <h3>🎨 Салон красоты "Анна"</h3>
          <p>Услуга: Маникюр с покрытием</p>
        </div>
      </div>
    )
  }

  // Показываем статус загрузки / ошибки
  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif', textAlign: 'center', marginTop: 100 }}>
      <h1>Kooz</h1>
      <p style={{ marginTop: 20, fontSize: 16, color: '#666' }}>{status}</p>
    </div>
  )
}
