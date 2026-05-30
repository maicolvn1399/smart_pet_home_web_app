import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

function Devices() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Responsive header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark-blue">
            My Devices
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all devices connected to your pet
          </p>
        </div>
        <Button size="lg" className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add New Device
        </Button>
      </div>

      {/* Device cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <p className="text-muted-foreground col-span-full text-center py-12">
          No devices yet. Click "Add New Device" to get started.
        </p>
      </div>
    </div>
  )
}

export default Devices