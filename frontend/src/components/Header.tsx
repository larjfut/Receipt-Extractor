import { pca } from "../auth/msalInit"

export default function Header() {
  const user = pca.getActiveAccount()
  return (
    <header style={{ padding: 16, textAlign: "right" }}>
      <span>{user?.username ?? "Signed out"}</span>
    </header>
  )
}
