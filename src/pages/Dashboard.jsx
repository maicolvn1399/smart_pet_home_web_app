import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Bone, Thermometer, DoorOpen, Mic, Maximize2 } from 'lucide-react'
import { useDashboard } from '@/hooks/useDashboard'
import { usePet } from '@/context/PetContext'

function TimeRangeTabs({ value, onChange }) {
  return (
    <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
      {['24h', '7d', '30d'].map((range) => (
        <button
          key={range}
          onClick={() => onChange(range)}
          className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
            value === range
              ? 'bg-background text-foreground border border-border shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {range}
        </button>
      ))}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-muted/50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-2xl font-semibold text-brand-dark-blue">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  )
}

function ChartCard({ title, children, onExpand }) {
  return (
    <div className="bg-background border border-border rounded-xl p-4 cursor-pointer group relative"
      onClick={onExpand}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
        <Maximize2 className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      {children}
    </div>
  )
}

function TemperatureChart({ data, expanded }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)
  const height = expanded ? 300 : 160

  useEffect(() => {
    if (!canvasRef.current || !data.length) return

    const loadChart = async () => {
      const { Chart, registerables } = await import('https://esm.sh/chart.js@4.4.1')
      Chart.register(...registerables)

      if (chartRef.current) chartRef.current.destroy()

      const isDark = matchMedia('(prefers-color-scheme: dark)').matches
      const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'
      const textColor = isDark ? '#aaa' : '#888'

      chartRef.current = new Chart(canvasRef.current, {
        type: 'line',
        data: {
          labels: data.map((d) => d.time),
          datasets: [
            {
              label: 'Temperature °C',
              data: data.map((d) => d.temp),
              borderColor: '#1F4E79',
              backgroundColor: 'rgba(31,78,121,0.08)',
              borderWidth: 2,
              pointRadius: 2,
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: textColor, font: { size: 10 }, maxTicksLimit: 8 }, grid: { color: gridColor } },
            y: { ticks: { color: textColor, font: { size: 10 } }, grid: { color: gridColor } },
          },
        },
      })
    }

    loadChart()
    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [data, expanded])

  return (
    <div style={{ position: 'relative', width: '100%', height: `${height}px` }}>
      <canvas ref={canvasRef}
        role="img"
        aria-label="Line chart showing temperature over time"
      >Temperature over time chart</canvas>
    </div>
  )
}

function FeedingChart({ data, expanded }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)
  const height = expanded ? 300 : 160

  useEffect(() => {
    if (!canvasRef.current || !data.length) return

    const loadChart = async () => {
      const { Chart, registerables } = await import('https://esm.sh/chart.js@4.4.1')
      Chart.register(...registerables)

      if (chartRef.current) chartRef.current.destroy()

      const isDark = matchMedia('(prefers-color-scheme: dark)').matches
      const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'
      const textColor = isDark ? '#aaa' : '#888'

      chartRef.current = new Chart(canvasRef.current, {
        type: 'bar',
        data: {
          labels: data.map((d) => d.time),
          datasets: [
            {
              label: 'Served (g)',
              data: data.map((d) => d.served),
              backgroundColor: '#1F4E79',
              borderRadius: 4,
            },
            {
              label: 'Eaten (g)',
              data: data.map((d) => d.eaten),
              backgroundColor: '#4FC3F7',
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: textColor, font: { size: 10 } }, grid: { color: gridColor } },
            y: { ticks: { color: textColor, font: { size: 10 } }, grid: { color: gridColor } },
          },
        },
      })
    }

    loadChart()
    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [data, expanded])

  return (
    <div style={{ position: 'relative', width: '100%', height: `${height}px` }}>
      <canvas ref={canvasRef}
        role="img"
        aria-label="Bar chart showing grams served vs eaten per feeding session"
      >Feeding sessions chart</canvas>
    </div>
  )
}

