import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

export function usePetDoor(serial) {
  const [doorOpen, setDoorOpen] = useState(false)
  const [ranges, setRanges] = useState([
    { id: generateId(), openTime: '08:00', closeTime: '20:00' },
  ])
  const [deviceId, setDeviceId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (!serial) return

    async function loadConfig() {
      setLoading(true)

      const { data: device, error: deviceError } = await supabase
        .from('devices')
        .select('id')
        .eq('serial_number', serial)
        .single()

      if (deviceError || !device) {
        setLoading(false)
        return
      }

      setDeviceId(device.id)

      // Load door config
      const { data: config } = await supabase
        .from('pet_door_config')
        .select('*')
        .eq('device_id', device.id)
        .single()

      if (config) {
        setDoorOpen(config.current_state === 'open')
      }

      // Load door schedule times
      const { data: scheduleTimes } = await supabase
        .from('door_schedule_times')
        .select('*')
        .eq('device_id', device.id)
        .order('scheduled_time', { ascending: true })

      if (scheduleTimes && scheduleTimes.length > 0) {
        // Group open/close pairs into ranges
        const openTimes = scheduleTimes.filter((s) => s.action === 'open')
        const closeTimes = scheduleTimes.filter((s) => s.action === 'close')
        const paired = openTimes.map((open, i) => ({
          id: generateId(),
          openTime: open.scheduled_time.slice(0, 5),
          closeTime: closeTimes[i]?.scheduled_time.slice(0, 5) ?? '20:00',
        }))
        if (paired.length > 0) setRanges(paired)
      }

      setLoading(false)
    }

    loadConfig()
  }, [serial])

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

  async function handleSave() {
    if (!deviceId) return
    setSaving(true)
    setError('')
    setSuccessMsg('')

    // Upsert door config
    const { error: configError } = await supabase
      .from('pet_door_config')
      .upsert({
        device_id: deviceId,
        current_state: doorOpen ? 'open' : 'closed',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'device_id' })

    if (configError) {
      setError(configError.message)
      setSaving(false)
      return
    }

    // Delete existing schedule times and re-insert
    await supabase
      .from('door_schedule_times')
      .delete()
      .eq('device_id', deviceId)

    if (ranges.length > 0) {
      const rows = ranges.flatMap((r) => [
        { device_id: deviceId, scheduled_time: r.openTime, action: 'open' },
        { device_id: deviceId, scheduled_time: r.closeTime, action: 'close' },
      ])

      const { error: scheduleError } = await supabase
        .from('door_schedule_times')
        .insert(rows)

      if (scheduleError) {
        setError(scheduleError.message)
        setSaving(false)
        return
      }
    }

    setSaving(false)
    setSuccessMsg('Settings saved!')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  return {
    doorOpen,
    ranges,
    loading,
    saving,
    error,
    successMsg,
    toggleDoor,
    addRange,
    removeRange,
    updateOpenTime,
    updateCloseTime,
    handleSave,
  }
}