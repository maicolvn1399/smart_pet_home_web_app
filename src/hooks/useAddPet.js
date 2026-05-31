import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

const DOG_BREEDS = [
  'Labrador Retriever', 'Golden Retriever', 'German Shepherd', 'Bulldog',
  'Beagle', 'Poodle', 'Rottweiler', 'Yorkshire Terrier', 'Dachshund',
  'Boxer', 'Shih Tzu', 'Doberman', 'Great Dane', 'Siberian Husky',
  'Chihuahua', 'Border Collie', 'Maltese', 'Pomeranian', 'Cocker Spaniel',
]

const CAT_BREEDS = [
  'Persian', 'Maine Coon', 'Siamese', 'Ragdoll', 'British Shorthair',
  'Sphynx', 'Bengal', 'Abyssinian', 'Scottish Fold', 'Russian Blue',
  'Norwegian Forest Cat', 'Birman', 'Oriental', 'Tonkinese', 'Burmese',
]

export { DOG_BREEDS, CAT_BREEDS }

export function useAddPet(redirectTo = '/pet-photo') {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [breedType, setBreedType] = useState('pure')
  const [breed, setBreed] = useState('')
  const [mixedBreedDesc, setMixedBreedDesc] = useState('')
  const [ageCategory, setAgeCategory] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [size, setSize] = useState('')
  const [coatColor, setCoatColor] = useState('')
  const [coatType, setCoatType] = useState('')
  const [earType, setEarType] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function getAgeOptions() {
    if (type === 'dog') return [
      { value: 'puppy', label: 'Puppy (under 1 year)' },
      { value: 'adult_dog', label: 'Adult (1–7 years)' },
      { value: 'senior_dog', label: 'Senior (8+ years)' },
    ]
    if (type === 'cat') return [
      { value: 'kitten', label: 'Kitten (under 1 year)' },
      { value: 'adult_cat', label: 'Adult (1–10 years)' },
      { value: 'senior_cat', label: 'Senior (11+ years)' },
    ]
    return []
  }

  function getBreedValue() {
    if (breedType === 'pure') return breed
    if (breedType === 'mixed') return mixedBreedDesc
    return 'Unknown'
  }

  function validate() {
    if (!name.trim()) { setError('Pet name is required.'); return false }
    if (!type) { setError('Please select a pet type.'); return false }
    if (breedType === 'pure' && !breed) { setError('Please select a breed.'); return false }
    if (breedType === 'mixed' && !mixedBreedDesc.trim()) { setError('Please describe the mix.'); return false }
    if (!ageCategory) { setError('Please select an age category.'); return false }
    if (!weightKg || parseFloat(weightKg) <= 0) { setError('Please enter a valid weight.'); return false }
    if (!size) { setError('Please select a size.'); return false }
    if (!coatColor.trim()) { setError('Please enter a coat color.'); return false }
    if (!coatType) { setError('Please select a coat type.'); return false }
    if (!earType) { setError('Please select an ear type.'); return false }
    return true
  }

  async function handleSubmit() {
    setError('')
    if (!validate()) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Not authenticated.')
      setLoading(false)
      return
    }

    const { data: pet, error: petError } = await supabase
      .from('pets')
      .insert({
        user_id: user.id,
        name: name.trim(),
        type,
        breed: getBreedValue(),
        age_category: ageCategory,
        weight_kg: parseFloat(weightKg),
      })
      .select()
      .single()

    if (petError) {
      setError(petError.message)
      setLoading(false)
      return
    }

    const { error: traitsError } = await supabase
      .from('pet_physical_traits')
      .insert({
        pet_id: pet.id,
        size,
        coat_color: coatColor.trim(),
        coat_type: coatType,
        ear_type: earType,
      })

    if (traitsError) {
      setError(traitsError.message)
      setLoading(false)
      return
    }

    navigate(redirectTo, {
      state: {
        pet,
        traits: {
          size,
          coat_color: coatColor,
          coat_type: coatType,
          ear_type: earType,
        }
      }
    })
  }

  return {
    name, setName,
    type, setType,
    breedType, setBreedType,
    breed, setBreed,
    mixedBreedDesc, setMixedBreedDesc,
    ageCategory, setAgeCategory,
    weightKg, setWeightKg,
    size, setSize,
    coatColor, setCoatColor,
    coatType, setCoatType,
    earType, setEarType,
    error,
    loading,
    handleSubmit,
    getAgeOptions,
    breeds: type === 'dog' ? DOG_BREEDS : CAT_BREEDS,
  }
}