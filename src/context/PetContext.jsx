import { createContext, useContext, useState } from 'react'

// Placeholder pets — replace with real Supabase data later
const PLACEHOLDER_PETS = [
  { id: '1', name: 'Buddy', breed: 'Golden Retriever', age: 3, photo: null },
  { id: '2', name: 'Luna',  breed: 'Siamese Cat',      age: 1, photo: null },
]

const PetContext = createContext(null)

export function PetProvider({ children }) {
  const [pets] = useState(PLACEHOLDER_PETS)
  const [activePet, setActivePet] = useState(PLACEHOLDER_PETS[0])

  return (
    <PetContext.Provider value={{ pets, activePet, setActivePet }}>
      {children}
    </PetContext.Provider>
  )
}

export function usePet() {
  const ctx = useContext(PetContext)
  if (!ctx) throw new Error('usePet must be used inside PetProvider')
  return ctx
}