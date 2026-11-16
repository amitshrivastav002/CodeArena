import { useEffect, useRef, useState } from 'react'
import { api } from '../../../lib/api'
import { useAuth } from '../AuthContext'

interface GoogleId {
  initialize: (o: { client_id: string; callback: (r: { credential: string }) => void }) => void
  renderButton: (el: HTMLElement, o: { theme: string; size: string; width: number; text: string }) => void
}
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } }
  }
}

const SCRIPT = 'https://accounts.google.com/gsi/client'

// Renders Google's own sign-in button when the server has GOOGLE_CLIENT_ID configured; otherwise nothing.
export default function GoogleButton({ onDone, onError }: { onDone: () => void; onError: (m: string) => void }) {
  const { loginWithGoogle } = useAuth()
  const holder = useRef<HTMLDivElement>(null)
  const [clientId, setClientId] = useState<string | null>(null)

  useEffect(() => {
    api<{ googleClientId: string | null }>('/auth/config').then((c) => setClientId(c.googleClientId)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!clientId) return
    const render = () => {
      const id = window.google?.accounts.id
      if (!id || !holder.current) return
      id.initialize({
        client_id: clientId,
        callback: (r) => loginWithGoogle(r.credential).then(onDone).catch((e) => onError(e instanceof Error ? e.message : 'Google sign-in failed')),
      })
      id.renderButton(holder.current, { theme: 'outline', size: 'large', width: 320, text: 'continue_with' })
    }
    if (window.google) return render()
    let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT}"]`)
    if (!script) {
      script = document.createElement('script')
      script.src = SCRIPT
      script.async = true
      document.head.appendChild(script)
    }
    script.addEventListener('load', render)
    return () => script.removeEventListener('load', render)
  }, [clientId, loginWithGoogle, onDone, onError])

  if (!clientId) return null
  return (
    <div>
      <p className="my-3 text-center text-xs text-slate-500">or</p>
      <div ref={holder} aria-label="Sign in with Google" />
    </div>
  )
}
