import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import KibbleDispenser from './devices/KibbleDispenser'
import TemperatureMonitor from './devices/TemperatureMonitor'
import PetDoor from './devices/PetDoor'
import VoiceCommunication from './devices/VoiceCommunication'

const DEVICE_PAGES = {
  KBL: KibbleDispenser,
  TMP: TemperatureMonitor,
  DOR: PetDoor,
  VOC: VoiceCommunication,
}

export default function DeviceDetail() {
  const { serial } = useParams()
  const navigate = useNavigate()

  const typeCode = serial?.split('-')[1]?.toUpperCase()
  const DevicePage = DEVICE_PAGES[typeCode]

  if (!DevicePage) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-muted-foreground">Device type not supported yet.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      <Button
        variant="ghost"
        size="sm"
        className="w-fit -ml-2 text-muted-foreground"
        onClick={() => navigate('/devices')}
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to devices
      </Button>
      <DevicePage serial={serial} />
    </div>
  )
}