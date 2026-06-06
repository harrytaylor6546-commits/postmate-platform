import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '../../../lib/supabase'

export async function POST(req) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorised' }, { status: 401 })

  const { historyId } = await req.json()
  const db = supabaseAdmin()

  const { data: entry } = await db.from('content_history').select('*').eq('id', historyId).eq('clerk_user_id', userId).single()
  if (!entry) return Response.json({ error: 'Content not found' }, { status: 404 })

  const { data: profile } = await db.from('profiles').select('*').eq('clerk_user_id', userId).single()
  if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 })

  const socialPreview = (entry.sections?.social || entry.raw_content || '').slice(0, 1500)

  const prompt = `You are a social media art director for "${profile.business_name}", a ${profile.business_type} based in ${profile.location}.

Brand voice: ${profile.voice}
What they offer: ${profile.offerings}
${profile.images?.length > 0 ? 'Brand images provided above — reference their visual style, colours and aesthetic.' : ''}

Sample content for this month:
${socialPreview}

Generate 8 image prompts for Ideogram AI (which renders text accurately).

IMPORTANT TEXT RULES:
- When including the business name as visible text in an image, always write it in "quotes" exactly as spelled: "${profile.business_name}"
- Only include text when it genuinely improves the image (logo on product, storefront sign, etc.)
- Some images can be pure visual/lifestyle shots without any text — use your judgement
- Never guess or shorten the business name — copy it exactly

Format EXACTLY like this:
IMAGE 1 | [theme name]
Prompt: [2-3 sentence detailed visual prompt. Photo-realistic style. If including text, put the exact words in "quotes".]

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

Mix it up: some lifestyle shots, some product shots, some with the brand name visible, some purely atmospheric. All should look professional and Instagram-ready.`

  const allImages = profile.images || []
  const messageContent = [
    ...allImages.map(img => ({ type: 'image', source: { type: 'base64', media_type: img.type, data: img.data } })),
    { type: 'text', text: prompt }
  ]

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: messageContent }]
    })
  })

  const data = await r.json()
  if (data.error) return Response.json({ error: data.error.message }, { status: 500 })

  const imageText = data.content?.map(b => b.text || '').join('\n') || ''
  const updatedSections = { ...entry.sections, images: imageText }
  await db.from('content_history').update({ sections: updatedSections }).eq('id', historyId)

  return Response.json({ images: imageText })
}
