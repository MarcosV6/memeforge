import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

const MEME_TEMPLATES = [
  { id: '181913649', name: 'Drake Hotline Bling', lines: 2 },
  { id: '87743020', name: 'Two Buttons', lines: 2 },
  { id: '112126428', name: 'Distracted Boyfriend', lines: 3 },
  { id: '131087935', name: 'Running Away Balloon', lines: 2 },
  { id: '217743513', name: 'UNO Draw 25 Cards', lines: 2 },
  { id: '124822590', name: 'Left Exit 12 Off Ramp', lines: 3 },
  { id: '61579', name: 'One Does Not Simply', lines: 2 },
  { id: '100777631', name: 'Is This a Pigeon?', lines: 3 },
  { id: '247375501', name: 'Buff Doge vs. Cheems', lines: 2 },
  { id: '222403160', name: 'Bernie Sanders Once Again Asking', lines: 1 },
  { id: '196652226', name: 'Spongebob Ight Imma Head Out', lines: 1 },
  { id: '101470', name: 'Ancient Aliens', lines: 1 },
  { id: '252600902', name: 'always has been', lines: 2 },
  { id: '91538330', name: 'Whisper and Goosebumps', lines: 2 },
  { id: '93895088', name: 'Expanding Brain', lines: 4 },
  { id: '101288', name: 'Most Interesting Man In The World', lines: 2 },
  { id: '14371066', name: 'Star Wars Yoda', lines: 1 },
  { id: '28251713', name: 'Oprah You Get A', lines: 1 },
  { id: '5496396', name: 'Leonardo Dicaprio Cheers', lines: 1 },
  { id: '102156234', name: 'Mocking Spongebob', lines: 2 },
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

  // Strip markdown code blocks if present
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()

  const data = JSON.parse(cleaned)
  const template = MEME_TEMPLATES[data.templateIndex] || MEME_TEMPLATES[0]

  return {
    template,
    texts: [data.text0 || '', data.text1 || '', data.text2 || '', data.text3 || ''],
    explanation: data.explanation || '',
  }
}

export async function buildMemeUrl(template, texts) {
  const username = 'imgflip_hubot'
  const password = 'imgflip_hubot'

  const params = new URLSearchParams({
    template_id: template.id,
    username,
    password,
    text0: texts[0] || '',
    text1: texts[1] || '',
  })

  if (texts[2]) params.append('text2', texts[2])
  if (texts[3]) params.append('text3', texts[3])

  const res = await fetch('https://api.imgflip.com/caption_image', {
    method: 'POST',
    body: params,
  })

  const json = await res.json()
  if (!json.success) throw new Error('Imgflip failed: ' + json.error_message)
  return json.data.url
}
