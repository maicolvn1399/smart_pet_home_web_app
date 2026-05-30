import { supabase } from '../lib/supabase'
import { useEffect } from 'react'

export default function TestConnection() {
  useEffect(() => {
    const test = async () => {
      const { data, error } = await supabase.from('users').select('*')
      console.log('data:', data)
      console.log('error:', error)
    }
    test()
  }, [])

  return null
}