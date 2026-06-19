import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

export function useBallLauncher(serial) {
  const [deviceId, setDeviceId]         = useState(null)
  const [defaultAngle, setDefaultAngle] = useState('center')
  const [ballCount, setBallCount]       = useState(null)
  const [schedule, setSchedule]         = useState([])
  const [logs, setLogs]                 = useState([])
  const [loading, setLoading]           = useState(true)
  const [saving, setSaving]             = useState(false)
  const [launching, setLaunching]       = useState(false)
  const [launched, setLaunched]         = useState(false)
  const [error, setError]               = useState('')
  const [successMsg, setSuccessMsg]     = useState('')

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
      .from('ball_launcher_config')
      .select('*')
      .eq('device_id', device.id)
      .maybeSingle()

    if (config) {
      setDefaultAngle(config.default_angle)
      setBallCount(config.ball_count ?? null)
    }

    const { data: scheduleData } = await supabase
      .from('ball_launch_schedule')
      .select('*')
      .eq('device_id', device.id)
      .order('scheduled_time', { ascending: true })

    setSchedule((scheduleData ?? []).map((s) => ({
      id:    s.id,
      time:  s.scheduled_time.slice(0, 5),
      angle: s.angle,
    })))

    const { data: recentLogs } = await supabase
      .from('ball_launch_logs')
      .select('*')
      .eq('device_id', device.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (recentLogs) setLogs(recentLogs)

    setLoading(false)
  }

  function addScheduleEntry() {
    setSchedule((prev) => [...prev, { id: generateId(), time: '12:00', angle: 'center' }])
  }

  function removeScheduleEntry(id) {
    setSchedule((prev) => prev.filter((s) => s.id !== id))
  }

  function updateScheduleEntry(id, field, value) {
    setSchedule((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s))
  }

  async function handleSave() {
    if (!deviceId) return
    setSaving(true)
    setError('')
    setSuccessMsg('')

    const { error: configError } = await supabase
      .from('ball_launcher_config')
      .upsert({
        device_id:     deviceId,
        default_angle: defaultAngle,
        updated_at:    new Date().toISOString(),
      }, { onConflict: 'device_id' })

    if (configError) {
      setError(configError.message)
      setSaving(false)
      return
    }

    await supabase
      .from('ball_launch_schedule')
      .delete()
      .eq('device_id', deviceId)

    if (schedule.length > 0) {
      const { error: scheduleError } = await supabase
        .from('ball_launch_schedule')
        .insert(schedule.map((s) => ({
          device_id:      deviceId,
          scheduled_time: s.time,
          angle:          s.angle,
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

  async function handleLaunch(angle) {
    if (!deviceId) return
    setLaunching(true)
    setLaunched(false)

    await supabase
      .from('device_commands')
      .insert({
        device_id:  deviceId,
        command:    'launch',
        params:     { angle },
        executed:   false,
        expires_at: new Date(Date.now() + 30000).toISOString(),
      })

    setLaunching(false)
    setLaunched(true)
    setTimeout(() => setLaunched(false), 3000)
  }

  return {
    defaultAngle,  setDefaultAngle,
    ballCount,
    schedule,
    logs,
    loading,
    saving,
    launching,
    launched,
    error,
    successMsg,
    addScheduleEntry,
    removeScheduleEntry,
    updateScheduleEntry,
    handleSave,
    handleLaunch,
  }
}