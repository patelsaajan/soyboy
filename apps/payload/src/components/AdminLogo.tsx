import React from 'react'

/**
 * Replaces Payload's own wordmark on the auth screens. `graphics.Logo` is only
 * rendered by the Login and Verify views — the nav uses `graphics.Icon`, which
 * is left alone — so this stays inside the login scope on its own.
 *
 * Markup only; the type is set in (payload)/custom.scss alongside the rest of
 * the auth styling.
 */
export const AdminLogo: React.FC = () => (
  <div className="soyboy-brand">
    <span className="soyboy-brand__word">Soyboy</span>
    <span aria-hidden="true" className="soyboy-brand__rule" />
    <span className="soyboy-brand__tag">Content manager</span>
  </div>
)
