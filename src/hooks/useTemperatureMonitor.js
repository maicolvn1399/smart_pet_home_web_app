import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const MOCK_TEMP_CELSIUS = 27.4
const TEMP_MIN = 0
const TEMP_MAX = 40

function celsiusToFahrenheit(c) {
  return Math.round((c * 9) / 5 + 32)
}

export function tempToProgress(temp, min, max) {
  return Math.min(1, Math.max(0, (temp - min) / (max - min)))
}

export function useTemperatureMonitor(serial) {
  const [unit, setUnit] = useState('C')
  const [fanOn, setFanOn] = useState(false)
  const [scheduleMode, setScheduleMode] = useState('time')
  const [fanOnTime, setFanOnTime] = useState('14:00')
  const [fanOffTime, setFanOffTime] = useState('18:00')
  const [threshold, setThreshold] = useState(28)
  const [deviceId, setDeviceId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const displayTemp = unit === 'C'
    ? MOCK_TEMP_CELSIUS
    : celsiusToFahrenheit(MOCK_TEMP_CELSIUS)

  const tempColor = MOCK_TEMP_CELSIUS >= 30
    ? 'text-red-500'
    : MOCK_TEMP_CELSIUS >= 25
    ? 'text-amber-500'
    : 'text-brand-dark-blue'

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

      // Load temperature config
      const { data: config } = await supabase
        .from('temperature_monitor_config')
        .select('*')
        .eq('device_id', device.id)
        .single()

      if (config) {
        setThreshold(config.upper_threshold)
        setFanOn(config.fan_enabled)
      }

      // Load fan schedule times
      const { data: scheduleTimes } = await supabase
        .from('fan_schedule_times')
        .select('*')
        .eq('device_id', device.id)

      if (scheduleTimes && scheduleTimes.length > 0) {
        const onTime = scheduleTimes.find((s) => s.action === 'on')
        const offTime = scheduleTimes.find((s) => s.action === 'off')
        if (onTime) setFanOnTime(onTime.scheduled_time.slice(0, 5))
        if (offTime) setFanOffTime(offTime.scheduled_time.slice(0, 5))
        setScheduleMode('time')
      }

      setLoading(false)
    }

    loadConfig()
  }, [serial])

  function toggleFan() {
    setFanOn((prev) => !prev)
  }

  function incrementThreshold() {
    setThreshold((t) => Math.min(40, t + 1))
  }

  function decrementThreshold() {
    setThreshold((t) => Math.max(15, t - 1))
  }

  async function handleSave() {
    if (!deviceId) return
    setSaving(true)
    setError('')
    setSuccessMsg('')

    // Upsert temperature config
    const { error: configError } = await supabase
      .from('temperature_monitor_config')
      .upsert({
        device_id: deviceId,
        upper_threshold: threshold,
        lower_threshold: threshold - 2,
        fan_enabled: fanOn,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'device_id' })

    if (configError) {
      setError(configError.message)
      setSaving(false)
      return
    }

    // Save fan schedule times if time mode
    if (scheduleMode === 'time') {
      await supabase
        .from('fan_schedule_times')
        .delete()
        .eq('device_id', deviceId)

      const { error: scheduleError } = await supabase
        .from('fan_schedule_times')
        .insert([
          { device_id: deviceId, scheduled_time: fanOnTime, action: 'on' },
          { device_id: deviceId, scheduled_time: fanOffTime, action: 'off' },
        ])

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
    unit, setUnit,
    fanOn, toggleFan,
    scheduleMode, setScheduleMode,
    fanOnTime, setFanOnTime,
    fanOffTime, setFanOffTime,
    threshold,
    incrementThreshold,
    decrementThreshold,
    displayTemp,
    tempColor,
    rawTemp: MOCK_TEMP_CELSIUS,
    tempMin: TEMP_MIN,
    tempMax: TEMP_MAX,
    loading,
    saving,
    error,
    successMsg,
    handleSave,
  }
}