import { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CircleDot, Plus, Trash2 } from 'lucide-react'
import { useBallLauncher } from '@/hooks/useBallLauncher'
import arrowAnim from '@/assets/animations/arrow.json'

const ANGLE_DEGREES = {
  left:   90,
  center: 180,
  right:  -90,
}

export default function BallLauncher({ serial }) {
  const {
    defaultAngle,  setDefaultAngle,
    ballCount,
    schedule,
    loading,
    saving,
    launching,
    launched,
    error,
    successMsg,
    addScheduleEntry,
    removeScheduleEntry,
    updateScheduleEntry,
    handleSave,
    handleLaunch,
  } = useBallLauncher(serial)

  const arrowRef      = useRef(null)
  const arrowInstance = useRef(null)

  useEffect(() => {
    if (loading) return
    let cancelled = false

    import('lottie-web').then(({ default: lottie }) => {
      if (cancelled || !arrowRef.current) return

      if (arrowInstance.current) {
        arrowInstance.current.destroy()
        arrowInstance.current = null
      }

      arrowInstance.current = lottie.loadAnimation({
        container:     arrowRef.current,
        animationData: arrowAnim,
        renderer:      'svg',
        loop:          true,
        autoplay:      true,
      })
    })

    return () => {
      cancelled = true
      if (arrowInstance.current) {
        arrowInstance.current.destroy()
        arrowInstance.current = null
      }
    }
  }, [loading])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-muted-foreground">Loading settings...</p>
    </div>
  )

  const angles = [
    { angle: 'left',   label: 'Left'   },
    { angle: 'center', label: 'Center' },
    { angle: 'right',  label: 'Right'  },
  ]

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-brand-dark-blue/10 flex items-center justify-center">
          <CircleDot className="w-7 h-7 text-brand-dark-blue" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-brand-dark-blue">Ball launcher</h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">{serial}</p>
        </div>
      </div>

      {/* Ball count */}
      {ballCount !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Balls remaining
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="text-4xl font-bold text-brand-dark-blue">{ballCount}</p>
              <p className="text-sm text-muted-foreground">/ 5 balls</p>
            </div>
            <Badge
              variant="outline"
              className={
                ballCount === 0 ? 'border-red-300 text-red-700' :
                ballCount <= 2  ? 'border-amber-300 text-amber-700' : ''
              }
            >
              {ballCount === 0 ? 'Empty — reload!' : ballCount <= 2 ? 'Running low' : 'Ready'}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Angle selection + launch */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Launch angle
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-xs text-muted-foreground self-start">
            Select an angle and launch manually.
          </p>

          {/* Arrow animation */}
          <div
            ref={arrowRef}
            className="w-40 h-40 flex-shrink-0 transition-all duration-300"
            style={{ transform: `rotate(${ANGLE_DEGREES[defaultAngle]}deg)` }}
          />

          {/* Angle buttons */}
          <div className="flex flex-row gap-3 w-full">
            {angles.map(({ angle, label }) => (
              <button
                key={angle}
                onClick={() => setDefaultAngle(angle)}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors text-center ${
                  defaultAngle === angle
                    ? 'border-brand-orange bg-orange-50 text-brand-orange'
                    : 'border-border hover:bg-muted/50 text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Launch button */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => handleLaunch(defaultAngle)}
              disabled={launching || ballCount === 0}
              className="w-36 h-36 rounded-full bg-green-500 hover:bg-green-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-1 shadow-lg"
            >
              <CircleDot className={`w-8 h-8 text-white ${launching ? 'animate-spin' : ''}`} />
              <span className="text-white text-xs font-semibold capitalize">Launch {defaultAngle}</span>
            </button>
            {launched && (
              <p className="text-xs text-green-600 font-medium">🎾 Ball launched!</p>
            )}
          </div>

          {ballCount === 0 && (
            <p className="text-xs text-destructive text-center">
              No balls remaining — please reload the launcher!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Launch schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Launch schedule
            </CardTitle>
            <Badge variant="outline">{schedule.length} scheduled</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-xs text-muted-foreground">
            Set times to automatically launch balls. Each entry can have its own angle.
          </p>

          {schedule.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              No scheduled launches yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {schedule.map((entry) => (
                <div key={entry.id} className="flex items-center gap-3">
                  <input
                    type="time"
                    value={entry.time}
                    onChange={(e) => updateScheduleEntry(entry.id, 'time', e.target.value)}
                    className="border border-input rounded-lg px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  />
                  <select
                    value={entry.angle}
                    onChange={(e) => updateScheduleEntry(entry.id, 'angle', e.target.value)}
                    className="border border-input rounded-lg px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand-orange flex-1"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeScheduleEntry(entry.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={addScheduleEntry}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add launch time
          </Button>
        </CardContent>
      </Card>

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