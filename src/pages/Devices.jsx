import { useNavigate } from 'react-router-dom'
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
  ChevronRight,
} from 'lucide-react'
import { useDevices } from '@/hooks/useDevices'

const DEVICE_ICONS = {
  kibble_dispenser:    Bone,
  water_dispenser:     Droplets,
  treat_dispenser:     Cookie,
  ball_launcher:       CircleDot,
  movement_detector:   Radio,
  pet_door:            DoorOpen,
  temperature_monitor: Thermometer,
  voice_communication: Mic,
}

function DeviceCard({ device }) {
  const navigate = useNavigate()
  const Icon = DEVICE_ICONS[device.type] ?? CircleDot

  return (
    <Card
      className="flex flex-col cursor-pointer hover:shadow-md transition-shadow group"
      onClick={() => navigate(`/devices/${device.serial_number}`)}
    >
      <CardContent className="flex flex-col items-center justify-center gap-4 py-8 relative">
        <div className="w-16 h-16 rounded-2xl bg-brand-dark-blue/10 flex items-center justify-center">
          <Icon className="w-8 h-8 text-brand-dark-blue" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-brand-dark-blue">{device.name}</p>
          <p className="text-xs text-muted-foreground mt-1 font-mono">{device.serial_number}</p>
          <span className={`inline-block mt-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
            device.status === 'online'
              ? 'bg-green-50 text-green-700'
              : device.status === 'error'
              ? 'bg-red-50 text-red-700'
              : 'bg-muted text-muted-foreground'
          }`}>
            {device.status}
          </span>
        </div>
        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </CardContent>
    </Card>
  )
}

export default function Devices() {
  const {
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
  } = useDevices()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-muted-foreground col-span-full text-center py-12">
            Loading devices...
          </p>
        ) : devices.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-12">
            No devices yet. Click "Add New Device" to get started.
          </p>
        ) : (
          devices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a new device</DialogTitle>
            <DialogDescription>
              Enter the serial number found on the back of your device.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Serial number
            </p>
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

            {error && (
              <div className="flex items-center gap-2 text-destructive text-xs">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {error}
              </div>
            )}

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