import { useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bone, Trash2, Zap, Scale, Minus, Plus, Clock } from 'lucide-react'
import { useKibbleDispenser } from '@/hooks/useKibbleDispenser'

function SessionRow({ session, gramsPerSession, onTimeChange, onRemove }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-2 flex-1">
        <span className="text-sm text-muted-foreground w-24">
          Session {session.index + 1}
        </span>
        <input
          type="time"
          value={session.time}
          onChange={(e) => onTimeChange(session.id, e.target.value)}
          className="border border-input rounded-lg px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand-orange"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-brand-dark-blue w-16 text-right">
          {gramsPerSession}g
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(session.id)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

function NumberPicker({ value, onChange, min = 1, max = 6 }) {
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-full"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        <Minus className="w-4 h-4" />
      </Button>
      <span className="text-xl font-semibold text-brand-dark-blue w-6 text-center">
        {value}
      </span>
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-full"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        <Plus className="w-4 h-4" />
      </Button>
      <span className="text-sm text-muted-foreground">
        feeding{value !== 1 ? 's' : ''} per day
      </span>
    </div>
  )
}

export default function KibbleDispenser({ serial }) {
  const {
    feedingCount,
    sessions,
    dailyGrams,
    mode,
    waitMinutes,
    gramsPerSession,
    loading,
    saving,
    error,
    successMsg,
    setMode,
    handleFeedingCountChange,
    removeSession,
    updateTime,
    handleDailyGramsChange,
    handleWaitMinutesChange,
    handleSave,
  } = useKibbleDispenser(serial)

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
          <Bone className="w-7 h-7 text-brand-dark-blue" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-brand-dark-blue">Kibble dispenser</h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">{serial}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Daily intake */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Daily intake
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={dailyGrams}
                onChange={handleDailyGramsChange}
                className="w-28 border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
              <span className="text-sm text-muted-foreground">grams / day</span>
            </div>
            {sessions.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {gramsPerSession}g per session across {sessions.length} feeding{sessions.length > 1 ? 's' : ''}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Dispensing mode */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Dispensing mode
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <button
              onClick={() => setMode('smart')}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors text-left ${
                mode === 'smart'
                  ? 'border-brand-orange bg-orange-50'
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <Scale className={`w-5 h-5 mt-0.5 flex-shrink-0 ${mode === 'smart' ? 'text-brand-orange' : 'text-muted-foreground'}`} />
              <div>
                <p className={`text-sm font-medium ${mode === 'smart' ? 'text-brand-orange' : 'text-foreground'}`}>
                  Smart mode
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Weighs what's left on the plate and only dispenses the difference to reach the target.
                </p>
              </div>
            </button>

            <button
              onClick={() => setMode('fixed')}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors text-left ${
                mode === 'fixed'
                  ? 'border-brand-orange bg-orange-50'
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <Zap className={`w-5 h-5 mt-0.5 flex-shrink-0 ${mode === 'fixed' ? 'text-brand-orange' : 'text-muted-foreground'}`} />
              <div>
                <p className={`text-sm font-medium ${mode === 'fixed' ? 'text-brand-orange' : 'text-foreground'}`}>
                  Fixed mode
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Dispenses the full portion every session regardless of what's already on the plate.
                </p>
              </div>
            </button>
          </CardContent>
        </Card>

      </div>

      {/* Wait time */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Eating wait time
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={120}
              value={waitMinutes}
              onChange={handleWaitMinutesChange}
              className="w-24 border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
            <span className="text-sm text-muted-foreground">minutes</span>
          </div>
          <p className="text-xs text-muted-foreground">
            How long to wait after dispensing before checking if your pet ate. Set lower for demos, higher for real use.
          </p>
        </CardContent>
      </Card>

      {/* Feeding schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Feeding schedule
            </CardTitle>
            <Badge variant="outline">
              {sessions.length} session{sessions.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="pb-3 border-b border-border">
            <NumberPicker
              value={feedingCount}
              onChange={handleFeedingCountChange}
              min={1}
              max={6}
            />
          </div>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No sessions yet.
            </p>
          ) : (
            sessions.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                gramsPerSession={gramsPerSession}
                onTimeChange={updateTime}
                onRemove={removeSession}
              />
            ))
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