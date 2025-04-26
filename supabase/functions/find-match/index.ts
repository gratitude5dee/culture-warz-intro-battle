
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') as string
const supabase = createClient(supabaseUrl, supabaseAnonKey)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("Running find-match function")
    
    // Find users in the queue
    const { data: queueEntries, error: queueError } = await supabase
      .from('queue')
      .select('*')
      .order('joined_at', { ascending: true })
      .limit(2)
    
    if (queueError) {
      throw queueError
    }
    
    // If we don't have at least 2 users, can't make a match
    if (!queueEntries || queueEntries.length < 2) {
      return new Response(JSON.stringify({ message: "Not enough players in queue" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }
    
    // Get the first two users
    const player1 = queueEntries[0]
    const player2 = queueEntries[1]
    
    // Determine which stage to use (use player1's selection)
    const stage = player1.stage
    
    // Create a new match
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .insert({
        player1_id: player1.user_id,
        player2_id: player2.user_id,
        p1_character: player1.character,
        p2_character: player2.character,
        stage,
        status: 'active',
        // Initialize game state
        current_state: {
          player1Pos: { x: 100, y: 236 },
          player2Pos: { x: 652, y: 236 },
          player1Velocity: { x: 0, y: 0 },
          player2Velocity: { x: 0, y: 0 },
          player1Health: 100,
          player2Health: 100,
          player1State: 'idle',
          player2State: 'idle',
          gameTimer: 99,
          matchOver: false,
          winner: null,
          player1InputSeq: 0,
          player2InputSeq: 0
        }
      })
      .select('id')
      .single()
    
    if (matchError) {
      throw matchError
    }
    
    // Update both players' status to in_match:{matchId}
    const { error: p1UpdateError } = await supabase
      .from('profiles')
      .update({ status: `in_match:${match.id}` })
      .eq('id', player1.user_id)
      
    const { error: p2UpdateError } = await supabase
      .from('profiles')
      .update({ status: `in_match:${match.id}` })
      .eq('id', player2.user_id)
    
    if (p1UpdateError || p2UpdateError) {
      throw p1UpdateError || p2UpdateError
    }
    
    // Remove both players from the queue
    await supabase
      .from('queue')
      .delete()
      .in('user_id', [player1.user_id, player2.user_id])
    
    return new Response(JSON.stringify({ 
      message: "Match created", 
      matchId: match.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error) {
    console.error('Error in find-match function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
