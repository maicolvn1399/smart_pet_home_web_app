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
  const [toggling, setToggling] = useState(false)
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
        .maybeSingle()

      console.log('Device lookup:', device, deviceError)

      if (deviceError || !device) {
        console.log('Device not found or error:', deviceError)
        setLoading(false)
        return
      }

      setDeviceId(device.id)
      console.log('Device ID set:', device.id)

      // Load door config
      const { data: config } = await supabase
        .from('pet_door_config')
        .select('*')
        .eq('device_id', device.id)
        .maybeSingle()

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

  async function toggleDoor() {
    console.log('toggleDoor called, deviceId:', deviceId)
    if (!deviceId) {
      console.log('No deviceId, returning early')
      return
    }
    setToggling(true)
    setError('')

    const newState = !doorOpen
    const command = newState ? 'open' : 'close'

    console.log('Inserting command:', command, 'for device:', deviceId)

    // Insert command for the Pico W to pick up
    const { error: cmdError } = await supabase
      .from('device_commands')
      .insert({
        device_id: deviceId,
        command,
        executed: false,
        expires_at: new Date(Date.now() + 60000).toISOString(),
      })

    if (cmdError) {
      console.log('Command insert error:', cmdError)
      setError(cmdError.message)
      setToggling(false)
      return
    }

    console.log('Command inserted successfully')

    // Update door state in DB
    await supabase
      .from('pet_door_config')
      .upsert({
        device_id: deviceId,
        current_state: newState ? 'open' : 'closed',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'device_id' })

    setDoorOpen(newState)
    setToggling(false)
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
    toggling,
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