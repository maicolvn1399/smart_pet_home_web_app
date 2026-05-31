import { useRef, useState } from 'react'

export const DEVICE_MAP = {
  KBL: { name: 'Kibble dispenser' },
  WTR: { name: 'Water dispenser' },
  TRT: { name: 'Treat dispenser' },
  BAL: { name: 'Ball launcher' },
  MOV: { name: 'Movement detector' },
  DOR: { name: 'Pet door' },
  TMP: { name: 'Temperature monitor' },
  VOC: { name: 'Voice communication' },
}

const VALID_SERIALS = [
  'SPH-KBL-A4B7C2',
  'SPH-WTR-X9Y2Z5',
  'SPH-TRT-K8L1M4',
  'SPH-BAL-P3Q7R1',
  'SPH-MOV-H5J2K9',
  'SPH-DOR-T6U3V8',
  'SPH-TMP-W1X4Y7',
  'SPH-VOC-B2C5D8',
]

function parseSerial(serial) {
  const parts = serial.toUpperCase().split('-')
  if (parts.length !== 3) return null
  if (parts[0] !== 'SPH') return null
  if (!DEVICE_MAP[parts[1]]) return null
  if (parts[2].length !== 6) return null
  return { prefix: parts[0], typeCode: parts[1], uid: parts[2] }
}

export function useDevices() {
  const [devices, setDevices] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [error, setError] = useState('')

  const seg1Ref = useRef(null)
  const seg2Ref = useRef(null)
  const seg3Ref = useRef(null)

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

  function handleConfirm() {
    const serial = getSerial()
    const parsed = parseSerial(serial)

    if (!parsed) {
      setError('Invalid format. Expected SPH - XXX - XXXXXX.')
      return
    }

    if (!VALID_SERIALS.includes(serial)) {
      setError('Serial number not recognized.')
      return
    }

    if (devices.find((d) => d.serial === serial)) {
      setError('This device is already registered.')
      return
    }

    const deviceInfo = DEVICE_MAP[parsed.typeCode]
    setDevices((prev) => [...prev, { ...deviceInfo, serial, id: serial }])
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