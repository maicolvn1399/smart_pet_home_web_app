import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { usePet } from '@/context/PetContext'

export function useDashboard() {
  const { activePet } = usePet()
  const [timeRange, setTimeRange] = useState('24h')
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)

  // Stats
  const [feedingStats, setFeedingStats] = useState(null)
  const [tempStats, setTempStats] = useState(null)
  const [doorStats, setDoorStats] = useState(null)
  const [vocStats, setVocStats] = useState(null)

  // Chart data
  const [feedingChartData, setFeedingChartData] = useState([])
  const [tempChartData, setTempChartData] = useState([])
  const [doorChartData, setDoorChartData] = useState([])
  const [vocChartData, setVocChartData] = useState([])

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

    // Fetch devices for active pet
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

    const deviceIds = petDevices.map((d) => d.id)
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
        const totalEaten = feedingSessions.reduce((sum, s) => sum + (s.grams_eaten ?? 0), 0)

        setFeedingStats({
          count: feedingSessions.length,
          totalServed: Math.round(totalServed),
          totalEaten: Math.round(totalEaten),
        })

        setFeedingChartData(feedingSessions.map((s) => ({
          time: new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          served: s.grams_served ?? 0,
          eaten: s.grams_eaten ?? 0,
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
        const avgTemp = tempLogs.reduce((sum, t) => sum + t.temperature_c, 0) / tempLogs.length
        const fanActivations = tempLogs.filter((t) => t.fan_triggered).length

        setTempStats({
          avgTemp: avgTemp.toFixed(1),
          fanActivations,
          latestTemp: tempLogs[tempLogs.length - 1].temperature_c,
        })

        setTempChartData(tempLogs.map((t) => ({
          time: new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          temp: t.temperature_c,
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
        const opens = doorLogs.filter((d) => d.action === 'open').length
        const closes = doorLogs.filter((d) => d.action === 'close').length

        setDoorStats({ opens, closes, total: doorLogs.length })
        setDoorChartData(doorLogs.map((d) => ({
          time: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: d.action,
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
          total: voiceMessages.length,
          delivered,
          pending: voiceMessages.length - delivered,
        })

        setVocChartData(voiceMessages.map((m) => ({
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          duration: m.duration_sec ?? 0,
          delivered: m.delivered,
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
    feedingChartData,
    tempChartData,
    doorChartData,
    vocChartData,
  }
}