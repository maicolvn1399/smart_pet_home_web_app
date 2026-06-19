import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Bone, Thermometer, DoorOpen, Mic, Maximize2, Droplets, Cookie, CircleDot, Radio } from 'lucide-react'
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
    <div
      className="bg-background border border-border rounded-xl p-4 cursor-pointer group relative"
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

function LineChart({ data, dataKey, color, label, expanded }) {
  const canvasRef = useRef(null)
  const chartRef  = useRef(null)
  const height    = expanded ? 300 : 160

  useEffect(() => {
    if (!canvasRef.current || !data.length) return

    const loadChart = async () => {
      const { Chart, registerables } = await import('https://esm.sh/chart.js@4.4.1')
      Chart.register(...registerables)
      if (chartRef.current) chartRef.current.destroy()

      const isDark    = matchMedia('(prefers-color-scheme: dark)').matches
      const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'
      const textColor = isDark ? '#aaa' : '#888'

      chartRef.current = new Chart(canvasRef.current, {
        type: 'line',
        data: {
          labels:   data.map((d) => d.time),
          datasets: [{
            label,
            data:            data.map((d) => d[dataKey]),
            borderColor:     color,
            backgroundColor: color + '15',
            borderWidth:     2,
            pointRadius:     2,
            tension:         0.4,
            fill:            true,
          }],
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
      <canvas ref={canvasRef} role="img" aria-label={label}>{label}</canvas>
    </div>
  )
}

function BarChart({ data, colors, expanded, ariaLabel }) {
  const canvasRef = useRef(null)
  const chartRef  = useRef(null)
  const height    = expanded ? 300 : 160

  useEffect(() => {
    if (!canvasRef.current || !data.length) return

    const loadChart = async () => {
      const { Chart, registerables } = await import('https://esm.sh/chart.js@4.4.1')
      Chart.register(...registerables)
      if (chartRef.current) chartRef.current.destroy()

      const isDark    = matchMedia('(prefers-color-scheme: dark)').matches
      const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'
      const textColor = isDark ? '#aaa' : '#888'

      chartRef.current = new Chart(canvasRef.current, {
        type: 'bar',
        data: {
          labels:   data.map((d) => d.label ?? d.time),
          datasets: [{
            data:            data.map((d) => d.value ?? d.served ?? d.duration ?? 0),
            backgroundColor: colors ?? data.map((d) => d.color ?? '#1F4E79'),
            borderRadius:    4,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: textColor, font: { size: 10 } }, grid: { color: gridColor } },
            y: { ticks: { color: textColor, font: { size: 10 }, stepSize: 1 }, grid: { color: gridColor } },
          },
        },
      })
    }

    loadChart()
    return () => { if (chartRef.current) chartRef.current.destroy() }
  }, [data, expanded])

  return (
    <div style={{ position: 'relative', width: '100%', height: `${height}px` }}>
      <canvas ref={canvasRef} role="img" aria-label={ariaLabel}>{ariaLabel}</canvas>
    </div>
  )
}

function FeedingChart({ data, expanded }) {
  const canvasRef = useRef(null)
  const chartRef  = useRef(null)
  const height    = expanded ? 300 : 160

  useEffect(() => {
    if (!canvasRef.current || !data.length) return

    const loadChart = async () => {
      const { Chart, registerables } = await import('https://esm.sh/chart.js@4.4.1')
      Chart.register(...registerables)
      if (chartRef.current) chartRef.current.destroy()

      const isDark    = matchMedia('(prefers-color-scheme: dark)').matches
      const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'
      const textColor = isDark ? '#aaa' : '#888'

      chartRef.current = new Chart(canvasRef.current, {
        type: 'bar',
        data: {
          labels:   data.map((d) => d.time),
          datasets: [
            { label: 'Served (g)', data: data.map((d) => d.served), backgroundColor: '#1F4E79', borderRadius: 4 },
            { label: 'Eaten (g)',  data: data.map((d) => d.eaten),  backgroundColor: '#4FC3F7', borderRadius: 4 },
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
      <canvas ref={canvasRef} role="img" aria-label="Feeding sessions chart">Feeding sessions chart</canvas>
    </div>
  )
}

function VocChart({ data, expanded }) {
  const canvasRef = useRef(null)
  const chartRef  = useRef(null)
  const height    = expanded ? 300 : 160

  useEffect(() => {
    if (!canvasRef.current || !data.length) return

    const loadChart = async () => {
      const { Chart, registerables } = await import('https://esm.sh/chart.js@4.4.1')
      Chart.register(...registerables)
      if (chartRef.current) chartRef.current.destroy()

      const isDark    = matchMedia('(prefers-color-scheme: dark)').matches
      const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'
      const textColor = isDark ? '#aaa' : '#888'

      chartRef.current = new Chart(canvasRef.current, {
        type: 'bar',
        data: {
          labels:   data.map((d) => d.time),
          datasets: [{
            label:           'Duration (s)',
            data:            data.map((d) => d.duration),
            backgroundColor: data.map((d) => d.delivered ? '#1F4E79' : '#F57C00'),
            borderRadius:    4,
          }],
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
      <canvas ref={canvasRef} role="img" aria-label="Voice messages chart">Voice messages chart</canvas>
    </div>
  )
}

function timeAgo(dateStr) {
  if (!dateStr) return 'No activity'
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
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
    waterStats,
    treatStats,
    ballStats,
    motionStats,
    feedingChartData,
    tempChartData,
    doorChartData,
    vocChartData,
    waterChartData,
    treatChartData,
    ballChartData,
    motionChartData,
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
            {has('water_dispenser') && (
              <StatCard
                icon={Droplets}
                label="Water level"
                value={waterStats?.currentLevel !== null && waterStats?.currentLevel !== undefined ? `${waterStats.currentLevel}%` : '--'}
                sub={`${waterStats?.refills ?? 0} refills · ${waterStats?.readings ?? 0} readings`}
                color="text-blue-500"
              />
            )}
            {has('treat_dispenser') && (
              <StatCard
                icon={Cookie}
                label="Treat sessions"
                value={treatStats?.total ?? '--'}
                sub={`${treatStats?.wins ?? 0} wins · ${treatStats?.losses ?? 0} losses`}
                color="text-brand-orange"
              />
            )}
            {has('ball_launcher') && (
              <StatCard
                icon={CircleDot}
                label="Ball launches"
                value={ballStats?.total ?? '--'}
                sub={ballStats?.ballCount !== null ? `${ballStats?.ballCount ?? 0} balls remaining` : 'Left · Center · Right'}
                color="text-green-600"
              />
            )}
            {has('movement_detector') && (
              <StatCard
                icon={Radio}
                label="Motion events"
                value={motionStats?.total ?? '--'}
                sub={`Last: ${timeAgo(motionStats?.lastMotion)}`}
                color="text-brand-dark-blue"
              />
            )}
          </div>

          {/* Charts grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* KBL */}
            {has('kibble_dispenser') && (
              <ChartCard title="Feeding sessions" onExpand={() => setExpandedChart('feeding')}>
                {feedingChartData.length > 0 ? (
                  <>
                    <div className="flex gap-4 mb-3">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="w-2.5 h-2.5 rounded-sm bg-brand-dark-blue inline-block" />Served
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#4FC3F7] inline-block" />Eaten
                      </span>
                    </div>
                    <FeedingChart data={feedingChartData} expanded={false} />
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-8">No feeding data for this period.</p>
                )}
              </ChartCard>
            )}

            {/* TMP */}
            {has('temperature_monitor') && (
              <ChartCard title="Temperature over time" onExpand={() => setExpandedChart('temp')}>
                {tempChartData.length > 0 ? (
                  <>
                    <div className="flex gap-4 mb-3">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="w-2.5 h-2.5 rounded-sm bg-brand-dark-blue inline-block" />°C
                      </span>
                    </div>
                    <LineChart data={tempChartData} dataKey="temp" color="#1F4E79" label="Temperature °C" expanded={false} />
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-8">No temperature data for this period.</p>
                )}
              </ChartCard>
            )}

            {/* DOR */}
            {has('pet_door') && (
              <ChartCard title="Door activity" onExpand={() => setExpandedChart('door')}>
                {doorChartData.length > 0 ? (
                  <>
                    <div className="flex gap-4 mb-3">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="w-2.5 h-2.5 rounded-sm bg-green-600 inline-block" />Opens
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="w-2.5 h-2.5 rounded-sm bg-red-600 inline-block" />Closes
                      </span>
                    </div>
                    <BarChart
                      data={[
                        { label: 'Opens',  value: doorStats?.opens  ?? 0, color: '#2E7D32' },
                        { label: 'Closes', value: doorStats?.closes ?? 0, color: '#C62828' },
                      ]}
                      expanded={false}
                      ariaLabel="Door activity chart"
                    />
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-8">No door activity for this period.</p>
                )}
              </ChartCard>
            )}

            {/* VOC */}
            {has('voice_communication') && (
              <ChartCard title="Voice messages" onExpand={() => setExpandedChart('voc')}>
                {vocChartData.length > 0 ? (
                  <>
                    <div className="flex gap-4 mb-3">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="w-2.5 h-2.5 rounded-sm bg-brand-dark-blue inline-block" />Delivered
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="w-2.5 h-2.5 rounded-sm bg-brand-orange inline-block" />Pending
                      </span>
                    </div>
                    <VocChart data={vocChartData} expanded={false} />
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-8">No voice messages for this period.</p>
                )}
              </ChartCard>
            )}

            {/* WTR */}
            {has('water_dispenser') && (
              <ChartCard title="Water level over time" onExpand={() => setExpandedChart('water')}>
                {waterChartData.length > 0 ? (
                  <>
                    <div className="flex gap-4 mb-3">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />Level %
                      </span>
                    </div>
                    <LineChart data={waterChartData} dataKey="level" color="#3B82F6" label="Water level %" expanded={false} />
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-8">No water data for this period.</p>
                )}
              </ChartCard>
            )}

            {/* TRT */}
            {has('treat_dispenser') && (
              <ChartCard title="Treat session results" onExpand={() => setExpandedChart('treat')}>
                {treatChartData.length > 0 ? (
                  <>
                    <div className="flex gap-4 mb-3">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="w-2.5 h-2.5 rounded-sm bg-brand-orange inline-block" />Wins
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="w-2.5 h-2.5 rounded-sm bg-brand-dark-blue inline-block" />Losses
                      </span>
                    </div>
                    <BarChart data={treatChartData} expanded={false} ariaLabel="Treat session results chart" />
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-8">No treat data for this period.</p>
                )}
              </ChartCard>
            )}

            {/* BAL */}
            {has('ball_launcher') && (
              <ChartCard title="Ball launches by angle" onExpand={() => setExpandedChart('ball')}>
                {ballChartData.length > 0 ? (
                  <>
                    <div className="flex gap-4 mb-3">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="w-2.5 h-2.5 rounded-sm bg-brand-dark-blue inline-block" />Left
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="w-2.5 h-2.5 rounded-sm bg-brand-orange inline-block" />Center
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#4FC3F7] inline-block" />Right
                      </span>
                    </div>
                    <BarChart data={ballChartData} expanded={false} ariaLabel="Ball launches by angle chart" />
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-8">No launch data for this period.</p>
                )}
              </ChartCard>
            )}

            {/* MOV */}
            {has('movement_detector') && (
              <ChartCard title="Motion events" onExpand={() => setExpandedChart('motion')}>
                {motionChartData.length > 0 ? (
                  <>
                    <div className="flex gap-4 mb-3">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="w-2.5 h-2.5 rounded-sm bg-brand-dark-blue inline-block" />Motion detected
                      </span>
                    </div>
                    <BarChart data={motionChartData.map((m) => ({ ...m, label: m.time, value: m.value, color: '#1F4E79' }))} expanded={false} ariaLabel="Motion events chart" />
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-8">No motion data for this period.</p>
                )}
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
              {expandedChart === 'temp'    && 'Temperature over time'}
              {expandedChart === 'door'    && 'Door activity'}
              {expandedChart === 'voc'     && 'Voice messages'}
              {expandedChart === 'water'   && 'Water level over time'}
              {expandedChart === 'treat'   && 'Treat session results'}
              {expandedChart === 'ball'    && 'Ball launches by angle'}
              {expandedChart === 'motion'  && 'Motion events'}
            </DialogTitle>
          </DialogHeader>
          <div className="pt-2">
            {expandedChart === 'feeding' && <FeedingChart data={feedingChartData} expanded={true} />}
            {expandedChart === 'temp'    && <LineChart data={tempChartData} dataKey="temp" color="#1F4E79" label="Temperature °C" expanded={true} />}
            {expandedChart === 'door'    && <BarChart data={[{ label: 'Opens', value: doorStats?.opens ?? 0, color: '#2E7D32' }, { label: 'Closes', value: doorStats?.closes ?? 0, color: '#C62828' }]} expanded={true} ariaLabel="Door activity chart" />}
            {expandedChart === 'voc'     && <VocChart data={vocChartData} expanded={true} />}
            {expandedChart === 'water'   && <LineChart data={waterChartData} dataKey="level" color="#3B82F6" label="Water level %" expanded={true} />}
            {expandedChart === 'treat'   && <BarChart data={treatChartData} expanded={true} ariaLabel="Treat session results chart" />}
            {expandedChart === 'ball'    && <BarChart data={ballChartData} expanded={true} ariaLabel="Ball launches by angle chart" />}
            {expandedChart === 'motion'  && <BarChart data={motionChartData.map((m) => ({ ...m, label: m.time, value: m.value, color: '#1F4E79' }))} expanded={true} ariaLabel="Motion events chart" />}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}