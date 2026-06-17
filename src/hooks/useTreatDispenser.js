import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useTreatDispenser(serial) {
  const [deviceId, setDeviceId]     = useState(null)
  const [petId, setPetId]           = useState(null)
  const [dailyLimit, setDailyLimit] = useState(5)
  const [cooldown, setCooldown]     = useState(1800) // stored in seconds
  const [usedToday, setUsedToday]   = useState(0)
  const [sessions, setSessions]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (!serial) return
    loadConfig()
  }, [serial])

  async function loadConfig() {
    setLoading(true)

    const { data: device } = await supabase
      .from('devices')
      .select('id, pet_id')
      .eq('serial_number', serial)
      .maybeSingle()

    if (!device) { setLoading(false); return }

    setDeviceId(device.id)
    setPetId(device.pet_id)

    const { data: config } = await supabase
      .from('treat_dispenser_config')
      .select('*')
      .eq('device_id', device.id)
      .maybeSingle()

    if (config) {
      setDailyLimit(config.daily_limit)
      setCooldown(config.cooldown_seconds ?? config.cooldown_minutes * 60 ?? 1800)
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: todaySessions } = await supabase
      .from('treat_sessions')
      .select('*')
      .eq('device_id', device.id)
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false })

    if (todaySessions) {
      setSessions(todaySessions)
      setUsedToday(todaySessions.filter((s) => s.won).length)
    }

    setLoading(false)
  }

  async function handleSave() {
    if (!deviceId) return
    setSaving(true)
    setError('')
    setSuccessMsg('')

    const { error: configError } = await supabase
      .from('treat_dispenser_config')
      .upsert({
        device_id:        deviceId,
        daily_limit:      dailyLimit,
        cooldown_seconds: cooldown,
        updated_at:       new Date().toISOString(),
      }, { onConflict: 'device_id' })

    if (configError) {
      setError(configError.message)
      setSaving(false)
      return
    }

    setSaving(false)
    setSuccessMsg('Settings saved!')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  return {
    dailyLimit,  setDailyLimit,
    cooldown,    setCooldown,
    usedToday,
    sessions,
    loading,
    saving,
    error,
    successMsg,
    handleSave,
  }
}