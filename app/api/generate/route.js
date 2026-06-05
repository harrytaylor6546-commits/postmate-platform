import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '../../../lib/supabase'

function extract(text, keywords, endKeywords) {
  const variations = keywords.flatMap(k => [
    `===${k}===`, `=== ${k} ===`, `## ${k}`, `# ${k}`, `**${k}**`, k
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
    const endV = [`===${ek}===`, `=== ${ek} ===`, `## ${ek}`, `# ${ek}`, `**${ek}**`, ek]
    for (const v of endV) {
      const idx = text.indexOf(v, s)
      if (idx !== -1 && (ei === -1 || idx < ei)) { ei = idx; break }
    }
  }
  return ei === -1 ? text.slice(s).trim() : text.slice(s, ei).trim()
}

export async function POST(req) {
  try {
    const { userId } = await auth()
    if (!userId) return Response.json({ error: 'Unauthorised' }, { status: 401 })

    const { updates, contentType, extraImages, month, year } = await req.json()
    const db = supabaseAdmin()

    const { data: profile, error: profileError } = await db
      .from('profiles').select('*').eq('clerk_user_id', userId).single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return Response.json({ error: 'Profile error: ' + profileError.message }, { status: 500 })
    }
    if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 })

    console.log('Generating for:', profile.business_name)

    const prompt = `You are PostMate, a professional AI content manager. Generate authentic content for this business.

BUSINESS:
Name: ${profile.business_name}
Type: ${profile.business_type}
Location: ${profile.location}
Voice: ${profile.voice}
Offerings: ${profile.offerings}
${profile.audience ? `Customers: ${profile.audience}` : ''}

THIS MONTH (${month} ${year}):
${updates?.promotions ? `Promotions: ${updates.promotions}` : 'No promotions'}
${updates?.news ? `News: ${updates.news}` : ''}

Use these EXACT headers:
===SOCIAL POSTS===
16 posts. Each: POST [N] | [Platform] | [Type]
Caption: [text]
Hashtags: [tags]
Best time: [day + time]

===EMAIL NEWSLETTERS===
2 newsletters. Each:
Subject: [subject]
Body: [300 words]
CTA: [button]

===GOOGLE POSTS===
4 posts. Each:
Copy: [150 words]
CTA: [button]

===BLOG POSTS===
2 outlines. Each:
Title: [SEO title]
Outline: [H2/H3 structure]

Write for ${profile.business_name} in ${profile.location}. Use ${profile.voice} voice.`

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const anthropicData = await anthropicRes.json()
    console.log('Anthropic status:', anthropicRes.status)
    console.log('Anthropic response type:', anthropicData.type)

    if (anthropicData.error) {
      console.error('Anthropic error:', anthropicData.error)
      return Response.json({ error: 'AI error: ' + anthropicData.error.message }, { status: 500 })
    }

    const raw = anthropicData.content?.map(b => b.text || '').join('\n') || ''
    console.log('Raw content length:', raw.length)
    console.log('Raw preview:', raw.substring(0, 200))

    if (!raw) {
      return Response.json({ error: 'No content generated. Check API key.' }, { status: 500 })
    }

    const social = extract(raw, ['SOCIAL POSTS'], ['EMAIL NEWSLETTERS', 'EMAIL NEWSLETTER'])
    const email = extract(raw, ['EMAIL NEWSLETTERS', 'EMAIL NEWSLETTER'], ['GOOGLE POSTS', 'GOOGLE POST'])
    const google = extract(raw, ['GOOGLE POSTS', 'GOOGLE POST'], ['BLOG POSTS', 'BLOG POST', 'BLOG'])
    const blog = extract(raw, ['BLOG POSTS', 'BLOG POST', 'BLOG'], null)

    console.log('Section lengths - social:', social.length, 'email:', email.length, 'google:', google.length, 'blog:', blog.length)

    const sections = {
      social: social || raw,
      email: email || '(See Social tab for full content)',
      google: google || '(See Social tab for full content)',
      blog: blog || '(See Social tab for full content)',
    }

    const { data: saved, error: saveError } = await db.from('content_history').insert({
      clerk_user_id: userId,
      month, year,
      raw_content: raw,
      sections,
      updates: updates || {},
      content_type: contentType || 'full'
    }).select('id').single()

    if (saveError) {
      console.error('Save error:', saveError)
      return Response.json({ error: 'Save error: ' + saveError.message }, { status: 500 })
    }

    console.log('Saved history entry:', saved.id)
    return Response.json({ id: saved.id })

  } catch (err) {
    console.error('Unexpected error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
