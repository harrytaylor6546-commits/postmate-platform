import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '../../../lib/supabase'

function extract(text, start, end) {
  const si = text.indexOf(start)
  if (si === -1) return ''
  const s = si + start.length
  if (!end) return text.slice(s).trim()
  const ei = text.indexOf(end, s)
  return ei === -1 ? text.slice(s).trim() : text.slice(s, ei).trim()
}

export async function POST(req) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorised' }, { status: 401 })

  const { updates, contentType, extraImages, month, year } = await req.json()
  const db = supabaseAdmin()
  const { data: profile } = await db.from('profiles').select('*').eq('clerk_user_id', userId).single()
  if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 })

  const typePrompts = {
    full: `Generate ALL sections with EXACT headers:
===SOCIAL POSTS===
16 posts. Each: POST [N] | [Instagram or Facebook] | [type: promotional/educational/engaging/behind-scenes]
Caption: [full caption]
Hashtags: [10 for Instagram, 3 for Facebook]
Best time: [day and time]

===EMAIL NEWSLETTERS===
2 newsletters. Each:
NEWSLETTER [N]
Subject: [subject]
Subject B: [A/B variant]
Preview: [under 90 chars]
Body:
[350 word body]
CTA: [button text]

===GOOGLE POSTS===
4 posts. Each:
GOOGLE [N] | [offer/update/event/product]
Copy: [150 words]
CTA: [button]

===BLOG POSTS===
2 posts. Each:
BLOG [N]
Title: [SEO title]
Meta: [meta description]
Keyword: [target keyword]
Outline:
[H2/H3 sections]`,
    social: '===SOCIAL POSTS===\n16 posts. Each: POST [N] | [platform] | [type]\nCaption: [full]\nHashtags: [10 IG/3 FB]\nBest time: [day+time]',
    email: '===EMAIL NEWSLETTERS===\n2 newsletters. Each:\nNEWSLETTER [N]\nSubject: [subject]\nSubject B: [variant]\nPreview: [text]\nBody:\n[350 words]\nCTA: [button]',
    google: '===GOOGLE POSTS===\n4 posts. Each:\nGOOGLE [N] | [type]\nCopy: [150 words]\nCTA: [button]',
    blog: '===BLOG POSTS===\n2 posts. Each:\nBLOG [N]\nTitle: [SEO title]\nMeta: [desc]\nKeyword: [keyword]\nOutline:\n[H2/H3]'
  }

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

${(profile.images?.length + (extraImages?.length||0)) > 0 ? `BRAND IMAGES: ${profile.images?.length + (extraImages?.length||0)} image(s) provided. Reference brand visuals where relevant.` : ''}

${typePrompts[contentType] || typePrompts.full}

Write specifically for ${profile.business_name} in ${profile.location}. Match the ${profile.voice} voice throughout.`

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

  const sections = {
    social: extract(raw,'===SOCIAL POSTS===','===EMAIL NEWSLETTERS==='),
    email: extract(raw,'===EMAIL NEWSLETTERS===','===GOOGLE POSTS==='),
    google: extract(raw,'===GOOGLE POSTS===','===BLOG POSTS==='),
    blog: extract(raw,'===BLOG POSTS===',null),
  }

  const { data: saved } = await db.from('content_history').insert({
    clerk_user_id: userId, month, year, raw_content:raw, sections, updates, content_type:contentType
  }).select('id').single()

  return Response.json({ id: saved.id })
}
