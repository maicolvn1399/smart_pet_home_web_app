import { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Droplets, WavesArrowDown } from 'lucide-react'
import { useWaterDispenser } from '@/hooks/useWaterDispenser'
import waterAnim from '@/assets/animations/water.json'

export default function WaterDispenser({ serial }) {
  const {
    source,          setSource,
    lowLevelThresh,  setLowLevelThresh,
    currentLevel,
    loading,
    saving,
    error,
    successMsg,
    handleSave,
  } = useWaterDispenser(serial)

  const waterRef      = useRef(null)
  const waterInstance = useRef(null)

  // Load the animation once when loading finishes
  useEffect(() => {
    if (loading) return
    let cancelled = false

    import('lottie-web').then(({ default: lottie }) => {
      if (cancelled || !waterRef.current) return

      if (waterInstance.current) {
        waterInstance.current.destroy()
        waterInstance.current = null
      }

      waterInstance.current = lottie.loadAnimation({
        container:     waterRef.current,
        animationData: waterAnim,
        renderer:      'svg',
        loop:          false,
        autoplay:      false,
      })
    })

    return () => {
      cancelled = true
      if (waterInstance.current) {
        waterInstance.current.destroy()
        waterInstance.current = null
      }
    }
  }, [loading])

  // Update the frame whenever the level changes (realtime)
  useEffect(() => {
    if (loading || !waterInstance.current) return
    if (currentLevel === null) return

    const anim = waterInstance.current

    const seek = () => {
      const totalFrames = anim.totalFrames
      if (!totalFrames) return
      const clamped = Math.max(0, Math.min(100, currentLevel))
      const frame = Math.round((clamped / 100) * (totalFrames - 1))
      anim.goToAndStop(frame, true)
    }

    if (anim.isLoaded) {
      seek()
    } else {
      anim.addEventListener('DOMLoaded', seek)
      return () => anim.removeEventListener('DOMLoaded', seek)
    }
  }, [currentLevel, loading])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-muted-foreground">Loading settings...</p>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-brand-dark-blue/10 flex items-center justify-center">
          <Droplets className="w-7 h-7 text-brand-dark-blue" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-brand-dark-blue">Water dispenser</h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">{serial}</p>
        </div>
      </div>

      {/* Current water level */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Bowl water level
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          <div ref={waterRef} className="w-40 h-40" />
          <div className="flex flex-col items-center gap-2">
            <p className={`text-4xl font-bold ${
              currentLevel === null ? 'text-muted-foreground' :
              currentLevel <= 20   ? 'text-red-500'          :
              currentLevel <= 50   ? 'text-amber-500'        :
              'text-blue-500'
            }`}>
              {currentLevel !== null ? `${currentLevel}%` : '--'}
            </p>
            <p className="text-xs text-muted-foreground">
              {currentLevel === null ? 'No reading yet'     :
               currentLevel <= 20   ? 'Low — refill soon'  :
               currentLevel <= 50   ? 'Medium'             : 'Good'}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Water source */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Water source
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <button
              onClick={() => setSource('automatic')}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors text-left ${
                source === 'automatic'
                  ? 'border-brand-orange bg-orange-50'
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <Droplets className={`w-5 h-5 mt-0.5 flex-shrink-0 ${source === 'automatic' ? 'text-brand-orange' : 'text-muted-foreground'}`} />
              <div>
                <p className={`text-sm font-medium ${source === 'automatic' ? 'text-brand-orange' : 'text-foreground'}`}>
                  Automatic
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Auto-refills the bowl from the tank when it runs low.
                </p>
              </div>
            </button>

            <button
              onClick={() => setSource('monitor_only')}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors text-left ${
                source === 'monitor_only'
                  ? 'border-brand-orange bg-orange-50'
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <WavesArrowDown className={`w-5 h-5 mt-0.5 flex-shrink-0 ${source === 'monitor_only' ? 'text-brand-orange' : 'text-muted-foreground'}`} />
              <div>
                <p className={`text-sm font-medium ${source === 'monitor_only' ? 'text-brand-orange' : 'text-foreground'}`}>
                  Monitor only
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tracks the level and alerts you to refill manually.
                </p>
              </div>
            </button>
          </CardContent>
        </Card>

        {/* Low level threshold */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Low level alert threshold
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={99}
                value={lowLevelThresh}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  if (!isNaN(val) && val >= 1 && val <= 99) setLowLevelThresh(val)
                }}
                className="w-24 border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {source === 'automatic'
                ? 'The bowl auto-refills when it drops below this level.'
                : 'Alert when water level drops below this percentage.'
              }
            </p>
          </CardContent>
        </Card>

      </div>

      {error && <p className="text-xs text-destructive text-center">{error}</p>}
      {successMsg && <p className="text-xs text-green-600 text-center">{successMsg}</p>}

      <div className="flex justify-end">
        <Button size="lg" className="px-8" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save settings'}
        </Button>
      </div>

    </div>
  )
}