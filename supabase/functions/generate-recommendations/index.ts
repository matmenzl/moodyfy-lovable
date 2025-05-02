
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

    const { mood, genre, excludeSongs = [], includeHistory = false, historyTracks = [] } = await req.json();
    
    if (!mood) {
      return new Response(
        JSON.stringify({ error: 'Mood is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating recommendations for mood: ${mood}, genre: ${genre || 'any'}`);
    if (excludeSongs.length > 0) {
      console.log(`Excluding ${excludeSongs.length} songs from recommendations`);
    }
    if (includeHistory && historyTracks.length > 0) {
      console.log(`Including ${historyTracks.length} songs from listening history`);
    }

    // Format exclude songs list for the prompt
    let excludeSongsContent = '';
    if (excludeSongs && excludeSongs.length > 0) {
      excludeSongsContent = "\n\nPlease DO NOT include these songs in your recommendations:\n" +
        excludeSongs.map((song: {title: string, artist: string}) => 
          `- "${song.title}" by ${song.artist}`
        ).join("\n");
    }
    
    // Format history tracks for the prompt
    let historyContent = '';
    if (includeHistory && historyTracks.length > 0) {
      historyContent = "\n\nHere are songs from the user's listening history that you should consider as inspiration:\n" +
        historyTracks.map((song: {title: string, artist: string}) => 
          `- "${song.title}" by ${song.artist}`
        ).join("\n") +
        "\n\nTry to recommend songs that match the mood and genre but are also stylistically similar to these history tracks in terms of instrumentation, tempo, or general feel.";
    }

    const systemPrompt = `
      You are a music recommendation expert with deep knowledge of music theory, instrumentation, and song characteristics.
      When recommending songs:
      
      1. Focus on the MUSICAL QUALITIES that match the requested mood, not just lyrical content
      2. Consider instrumentation, tempo, chord progressions, and vocal style that typically convey the requested mood
      3. For each genre, understand its typical patterns and how they can express different emotions
      4. Provide diverse recommendations across different eras and popularity levels
      5. Return ONLY a JSON array with objects having 'title' and 'artist' properties
    `;

    const userPrompt = `
      Recommend 10 songs for the mood: ${mood}${genre ? ` and genre: ${genre}` : ''}.
      
      Beyond just the title words, focus on songs whose MUSICAL ELEMENTS (instrumentation, tempo, vocal style, chord progressions) genuinely convey this mood.
      ${genre ? `Ensure the songs fit within the ${genre} genre tradition and sound.` : ''}
      
      Only respond with a JSON array.${excludeSongsContent}${historyContent}
    `;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
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
