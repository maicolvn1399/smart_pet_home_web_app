import { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mic, Square, Send, Trash2, Play, Pause } from 'lucide-react'
import { useVoiceCommunication } from '@/hooks/useVoiceCommunication'

import speakerAnim from '@/assets/animations/speaker.json'

export default function VoiceCommunication({ serial }) {
  const {
    state,
    audioUrl,
    isPlaying,
    setIsPlaying,
    startRecording,
    stopRecording,
    handleSend,
    handleDiscard,
    handleRecordAgain,
    togglePlayback,
    cleanup,
    formattedDuration,
  } = useVoiceCommunication()

  const canvasRef = useRef(null)
  const audioRef = useRef(null)
  const speakerRef = useRef(null)
  const speakerInstance = useRef(null)

  // Speaker animation
  useEffect(() => {
    let cancelled = false

    import('lottie-web').then(({ default: lottie }) => {
      if (cancelled || !speakerRef.current) return

      if (speakerInstance.current) {
        speakerInstance.current.destroy()
        speakerInstance.current = null
      }

      speakerInstance.current = lottie.loadAnimation({
        container: speakerRef.current,
        animationData: speakerAnim,
        renderer: 'svg',
        loop: true,
        autoplay: state === 'sent',
      })
    })

    return () => {
      cancelled = true
      if (speakerInstance.current) {
        speakerInstance.current.destroy()
        speakerInstance.current = null
      }
    }
  }, [state])

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup()
  }, [])

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-brand-dark-blue/10 flex items-center justify-center">
          <Mic className="w-7 h-7 text-brand-dark-blue" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-brand-dark-blue">Voice communication</h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">{serial}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Recording card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Record a message
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 py-4">

            {/* Idle */}
            {state === 'idle' && (
              <>
                <p className="text-sm text-muted-foreground text-center">
                  Press record to send a voice message to your pet.
                </p>
                <button
                  onClick={() => startRecording(canvasRef)}
                  className="w-28 h-28 rounded-full bg-brand-orange text-white border-2 border-brand-orange hover:bg-brand-orange/90 font-semibold text-sm transition-colors flex flex-col items-center justify-center gap-1"
                >
                  <Mic className="w-6 h-6" />
                  Record
                </button>
              </>
            )}

            {/* Recording */}
            {state === 'recording' && (
              <>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm font-medium text-red-500">
                    Recording — {formattedDuration}
                  </span>
                </div>

                <canvas
                  ref={canvasRef}
                  width={500}
                  height={120}
                  className="w-full rounded-lg bg-muted/30"
                />

                <button
                  onClick={stopRecording}
                  className="w-28 h-28 rounded-full bg-red-500 text-white border-2 border-red-500 hover:bg-red-600 font-semibold text-sm transition-colors flex flex-col items-center justify-center gap-1"
                >
                  <Square className="w-6 h-6" />
                  Stop
                </button>
              </>
            )}

            {/* Preview */}
            {state === 'preview' && (
              <>
                <p className="text-sm text-muted-foreground text-center">
                  Listen back before sending.
                </p>

                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                />

                <div className="flex items-center gap-4 bg-muted/30 rounded-xl px-5 py-3 w-full">
                  <button
                    onClick={() => togglePlayback(audioRef)}
                    className="w-10 h-10 rounded-full bg-brand-dark-blue text-white flex items-center justify-center flex-shrink-0 hover:bg-brand-dark-blue/80 transition-colors"
                  >
                    {isPlaying
                      ? <Pause className="w-4 h-4" />
                      : <Play className="w-4 h-4 ml-0.5" />
                    }
                  </button>
                  <div className="flex flex-col flex-1">
                    <span className="text-xs font-medium text-foreground">Voice message</span>
                    <span className="text-xs text-muted-foreground">{formattedDuration}</span>
                  </div>
                </div>

                <div className="flex gap-3 w-full">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleDiscard}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Discard
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSend}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </div>
              </>
            )}

            {/* Sent */}
            {state === 'sent' && (
              <>
                <p className="text-sm text-green-600 font-medium text-center">
                  Message sent to your pet!
                </p>
                <Button variant="outline" onClick={handleRecordAgain}>
                  <Mic className="w-4 h-4 mr-2" />
                  Record another
                </Button>
              </>
            )}

          </CardContent>
        </Card>

        {/* Speaker card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Device speaker
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div ref={speakerRef} className="w-full h-56" />
            <p className="text-xs text-muted-foreground text-center">
              {state === 'sent'
                ? 'Playing your message on the device...'
                : 'Speaker is idle — send a message to activate it.'
              }
            </p>
          </CardContent>
        </Card>

      </div>

    </div>
  )
}