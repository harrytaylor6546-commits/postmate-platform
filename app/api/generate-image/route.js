import { auth } from '@clerk/nextjs/server'

export async function POST(req) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorised' }, { status: 401 })

  const { prompt } = await req.json()
  if (!prompt) return Response.json({ error: 'No prompt provided' }, { status: 400 })

  try {
    const res = await fetch('https://api.together.xyz/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'black-forest-labs/FLUX.1-schnell-Free',
        prompt: prompt,
        width: 1024,
        height: 1024,
        steps: 4,
        n: 1,
        response_format: 'url'
      })
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('Together AI error:', data)
      return Response.json({ error: data.error?.message || 'Image generation failed' }, { status: 500 })
    }

    const url = data.data?.[0]?.url
    if (!url) return Response.json({ error: 'No image returned' }, { status: 500 })

    return Response.json({ url })
  } catch (err) {
    console.error('Image generation error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
