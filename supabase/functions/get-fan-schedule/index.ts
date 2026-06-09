import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const { device_id } = await req.json();

    if (!device_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing device_id"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const now = new Date();

    const costaRicaTime = now.toLocaleTimeString("en-GB", {
      timeZone: "America/Costa_Rica",
      hour12: false
    });

    const { data, error } = await supabase
      .from("fan_schedule_times")
      .select("*")
      .eq("device_id", device_id)
      .lte("scheduled_time", costaRicaTime)
      .order("scheduled_time", { ascending: false })
      .limit(1);

    if (error) throw error;

    let fanState = false;

    if (data && data.length > 0) {
      fanState = data[0].action === "on";
    }

    return new Response(
      JSON.stringify({
        success: true,
        fan_on: fanState,
        current_time: costaRicaTime
      }),
      {
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: String(err)
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});







