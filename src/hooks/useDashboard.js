import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { usePet } from '@/context/PetContext'

export function useDashboard() {
  const { activePet } = usePet()
  const [timeRange, setTimeRange] = useState('24h')
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)

  // Stats
  const [feedingStats, setFeedingStats]     = useState(null)
  const [tempStats, setTempStats]           = useState(null)
  const [doorStats, setDoorStats]           = useState(null)
  const [vocStats, setVocStats]             = useState(null)
  const [waterStats, setWaterStats]         = useState(null)
  const [treatStats, setTreatStats]         = useState(null)
  const [ballStats, setBallStats]           = useState(null)
  const [motionStats, setMotionStats]       = useState(null)

  // Chart data
  const [feedingChartData, setFeedingChartData]   = useState([])
  const [tempChartData, setTempChartData]         = useState([])
  const [doorChartData, setDoorChartData]         = useState([])
  const [vocChartData, setVocChartData]           = useState([])
  const [waterChartData, setWaterChartData]       = useState([])
  const [treatChartData, setTreatChartData]       = useState([])
  const [ballChartData, setBallChartData]         = useState([])
  const [motionChartData, setMotionChartData]     = useState([])

  function getStartDate() {
    const now = new Date()
    if (timeRange === '24h') return new Date(now - 24 * 60 * 60 * 1000).toISOString()
    if (timeRange === '7d') return new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()
    if (timeRange === '30d') return new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString()
    return new Date(now - 24 * 60 * 60 * 1000).toISOString()
  }

  useEffect(() => {
    if (!activePet) return
    loadDashboard()
  }, [activePet, timeRange])

  async function loadDashboard() {
    setLoading(true)
    const startDate = getStartDate()

    const { data: petDevices } = await supabase
      .from('devices')
      .select('id, type, serial_number, name')
      .eq('pet_id', activePet.id)

    if (!petDevices || petDevices.length === 0) {
      setDevices([])
      setLoading(false)
      return
    }

    setDevices(petDevices)

    const deviceByType = {}
    petDevices.forEach((d) => { deviceByType[d.type] = d })

    // ── KBL ──────────────────────────────────────────────────
    if (deviceByType['kibble_dispenser']) {
      const kblId = deviceByType['kibble_dispenser'].id

      const { data: feedingSessions } = await supabase
        .from('feeding_sessions')
        .select('*')
        .eq('device_id', kblId)
        .gte('created_at', startDate)
        .order('created_at', { ascending: true })

      if (feedingSessions) {
        const totalServed = feedingSessions.reduce((sum, s) => sum + (s.grams_served ?? 0), 0)
        const totalEaten  = feedingSessions.reduce((sum, s) => sum + (s.grams_eaten ?? 0), 0)

        setFeedingStats({
          count: feedingSessions.length,
          totalServed: Math.round(totalServed),
          totalEaten:  Math.round(totalEaten),
        })

        setFeedingChartData(feedingSessions.map((s) => ({
          time:   new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          served: s.grams_served ?? 0,
          eaten:  s.grams_eaten  ?? 0,
        })))
      }
    }

    // ── TMP ──────────────────────────────────────────────────
    if (deviceByType['temperature_monitor']) {
      const tmpId = deviceByType['temperature_monitor'].id

      const { data: tempLogs } = await supabase
        .from('temperature_logs')
        .select('*')
        .eq('device_id', tmpId)
        .gte('created_at', startDate)
        .order('created_at', { ascending: true })

      if (tempLogs && tempLogs.length > 0) {
        const avgTemp       = tempLogs.reduce((sum, t) => sum + t.temperature_c, 0) / tempLogs.length
        const fanActivations = tempLogs.filter((t) => t.fan_triggered).length

        setTempStats({
          avgTemp: avgTemp.toFixed(1),
          fanActivations,
          latestTemp: tempLogs[tempLogs.length - 1].temperature_c,
        })

        setTempChartData(tempLogs.map((t) => ({
          time:        new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          temp:        t.temperature_c,
          fanTriggered: t.fan_triggered,
        })))
      }
    }

    // ── DOR ──────────────────────────────────────────────────
    if (deviceByType['pet_door']) {
      const dorId = deviceByType['pet_door'].id

      const { data: doorLogs } = await supabase
        .from('door_logs')
        .select('*')
        .eq('device_id', dorId)
        .gte('created_at', startDate)
        .order('created_at', { ascending: true })

      if (doorLogs) {
        const opens  = doorLogs.filter((d) => d.action === 'open').length
        const closes = doorLogs.filter((d) => d.action === 'close').length

        setDoorStats({ opens, closes, total: doorLogs.length })
        setDoorChartData(doorLogs.map((d) => ({
          time:    new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action:  d.action,
          trigger: d.trigger,
        })))
      }
    }

    // ── VOC ──────────────────────────────────────────────────
    if (deviceByType['voice_communication']) {
      const vocId = deviceByType['voice_communication'].id

      const { data: voiceMessages } = await supabase
        .from('voice_messages')
        .select('*')
        .eq('device_id', vocId)
        .gte('created_at', startDate)
        .order('created_at', { ascending: true })

      if (voiceMessages) {
        const delivered = voiceMessages.filter((m) => m.delivered).length

        setVocStats({
          total:     voiceMessages.length,
          delivered,
          pending:   voiceMessages.length - delivered,
        })

        setVocChartData(voiceMessages.map((m) => ({
          time:      new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          duration:  m.duration_sec ?? 0,
          delivered: m.delivered,
        })))
      }
    }

    // ── WTR ──────────────────────────────────────────────────
    if (deviceByType['water_dispenser']) {
      const wtrId = deviceByType['water_dispenser'].id

      const { data: waterLogs } = await supabase
        .from('water_logs')
        .select('*')
        .eq('device_id', wtrId)
        .gte('created_at', startDate)
        .order('created_at', { ascending: true })

      if (waterLogs && waterLogs.length > 0) {
        const readings = waterLogs.filter((w) => w.event_type === 'reading')
        const refills  = waterLogs.filter((w) => w.event_type === 'refill').length
        const latest   = readings[readings.length - 1]

        setWaterStats({
          currentLevel: latest?.level_percent ?? null,
          refills,
          readings: readings.length,
        })

        setWaterChartData(readings.map((w) => ({
          time:  new Date(w.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          level: w.level_percent ?? 0,
        })))
      }
    }

    // ── TRT ──────────────────────────────────────────────────
    if (deviceByType['treat_dispenser']) {
      const trtId = deviceByType['treat_dispenser'].id

      const { data: treatSessions } = await supabase
        .from('treat_sessions')
        .select('*')
        .eq('device_id', trtId)
        .gte('created_at', startDate)
        .order('created_at', { ascending: true })

      if (treatSessions) {
        const wins   = treatSessions.filter((s) => s.won).length
        const losses = treatSessions.length - wins

        setTreatStats({
          total: treatSessions.length,
          wins,
          losses,
        })

        setTreatChartData([
          { label: 'Wins',   value: wins,   color: '#F57C00' },
          { label: 'Losses', value: losses, color: '#1F4E79' },
        ])
      }
    }

    // ── BAL ──────────────────────────────────────────────────
    if (deviceByType['ball_launcher']) {
      const balId = deviceByType['ball_launcher'].id

      const { data: ballLogs } = await supabase
        .from('ball_launch_logs')
        .select('*')
        .eq('device_id', balId)
        .gte('created_at', startDate)
        .order('created_at', { ascending: true })

      const { data: ballConfig } = await supabase
        .from('ball_launcher_config')
        .select('ball_count')
        .eq('device_id', balId)
        .maybeSingle()

      if (ballLogs) {
        const left   = ballLogs.filter((b) => b.angle === 'left').length
        const center = ballLogs.filter((b) => b.angle === 'center').length
        const right  = ballLogs.filter((b) => b.angle === 'right').length

        setBallStats({
          total:      ballLogs.length,
          ballCount:  ballConfig?.ball_count ?? null,
          left, center, right,
        })

        setBallChartData([
          { label: 'Left',   value: left,   color: '#1F4E79' },
          { label: 'Center', value: center, color: '#F57C00' },
          { label: 'Right',  value: right,  color: '#4FC3F7' },
        ])
      }
    }

    // ── MOV ──────────────────────────────────────────────────
    if (deviceByType['movement_detector']) {
      const movId = deviceByType['movement_detector'].id

      const { data: motionLogs } = await supabase
        .from('movement_logs')
        .select('*')
        .eq('device_id', movId)
        .eq('motion_detected', true)
        .gte('created_at', startDate)
        .order('created_at', { ascending: true })

      if (motionLogs) {
        const lastMotion = motionLogs[motionLogs.length - 1]?.created_at ?? null

        setMotionStats({
          total:      motionLogs.length,
          lastMotion,
        })

        setMotionChartData(motionLogs.map((m) => ({
          time:  new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          value: 1,
        })))
      }
    }

    setLoading(false)
  }

  return {
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
  }
}