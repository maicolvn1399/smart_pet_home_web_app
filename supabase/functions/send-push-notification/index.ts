// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// @ts-ignore
import webpush from 'https://esm.sh/web-push@3.6.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()

    // Handle both direct calls and webhook calls
    let user_id: string
    let title: string
    let notifBody: string

    if (body.record) {
      // Called from database webhook — body.record is the new alert row
      const alert = body.record
      user_id = alert.user_id
      title = 'Smart Pet Home'
      notifBody = alert.message
    } else {
      // Called directly
      user_id = body.user_id
      title = body.title ?? 'Smart Pet Home'
      notifBody = body.body ?? 'You have a new notification'
    }

    const supabase = createClient(
      (globalThis as any).Deno.env.get('SUPABASE_URL'),
      (globalThis as any).Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    )

    webpush.setVapidDetails(
      (globalThis as any).Deno.env.get('VAPID_EMAIL'),
      (globalThis as any).Deno.env.get('VAPID_PUBLIC_KEY'),
      (globalThis as any).Deno.env.get('VAPID_PRIVATE_KEY'),
    )

    // Get all subscriptions for this user
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', user_id)

    if (error) throw error

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: 'No subscriptions found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const payload = JSON.stringify({
      title,
      body: notifBody,
      icon: '/tab_logo.png',
    })

    // Send to all subscribed devices
    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        )
      )
    )

    // Remove expired subscriptions
    const expired = subscriptions.filter((_, i) => {
      const result = results[i]
      return result.status === 'rejected' &&
        (result.reason?.statusCode === 404 || result.reason?.statusCode === 410)
    })

    if (expired.length > 0) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('endpoint', expired.map((s: any) => s.endpoint))
    }

    return new Response(JSON.stringify({ sent: results.length - expired.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})