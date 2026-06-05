import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '../../../lib/supabase'

function extract(text, keywords, endKeywords) {
  // Try multiple variations of the header
  const variations = keywords.flatMap(k => [
    `===${k}===`, `=== ${k} ===`, `## ${k}`, `# ${k}`,
    `**${k}**`, k, k.toLowerCase(), k.toUpperCase()
  ])
  let si = -1, startLen = 0
  for (const v of variations) {
    const idx = text.indexOf(v)
    if (idx !== -1) { si = idx; startLen = v.length; break }
  }
  if (si === -1) return ''
  const s = si + startLen

  if (!endKeywords) return text.slice(s).trim()

  let ei = -1
  for (const ek of endKeywords) {
    const endVariations = [
      `===${ek}===`, `=== ${ek} ===`, `## ${ek}`, `# ${ek}`,
      `**${ek}**`, ek, ek.toLowerCase(), ek.toUpperCase()
    ]
    for (const v of endVariations) {
      const idx = text.indexOf(v, s)
      if (idx !== -1 && (ei === -1 || idx < ei)) { ei = idx; break }
    }
  }
  return ei === -1 ? text.slice(s).trim() : text.slice(s, ei).trim()
}

export async function POST(req) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorised' }, { status: 401 })

  const { updates, contentType, extraImages, month, year } = await req.json()
  const db = supabaseAdmin()
  const { data: profile } = await db.from('profiles').select('*').eq('clerk_user_id', userId).single()
  if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 })

  const prompt = `You are PostMate, a professional content manager for local businesses. Generate authentic, specific content — never generic.

BUSINESS:
Name: ${profile.business_name}
Type: ${profile.business_type}
Location: ${profile.location}
Voice: ${profile.voice}
Offerings: ${profile.offerings}
${profile.audience ? `Customers: ${profile.audience}` : ''}
${profile.instagram ? `Instagram: ${profile.instagram}` : ''}
${profile.facebook ? `Facebook: ${profile.facebook}` : ''}
${profile.website ? `Website: ${profile.website}` : ''}

THIS MONTH (${month} ${year}):
${updates.promotions ? `Promotions: ${updates.promotions}` : 'No specific promotions'}
${updates.news ? `News: ${updates.news}` : ''}
${updates.highlights ? `Highlight: ${updates.highlights}` : ''}
${updates.avoid ? `Avoid: ${updates.avoid}` : ''}

Generate content with these EXACT section headers (copy them exactly):
===SOCIAL POSTS===
Create 16 social media posts. For each post:
POST [N] | [Instagram or Facebook] | [promotional/educational/engaging/behind-scenes]
Caption: [full caption text]
Hashtags: [10 for Instagram, 3 for Facebook]
Best time: [day and time]

===EMAIL NEWSLETTERS===
Create 2 email newsletters. For each:
NEWSLETTER [N]
Subject: [subject line]
Subject B: [A/B variant]
Preview: [preview text under 90 chars]
Body:
[full 350 word body copy]
CTA: [button text]

===GOOGLE POSTS===
Create 4 Google Business posts. For each:
GOOGLE [N] | [offer/update/event/product]
Copy: [150 word copy]
CTA: [button type]

===BLOG POSTS===
Create 2 blog post outlines. For each:
BLOG [N]
Title: [SEO-optimised title]
Meta: [meta description under 155 chars]
Keyword: [target keyword]
Outline:
[H2 and H3 sections with brief notes]

Write specifically for ${profile.business_name} in ${profile.location}. Match the ${profile.voice} brand voice throughout. Never be generic.`

  const allImages = [...(profile.images||[]), ...(extraImages||[])]
  const messageContent = [
    ...allImages.map(img => ({ type:'image', source:{ type:'base64', media_type:img.type, data:img.data } })),
    { type:'text', text:prompt }
  ]

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method:'POST',
    headers:{ 'Content-Type':'application/json', 'x-api-key':process.env.ANTHROPIC_API_KEY, 'anthropic-version':'2023-06-01' },
    body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:4000, messages:[{ role:'user', content:messageContent }] })
  })

  const data = await r.json()
  const raw = data.content?.map(b=>b.text||'').join('\n') || ''

  // Flexible section extraction
  const social = extract(raw, ['SOCIAL POSTS'], ['EMAIL NEWSLETTERS','EMAIL NEWSLETTER','NEWSLETTERS'])
  const email = extract(raw, ['EMAIL NEWSLETTERS','EMAIL NEWSLETTER','NEWSLETTERS'], ['GOOGLE POSTS','GOOGLE POST','GOOGLE BUSINESS'])
  const google = extract(raw, ['GOOGLE POSTS','GOOGLE POST','GOOGLE BUSINESS'], ['BLOG POSTS','BLOG POST','BLOG'])
  const blog = extract(raw, ['BLOG POSTS','BLOG POST','BLOG'], null)

  // Fallback: if sections are empty, store raw in social
  const sections = {
    social: social || raw,
    email: email || '',
    google: google || '',
    blog: blog || '',
  }

  const { data: saved } = await db.from('content_history').insert({
    clerk_user_id: userId, month, year, raw_content:raw, sections, updates, content_type: contentType || 'full'
  }).select('id').single()

  return Response.json({ id: saved.id })
}
