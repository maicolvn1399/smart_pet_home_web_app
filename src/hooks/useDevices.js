import { useRef, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { usePet } from '@/context/PetContext'

export const DEVICE_MAP = {
  KBL: { name: 'Kibble dispenser',    type: 'kibble_dispenser'    },
  WTR: { name: 'Water dispenser',     type: 'water_dispenser'     },
  TRT: { name: 'Treat dispenser',     type: 'treat_dispenser'     },
  BAL: { name: 'Ball launcher',       type: 'ball_launcher'       },
  MOV: { name: 'Movement detector',   type: 'movement_detector'   },
  DOR: { name: 'Pet door',            type: 'pet_door'            },
  TMP: { name: 'Temperature monitor', type: 'temperature_monitor' },
  VOC: { name: 'Voice communication', type: 'voice_communication' },
}

function parseSerial(serial) {
  const parts = serial.toUpperCase().split('-')
  if (parts.length !== 3) return null
  if (parts[0] !== 'SPH') return null
  if (!DEVICE_MAP[parts[1]]) return null
  if (parts[2].length !== 6) return null
  return { prefix: parts[0], typeCode: parts[1], uid: parts[2] }
}

export function useDevices() {
  const { activePet } = usePet()
  const [devices, setDevices] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const seg1Ref = useRef(null)
  const seg2Ref = useRef(null)
  const seg3Ref = useRef(null)

  // Fetch devices for active pet
  useEffect(() => {
    if (!activePet) return

    async function fetchDevices() {
      setLoading(true)

      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('pet_id', activePet.id)
        .order('created_at', { ascending: true })

      if (!error && data) setDevices(data)
      setLoading(false)
    }

    fetchDevices()
  }, [activePet])

  function getSerial() {
    const s1 = seg1Ref.current?.value.toUpperCase() ?? ''
    const s2 = seg2Ref.current?.value.toUpperCase() ?? ''
    const s3 = seg3Ref.current?.value.toUpperCase() ?? ''
    return `${s1}-${s2}-${s3}`
  }

  function clearInputs() {
    if (seg1Ref.current) seg1Ref.current.value = ''
    if (seg2Ref.current) seg2Ref.current.value = ''
    if (seg3Ref.current) seg3Ref.current.value = ''
  }

  function handleSeg1Change(e) {
    const val = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 3)
    e.target.value = val
    if (val.length === 3) seg2Ref.current?.focus()
    setError('')
  }

  function handleSeg2Change(e) {
    const val = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 3)
    e.target.value = val
    if (val.length === 3) seg3Ref.current?.focus()
    setError('')
  }

  function handleSeg3Change(e) {
    const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6)
    e.target.value = val
    setError('')
  }

  function handleSeg2Keydown(e) {
    if (e.key === 'Backspace' && seg2Ref.current?.value === '') {
      seg1Ref.current?.focus()
    }
  }

  function handleSeg3Keydown(e) {
    if (e.key === 'Backspace' && seg3Ref.current?.value === '') {
      seg2Ref.current?.focus()
    }
  }

  async function handleConfirm() {
    const serial = getSerial()
    const parsed = parseSerial(serial)

    if (!parsed) {
      setError('Invalid format. Expected SPH - XXX - XXXXXX.')
      return
    }

    if (!activePet) {
      setError('No active pet selected.')
      return
    }

    // Check if this pet already has this device
    const duplicate = devices.find((d) => d.serial_number === serial)
    if (duplicate) {
      setError('This device is already registered for this pet.')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Not authenticated.')
      return
    }

    const deviceInfo = DEVICE_MAP[parsed.typeCode]

    const { data, error: insertError } = await supabase
      .from('devices')
      .insert({
        pet_id: activePet.id,
        user_id: user.id,
        serial_number: serial,
        type: deviceInfo.type,
        name: deviceInfo.name,
        status: 'offline',
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      return
    }

    setDevices((prev) => [...prev, data])
    setError('')
    setDialogOpen(false)
    clearInputs()
  }

  function handleOpenChange(open) {
    setDialogOpen(open)
    if (!open) {
      setError('')
      clearInputs()
    }
  }

  return {
    devices,
    loading,
    dialogOpen,
    error,
    seg1Ref,
    seg2Ref,
    seg3Ref,
    handleSeg1Change,
    handleSeg2Change,
    handleSeg3Change,
    handleSeg2Keydown,
    handleSeg3Keydown,
    handleConfirm,
    handleOpenChange,
    setDialogOpen,
  }
}