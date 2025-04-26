
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Constants for game physics
const STAGE_WIDTH = 800;
const STAGE_HEIGHT = 300;
const GRAVITY = 0.5;
const PLAYER_WIDTH = 48;
const PLAYER_HEIGHT = 64;
const JUMP_FORCE = -10;
const MOVE_SPEED = 5;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') as string
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions
type Vector2D = {
  x: number;
  y: number;
};

type PlayerState = 
  | 'idle' 
  | 'walking' 
  | 'jumping' 
  | 'attacking' 
  | 'blocking' 
  | 'hit' 
  | 'knockedDown';

type PlayerIntent = {
  moveDirection: 'left' | 'right' | 'none';
  verticalIntent: 'jump' | 'crouch' | 'none';
  attackIntent: 'light' | 'medium' | 'heavy' | 'special' | null;
  blockIntent: boolean;
};

type GameState = {
  player1Pos: Vector2D;
  player2Pos: Vector2D;
  player1Velocity: Vector2D;
  player2Velocity: Vector2D;
  player1Health: number;
  player2Health: number;
  player1State: PlayerState;
  player2State: PlayerState;
  gameTimer: number;
  matchOver: boolean;
  winner: "P1" | "P2" | "Draw" | null;
  player1InputSeq: number;
  player2InputSeq: number;
};

