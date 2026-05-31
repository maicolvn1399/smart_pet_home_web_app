import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function usePetEdit(pet, onSaved, onDeleted) {
  const fileInputRef = useRef(null)
  const [ageCategory, setAgeCategory] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [breed, setBreed] = useState('')
  const [size, setSize] = useState('')
  const [coatType, setCoatType] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleteMode, setDeleteMode] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [viewingPhoto, setViewingPhoto] = useState(false)

  useEffect(() => {
    if (!pet) return
    setAgeCategory(pet.age_category ?? '')
    setWeightKg(pet.weight_kg ?? '')
    setBreed(pet.breed ?? '')
    setDeleteMode(false)
    setDeleteConfirm('')
    setError('')
    setViewingPhoto(false)

    supabase
      .from('pet_physical_traits')
      .select('size, coat_type')
      .eq('pet_id', pet.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setSize(data.size ?? '')
          setCoatType(data.coat_type ?? '')
        }
      })
  }, [pet])

  async function handleSave() {
    setSaving(true)
    setError('')

    const { error: petError } = await supabase
      .from('pets')
      .update({
        age_category: ageCategory,
        weight_kg: parseFloat(weightKg),
        breed,
      })
      .eq('id', pet.id)

    if (petError) {
      setError(petError.message)
      setSaving(false)
      return
    }

    await supabase
      .from('pet_physical_traits')
      .update({ size, coat_type: coatType })
      .eq('pet_id', pet.id)

    setSaving(false)
    onSaved()
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)

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

    setUploading(false)
    onSaved()
  }

  async function handleDelete() {
    if (deleteConfirm !== pet.name) {
      setError(`Type "${pet.name}" to confirm deletion.`)
      return
    }

    setDeleting(true)

    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('id', pet.id)

    if (error) {
      setError(error.message)
      setDeleting(false)
      return
    }

    onDeleted()
  }

  return {
    fileInputRef,
    ageCategory, setAgeCategory,
    weightKg, setWeightKg,
    breed, setBreed,
    size, setSize,
    coatType, setCoatType,
    saving,
    uploading,
    deleteMode, setDeleteMode,
    deleteConfirm, setDeleteConfirm,
    deleting,
    error, setError,
    handleSave,
    handlePhotoUpload,
    handleDelete,
    viewingPhoto, setViewingPhoto,
  }
}