function DoorChart({ data, expanded }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)
  const height = expanded ? 300 : 160

  useEffect(() => {
    if (!canvasRef.current || !data.length) return

    const loadChart = async () => {
      const { Chart, registerables } = await import('https://esm.sh/chart.js@4.4.1')
      Chart.register(...registerables)

      if (chartRef.current) chartRef.current.destroy()

      const isDark = matchMedia('(prefers-color-scheme: dark)').matches
      const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'
      const textColor = isDark ? '#aaa' : '#888'

      const opens = data.filter((d) => d.action === 'open')
      const closes = data.filter((d) => d.action === 'close')

      chartRef.current = new Chart(canvasRef.current, {
        type: 'bar',
        data: {
          labels: ['Opens', 'Closes'],
          datasets: [
            {
              label: 'Count',
              data: [opens.length, closes.length],
              backgroundColor: ['#2E7D32', '#C62828'],
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: textColor, font: { size: 11 } }, grid: { color: gridColor } },
            y: { ticks: { color: textColor, font: { size: 11 }, stepSize: 1 }, grid: { color: gridColor } },
          },
        },
      })
    }

    loadChart()
    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [data, expanded])

  return (
    <div style={{ position: 'relative', width: '100%', height: `${height}px` }}>
      <canvas ref={canvasRef}
        role="img"
        aria-label="Bar chart showing door opens vs closes"
      >Door activity chart</canvas>
    </div>
  )
}

function VocChart({ data, expanded }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)
  const height = expanded ? 300 : 160

  useEffect(() => {
    if (!canvasRef.current || !data.length) return

    const loadChart = async () => {
      const { Chart, registerables } = await import('https://esm.sh/chart.js@4.4.1')
      Chart.register(...registerables)

      if (chartRef.current) chartRef.current.destroy()

      const isDark = matchMedia('(prefers-color-scheme: dark)').matches
      const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'
      const textColor = isDark ? '#aaa' : '#888'

      chartRef.current = new Chart(canvasRef.current, {
        type: 'bar',
        data: {
          labels: data.map((d) => d.time),
          datasets: [
            {
              label: 'Duration (s)',
              data: data.map((d) => d.duration),
              backgroundColor: data.map((d) => d.delivered ? '#1F4E79' : '#F57C00'),
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: textColor, font: { size: 10 } }, grid: { color: gridColor } },
            y: { ticks: { color: textColor, font: { size: 10 } }, grid: { color: gridColor } },
          },
        },
      })
    }

    loadChart()
    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [data, expanded])

  return (
    <div style={{ position: 'relative', width: '100%', height: `${height}px` }}>
      <canvas ref={canvasRef}
        role="img"
        aria-label="Bar chart showing voice message durations"
      >Voice messages chart</canvas>
    </div>
  )
}

