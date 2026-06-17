import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

export function useKibbleDispenser(serial) {
  const [feedingCount, setFeedingCount] = useState(1)
  const [sessions, setSessions] = useState([
    { id: generateId(), time: '08:00', index: 0 },
  ])
  const [dailyGrams, setDailyGrams] = useState(500)
  const [mode, setMode] = useState('smart')
  const [waitMinutes, setWaitMinutes] = useState(30)
  const [deviceId, setDeviceId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const gramsPerSession = sessions.length > 0
    ? Math.round(dailyGrams / sessions.length)
    : 0

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

      const { data: config } = await supabase
        .from('kibble_dispenser_config')
        .select('*')
        .eq('device_id', device.id)
        .single()

      if (config) {
        setDailyGrams(config.total_grams)
        setFeedingCount(config.meals_per_day)
        setMode(config.mode)
        setWaitMinutes(config.wait_minutes ?? 30)
      }

      const { data: scheduleTimes } = await supabase
        .from('feeding_schedule_times')
        .select('*')
        .eq('device_id', device.id)
        .order('meal_number', { ascending: true })

      if (scheduleTimes && scheduleTimes.length > 0) {
        setSessions(scheduleTimes.map((s, i) => ({
          id: s.id,
          time: s.scheduled_time.slice(0, 5),
          index: i,
        })))
        setFeedingCount(scheduleTimes.length)
      }

      setLoading(false)
    }

    loadConfig()
  }, [serial])

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

  function handleWaitMinutesChange(e) {
    const val = parseInt(e.target.value)
    if (!isNaN(val) && val > 0) setWaitMinutes(val)
  }

  async function handleSave() {
    if (!deviceId) return
    setSaving(true)
    setError('')
    setSuccessMsg('')

    const { error: configError } = await supabase
      .from('kibble_dispenser_config')
      .upsert({
        device_id: deviceId,
        total_grams: dailyGrams,
        meals_per_day: feedingCount,
        mode,
        wait_minutes: waitMinutes,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'device_id' })

    if (configError) {
      setError(configError.message)
      setSaving(false)
      return
    }

    await supabase
      .from('feeding_schedule_times')
      .delete()
      .eq('device_id', deviceId)

    if (sessions.length > 0) {
      const { error: scheduleError } = await supabase
        .from('feeding_schedule_times')
        .insert(sessions.map((s, i) => ({
          device_id: deviceId,
          meal_number: i + 1,
          scheduled_time: s.time,
        })))

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
    feedingCount,
    sessions,
    dailyGrams,
    mode,
    waitMinutes,
    gramsPerSession,
    loading,
    saving,
    error,
    successMsg,
    setMode,
    handleFeedingCountChange,
    removeSession,
    updateTime,
    handleDailyGramsChange,
    handleWaitMinutesChange,
    handleSave,
  }
}