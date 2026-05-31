import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, X, Upload, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { usePet } from '@/context/PetContext'
import logo from '@/assets/logo/logo_navbar.png'
import pawsAnim from '@/assets/animations/paws.json'

const MAX_ATTEMPTS = 3

function buildPrompt(pet, traits) {
  const breedPart = pet.breed === 'Unknown'
    ? pet.type
    : `${pet.breed} ${pet.type}`

  const agePart = pet.age_category.includes('puppy') || pet.age_category.includes('kitten')
    ? 'young'
    : pet.age_category.includes('senior')
    ? 'senior'
    : 'adult'

  const sizePart = traits?.size ?? ''
  const coatColorPart = traits?.coat_color ?? ''
  const coatTypePart = traits?.coat_type ? `with ${traits.coat_type} fur` : ''
  const earTypePart = traits?.ear_type ? `and ${traits.ear_type} ears` : ''

  return `A digital illustration of a ${agePart} ${sizePart} ${breedPart}, ${coatColorPart} coat ${coatTypePart} ${earTypePart}. Looking at the camera, soft cartoon style, white background, warm friendly colors, high quality digital art.`
}

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
  const { state } = useLocation()
  const navigate = useNavigate()
  const { refetchPets } = usePet()
  const pet = state?.pet
  const traits = state?.traits

  const [generatedUrl, setGeneratedUrl] = useState(null)
  const [attempts, setAttempts] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  async function generateImage() {
    if (attempts >= MAX_ATTEMPTS) return
    setGenerating(true)
    setError('')

    try {
      const prompt = buildPrompt(pet, traits)

      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt,
          n: 1,
          size: '1024x1024',
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error.message)
        setGenerating(false)
        return
      }

      const base64 = data.data[0].b64_json
      const url = data.data[0].url

      if (base64) {
        setGeneratedUrl(`data:image/png;base64,${base64}`)
      } else if (url) {
        setGeneratedUrl(url)
      }

      setAttempts((prev) => prev + 1)

    } catch (err) {
      setError('Failed to generate image. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleKeep() {
    if (!generatedUrl || !pet) return
    setUploading(true)

    try {
      let blob

      if (generatedUrl.startsWith('data:')) {
        const base64Data = generatedUrl.split(',')[1]
        const byteCharacters = atob(base64Data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        blob = new Blob([byteArray], { type: 'image/png' })
      } else {
        const response = await fetch(generatedUrl)
        blob = await response.blob()
      }

      const filePath = `pets/${pet.id}.png`

      const { error: uploadError } = await supabase.storage
        .from('pet-photos')
        .upload(filePath, blob, { upsert: true, contentType: 'image/png' })

      if (uploadError) {
        setError(uploadError.message)
        setUploading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('pet-photos')
        .getPublicUrl(filePath)

      await supabase
        .from('pets')
        .update({ profile_pic_url: publicUrl })
        .eq('id', pet.id)

      await supabase
        .from('pet_physical_traits')
        .update({ ai_attempts: attempts })
        .eq('pet_id', pet.id)

      await refetchPets()
      navigate('/home')

    } catch (err) {
      setError('Failed to save image. Please try again.')
      setUploading(false)
    }
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file || !pet) return
    setUploading(true)
    setError('')

    const fileExt = file.name.split('.').pop()
    const filePath = `pets/${pet.id}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('pet-photos')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('pet-photos')
      .getPublicUrl(filePath)

    await supabase
      .from('pets')
      .update({ profile_pic_url: publicUrl })
      .eq('id', pet.id)

    await refetchPets()
    navigate('/home')
  }

  async function handleSkip() {
    await refetchPets()
    navigate('/home')
  }

  const attemptsLeft = MAX_ATTEMPTS - attempts
  const canGenerate = attempts < MAX_ATTEMPTS && !generating

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
            {attempts === 0
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
          <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
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