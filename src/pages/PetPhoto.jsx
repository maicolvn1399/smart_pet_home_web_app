import { useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, X, Upload, Sparkles } from 'lucide-react'
import { usePetPhoto } from '@/hooks/usePetPhoto'
import logo from '@/assets/logo/logo_navbar.png'
import pawsAnim from '@/assets/animations/paws.json'

function PawsAnimation() {
  const ref = useRef(null)
  const instance = useRef(null)

  useEffect(() => {
    let cancelled = false

    import('lottie-web').then(({ default: lottie }) => {
      if (cancelled || !ref.current) return

      if (instance.current) {
        instance.current.destroy()
        instance.current = null
      }

      instance.current = lottie.loadAnimation({
        container: ref.current,
        animationData: pawsAnim,
        renderer: 'svg',
        loop: true,
        autoplay: true,
      })
    })

    return () => {
      cancelled = true
      if (instance.current) {
        instance.current.destroy()
        instance.current = null
      }
    }
  }, [])

  return <div ref={ref} className="w-48 h-48" />
}

export default function PetPhoto() {
  const {
    pet,
    generatedUrl,
    attemptsLeft,
    generating,
    uploading,
    error,
    canGenerate,
    fileInputRef,
    generateImage,
    handleKeep,
    handleUpload,
    handleSkip,
    MAX_ATTEMPTS,
  } = usePetPhoto()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-6 flex flex-col items-center gap-6">

          <img src={logo} alt="Smart Pet Home" className="h-10 w-auto" />

          <div className="text-center">
            <h1 className="text-xl font-bold text-brand-dark-blue">
              {pet?.name}'s profile photo
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Generate an AI portrait or upload your own photo.
            </p>
          </div>

          <div className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
            attemptsLeft === 1
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-amber-50 border border-amber-200 text-amber-700'
          }`}>
            <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
            {attemptsLeft === MAX_ATTEMPTS
              ? `You have ${MAX_ATTEMPTS} AI generation attempts.`
              : attemptsLeft === 0
              ? 'No more attempts left.'
              : `${attemptsLeft} attempt${attemptsLeft > 1 ? 's' : ''} remaining.`
            }
          </div>

          <div className="w-full aspect-square rounded-2xl overflow-hidden bg-muted/40 border border-border flex items-center justify-center">
            {generating ? (
              <div className="flex flex-col items-center gap-3">
                <PawsAnimation />
                <p className="text-sm text-muted-foreground">Generating portrait...</p>
              </div>
            ) : generatedUrl ? (
              <img
                src={generatedUrl}
                alt="Generated pet portrait"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Sparkles className="w-10 h-10 opacity-30" />
                <p className="text-sm">Your AI portrait will appear here</p>
              </div>
            )}
          </div>

          {!generatedUrl && !generating && (
            <Button className="w-full" onClick={generateImage} disabled={!canGenerate}>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI portrait
            </Button>
          )}

          {generatedUrl && !generating && (
            <div className="flex gap-3 w-full">
              {attemptsLeft > 0 && (
                <Button variant="outline" className="flex-1" onClick={generateImage} disabled={generating}>
                  <X className="w-4 h-4 mr-2" />
                  Try again
                </Button>
              )}
              <Button className="flex-1" onClick={handleKeep} disabled={uploading}>
                <Check className="w-4 h-4 mr-2" />
                {uploading ? 'Saving...' : 'Keep this'}
              </Button>
            </div>
          )}

          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload my own photo'}
          </Button>

          {error && (
            <p className="text-xs text-destructive text-center">{error}</p>
          )}

          <button
            onClick={handleSkip}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            Skip for now
          </button>

        </CardContent>
      </Card>
    </div>
  )
}