type InputUpdate = {
  matchId: string;
  playerId: string;
  playerNumber: 'P1' | 'P2';
  intent: PlayerIntent;
  sequenceNumber: number;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse request body
    const body = await req.json() as InputUpdate
    const { matchId, playerId, playerNumber, intent, sequenceNumber } = body
    
    console.log(`Processing game tick for match ${matchId}, player ${playerNumber}`, { intent, sequenceNumber })
    
    // Get current match state
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single()
    
    if (matchError) {
      throw new Error(`Error fetching match: ${matchError.message}`)
    }
    
    if (!match) {
      throw new Error('Match not found')
    }
    
    // Verify player is part of this match
    if (match.player1_id !== playerId && match.player2_id !== playerId) {
      throw new Error('Player is not part of this match')
    }
    
    // Get current game state
    const currentState: GameState = match.current_state || {
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
    
    // Check if the input is newer than what we already processed
    if (playerNumber === 'P1' && sequenceNumber <= currentState.player1InputSeq) {
      return new Response(JSON.stringify({ 
        message: "Input already processed",
        currentState
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }
    
    if (playerNumber === 'P2' && sequenceNumber <= currentState.player2InputSeq) {
      return new Response(JSON.stringify({ 
        message: "Input already processed", 
        currentState
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }
    
    // Process the new input
    const newState = processInput(currentState, playerNumber, intent)
    
    // Update sequence numbers
    if (playerNumber === 'P1') {
      newState.player1InputSeq = sequenceNumber
    } else {
      newState.player2InputSeq = sequenceNumber
    }
    
    // Apply physics for 1/60th of a second
    const finalState = updatePhysics(newState, 1/60)
    
    // Check for match end conditions
    let matchStatus = match.status
    
    if (finalState.player1Health <= 0) {
      finalState.matchOver = true
      finalState.winner = 'P2'
      matchStatus = 'p2_won'
    } else if (finalState.player2Health <= 0) {
      finalState.matchOver = true
      finalState.winner = 'P1'
      matchStatus = 'p1_won'
    } else if (finalState.gameTimer <= 0) {
      finalState.matchOver = true
      if (finalState.player1Health > finalState.player2Health) {
        finalState.winner = 'P1'
        matchStatus = 'p1_won'
      } else if (finalState.player2Health > finalState.player1Health) {
        finalState.winner = 'P2'
        matchStatus = 'p2_won'
      } else {
        finalState.winner = 'Draw'
        matchStatus = 'draw'
      }
    }
    
    // Update match in database
    const { error: updateError } = await supabase
      .from('matches')
      .update({ 
        current_state: finalState,
        status: matchStatus,
        winner: finalState.winner === 'P1' ? match.player1_id : 
                finalState.winner === 'P2' ? match.player2_id : null
      })
      .eq('id', matchId)
    
    if (updateError) {
      throw new Error(`Error updating match: ${updateError.message}`)
    }
    
    return new Response(JSON.stringify({ 
      message: "Game state updated",
      currentState: finalState
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error) {
    console.error('Error in process-game-tick function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})

// Process player input and update game state
function processInput(state: GameState, playerNumber: 'P1' | 'P2', intent: PlayerIntent): GameState {
  const newState = { ...state }
  
  // Process movement
  let velocityX = 0
  const isPlayer1 = playerNumber === 'P1'
  const currentPos = isPlayer1 ? state.player1Pos : state.player2Pos
  const currentState = isPlayer1 ? state.player1State : state.player2State
  
  // Skip processing if player is in a non-controllable state
  if (currentState === 'hit' || currentState === 'knockedDown') {
    return newState
  }
  
  // Handle movement intent
  if (intent.moveDirection === 'left') {
    velocityX = -MOVE_SPEED
    if (currentState !== 'jumping' && currentState !== 'attacking') {
      if (isPlayer1) {
        newState.player1State = 'walking'
      } else {
        newState.player2State = 'walking'
      }
    }
  } else if (intent.moveDirection === 'right') {
    velocityX = MOVE_SPEED
    if (currentState !== 'jumping' && currentState !== 'attacking') {
      if (isPlayer1) {
        newState.player1State = 'walking'
      } else {
        newState.player2State = 'walking'
      }
    }
  } else if (currentState === 'walking') {
    if (isPlayer1) {
      newState.player1State = 'idle'
    } else {
      newState.player2State = 'idle'
    }
  }
  
  // Handle jump intent
  if (intent.verticalIntent === 'jump' && currentState !== 'jumping' && currentState !== 'attacking') {
    if (isPlayer1) {
      newState.player1Velocity = { x: velocityX, y: JUMP_FORCE }
      newState.player1State = 'jumping'
    } else {
      newState.player2Velocity = { x: velocityX, y: JUMP_FORCE }
      newState.player2State = 'jumping'
    }
  } else {
    if (isPlayer1) {
      newState.player1Velocity = { x: velocityX, y: newState.player1Velocity.y }
    } else {
      newState.player2Velocity = { x: velocityX, y: newState.player2Velocity.y }
    }
  }
  
  // Handle attack intent
  if (currentState !== 'attacking' && intent.attackIntent) {
    if (isPlayer1) {
      newState.player1State = 'attacking'
      
      // Simple hit detection against P2
      // In a real game, this would be more complex with hitboxes
      const p1Right = currentPos.x + PLAYER_WIDTH
      const p2Left = state.player2Pos.x
      const distance = Math.abs(p1Right - p2Left)
      
      if (distance < 30) {
        // Player is in range to hit
        const damage = intent.attackIntent === 'light' ? 5 : 
                      intent.attackIntent === 'medium' ? 10 : 
                      intent.attackIntent === 'heavy' ? 15 : 20
        
        if (state.player2State !== 'blocking') {
          newState.player2Health = Math.max(0, newState.player2Health - damage)
          newState.player2State = damage > 10 ? 'knockedDown' : 'hit'
        } else {
          // Reduced damage when blocking
          newState.player2Health = Math.max(0, newState.player2Health - damage * 0.25)
        }
      }
    } else {
      newState.player2State = 'attacking'
      
      // Simple hit detection against P1
      const p2Left = currentPos.x
      const p1Right = state.player1Pos.x + PLAYER_WIDTH
      const distance = Math.abs(p2Left - p1Right)
      
      if (distance < 30) {
        // Player is in range to hit
        const damage = intent.attackIntent === 'light' ? 5 : 
                      intent.attackIntent === 'medium' ? 10 : 
                      intent.attackIntent === 'heavy' ? 15 : 20
        
        if (state.player1State !== 'blocking') {
          newState.player1Health = Math.max(0, newState.player1Health - damage)
          newState.player1State = damage > 10 ? 'knockedDown' : 'hit'
        } else {
          // Reduced damage when blocking
          newState.player1Health = Math.max(0, newState.player1Health - damage * 0.25)
        }
      }
    }
  }
  
  // Handle block intent
  if (intent.blockIntent && currentState !== 'jumping' && currentState !== 'attacking') {
    if (isPlayer1) {
      newState.player1State = 'blocking'
    } else {
      newState.player2State = 'blocking'
    }
  } else if (currentState === 'blocking' && !intent.blockIntent) {
    if (isPlayer1) {
      newState.player1State = 'idle'
    } else {
      newState.player2State = 'idle'
    }
  }
  
  return newState
}

// Update physics (gravity, position, etc.)
function updatePhysics(state: GameState, deltaTime: number): GameState {
  const newState = { ...state }
  
  // Calculate new positions based on velocities
  const newP1Pos = {
    x: Math.max(0, Math.min(STAGE_WIDTH - PLAYER_WIDTH, state.player1Pos.x + state.player1Velocity.x * deltaTime)),
    y: Math.max(STAGE_HEIGHT - PLAYER_HEIGHT, Math.min(STAGE_HEIGHT, state.player1Pos.y + state.player1Velocity.y * deltaTime))
  }
  
  const newP2Pos = {
    x: Math.max(0, Math.min(STAGE_WIDTH - PLAYER_WIDTH, state.player2Pos.x + state.player2Velocity.x * deltaTime)),
    y: Math.max(STAGE_HEIGHT - PLAYER_HEIGHT, Math.min(STAGE_HEIGHT, state.player2Pos.y + state.player2Velocity.y * deltaTime))
  }
  
  // Apply gravity if in air
  const newP1Velocity = {
    x: state.player1Velocity.x,
    y: state.player1Pos.y < STAGE_HEIGHT - PLAYER_HEIGHT ? state.player1Velocity.y + GRAVITY : 0
  }
  
  const newP2Velocity = {
    x: state.player2Velocity.x,
    y: state.player2Pos.y < STAGE_HEIGHT - PLAYER_HEIGHT ? state.player2Velocity.y + GRAVITY : 0
  }
  
  // Check if player landed (was in air, now on ground)
  const wasP1InAir = state.player1Pos.y < STAGE_HEIGHT - PLAYER_HEIGHT
  const isP1OnGround = newP1Pos.y >= STAGE_HEIGHT - PLAYER_HEIGHT
  
  if (wasP1InAir && isP1OnGround && state.player1State === 'jumping') {
    newState.player1State = 'idle'
  }
  
  const wasP2InAir = state.player2Pos.y < STAGE_HEIGHT - PLAYER_HEIGHT
  const isP2OnGround = newP2Pos.y >= STAGE_HEIGHT - PLAYER_HEIGHT
  
  if (wasP2InAir && isP2OnGround && state.player2State === 'jumping') {
    newState.player2State = 'idle'
  }
  
  // Reset after hit animation
  if (state.player1State === 'hit') {
    setTimeout(() => {
      newState.player1State = 'idle'
    }, 500)
  }
  
  if (state.player2State === 'hit') {
    setTimeout(() => {
      newState.player2State = 'idle'
    }, 500)
  }
  
  // Reset after knockedDown animation (longer)
  if (state.player1State === 'knockedDown') {
    setTimeout(() => {
      newState.player1State = 'idle'
    }, 1000)
  }
  
  if (state.player2State === 'knockedDown') {
    setTimeout(() => {
      newState.player2State = 'idle'
    }, 1000)
  }
  
  // Reset after attack animation
  if (state.player1State === 'attacking') {
    setTimeout(() => {
      newState.player1State = 'idle'
    }, 300)
  }
  
  if (state.player2State === 'attacking') {
    setTimeout(() => {
      newState.player2State = 'idle'
    }, 300)
  }
  
  // Update positions and velocities
  newState.player1Pos = newP1Pos
  newState.player2Pos = newP2Pos
  newState.player1Velocity = newP1Velocity
  newState.player2Velocity = newP2Velocity
  
  // Update game timer
  if (!state.matchOver) {
    newState.gameTimer = Math.max(0, state.gameTimer - deltaTime)
  }
  
  return newState
}
