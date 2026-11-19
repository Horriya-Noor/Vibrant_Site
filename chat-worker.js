/**
 * Optional AI backend for the website chat assistant (Cloudflare Worker).
 * Keeps your Anthropic API key private on the server (never put it in the website files).
 *
 * Deploy:
 *   1. npm i -g wrangler && wrangler login
 *   2. wrangler secret put ANTHROPIC_API_KEY
 *   3. wrangler deploy worker/chat-worker.js --name vibrant-chat --compatibility-date 2026-01-01
 *   4. In index.html, before assets/js/chat.js, add:
 *        <script>window.VIBRANT_CHAT_ENDPOINT="https://vibrant-chat.<your-subdomain>.workers.dev";</script>
 *   5. Change ALLOWED_ORIGIN below to your live domain.
 */
const ALLOWED_ORIGIN = "https://www.vibrantriskmanagement.com";
const MODEL = "claude-sonnet-5-5";

const SYSTEM = `You are the website assistant for Vibrant Risk Management Services, a DFW-based virtual insurance agency (Richardson, TX) with 4+ years of experience.
Phone: +1 (214) 764-1992. Email: Info@VibrantRiskManagement.Com.

What the agency offers: Health insurance (ACA/Marketplace, group health, travel medical), Auto insurance, Home insurance. Agency service is free to the client. The agency also helps health clients find in-network doctors, labs, clinics, urgent care and hospitals.

Carriers - Health: UnitedHealthcare, Ambetter Health, Oscar Health, Blue Cross Blue Shield, Molina Healthcare, Cigna Healthcare, Kaiser Permanente, Anthem / WellPoint, Florida Blue, Community Health Choice, Baylor Scott & White Health Plan, Imperial Health.
Auto: National General, State Farm, Progressive, GEICO.
Home: State Farm, Allstate, Farmers Insurance, USAA, Liberty Mutual, Travelers, Nationwide, American Family, Progressive, Chubb, Safeco, Homesite, Mercury Insurance, Texas Farm Bureau, Auto-Owners, Amica, Foremost, National General, Openly, Hippo, Stillwater Insurance, Universal Property, Branch Insurance, Lemonade, Kin Insurance.
Availability varies by state, county and plan year.

Rules:
- Be concise, warm and professional. Plain text, no markdown headings, max ~120 words.
- Never quote specific prices, premiums, subsidies or guarantee coverage/eligibility; say a licensed agent will confirm after a quote.
- Never give medical, legal or tax advice.
- Never ask for SSN, date of birth, payment or medical details. If the user offers them, tell them not to share them here.
- If you don't know or it needs an agent, direct them to call +1 (214) 764-1992 or use the quote form on the page.
- Only discuss the agency's insurance services and finding care providers. Politely decline anything else.`;

function cors(origin) {
  return {
    "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

export default {
  async fetch(req, env) {
    const origin = req.headers.get("Origin") || "";
    if (req.method === "OPTIONS") return new Response(null, { headers: cors(origin) });
    if (req.method !== "POST" || origin !== ALLOWED_ORIGIN)
      return new Response("Forbidden", { status: 403, headers: cors(origin) });

    let body;
    try { body = await req.json(); } catch { return new Response("Bad request", { status: 400, headers: cors(origin) }); }

    const messages = (Array.isArray(body.messages) ? body.messages : [])
      .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-12)
      .map(m => ({ role: m.role, content: m.content.slice(0, 600) }));
    if (!messages.length || messages[messages.length - 1].role !== "user")
      return new Response("Bad request", { status: 400, headers: cors(origin) });

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model: MODEL, max_tokens: 400, system: SYSTEM, messages }),
    });
    if (!r.ok) return new Response("Upstream error", { status: 502, headers: cors(origin) });
    const data = await r.json();
    const reply = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("").trim();
    return new Response(JSON.stringify({ reply }), { headers: { ...cors(origin), "Content-Type": "application/json" } });
  },
};
