import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const PetContext = createContext(null)

export function PetProvider({ children }) {
  const [pets, setPets] = useState([])
  const [activePet, setActivePet] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPets() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (!error && data) {
        setPets(data)
        setActivePet(data[0] ?? null)
      }

      setLoading(false)
    }

    fetchPets()
  }, [])

  return (
    <PetContext.Provider value={{ pets, activePet, setActivePet, loading }}>
      {children}
    </PetContext.Provider>
  )
}

export function usePet() {
  const ctx = useContext(PetContext)
  if (!ctx) throw new Error('usePet must be used inside PetProvider')
  return ctx
}