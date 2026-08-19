import { redirect } from 'next/navigation'

/**
 * This app is a headless CMS — the public site is the separate Nuxt frontend.
 *
 * Previously this rendered the Payload starter page, which booted a full Payload
 * instance and ran payload.auth() on every request just to show template
 * content, hotlinked images from raw.githubusercontent.com, and rendered the
 * author's local filesystem path into the public page via a vscode://file link.
 */
export default function HomePage() {
  redirect('/admin')
}
