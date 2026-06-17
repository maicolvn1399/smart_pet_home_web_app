import { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Radio, Clock } from 'lucide-react'
import { useMovementDetector } from '@/hooks/useMovementDetector'
import radarAnim from '@/assets/animations/radar.json'
import radarNoDots from '@/assets/animations/radar_no_dots.json'

function timeAgo(dateStr) {
  if (!dateStr) return 'No activity recorded'
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return `${diff} seconds ago`
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  return `${Math.floor(diff / 86400)} days ago`
}

export default function MovementDetector({ serial }) {
  const {
    inactivityThreshold, setInactivityThreshold,
    lastMotion,
    logs,
    loading,
    saving,
    error,
    successMsg,
    handleSave,
  } = useMovementDetector(serial)

  const radarRef      = useRef(null)
  const radarInstance = useRef(null)

  useEffect(() => {
    if (loading) return
    let cancelled = false

    import('lottie-web').then(({ default: lottie }) => {
      if (cancelled || !radarRef.current) return

      if (radarInstance.current) {
        radarInstance.current.destroy()
        radarInstance.current = null
      }

      radarInstance.current = lottie.loadAnimation({
        container:     radarRef.current,
        animationData: lastMotion ? radarAnim : radarNoDots,
        renderer:      'svg',
        loop:          true,
        autoplay:      true,
      })
    })

    return () => {
      cancelled = true
      if (radarInstance.current) {
        radarInstance.current.destroy()
        radarInstance.current = null
      }
    }
  }, [loading, lastMotion])

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
          <Radio className="w-7 h-7 text-brand-dark-blue" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-brand-dark-blue">Movement detector</h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">{serial}</p>
        </div>
      </div>

      {/* Last activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Last activity
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <div ref={radarRef} className="w-24 h-24 flex-shrink-0" />
          <div>
            <p className="text-lg font-semibold text-foreground">
              {timeAgo(lastMotion)}
            </p>
            {lastMotion && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(lastMotion).toLocaleString([], {
                  month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </p>
            )}
            {!lastMotion && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Waiting for first motion event...
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Inactivity threshold */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Inactivity alert threshold
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={480}
              value={inactivityThreshold}
              onChange={(e) => {
                const val = parseInt(e.target.value)
                if (!isNaN(val) && val >= 1 && val <= 480) setInactivityThreshold(val)
              }}
              className="w-24 border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
            <span className="text-sm text-muted-foreground">minutes</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Send an alert if no movement is detected for this long. Default is 60 minutes.
          </p>
        </CardContent>
      </Card>

      {/* Recent activity log */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Recent activity
            </CardTitle>
            <Badge variant="outline">{logs.length} events</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No motion detected yet.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Motion detected</p>
                      {log.sensor_id && (
                        <p className="text-xs text-muted-foreground">Sensor {log.sensor_id}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleString([], {
                      month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
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