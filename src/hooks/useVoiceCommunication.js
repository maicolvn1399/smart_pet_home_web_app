import { useRef, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function useVoiceCommunication(serial) {
  const [state, setState] = useState('idle')
  const [duration, setDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [deviceId, setDeviceId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const analyserRef = useRef(null)
  const animFrameRef = useRef(null)

  useEffect(() => {
    if (!serial) return

    async function loadDevice() {
      const { data: device, error: deviceError } = await supabase
        .from('devices')
        .select('id')
        .eq('serial_number', serial)
        .single()

      if (!deviceError && device) setDeviceId(device.id)
      setLoading(false)
    }

    loadDevice()
  }, [serial])

  function drawWave(canvasRef) {
    if (!canvasRef.current || !analyserRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    function draw() {
      animFrameRef.current = requestAnimationFrame(draw)
      analyser.getByteTimeDomainData(dataArray)

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.lineWidth = 4
      ctx.strokeStyle = '#F57C00'
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.beginPath()

      const sliceWidth = canvas.width / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * canvas.height) / 2

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          const prevX = (i - 1) * sliceWidth
          const prevV = dataArray[i - 1] / 128.0
          const prevY = (prevV * canvas.height) / 2
          const cpX = (prevX + x) / 2
          ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y)
        }

        x += sliceWidth
      }

      ctx.lineTo(canvas.width, canvas.height / 2)
      ctx.stroke()
    }

    draw()
  }

  async function startRecording(canvasRef) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const audioCtx = new AudioContext()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 4096
      source.connect(analyser)
      analyserRef.current = analyser

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stream.getTracks().forEach((t) => t.stop())
        cancelAnimationFrame(animFrameRef.current)
        setState('preview')
      }

      mediaRecorder.start()
      setState('recording')
      setDuration(0)
      setError('')

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)

      setTimeout(() => {
        drawWave(canvasRef)
      }, 50)

    } catch (err) {
      setError('Microphone access denied.')
      console.error('Microphone error:', err)
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
    }
    clearInterval(timerRef.current)
    cancelAnimationFrame(animFrameRef.current)
  }

  async function handleSend() {
    if (!deviceId || !audioUrl) return
    setError('')

    try {
      const response = await fetch(audioUrl)
      const blob = await response.blob()

      const fileName = `${deviceId}-${Date.now()}.webm`

      const { error: uploadError } = await supabase.storage
        .from('voice-messages')
        .upload(fileName, blob, { contentType: 'audio/webm' })

      if (uploadError) {
        setError(uploadError.message)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('voice-messages')
        .getPublicUrl(fileName)

      const { data: { user } } = await supabase.auth.getUser()

      const { error: insertError } = await supabase
        .from('voice_messages')
        .insert({
          device_id: deviceId,
          user_id: user.id,
          audio_url: publicUrl,
          duration_sec: duration,
          delivered: false,
        })

      if (insertError) {
        setError(insertError.message)
        return
      }

      setState('sent')
      setIsPlaying(false)

    } catch (err) {
      setError(err.message ?? 'Failed to send message.')
      console.error('Send error:', err)
    }
  }

  function handleDiscard() {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    setDuration(0)
    setIsPlaying(false)
    setError('')
    setState('idle')
  }

  function togglePlayback(audioRef) {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  function cleanup() {
    clearInterval(timerRef.current)
    cancelAnimationFrame(animFrameRef.current)
    if (audioUrl) URL.revokeObjectURL(audioUrl)
  }

  return {
    state,
    duration,
    audioUrl,
    isPlaying,
    loading,
    error,
    setIsPlaying,
    startRecording,
    stopRecording,
    handleSend,
    handleDiscard,
    handleRecordAgain: handleDiscard,
    togglePlayback,
    cleanup,
    formattedDuration: formatDuration(duration),
  }
}