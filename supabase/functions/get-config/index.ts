// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { device_id } = await req.json()

    const supabase = createClient(
      (globalThis as any).Deno.env.get('SUPABASE_URL'),
      (globalThis as any).Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    )

    const { data, error } = await supabase
      .from('temperature_monitor_config')
      .select('upper_threshold, lower_threshold, fan_enabled')
      .eq('device_id', device_id)
      .single()

    if (error) throw error

    return new Response(JSON.stringify({
      success: true,
      upper_threshold: data.upper_threshold,
      lower_threshold: data.lower_threshold,
      fan_enabled: data.fan_enabled,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'

    return new Response(JSON.stringify({
      error: message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})