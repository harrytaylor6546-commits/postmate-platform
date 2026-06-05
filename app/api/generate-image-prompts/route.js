import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '../../../lib/supabase'

export async function POST(req) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorised' }, { status: 401 })

  const { historyId } = await req.json()
  const db = supabaseAdmin()

  // Get the history entry and profile
  const { data: entry } = await db.from('content_history').select('*').eq('id', historyId).eq('clerk_user_id', userId).single()
  if (!entry) return Response.json({ error: 'Content not found' }, { status: 404 })

  const { data: profile } = await db.from('profiles').select('*').eq('clerk_user_id', userId).single()
  if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 })

  // Extract a short summary of the social posts for context
  const socialPreview = (entry.sections?.social || entry.raw_content || '').slice(0, 1500)

  const prompt = `You are a social media visual director. Create 8 detailed image prompts for a ${profile.business_type} called "${profile.business_name}" based in ${profile.location}.

Brand voice: ${profile.voice}
What they offer: ${profile.offerings}
${profile.images?.length > 0 ? `Note: The business has provided brand images. Reference their visual style and aesthetic.` : ''}

Sample content for this month:
${socialPreview}

Generate 8 photo-realistic image prompts for social media posts. Each should be specific, visual and professional.

Format EXACTLY like this:
IMAGE 1 | [theme name]
Prompt: [2-3 sentence detailed prompt describing a photo-realistic image that would work perfectly for this business's social media. Include lighting, composition, mood, setting details.]

IMAGE 2 | [theme name]
Prompt: [prompt]

IMAGE 3 | [theme name]
Prompt: [prompt]

IMAGE 4 | [theme name]
Prompt: [prompt]

IMAGE 5 | [theme name]
Prompt: [prompt]

IMAGE 6 | [theme name]
Prompt: [prompt]

IMAGE 7 | [theme name]
Prompt: [prompt]

IMAGE 8 | [theme name]
Prompt: [prompt]

Make every prompt specific to ${profile.business_name} — never generic. Reference the ${profile.location} setting naturally where appropriate.`

  const allImages = profile.images || []
  const messageContent = [
    ...allImages.map(img => ({ type: 'image', source: { type: 'base64', media_type: img.type, data: img.data } })),
    { type: 'text', text: prompt }
  ]

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 2000, messages: [{ role: 'user', content: messageContent }] })
  })

  const data = await r.json()
  if (data.error) return Response.json({ error: data.error.message }, { status: 500 })

  const imageText = data.content?.map(b => b.text || '').join('\n') || ''

  // Save back to history
  const updatedSections = { ...entry.sections, images: imageText }
  await db.from('content_history').update({ sections: updatedSections }).eq('id', historyId)

  return Response.json({ images: imageText })
}
