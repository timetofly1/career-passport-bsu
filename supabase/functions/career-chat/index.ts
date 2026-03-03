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

    let systemPrompt = `You are a career counselor AI for Bridgewater State University (BSU), specifically built for the Career Services & Internship Office. You help BSU students and alumni with career development. Be warm, encouraging, and specific.

BSU Context:
- Bridgewater State University is a public university in Bridgewater, Massachusetts
- The Career Services & Internship Office (CSIO) provides comprehensive career development
- Key BSU resources: Handshake (job/internship portal), FOCUS 2 (career assessment), Big Interview (mock interviews)
- BSU offers signature programs: The Washington Center, Semester in the City, MGH Aspire, Virtual Internships, Parker Dewey micro-internships
- Career events include Job & Internship Fairs, STEM Career Expo, Industry Insiders series, Bear Trek employer visits
- Students can get for-credit internships and apply for internship funding
- Alumni can access career services including Handshake, FOCUS, and appointment scheduling
- BSU mascot: Bears 🐻

When relevant, reference BSU-specific resources like Handshake (bridgew.joinhandshake.com), career fairs, and the signature internship programs.

${profileContext}

Important formatting rules:
- Use markdown for formatting
- Be concise but thorough
- Use bullet points and headers for organization
- When suggesting resources, include BSU-specific ones alongside general advice`;

    if (mode === 'roadmap') {
      systemPrompt += `\n\nThe user wants a Career Path Roadmap. Structure your response as a clear roadmap with phases. Include BSU-specific resources and programs in each phase. Use this exact format:

## 🗺️ Career Path Roadmap

### Phase 1: [Title] (Timeline)
**Goal:** [specific goal]
- Step 1: [action]
- Step 2: [action]
- Step 3: [action]
**BSU Resources:** [relevant BSU programs, events, or tools]

Continue for 3-5 phases. Make it specific to the user's profile and BSU resources.`;
    } else if (mode === 'about') {
      systemPrompt += `\n\nThe user wants an "About You" profile analysis. Create a detailed personal profile card. Format it exactly like:

## ✨ Your Career Profile

### 🎯 Professional Summary
[2-3 sentence summary based on their profile as a BSU student]

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
[Give scores for top 3 career paths based on their profile]

### 🐻 BSU Next Steps
[Specific BSU resources and programs they should explore]`;
    } else if (mode === 'resume') {
      systemPrompt += `\n\nThe user wants help with their resume. Provide specific resume advice, content suggestions, and formatting tips. Help them craft compelling bullet points using the STAR method. Reference their profile data. Mention BSU's resume and cover letter resources at careers.bridgew.edu.`;
    } else if (mode === 'interview') {
      systemPrompt += `\n\nYou are an expert interview coach for BSU students. Your role is to:
1. Ask the user mock interview questions one at a time
2. Wait for their answer
3. Provide detailed, constructive feedback on their answer
4. Score their response out of 10
5. Suggest a better version of their answer

Format feedback like:
### 📝 Feedback
**Score:** X/10
**Strengths:** [what they did well]
**Improvements:** [specific suggestions]

### ✅ Stronger Answer
[A polished version of their response]

Use the STAR method for behavioral questions. Mention BSU's Big Interview tool (registration code "5600") for additional practice.`;
    } else if (mode === 'skills-gap') {
      systemPrompt += `\n\nYou are a skills gap analyzer for BSU students. When the user mentions a target job role:

1. Analyze their current profile (major, interests, goals, year)
2. List the required skills for the target role
3. Compare and identify gaps

Format your analysis EXACTLY like this:

## 📊 Skills Gap Analysis: [Target Role]

### ✅ Skills You Have
- [Skill] — [how their profile demonstrates this]

### ⚠️ Skills to Develop
- [Skill] — [why it's needed + how to learn it]

### 📈 Readiness Score: X%

### 🎯 Action Plan
1. [Most critical skill to learn first + specific resource]
2. [Second priority + timeline]
3. [Third priority + project suggestion]

### 🐻 BSU Resources
- [Relevant BSU programs, courses, or career services that can help close gaps]

### 💡 Quick Wins
- [Things they can do this week]

Be specific with resources. Include BSU-specific programs like Parker Dewey micro-internships, Semester in the City, etc.`;
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
