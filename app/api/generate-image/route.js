import { auth } from '@clerk/nextjs/server'

export async function POST(req) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorised' }, { status: 401 })

  const { prompt } = await req.json()
  if (!prompt) return Response.json({ error: 'No prompt' }, { status: 400 })

  const res = await fetch('https://fal.run/fal-ai/flux/schnell', {
    method: 'POST',
    headers: { 'Authorization': `Key ${process.env.FAL_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, image_size: 'square_hd', num_inference_steps: 4, num_images: 1 })
  })
  const data = await res.json()
  if (!res.ok) return Response.json({ error: data.detail || 'Failed' }, { status: 500 })
  return Response.json({ url: data.images?.[0]?.url })
}
