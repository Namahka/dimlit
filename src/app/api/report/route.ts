import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { username, text, messageId } = await req.json()

  await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'dimlit', email: 'noreply@dimlit.app' },
      to: [{ email: 'namahka@hotmail.com' }],
      subject: '🚨 New report on dimlit',
      htmlContent: `
        <h2>A message has been reported</h2>
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Message:</strong> ${text}</p>
        <p><strong>Message ID:</strong> ${messageId}</p>
        <hr/>
        <p style="color:#999;font-size:12px">dimlit moderation</p>
      `,
    }),
  })

  return NextResponse.json({ ok: true })
}
