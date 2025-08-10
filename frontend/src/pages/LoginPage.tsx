import { useEffect } from 'react'
import { signIn } from '../auth'

export default function LoginPage() {
  useEffect(() => {
    signIn()
  }, [])
  return <div style={{ padding: 24 }}>Signing you in…</div>
}

