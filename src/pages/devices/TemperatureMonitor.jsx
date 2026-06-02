import { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Thermometer, Clock, Gauge } from 'lucide-react'
import { useTemperatureMonitor, tempToProgress } from '@/hooks/useTemperatureMonitor'

import thermometerAnim from '@/assets/animations/thermometer.json'
import windAnim from '@/assets/animations/wind.json'

export default function TemperatureMonitor({ serial }) {
  const {
    unit, setUnit,
    fanOn,
    toggling,
    toggleFan,
    scheduleMode, setScheduleMode,
    fanOnTime, setFanOnTime,
    fanOffTime, setFanOffTime,
    threshold,
    incrementThreshold,
    decrementThreshold,
    displayTemp,
    tempColor,
    rawTemp,
    tempMin,
    tempMax,
    loading,
    saving,
    error,
    successMsg,
    handleSave,
  } = useTemperatureMonitor(serial)

  const thermometerRef = useRef(null)
  const thermometerInstance = useRef(null)
  const windAnimRef = useRef(null)
  const windAnimInstance = useRef(null)

  // Thermometer animation
  useEffect(() => {
    let cancelled = false

    import('lottie-web').then(({ default: lottie }) => {
      if (cancelled || !thermometerRef.current) return

      if (thermometerInstance.current) {
        thermometerInstance.current.destroy()
        thermometerInstance.current = null
      }

      const anim = lottie.loadAnimation({
        container: thermometerRef.current,
        animationData: thermometerAnim,
        renderer: 'svg',
        loop: false,
        autoplay: false,
      })

      thermometerInstance.current = anim

      anim.addEventListener('DOMLoaded', () => {
        const progress = tempToProgress(rawTemp, tempMin, tempMax)
        const frame = Math.round(progress * (anim.totalFrames - 1))
        anim.goToAndStop(frame, true)
      })
    })

    return () => {
      cancelled = true
      if (thermometerInstance.current) {
        thermometerInstance.current.destroy()
        thermometerInstance.current = null
      }
    }
  }, [rawTemp])

  // Wind animation
  useEffect(() => {
    let cancelled = false

    import('lottie-web').then(({ default: lottie }) => {
      if (cancelled || !windAnimRef.current) return

      if (windAnimInstance.current) {
        windAnimInstance.current.destroy()
        windAnimInstance.current = null
      }

      if (fanOn) {
        windAnimInstance.current = lottie.loadAnimation({
          container: windAnimRef.current,
          animationData: windAnim,
          renderer: 'svg',
          loop: true,
          autoplay: true,
        })
      }
    })

    return () => {
      cancelled = true
      if (windAnimInstance.current) {
        windAnimInstance.current.destroy()
        windAnimInstance.current = null
      }
    }
  }, [fanOn])

  return (
    <div className="flex flex-col gap-6">

      {loading && (
        <p className="text-xs text-muted-foreground text-center">Loading settings...</p>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-brand-dark-blue/10 flex items-center justify-center">
          <Thermometer className="w-7 h-7 text-brand-dark-blue" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-brand-dark-blue">Temperature monitor</h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">{serial}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Current temperature */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Current temperature
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-6">
              <div ref={thermometerRef} className="w-32 h-44 flex-shrink-0" />
              <div className="flex flex-col gap-3">
                <div className="flex items-end gap-3">
                  <span className={`text-6xl font-bold ${tempColor}`}>
                    {displayTemp !== null ? displayTemp : '--'}
                  </span>
                  <div className="flex flex-col gap-1 mb-2">
                    <button
                      onClick={() => setUnit('C')}
                      className={`text-sm font-medium px-2 py-0.5 rounded transition-colors ${
                        unit === 'C'
                          ? 'bg-brand-orange text-white'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      °C
                    </button>
                    <button
                      onClick={() => setUnit('F')}
                      className={`text-sm font-medium px-2 py-0.5 rounded transition-colors ${
                        unit === 'F'
                          ? 'bg-brand-orange text-white'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      °F
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {displayTemp !== null
                    ? 'Last updated — reported by device'
                    : 'Waiting for device reading...'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fan control */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Fan control
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <button
              onClick={toggleFan}
              disabled={toggling}
              className={`w-28 h-28 rounded-full text-sm font-semibold transition-colors border-2 disabled:opacity-50 ${
                fanOn
                  ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
                  : 'bg-green-500 text-white border-green-500 hover:bg-green-600'
              }`}
            >
              {toggling ? '...' : fanOn ? 'Stop' : 'Start'}
            </button>

            {fanOn && (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-2 w-full">
                <div ref={windAnimRef} className="w-10 h-10 flex-shrink-0" />
                <p className="text-xs text-green-700 font-medium">Fan is running</p>
              </div>
            )}

            {!fanOn && (
              <p className="text-xs text-muted-foreground">Fan is currently off</p>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Fan schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Fan schedule
            </CardTitle>
            <Badge variant="outline">
              {scheduleMode === 'time' ? 'Time range' : 'Threshold'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setScheduleMode('time')}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors text-left ${
                scheduleMode === 'time'
                  ? 'border-brand-orange bg-orange-50'
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <Clock className={`w-4 h-4 mt-0.5 flex-shrink-0 ${scheduleMode === 'time' ? 'text-brand-orange' : 'text-muted-foreground'}`} />
              <div>
                <p className={`text-sm font-medium ${scheduleMode === 'time' ? 'text-brand-orange' : 'text-foreground'}`}>
                  Time range
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Fan runs between two set times.
                </p>
              </div>
            </button>

            <button
              onClick={() => setScheduleMode('threshold')}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors text-left ${
                scheduleMode === 'threshold'
                  ? 'border-brand-orange bg-orange-50'
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <Gauge className={`w-4 h-4 mt-0.5 flex-shrink-0 ${scheduleMode === 'threshold' ? 'text-brand-orange' : 'text-muted-foreground'}`} />
              <div>
                <p className={`text-sm font-medium ${scheduleMode === 'threshold' ? 'text-brand-orange' : 'text-foreground'}`}>
                  Threshold
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Fan turns on above a set temperature.
                </p>
              </div>
            </button>
          </div>

          {scheduleMode === 'time' && (
            <div className="flex flex-col gap-3 pt-1">
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground">Turn on at</label>
                  <input
                    type="time"
                    value={fanOnTime}
                    onChange={(e) => setFanOnTime(e.target.value)}
                    className="border border-input rounded-lg px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-muted-foreground">Turn off at</label>
                  <input
                    type="time"
                    value={fanOffTime}
                    onChange={(e) => setFanOffTime(e.target.value)}
                    className="border border-input rounded-lg px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Fan will run from {fanOnTime} to {fanOffTime} every day.
              </p>
            </div>
          )}

          {scheduleMode === 'threshold' && (
            <div className="flex flex-col gap-3 pt-1">
              <div className="flex items-center gap-3">
                <label className="text-xs text-muted-foreground w-36">
                  Turn on above
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    onClick={decrementThreshold}
                    disabled={threshold <= 15}
                  >
                    <span className="text-lg leading-none">−</span>
                  </Button>
                  <span className="text-xl font-semibold text-brand-dark-blue w-16 text-center">
                    {threshold}°{unit}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    onClick={incrementThreshold}
                    disabled={threshold >= 40}
                  >
                    <span className="text-lg leading-none">+</span>
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Fan will turn on automatically when temperature exceeds {threshold}°{unit}.
              </p>
            </div>
          )}

        </CardContent>
      </Card>

      {error && <p className="text-xs text-destructive text-center">{error}</p>}
      {successMsg && <p className="text-xs text-green-600 text-center">{successMsg}</p>}

      {/* Save */}
      <div className="flex justify-end">
        <Button size="lg" className="px-8" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save settings'}
        </Button>
      </div>

    </div>
  )
}