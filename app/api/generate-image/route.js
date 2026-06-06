import { auth } from '@clerk/nextjs/server'

export async function POST(req) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorised' }, { status: 401 })

  const { prompt } = await req.json()
  if (!prompt) return Response.json({ error: 'No prompt provided' }, { status: 400 })

  try {
    const res = await fetch('https://api.ideogram.ai/generate', {
      method: 'POST',
      headers: {
        'Api-Key': process.env.IDEOGRAM_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_request: {
          prompt: prompt,
          aspect_ratio: 'ASPECT_1_1',
          model: 'V_2',
          magic_prompt_option: 'AUTO',
          style_type: 'REALISTIC'
        }
      })
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('Ideogram error:', data)
      return Response.json({ error: data.error || 'Image generation failed' }, { status: 500 })
    }

    const url = data.data?.[0]?.url
    if (!url) return Response.json({ error: 'No image returned' }, { status: 500 })

    return Response.json({ url })
  } catch (err) {
    console.error('Image generation error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
