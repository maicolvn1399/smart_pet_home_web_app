import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useWaterDispenser(serial) {
  const [deviceId, setDeviceId]             = useState(null)
  const [source, setSource]                 = useState('tank')
  const [lowLevelThresh, setLowLevelThresh] = useState(20)
  const [currentLevel, setCurrentLevel]     = useState(null)
  const [logs, setLogs]                     = useState([])
  const [loading, setLoading]               = useState(true)
  const [saving, setSaving]                 = useState(false)
  const [error, setError]                   = useState('')
  const [successMsg, setSuccessMsg]         = useState('')

  useEffect(() => {
    if (!serial) return
    loadConfig()
  }, [serial])

  async function loadConfig() {
    setLoading(true)

    const { data: device } = await supabase
      .from('devices')
      .select('id')
      .eq('serial_number', serial)
      .maybeSingle()

    if (!device) { setLoading(false); return }

    setDeviceId(device.id)

    const { data: config } = await supabase
      .from('water_dispenser_config')
      .select('*')
      .eq('device_id', device.id)
      .maybeSingle()

    if (config) {
      setSource(config.source)
      setLowLevelThresh(config.low_level_thresh)
    }

    const { data: latestLog } = await supabase
      .from('water_logs')
      .select('*')
      .eq('device_id', device.id)
      .eq('event_type', 'reading')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latestLog) setCurrentLevel(latestLog.level_percent)

    const { data: recentLogs } = await supabase
      .from('water_logs')
      .select('*')
      .eq('device_id', device.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (recentLogs) setLogs(recentLogs)

    setLoading(false)
  }

  useEffect(() => {
    if (!deviceId) return

    async function pollLevel() {
      const { data: latestLog } = await supabase
        .from('water_logs')
        .select('level_percent')
        .eq('device_id', deviceId)
        .eq('event_type', 'reading')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (latestLog) setCurrentLevel(latestLog.level_percent)
    }

    const interval = setInterval(pollLevel, 30000)
    return () => clearInterval(interval)
  }, [deviceId])

  async function handleSave() {
    if (!deviceId) return
    setSaving(true)
    setError('')
    setSuccessMsg('')

    const { error: configError } = await supabase
      .from('water_dispenser_config')
      .upsert({
        device_id:        deviceId,
        source,
        low_level_thresh: lowLevelThresh,
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
    source,          setSource,
    lowLevelThresh,  setLowLevelThresh,
    currentLevel,
    logs,
    loading,
    saving,
    error,
    successMsg,
    handleSave,
  }
}