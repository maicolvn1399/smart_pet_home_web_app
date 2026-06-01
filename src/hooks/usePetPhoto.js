import { useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { usePet } from '@/context/PetContext'

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

export function usePetPhoto() {
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

  const attemptsLeft = MAX_ATTEMPTS - attempts
  const canGenerate = attempts < MAX_ATTEMPTS && !generating

  async function generateImage() {
    if (attempts >= MAX_ATTEMPTS) return
    setGenerating(true)
    setError('')

    try {
      const prompt = buildPrompt(pet, traits)

      const { data, error: fnError } = await supabase.functions.invoke('generate-pet-image', {
        body: { prompt },
      })

      if (fnError) {
        setError(fnError.message)
        setGenerating(false)
        return
      }

      if (data.error) {
        setError(data.error)
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

  return {
    pet,
    generatedUrl,
    attempts,
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
  }
}