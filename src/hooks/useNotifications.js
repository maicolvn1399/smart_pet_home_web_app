import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { usePet } from '@/context/PetContext'

export function useNotifications() {
  const { pets } = usePet()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!pets.length) return

    let channel

    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch existing notifications
      const { data } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (data) {
        setNotifications(data)
        setUnreadCount(data.filter((n) => !n.read).length)
      }

      setLoading(false)

      // Subscribe to realtime
      channel = supabase
        .channel(`alerts-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'alerts',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('New alert received:', payload.new)
            setNotifications((prev) => [payload.new, ...prev].slice(0, 20))
            setUnreadCount((prev) => prev + 1)
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'alerts',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setNotifications((prev) =>
              prev.map((n) => (n.id === payload.new.id ? payload.new : n))
            )
            setUnreadCount((prev) =>
              payload.new.read && !payload.old.read ? Math.max(0, prev - 1) : prev
            )
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status)
        })
    }

    init()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [pets])

  async function markAllAsRead() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('alerts')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  async function markAsRead(id) {
    await supabase
      .from('alerts')
      .update({ read: true })
      .eq('id', id)

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  return {
    notifications,
    unreadCount,
    loading,
    markAllAsRead,
    markAsRead,
  }
}