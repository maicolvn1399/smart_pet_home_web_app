import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DoorOpen, Plus, Trash2 } from 'lucide-react'

import doorAnim from '@/assets/animations/door.json'

function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

function TimeRangeRow({ range, index, onOpenChange, onCloseChange, onRemove }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground w-20 flex-shrink-0">
        Range {index + 1}
      </span>
      <div className="flex items-center gap-3 flex-1 flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Open at</label>
          <input
            type="time"
            value={range.openTime}
            onChange={(e) => onOpenChange(range.id, e.target.value)}
            className="border border-input rounded-lg px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand-orange"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Close at</label>
          <input
            type="time"
            value={range.closeTime}
            onChange={(e) => onCloseChange(range.id, e.target.value)}
            className="border border-input rounded-lg px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand-orange"
          />
        </div>
      </div>
      {index > 0 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(range.id)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 flex-shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}

export default function PetDoor({ serial }) {
  const [doorOpen, setDoorOpen] = useState(false)
  const [ranges, setRanges] = useState([
    { id: generateId(), openTime: '08:00', closeTime: '20:00' },
  ])

  const doorAnimRef = useRef(null)
  const doorAnimInstance = useRef(null)

  // Load once
  useEffect(() => {
    let cancelled = false

    import('lottie-web').then(({ default: lottie }) => {
      if (cancelled || !doorAnimRef.current) return

      if (doorAnimInstance.current) {
        doorAnimInstance.current.destroy()
        doorAnimInstance.current = null
      }

      const anim = lottie.loadAnimation({
        container: doorAnimRef.current,
        animationData: doorAnim,
        renderer: 'svg',
        loop: false,
        autoplay: false,
      })

      doorAnimInstance.current = anim

      anim.addEventListener('DOMLoaded', () => {
        anim.goToAndStop(0, true)
      })
    })

    return () => {
      cancelled = true
      if (doorAnimInstance.current) {
        doorAnimInstance.current.destroy()
        doorAnimInstance.current = null
      }
    }
  }, [])

  // Play animation when doorOpen changes
  useEffect(() => {
    if (!doorAnimInstance.current) return
    const anim = doorAnimInstance.current

    if (doorOpen) {
      anim.playSegments([0, 90], true)
    } else {
      anim.playSegments([120, 149], true)
    }
  }, [doorOpen])

  function handleDoorToggle() {
    setDoorOpen((prev) => !prev)
  }

  function addRange() {
    setRanges((prev) => [
      ...prev,
      { id: generateId(), openTime: '08:00', closeTime: '20:00' },
    ])
  }

  function removeRange(id) {
    setRanges((prev) => prev.filter((r) => r.id !== id))
  }

  function updateOpenTime(id, time) {
    setRanges((prev) =>
      prev.map((r) => (r.id === id ? { ...r, openTime: time } : r))
    )
  }

  function updateCloseTime(id, time) {
    setRanges((prev) =>
      prev.map((r) => (r.id === id ? { ...r, closeTime: time } : r))
    )
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-brand-dark-blue/10 flex items-center justify-center">
          <DoorOpen className="w-7 h-7 text-brand-dark-blue" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-brand-dark-blue">Pet door</h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">{serial}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Door state animation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Door state
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div ref={doorAnimRef} className="w-full h-56" />
            <Badge
              variant="outline"
              className={doorOpen
                ? 'border-green-300 bg-green-50 text-green-700'
                : 'border-red-300 bg-red-50 text-red-700'
              }
            >
              {doorOpen ? 'Open' : 'Closed'}
            </Badge>
          </CardContent>
        </Card>

        {/* Manual control */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Manual control
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <button
              onClick={handleDoorToggle}
              className={`w-28 h-28 rounded-full text-sm font-semibold transition-colors border-2 ${
                doorOpen
                  ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
                  : 'bg-green-500 text-white border-green-500 hover:bg-green-600'
              }`}
            >
              {doorOpen ? 'Close' : 'Open'}
            </button>
            <p className="text-xs text-muted-foreground">
              Door is currently{' '}
              <span className={`font-medium ${doorOpen ? 'text-green-600' : 'text-red-500'}`}>
                {doorOpen ? 'open' : 'closed'}
              </span>
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Schedule
            </CardTitle>
            <Badge variant="outline">
              {ranges.length} range{ranges.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {ranges.map((range, index) => (
            <TimeRangeRow
              key={range.id}
              range={range}
              index={index}
              onOpenChange={updateOpenTime}
              onCloseChange={updateCloseTime}
              onRemove={removeRange}
            />
          ))}
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full"
            onClick={addRange}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add time range
          </Button>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button size="lg" className="px-8">
          Save settings
        </Button>
      </div>

    </div>
  )
}