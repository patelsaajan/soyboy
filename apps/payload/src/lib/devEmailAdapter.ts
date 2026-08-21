import type { EmailAdapter, SendEmailOptions } from 'payload'

// ---------------------------------------------------------------------------
// Development email adapter
//
// With no `email` configured, Payload falls back to its built-in
// consoleEmailAdapter, which logs only "Email attempted without being
// configured. To: ..., Subject: ..." and discards the body — so a
// forgot-password reset link is unrecoverable in local dev.
//
// This adapter prints the body instead. It is deliberately dependency-free:
// nodemailer (and therefore @payloadcms/email-nodemailer) pulls in Node
// builtins that cannot run on workerd, so anything reachable from the
// production config would have to be kept out of the OpenNext bundle. Nothing
// here is, which is why this stays a plain console writer rather than an SMTP
// transport pointed at a local mail catcher.
//
// Never wire this up in production: it writes password reset links,
// verification tokens, and any other email body straight to the logs.
// ---------------------------------------------------------------------------

/** nodemailer's `to` is string | Address | Array<string | Address>. */
const formatAddress = (to: SendEmailOptions['to']): string => {
  if (!to) return '(none)'
  const one = (value: string | { address: string; name: string }): string =>
    typeof value === 'string' ? value : `${value.name} <${value.address}>`
  return Array.isArray(to) ? to.map(one).join(', ') : one(to)
}

/** `html` and `text` are string | Buffer | Readable | AttachmentLike. */
const formatBody = (body: SendEmailOptions['html'] | SendEmailOptions['text']): string | null => {
  if (typeof body === 'string') return body
  if (Buffer.isBuffer(body)) return body.toString('utf8')
  if (body) return '(non-string body — stream or attachment, not rendered)'
  return null
}

export const devEmailAdapter: EmailAdapter = () => ({
  name: 'dev-console',
  defaultFromAddress: 'dev@soyboy.local',
  defaultFromName: 'Soyboy (dev)',
  sendEmail: async (message) => {
    const html = formatBody(message.html)
    const text = formatBody(message.text)

    // console rather than payload.logger: pino serialises the record to JSON,
    // so a multi-line HTML body risks arriving escaped, and the whole point is
    // being able to copy a reset link out of the terminal.
    console.log(
      [
        '',
        '────────────────────────── EMAIL (dev) ──────────────────────────',
        `To:      ${formatAddress(message.to)}`,
        `Subject: ${message.subject ?? '(none)'}`,
        '',
        html ?? text ?? '(no body)',
        ...(html && text ? ['', '--- text alternative ---', text] : []),
        '─────────────────────────────────────────────────────────────────',
        '',
      ].join('\n'),
    )
  },
})
