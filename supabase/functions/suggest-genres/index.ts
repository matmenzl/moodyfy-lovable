
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const { historyTracks = [], mood = '' } = await req.json();
    
    if (historyTracks.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Listening history is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Suggesting genres based on ${historyTracks.length} tracks from listening history`);

    // Format history tracks for the prompt
    const historyContent = historyTracks.map((song: {title: string, artist: string}) => 
      `- "${song.title}" by ${song.artist}`
    ).join("\n");

    const systemPrompt = `
      You are a music genre expert with deep knowledge of music theory, genres, and artists.
      Your task is to analyze a user's listening history and recommend 3-5 music genres that:
      1. Match the user's listening pattern and preferences
      2. Would be suitable for their current mood
      3. Are diverse enough to give varied recommendations
      
      Return ONLY a JSON array of strings representing genre names. Do not include any other text.
    `;

    const userPrompt = `
      Based on these songs from my listening history:
      ${historyContent}
      
      ${mood ? `And my current mood: ${mood}` : ''}
      
      Recommend 3-5 music genres that would match my taste and mood.
      Consider the musical elements of these songs like instrumentation, tempo, and overall feel.
      Only respond with a JSON array of genre strings.
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
        max_tokens: 150
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to get genre suggestions from OpenAI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    let genreSuggestions;

    try {
      const content = data.choices[0].message.content;
      // Try to parse the JSON response directly
      try {
        genreSuggestions = JSON.parse(content);
      } catch (e) {
        // If direct parsing fails, try to extract JSON from the text
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          genreSuggestions = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback to manual parsing if needed
          console.log("Failed to parse JSON, falling back to text extraction");
          genreSuggestions = content
            .split(/,|\n/)
            .map(s => s.trim())
            .filter(s => s && !s.includes('[') && !s.includes(']'))
            .slice(0, 5);
        }
      }
      
      // Validate the response
      if (!Array.isArray(genreSuggestions)) {
        throw new Error('Response is not an array');
      }
      
      // Filter out any non-string values
      genreSuggestions = genreSuggestions
        .filter(genre => typeof genre === 'string')
        .map(genre => genre.replace(/["']/g, '').trim())
        .slice(0, 5); // Limit to 5 genres
      
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      console.log('OpenAI raw response:', data.choices[0].message.content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse genre suggestions', raw: data.choices[0].message.content }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(genreSuggestions),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in suggest-genres function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
