import { useEffect } from "react"
import { msalInit, ensureSignedIn } from "../auth/msalInit"

export default function LoginPage() {
  useEffect(() => {
    let alive = true
    ;(async () => {
      await msalInit()
      if (!alive) return
      await ensureSignedIn()
    })()
    return () => {
      alive = false
    }
  }, [])
  return <div style={{ padding: 24 }}>Signing you in…</div>
}
