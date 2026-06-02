import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const VAPID_PUBLIC_KEY = 'BFih5j_B2huhypUSgIoQ5Kr6iIZ-TkVrz3KKlEAbiPVDafx4n3O9ZLhRTP5taNxdiVfEzL9zV-0CDQLSQPqmX9s'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function usePushNotifications() {
  const [permission, setPermission] = useState(Notification.permission)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    checkExistingSubscription()
  }, [])

  async function checkExistingSubscription() {
    if (!('serviceWorker' in navigator)) return

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) setSubscribed(true)
  }

  async function subscribe() {
    setLoading(true)
    setError('')

    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setError('Push notifications are not supported in this browser.')
        setLoading(false)
        return
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // Request permission
      const perm = await Notification.requestPermission()
      setPermission(perm)

      if (perm !== 'granted') {
        setError('Notification permission denied.')
        setLoading(false)
        return
      }

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      const { endpoint, keys } = subscription.toJSON()

      // Save subscription to Supabase
      const { data: { user } } = await supabase.auth.getUser()

      const { error: dbError } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
        }, { onConflict: 'endpoint' })

      if (dbError) {
        setError(dbError.message)
        setLoading(false)
        return
      }

      setSubscribed(true)
      setLoading(false)

    } catch (err) {
      setError(err.message ?? 'Failed to subscribe.')
      setLoading(false)
    }
  }

  async function unsubscribe() {
    setLoading(true)

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()

        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', subscription.endpoint)
      }

      setSubscribed(false)
      setLoading(false)

    } catch (err) {
      setError(err.message ?? 'Failed to unsubscribe.')
      setLoading(false)
    }
  }

  return {
    permission,
    subscribed,
    loading,
    error,
    subscribe,
    unsubscribe,
  }
}