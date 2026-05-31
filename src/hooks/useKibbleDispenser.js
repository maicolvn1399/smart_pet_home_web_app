import { useState } from 'react'

function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

export function useKibbleDispenser() {
  const [feedingCount, setFeedingCount] = useState(1)
  const [sessions, setSessions] = useState([
    { id: generateId(), time: '08:00', index: 0 },
  ])
  const [dailyGrams, setDailyGrams] = useState(500)
  const [mode, setMode] = useState('smart')

  const gramsPerSession = sessions.length > 0
    ? Math.round(dailyGrams / sessions.length)
    : 0

  function handleFeedingCountChange(newCount) {
    setFeedingCount(newCount)
    setSessions((prev) => {
      if (newCount > prev.length) {
        const toAdd = newCount - prev.length
        const added = Array.from({ length: toAdd }, (_, i) => ({
          id: generateId(),
          time: '12:00',
          index: prev.length + i,
        }))
        return [...prev, ...added]
      } else {
        return prev.slice(0, newCount).map((s, i) => ({ ...s, index: i }))
      }
    })
  }

  function removeSession(id) {
    setSessions((prev) => {
      const updated = prev
        .filter((s) => s.id !== id)
        .map((s, i) => ({ ...s, index: i }))
      setFeedingCount(updated.length)
      return updated
    })
  }

  function updateTime(id, time) {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, time } : s))
    )
  }

  function handleDailyGramsChange(e) {
    const val = parseInt(e.target.value)
    if (!isNaN(val) && val > 0) setDailyGrams(val)
  }

  return {
    feedingCount,
    sessions,
    dailyGrams,
    mode,
    gramsPerSession,
    setMode,
    handleFeedingCountChange,
    removeSession,
    updateTime,
    handleDailyGramsChange,
  }
}