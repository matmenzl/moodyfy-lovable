
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { mood, genre } = await req.json();
    
    if (!mood) {
      return new Response(
        JSON.stringify({ error: 'Mood is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating recommendations for mood: ${mood}, genre: ${genre || 'any'}`);

    const messages = [
      {
        role: "system",
        content: "You are a music recommendation expert. Provide a list of 10 songs that match the user's mood and optional genre preference. Return ONLY a JSON array with objects having 'title' and 'artist' properties."
      },
      {
        role: "user",
        content: `Recommend 10 songs for the mood: ${mood}${genre ? ` and genre: ${genre}` : ''}. The songs should genuinely reflect this mood${genre ? ` and genre` : ''}. Only respond with a JSON array.`
      }
    ];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to get recommendations from OpenAI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    let songRecommendations;

    try {
      const content = data.choices[0].message.content;
      // Try to parse the JSON response directly
      try {
        songRecommendations = JSON.parse(content);
      } catch (e) {
        // If direct parsing fails, try to extract JSON from the text
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          songRecommendations = JSON.parse(jsonMatch[0]);
        } else {
          // If still no valid JSON, parse line by line
          console.log("Parsing line by line as fallback");
          songRecommendations = parseLineByLine(content);
        }
      }
      
      // Validate and normalize the response
      if (!Array.isArray(songRecommendations)) {
        throw new Error('Response is not an array');
      }
      
      // Ensure each song has title and artist
      songRecommendations = songRecommendations.map(song => ({
        title: song.title || song.name || "Unknown Title",
        artist: song.artist || song.by || "Unknown Artist"
      })).slice(0, 10); // Limit to 10 songs
      
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      console.log('OpenAI raw response:', data.choices[0].message.content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse song recommendations' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(songRecommendations),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-recommendations function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Fallback parser for when JSON extraction fails
function parseLineByLine(content: string): any[] {
  const songs = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    // Try to match patterns like "1. Song Title by Artist" or "- Song Title by Artist"
    const match = line.match(/(?:\d+\.|-)?\s*["']?([^"']+)["']?\s+by\s+["']?([^"'.]+)["']?/i);
    if (match) {
      songs.push({
        title: match[1].trim(),
        artist: match[2].trim()
      });
    }
  }
  
  return songs;
}
