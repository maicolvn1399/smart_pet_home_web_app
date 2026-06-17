import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Cookie, Minus, Plus, Trophy, X } from 'lucide-react'
import { useTreatDispenser } from '@/hooks/useTreatDispenser'

function formatCooldown(seconds) {
  if (seconds >= 60) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (secs === 0) return `${mins} minute${mins !== 1 ? 's' : ''}`
    return `${mins}m ${secs}s`
  }
  return `${seconds} second${seconds !== 1 ? 's' : ''}`
}

export default function TreatDispenser({ serial }) {
  const {
    dailyLimit,  setDailyLimit,
    cooldown,    setCooldown,
    usedToday,
    sessions,
    loading,
    saving,
    error,
    successMsg,
    handleSave,
  } = useTreatDispenser(serial)

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-muted-foreground">Loading settings...</p>
    </div>
  )

  const remaining = Math.max(0, dailyLimit - usedToday)

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-brand-dark-blue/10 flex items-center justify-center">
          <Cookie className="w-7 h-7 text-brand-dark-blue" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-brand-dark-blue">Treat dispenser</h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">{serial}</p>
        </div>
      </div>

      {/* Today's usage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Today's usage
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-brand-dark-blue">
                {usedToday} <span className="text-lg text-muted-foreground font-normal">/ {dailyLimit}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">treats won today</p>
            </div>
            <Badge variant={remaining === 0 ? 'destructive' : 'outline'} className="text-sm px-3 py-1">
              {remaining === 0 ? 'Limit reached' : `${remaining} remaining`}
            </Badge>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2.5">
            <div
              className="bg-brand-orange h-2.5 rounded-full transition-all"
              style={{ width: `${Math.min(100, (usedToday / dailyLimit) * 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Daily limit */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Daily limit
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => setDailyLimit((v) => Math.max(1, v - 1))}
                disabled={dailyLimit <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-2xl font-bold text-brand-dark-blue w-8 text-center">
                {dailyLimit}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => setDailyLimit((v) => Math.min(20, v + 1))}
                disabled={dailyLimit >= 20}
              >
                <Plus className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">treats / day</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum number of treats your pet can win per day.
            </p>
          </CardContent>
        </Card>

        {/* Cooldown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Cooldown between wins
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={cooldown}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  if (!isNaN(val) && val >= 1) setCooldown(val)
                }}
                className="w-24 border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
              <span className="text-sm text-muted-foreground">
                {cooldown >= 60 ? `= ${formatCooldown(cooldown)}` : 'seconds'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter time in seconds. Values above 59 will display as minutes.
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Recent sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Today's sessions
            </CardTitle>
            <Badge variant="outline">{sessions.length} attempts</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No sessions today yet.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    {s.won
                      ? <Trophy className="w-4 h-4 text-brand-orange" />
                      : <X className="w-4 h-4 text-muted-foreground" />
                    }
                    <div>
                      <p className="text-sm font-medium">
                        {s.won ? 'Won a treat!' : 'No treat'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Pressed button {s.button_pressed} · Winning was {s.correct_button}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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