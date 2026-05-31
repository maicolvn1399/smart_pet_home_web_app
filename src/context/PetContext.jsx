import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const PetContext = createContext(null)

export function PetProvider({ children }) {
  const [pets, setPets] = useState([])
  const [activePet, setActivePet] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchPets = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (!error && data) {
      setPets(data)
      setActivePet((prev) => {
        const still = data.find((p) => p.id === prev?.id)
        return still ?? data[0] ?? null
      })
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPets()
  }, [fetchPets])

  return (
    <PetContext.Provider value={{ pets, activePet, setActivePet, loading, refetchPets: fetchPets }}>
      {children}
    </PetContext.Provider>
  )
}

export function usePet() {
  const ctx = useContext(PetContext)
  if (!ctx) throw new Error('usePet must be used inside PetProvider')
  return ctx
}