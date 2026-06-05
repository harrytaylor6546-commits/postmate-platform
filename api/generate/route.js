import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '../../../lib/supabase'

const CONTENT_PROMPTS = {
  full: `Generate ALL of the following clearly separated:
===SOCIAL POSTS===
16 posts. Each: POST [N] | Platform | Type (promotional/educational/engaging/behind-scenes)
Caption: [full caption]
Hashtags: [10 for Instagram, 3 for Facebook]
Best time: [day + time]

===EMAIL NEWSLETTERS===
2 newsletters. Each:
Subject: [subject line]
Subject B: [A/B variant]
Preview: [max 90 chars]
Body: [full 350-400 word copy]
CTA: [button text]

===GOOGLE POSTS===
4 posts. Each:
GOOGLE [N] | [Type: offer/update/event/product]
Copy: [150-200 words]
CTA: [button type]

===BLOG POSTS===
2 posts. Each:
Title: [SEO title]
Meta: [meta description max 155 chars]
Keyword: [target keyword]
Outline: [H2/H3 structure with brief notes]`,

  social: '===SOCIAL POSTS===\n16 posts. Each: POST [N] | Platform | Type\nCaption: [full caption]\nHashtags: [10 for Instagram, 3 for Facebook]\nBest time: [day + time]',
  email: '===EMAIL NEWSLETTERS===\n2 newsletters. Each:\nSubject: [subject]\nSubject B: [A/B variant]\nPreview: [max 90 chars]\nBody: [350-400 words]\nCTA: [button text]',
  google: '===GOOGLE POSTS===\n4 posts. Each:\nGOOGLE [N] | [Type]\nCopy: [150-200 words]\nCTA: [button]',
  blog: '===BLOG POSTS===\n2 posts. Each:\nTitle: [SEO title]\nMeta: [meta description]\nKeyword: [target keyword]\nOutline: [H2/H3 with notes]'
}

function extractSection(text, start, end) {
  const si = text.indexOf(start)
  if (si === -1) return text.slice(0, 2000)
  const startIdx = si + start.length
  if (!end) return text.slice(startIdx).trim()
  const ei = text.indexOf(end, startIdx)
  return ei === -1 ? text.slice(startIdx).trim() : text.slice(startIdx, ei).trim()
}

export async function POST(req) {
  const { userId } = auth()
  if (!userId) return Response.json({ error: 'Unauthorised' }, { status: 401 })

  const { updates, contentType, extraImages, month, year } = await req.json()
  const db = supabaseAdmin()

  // Get profile
  const { data: profile, error } = await db.from('profiles').select('*').eq('clerk_user_id', userId).single()
  if (error || !profile) return Response.json({ error: 'Profile not found' }, { status: 404 })

  const prompt = `You are PostMate, a professional content manager for local businesses. Generate a complete month of authentic, high-quality content.

BUSINESS PROFILE:
Name: ${profile.business_name}
Type: ${profile.business_type}
Location: ${profile.location}
Brand voice: ${profile.voice}
What they offer: ${profile.offerings}
${profile.audience ? `Target customers: ${profile.audience}` : ''}
${profile.instagram ? `Instagram: ${profile.instagram}` : ''}
${profile.facebook ? `Facebook: ${profile.facebook}` : ''}
${profile.website ? `Website: ${profile.website}` : ''}

THIS MONTH (${month} ${year}):
${updates.promotions ? `Promotions: ${updates.promotions}` : 'No specific promotions'}
${updates.news ? `News: ${updates.news}` : ''}
${updates.highlights ? `Highlights: ${updates.highlights}` : ''}
${updates.avoid ? `Avoid: ${updates.avoid}` : ''}

${(profile.images?.length + (extraImages?.length || 0)) > 0 ? `BRAND IMAGES: ${profile.images?.length + (extraImages?.length||0)} image(s) provided. Reference brand visuals, colours and products where relevant.` : ''}

${CONTENT_PROMPTS[contentType] || CONTENT_PROMPTS.full}

Write everything specifically for ${profile.business_name} — never generic. Match the ${profile.voice} brand voice. Reference ${profile.location} naturally.`

  const allImages = [...(profile.images || []), ...(extraImages || [])]
  const messageContent = [
    ...allImages.map(img => ({ type: 'image', source: { type: 'base64', media_type: img.type, data: img.data } })),
    { type: 'text', text: prompt }
  ]

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 4000, messages: [{ role: 'user', content: messageContent }] })
  })

  const data = await anthropicRes.json()
  const raw = data.content?.map(b => b.text || '').join('\n') || ''

  const sections = {
    social: extractSection(raw, '===SOCIAL POSTS===', '===EMAIL NEWSLETTERS==='),
    email: extractSection(raw, '===EMAIL NEWSLETTERS===', '===GOOGLE POSTS==='),
    google: extractSection(raw, '===GOOGLE POSTS===', '===BLOG POSTS==='),
    blog: extractSection(raw, '===BLOG POSTS===', null),
  }

  const { data: saved } = await db.from('content_history').insert({
    clerk_user_id: userId,
    month,
    year,
    raw_content: raw,
    sections,
    updates,
    content_type: contentType
  }).select('id').single()

  return Response.json({ id: saved.id })
}
