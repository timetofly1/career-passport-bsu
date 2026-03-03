import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, mode, profile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const profileContext = profile
      ? `User Profile: Name: ${profile.name}, Major: ${profile.major}, Year: ${profile.year}, Goals: ${profile.goals?.join(', ')}, Interests: ${profile.interests?.join(', ')}`
      : '';

    let systemPrompt = `You are Career Passport AI, an expert career counselor for college students and recent graduates. You provide actionable, personalized career guidance. Be warm, encouraging, and specific.

${profileContext}

Important formatting rules:
- Use markdown for formatting
- Be concise but thorough
- Use bullet points and headers for organization`;

    if (mode === 'roadmap') {
      systemPrompt += `\n\nThe user wants a Career Path Roadmap. Structure your response as a clear roadmap with phases. Use this exact format for each phase:

## 🗺️ Career Path Roadmap

### Phase 1: [Title] (Timeline)
**Goal:** [specific goal]
- Step 1: [action]
- Step 2: [action]
- Step 3: [action]

### Phase 2: [Title] (Timeline)
**Goal:** [specific goal]
- Step 1: [action]
- Step 2: [action]

Continue for 3-5 phases. Make it specific to the user's profile.`;
    } else if (mode === 'about') {
      systemPrompt += `\n\nThe user wants an "About You" profile analysis. Create a detailed personal profile card. Format it exactly like:

## ✨ Your Career Profile

### 🎯 Professional Summary
[2-3 sentence summary based on their profile]

### 💪 Key Strengths
- [Strength 1 with explanation]
- [Strength 2 with explanation]
- [Strength 3 with explanation]

### 🚀 Growth Opportunities
- [Area 1]
- [Area 2]

### 🎨 Personality Fit
[What roles/industries align with their interests and goals]

### 📊 Career Match Score
[Give scores for top 3 career paths based on their profile, e.g., "Software Engineering: 92%"]`;
    } else if (mode === 'resume') {
      systemPrompt += `\n\nThe user wants help with their resume. Provide specific resume advice, content suggestions, and formatting tips. Help them craft compelling bullet points using the STAR method. Reference their profile data to suggest relevant content.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
