import { useState } from 'react'

function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

export function usePetDoor() {
  const [doorOpen, setDoorOpen] = useState(false)
  const [ranges, setRanges] = useState([
    { id: generateId(), openTime: '08:00', closeTime: '20:00' },
  ])

  function toggleDoor() {
    setDoorOpen((prev) => !prev)
  }

  function addRange() {
    setRanges((prev) => [
      ...prev,
      { id: generateId(), openTime: '08:00', closeTime: '20:00' },
    ])
  }

  function removeRange(id) {
    setRanges((prev) => prev.filter((r) => r.id !== id))
  }

  function updateOpenTime(id, time) {
    setRanges((prev) =>
      prev.map((r) => (r.id === id ? { ...r, openTime: time } : r))
    )
  }

  function updateCloseTime(id, time) {
    setRanges((prev) =>
      prev.map((r) => (r.id === id ? { ...r, closeTime: time } : r))
    )
  }

  return {
    doorOpen,
    ranges,
    toggleDoor,
    addRange,
    removeRange,
    updateOpenTime,
    updateCloseTime,
  }
}