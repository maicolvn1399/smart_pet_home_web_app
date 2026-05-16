import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

function Devices() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with title and Add button */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark-blue">
            My Devices
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all devices connected to your pet
          </p>
        </div>
        <Button size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Add New Device
        </Button>
      </div>

      {/* Device cards will go here later */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Empty state for now */}
        <p className="text-muted-foreground col-span-full text-center py-12">
          No devices yet. Click "Add New Device" to get started.
        </p>
      </div>
    </div>
  )
}

export default Devices