export default function Dashboard() {
  const { activePet } = usePet()
  const {
    timeRange, setTimeRange,
    devices,
    loading,
    feedingStats,
    tempStats,
    doorStats,
    vocStats,
    feedingChartData,
    tempChartData,
    doorChartData,
    vocChartData,
  } = useDashboard()

  const [expandedChart, setExpandedChart] = useState(null)

  const deviceTypes = devices.map((d) => d.type)
  const has = (type) => deviceTypes.includes(type)

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <p className="text-muted-foreground text-center py-20">Loading dashboard...</p>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark-blue">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {activePet ? `Showing data for ${activePet.name}` : 'Select a pet to view data'}
          </p>
        </div>
        <TimeRangeTabs value={timeRange} onChange={setTimeRange} />
      </div>

      {devices.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No devices linked to {activePet?.name} yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Add devices from the Devices page.</p>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {has('kibble_dispenser') && (
              <StatCard
                icon={Bone}
                label="Feedings"
                value={feedingStats?.count ?? '--'}
                sub={`${feedingStats?.totalServed ?? 0}g served · ${feedingStats?.totalEaten ?? 0}g eaten`}
                color="text-brand-dark-blue"
              />
            )}
            {has('temperature_monitor') && (
              <StatCard
                icon={Thermometer}
                label="Avg temperature"
                value={tempStats ? `${tempStats.avgTemp}°C` : '--'}
                sub={`Fan activated ${tempStats?.fanActivations ?? 0} times`}
                color="text-amber-500"
              />
            )}
            {has('pet_door') && (
              <StatCard
                icon={DoorOpen}
                label="Door activity"
                value={doorStats?.total ?? '--'}
                sub={`${doorStats?.opens ?? 0} opens · ${doorStats?.closes ?? 0} closes`}
                color="text-green-600"
              />
            )}
            {has('voice_communication') && (
              <StatCard
                icon={Mic}
                label="Voice messages"
                value={vocStats?.total ?? '--'}
                sub={`${vocStats?.delivered ?? 0} delivered · ${vocStats?.pending ?? 0} pending`}
                color="text-brand-orange"
              />
            )}
          </div>

          {/* Charts grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {has('kibble_dispenser') && feedingChartData.length > 0 && (
              <ChartCard
                title="Feeding sessions"
                onExpand={() => setExpandedChart('feeding')}
              >
                <div className="flex gap-4 mb-3">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-sm bg-brand-dark-blue inline-block" />
                    Served
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#4FC3F7] inline-block" />
                    Eaten
                  </span>
                </div>
                <FeedingChart data={feedingChartData} expanded={false} />
              </ChartCard>
            )}

            {has('temperature_monitor') && tempChartData.length > 0 && (
              <ChartCard
                title="Temperature over time"
                onExpand={() => setExpandedChart('temp')}
              >
                <div className="flex gap-4 mb-3">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-sm bg-brand-dark-blue inline-block" />
                    °C
                  </span>
                </div>
                <TemperatureChart data={tempChartData} expanded={false} />
              </ChartCard>
            )}

            {has('pet_door') && doorChartData.length > 0 && (
              <ChartCard
                title="Door activity"
                onExpand={() => setExpandedChart('door')}
              >
                <div className="flex gap-4 mb-3">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-sm bg-green-600 inline-block" />
                    Opens
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-sm bg-red-600 inline-block" />
                    Closes
                  </span>
                </div>
                <DoorChart data={doorChartData} expanded={false} />
              </ChartCard>
            )}

            {has('voice_communication') && vocChartData.length > 0 && (
              <ChartCard
                title="Voice messages"
                onExpand={() => setExpandedChart('voc')}
              >
                <div className="flex gap-4 mb-3">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-sm bg-brand-dark-blue inline-block" />
                    Delivered
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-sm bg-brand-orange inline-block" />
                    Pending
                  </span>
                </div>
                <VocChart data={vocChartData} expanded={false} />
              </ChartCard>
            )}

            {/* Empty state when devices exist but no data */}
            {has('kibble_dispenser') && feedingChartData.length === 0 && (
              <ChartCard title="Feeding sessions" onExpand={() => {}}>
                <p className="text-xs text-muted-foreground text-center py-8">No feeding data for this period.</p>
              </ChartCard>
            )}
            {has('temperature_monitor') && tempChartData.length === 0 && (
              <ChartCard title="Temperature over time" onExpand={() => {}}>
                <p className="text-xs text-muted-foreground text-center py-8">No temperature data for this period.</p>
              </ChartCard>
            )}
            {has('pet_door') && doorChartData.length === 0 && (
              <ChartCard title="Door activity" onExpand={() => {}}>
                <p className="text-xs text-muted-foreground text-center py-8">No door activity for this period.</p>
              </ChartCard>
            )}
            {has('voice_communication') && vocChartData.length === 0 && (
              <ChartCard title="Voice messages" onExpand={() => {}}>
                <p className="text-xs text-muted-foreground text-center py-8">No voice messages for this period.</p>
              </ChartCard>
            )}
          </div>
        </>
      )}

      {/* Expanded chart dialog */}
      <Dialog open={!!expandedChart} onOpenChange={() => setExpandedChart(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-brand-dark-blue">
              {expandedChart === 'feeding' && 'Feeding sessions'}
              {expandedChart === 'temp' && 'Temperature over time'}
              {expandedChart === 'door' && 'Door activity'}
              {expandedChart === 'voc' && 'Voice messages'}
            </DialogTitle>
          </DialogHeader>
          <div className="pt-2">
            {expandedChart === 'feeding' && <FeedingChart data={feedingChartData} expanded={true} />}
            {expandedChart === 'temp' && <TemperatureChart data={tempChartData} expanded={true} />}
            {expandedChart === 'door' && <DoorChart data={doorChartData} expanded={true} />}
            {expandedChart === 'voc' && <VocChart data={vocChartData} expanded={true} />}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}