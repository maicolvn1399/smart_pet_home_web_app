import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useWaterDispenser(serial) {
  const [deviceId, setDeviceId]             = useState(null)
  const [source, setSource]                 = useState('monitor_only')
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
      setLowLevelThresh(config.low_level_threshold)
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

  // Realtime subscription — actualiza el nivel al instante
  useEffect(() => {
    if (!deviceId) return

    let cancelled = false

    const channel = supabase
      .channel(`water-${deviceId}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'water_logs',
          filter: `device_id=eq.${deviceId}`,
        },
        (payload) => {
          if (cancelled) return
          const log = payload.new
          if (log.event_type === 'reading') {
            setCurrentLevel(log.level_percent)
          }
          setLogs((prev) => [log, ...prev].slice(0, 20))
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [deviceId])

  async function handleSave() {
    if (!deviceId) return
    setSaving(true)
    setError('')
    setSuccessMsg('')

    const { error: configError } = await supabase
      .from('water_dispenser_config')
      .upsert({
        device_id:           deviceId,
        source,
        low_level_threshold: lowLevelThresh,
        updated_at:          new Date().toISOString(),
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