import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Plus,
  Bone,
  Droplets,
  Cookie,
  CircleDot,
  Radio,
  DoorOpen,
  Thermometer,
  Mic,
  AlertCircle,
} from 'lucide-react'

const DEVICE_MAP = {
  KBL: { name: 'Kibble dispenser',    Icon: Bone        },
  WTR: { name: 'Water dispenser',     Icon: Droplets    },
  TRT: { name: 'Treat dispenser',     Icon: Cookie      },
  BAL: { name: 'Ball launcher',       Icon: CircleDot   },
  MOV: { name: 'Movement detector',   Icon: Radio       },
  DOR: { name: 'Pet door',            Icon: DoorOpen    },
  TMP: { name: 'Temperature monitor', Icon: Thermometer },
  VOC: { name: 'Voice communication', Icon: Mic         },
}

// Placeholder serials — replace with real Supabase query later
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

function DeviceCard({ device }) {
  const { Icon, name, serial } = device
  return (
    <Card className="flex flex-col">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-8">
        <div className="w-16 h-16 rounded-2xl bg-brand-dark-blue/10 flex items-center justify-center">
          <Icon className="w-8 h-8 text-brand-dark-blue" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-brand-dark-blue">{name}</p>
          <p className="text-xs text-muted-foreground mt-1 font-mono">{serial}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Devices() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [devices, setDevices] = useState([])
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark-blue">My Devices</h1>
          <p className="text-muted-foreground mt-1">
            Manage all devices connected to your pet
          </p>
        </div>
        <Button size="lg" className="w-full md:w-auto" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Device
        </Button>
      </div>

      {/* Device grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-12">
            No devices yet. Click "Add New Device" to get started.
          </p>
        ) : (
          devices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))
        )}
      </div>

      {/* Add device dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a new device</DialogTitle>
            <DialogDescription>
              Enter the serial number found on your device.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Serial number
            </p>

            {/* Segmented input */}
            <div className="flex items-center gap-2">
              <input
                ref={seg1Ref}
                onChange={handleSeg1Change}
                maxLength={3}
                placeholder="SPH"
                className="w-16 text-center font-mono text-sm uppercase border border-input rounded-lg px-2 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
              <span className="text-muted-foreground font-bold">—</span>
              <input
                ref={seg2Ref}
                onChange={handleSeg2Change}
                onKeyDown={handleSeg2Keydown}
                maxLength={3}
                placeholder="XXX"
                className="w-16 text-center font-mono text-sm uppercase border border-input rounded-lg px-2 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
              <span className="text-muted-foreground font-bold">—</span>
              <input
                ref={seg3Ref}
                onChange={handleSeg3Change}
                onKeyDown={handleSeg3Keydown}
                maxLength={6}
                placeholder="XXXXXX"
                className="w-24 text-center font-mono text-sm uppercase border border-input rounded-lg px-2 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-destructive text-xs">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Format hint */}
            <p className="text-xs text-muted-foreground">
              Format: <span className="font-mono">SPH - XXX - XXXXXX</span>
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              Confirm device
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}