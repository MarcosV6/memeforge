import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

export const MEME_TEMPLATES = [
  { id: '181913649', name: 'Drake Hotline Bling',         url: 'https://i.imgflip.com/30b1gx.jpg',   lines: 2 },
  { id: '87743020',  name: 'Two Buttons',                 url: 'https://i.imgflip.com/1g8my4.jpg',   lines: 2 },
  { id: '112126428', name: 'Distracted Boyfriend',        url: 'https://i.imgflip.com/1ur9b0.jpg',   lines: 3 },
  { id: '131087935', name: 'Running Away Balloon',        url: 'https://i.imgflip.com/261o3j.jpg',   lines: 2 },
  { id: '217743513', name: 'UNO Draw 25 Cards',           url: 'https://i.imgflip.com/3lmzyx.jpg',   lines: 2 },
  { id: '124822590', name: 'Left Exit 12 Off Ramp',       url: 'https://i.imgflip.com/22bdq6.jpg',   lines: 3 },
  { id: '61579',     name: 'One Does Not Simply',         url: 'https://i.imgflip.com/1bij.jpg',     lines: 2 },
  { id: '100777631', name: 'Is This a Pigeon?',           url: 'https://i.imgflip.com/cm7x0.jpg',    lines: 3 },
  { id: '222403160', name: 'Bernie I Am Once Again',      url: 'https://i.imgflip.com/3oevdk.jpg',   lines: 1 },
  { id: '196652226', name: 'Spongebob Ight Imma Head Out',url: 'https://i.imgflip.com/3si4.jpg',     lines: 1 },
  { id: '101288',    name: 'Most Interesting Man',        url: 'https://i.imgflip.com/4/1bij.jpg',   lines: 2 },
  { id: '93895088',  name: 'Expanding Brain',             url: 'https://i.imgflip.com/1jwhww.jpg',   lines: 4 },
  { id: '102156234', name: 'Mocking Spongebob',           url: 'https://i.imgflip.com/1otk96.jpg',   lines: 2 },
  { id: '247375501', name: 'Buff Doge vs Cheems',         url: 'https://i.imgflip.com/43a45p.png',   lines: 2 },
  { id: '5496396',   name: 'Leonardo Dicaprio Cheers',    url: 'https://i.imgflip.com/utz3l.jpg',    lines: 1 },
  { id: '28251713',  name: 'Oprah You Get A',             url: 'https://i.imgflip.com/1bhk.jpg',     lines: 1 },
  { id: '14371066',  name: 'Star Wars Yoda',              url: 'https://i.imgflip.com/1e7ql7.jpg',   lines: 1 },
  { id: '252600902', name: 'Always Has Been',             url: 'https://i.imgflip.com/46e43q.png',   lines: 2 },
  { id: '101470',    name: 'Ancient Aliens',              url: 'https://i.imgflip.com/kd5en.jpg',    lines: 1 },
  { id: '91538330',  name: 'Whisper and Goosebumps',      url: 'https://i.imgflip.com/1yxkcp.jpg',   lines: 2 },
]

export async function generateMeme(topic) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

  const templateList = MEME_TEMPLATES.map(
    (t, i) => `${i}: "${t.name}" (${t.lines} text box${t.lines > 1 ? 'es' : ''})`
  ).join('\n')

  const prompt = `You are a meme expert. Generate a hilarious, clever meme about: "${topic}"

Available meme templates (pick the BEST one for this topic):
${templateList}

Rules:
- Pick the template that fits the topic most naturally and funnily
- Write genuinely funny, witty text - not generic
- Keep each text box SHORT (max 8 words per box)
- text0 = top text, text1 = bottom text, text2/text3 = additional boxes if template has them
- Only include text boxes the template actually has
- Make it relatable and shareable

Respond ONLY with valid JSON, no markdown, no explanation:
{
  "templateIndex": <number 0-${MEME_TEMPLATES.length - 1}>,
  "text0": "<top text or first box>",
  "text1": "<bottom text or second box>",
  "text2": "<third box if needed, else empty string>",
  "text3": "<fourth box if needed, else empty string>",
  "explanation": "<one sentence: why this template + text combo is funny>"
}`

  const result = await model.generateContent(prompt)
  const raw = result.response.text().trim()
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
  const data = JSON.parse(cleaned)
  const template = MEME_TEMPLATES[data.templateIndex] || MEME_TEMPLATES[0]

  return {
    template,
    texts: [data.text0 || '', data.text1 || '', data.text2 || '', data.text3 || ''],
    explanation: data.explanation || '',
  }
}

// Draw meme text on a canvas over the template image
export async function buildMemeCanvas(template, texts, canvasEl) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const ctx = canvasEl.getContext('2d')
      canvasEl.width = img.width
      canvasEl.height = img.height
      ctx.drawImage(img, 0, 0)

      const fontSize = Math.max(24, Math.floor(img.width / 14))
      ctx.font = `900 ${fontSize}px Impact, Arial Black, sans-serif`
      ctx.textAlign = 'center'
      ctx.lineWidth = fontSize / 6
      ctx.strokeStyle = 'black'
      ctx.fillStyle = 'white'

      const drawText = (text, x, y) => {
        if (!text) return
        // Word wrap
        const words = text.toUpperCase().split(' ')
        const maxW = img.width * 0.9
        let lines = []
        let line = ''
        for (const word of words) {
          const test = line ? line + ' ' + word : word
          if (ctx.measureText(test).width > maxW && line) {
            lines.push(line)
            line = word
          } else {
            line = test
          }
        }
        if (line) lines.push(line)

        lines.forEach((l, i) => {
          const ly = y + i * (fontSize * 1.2)
          ctx.strokeText(l, x, ly)
          ctx.fillText(l, x, ly)
        })
      }

      const pad = fontSize * 1.2
      // Top text
      drawText(texts[0], img.width / 2, pad)
      // Bottom text
      if (texts[1]) drawText(texts[1], img.width / 2, img.height - pad * 0.5)

      resolve(canvasEl.toDataURL('image/jpeg', 0.92))
    }
    img.onerror = () => reject(new Error('Failed to load meme template image'))
    img.src = template.url
  })
}
