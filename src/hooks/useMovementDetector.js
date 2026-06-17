import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useMovementDetector(serial) {
  const [deviceId, setDeviceId]               = useState(null)
  const [inactivityThreshold, setInactivityThreshold] = useState(60)
  const [lastMotion, setLastMotion]           = useState(null)
  const [logs, setLogs]                       = useState([])
  const [loading, setLoading]                 = useState(true)
  const [saving, setSaving]                   = useState(false)
  const [error, setError]                     = useState('')
  const [successMsg, setSuccessMsg]           = useState('')

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

    // Load config
    const { data: config } = await supabase
      .from('movement_detector_config')
      .select('*')
      .eq('device_id', device.id)
      .maybeSingle()

    if (config) {
      setInactivityThreshold(config.inactivity_threshold_min)
    }

    // Load recent motion logs
    const { data: motionLogs } = await supabase
      .from('movement_logs')
      .select('*')
      .eq('device_id', device.id)
      .eq('motion_detected', true)
      .order('created_at', { ascending: false })
      .limit(20)

    if (motionLogs && motionLogs.length > 0) {
      setLogs(motionLogs)
      setLastMotion(motionLogs[0].created_at)
    }

    setLoading(false)
  }

  async function handleSave() {
    if (!deviceId) return
    setSaving(true)
    setError('')
    setSuccessMsg('')

    const { error: configError } = await supabase
      .from('movement_detector_config')
      .upsert({
        device_id:                deviceId,
        inactivity_threshold_min: inactivityThreshold,
        updated_at:               new Date().toISOString(),
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
    inactivityThreshold, setInactivityThreshold,
    lastMotion,
    logs,
    loading,
    saving,
    error,
    successMsg,
    handleSave,
  }
}