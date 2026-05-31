import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useUser() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function fetchUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      const { data } = await supabase
        .from('users')
        .select('full_name, avatar_url')
        .eq('id', authUser.id)
        .single()

      if (data) setUser(data)
    }

    fetchUser()
  }, [])

  return { user }
}