"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { upsertProfile, type UserRole } from "@/supabase/user"
import { Wallet, Stethoscope, UserRound, ShieldCheck, ArrowRight, User } from "lucide-react"

type Role = UserRole | null

export default function LoginPage() {
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role>(null)
  const [fullName, setFullName] = useState("")

  const { connectWallet, isAuthenticated, user } = useAuth()

  if (isAuthenticated) {
    return (
      <div style={styles.page}>
        <div style={styles.successCard}>
          <div style={styles.successIconRing}>
            <ShieldCheck size={28} color="#10b981" />
          </div>
          <p style={styles.successName}>{user?.name ?? fullName}</p>
          <p style={styles.successWallet}>{user?.walletAddress}</p>
          <div style={{
            ...styles.rolePill,
            background: user?.role === "doctor" ? "#d1fae5" : "#dbeafe",
            color: user?.role === "doctor" ? "#065f46" : "#1e40af",
          }}>
            {user?.role ?? selectedRole ?? "—"}
          </div>
        </div>
      </div>
    )
  }

  const handleConnectWallet = async () => {
    if (!fullName.trim()) { setError("Please enter your full name."); return }
    if (!selectedRole)    { setError("Please select your role."); return }

    try {
      setIsSubmitting(true)
      setError("")

      // 1. Trigger MetaMask connection (sets auth state internally)
      await connectWallet()

      // 2. Read wallet address directly from MetaMask after connection.
      //    This is necessary because connectWallet() returns void.
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("MetaMask is not installed. Please install it and try again.")
      }

      const accounts: string[] = await window.ethereum.request({
        method: "eth_accounts", // reads already-connected accounts (no extra prompt)
      })

      const walletAddress = accounts[0]

      if (!walletAddress) {
        throw new Error("No wallet address found. Please approve the connection in MetaMask.")
      }

      // 3. Save profile to Supabase
      const { error: dbError } = await upsertProfile(walletAddress, fullName, selectedRole)

      if (dbError) {
        console.error("[LoginPage] Profile save failed:", dbError)
        setError("Wallet connected but profile could not be saved. Please try again.")
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet")
      console.error("[LoginPage] Error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isReady = !!selectedRole && !!fullName.trim()

  return (
    <div style={styles.page}>
      <style>{css}</style>

      {/* ── Left branding panel ── */}
      <div style={styles.leftPanel}>
        <div style={styles.leftInner}>
          <div style={styles.logo}>
            <span style={styles.logoMark}>M</span>
            <span style={styles.logoText}>MedSync</span>
          </div>
          <div style={styles.heroText}>
            <h2 style={styles.heroH}>Your health,<br />secured on-chain.</h2>
            <p style={styles.heroP}>
              Private. Permissioned. Yours. Give doctors access on your terms — revoke anytime.
            </p>
          </div>
          <div style={styles.featureList}>
            {[
              ["🔐", "End-to-end encrypted records"],
              ["⛓️", "Immutable audit trail"],
              ["👁️", "Granular access control"],
            ].map(([icon, label]) => (
              <div key={label as string} style={styles.featureItem}>
                <span style={styles.featureIcon}>{icon}</span>
                <span style={styles.featureLabel}>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={styles.blob1} />
        <div style={styles.blob2} />
      </div>

      {/* ── Right form panel ── */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>

          <div style={styles.formHeader}>
            <h1 style={styles.formTitle}>Create your profile</h1>
            <p style={styles.formSubtitle}>Takes 30 seconds. No password needed.</p>
          </div>

          {/* Full name */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Full name</label>
            <div style={styles.inputWrap} className="input-focus-ring">
              <User size={15} color="#94a3b8" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="e.g. Jane Smith"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setError("") }}
                style={styles.input}
                className="medsync-input"
              />
            </div>
          </div>

          {/* Role */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>I am joining as</label>
            <div style={styles.roleRow}>

              <button
                onClick={() => { setSelectedRole("patient"); setError("") }}
                style={{ ...styles.roleBtn, ...(selectedRole === "patient" ? styles.roleBtnActivePatient : {}) }}
                className="role-btn"
              >
                <div style={{ ...styles.roleIconWrap, background: selectedRole === "patient" ? "#dbeafe" : "#f1f5f9" }}>
                  <UserRound size={20} color={selectedRole === "patient" ? "#2563eb" : "#94a3b8"} />
                </div>
                <div style={styles.roleTextGroup}>
                  <span style={{ ...styles.roleName, color: selectedRole === "patient" ? "#1d4ed8" : "#334155" }}>Patient</span>
                  <span style={styles.roleDesc}>Manage my health records</span>
                </div>
                <div style={{ ...styles.roleCheck, opacity: selectedRole === "patient" ? 1 : 0, background: "#2563eb" }}>
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>

              <button
                onClick={() => { setSelectedRole("doctor"); setError("") }}
                style={{ ...styles.roleBtn, ...(selectedRole === "doctor" ? styles.roleBtnActiveDoctor : {}) }}
                className="role-btn"
              >
                <div style={{ ...styles.roleIconWrap, background: selectedRole === "doctor" ? "#d1fae5" : "#f1f5f9" }}>
                  <Stethoscope size={20} color={selectedRole === "doctor" ? "#059669" : "#94a3b8"} />
                </div>
                <div style={styles.roleTextGroup}>
                  <span style={{ ...styles.roleName, color: selectedRole === "doctor" ? "#047857" : "#334155" }}>Doctor</span>
                  <span style={styles.roleDesc}>Access patient records</span>
                </div>
                <div style={{ ...styles.roleCheck, opacity: selectedRole === "doctor" ? 1 : 0, background: "#059669" }}>
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>

            </div>
          </div>

          {/* Error */}
          {error && <div style={styles.errorBox}>⚠ &nbsp;{error}</div>}

          {/* CTA */}
          <button
            onClick={handleConnectWallet}
            disabled={isSubmitting || !isReady}
            style={{ ...styles.ctaBtn, ...(isReady && !isSubmitting ? styles.ctaBtnReady : styles.ctaBtnDim) }}
            className={isReady ? "cta-ready" : ""}
          >
            <Wallet size={17} />
            <span>{isSubmitting ? "Connecting & saving profile…" : "Connect with MetaMask"}</span>
            {isReady && !isSubmitting && <ArrowRight size={16} style={{ marginLeft: "auto" }} />}
          </button>

          {!isReady && (
            <p style={styles.hint}>
              {!fullName.trim() ? "Enter your name to continue" : "Select a role to continue"}
            </p>
          )}

          <p style={styles.footer}>Secured by blockchain · No passwords · You own your data</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Styles ──────────────────────────────────────────────────────── */
const styles: Record<string, React.CSSProperties> = {
  page: { display: "flex", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", background: "#f8fafc" },
  leftPanel: { position: "relative", flex: "0 0 420px", background: "linear-gradient(155deg, #0f1f3d 0%, #0d3060 52%, #0a4a3a 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "56px 48px", overflow: "hidden" },
  leftInner: { position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: 44 },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoMark: { width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg, #3b82f6, #10b981)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "#fff" },
  logoText: { fontSize: 21, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" },
  heroText: { display: "flex", flexDirection: "column", gap: 14 },
  heroH: { fontSize: 36, fontWeight: 800, color: "#fff", lineHeight: 1.18, letterSpacing: "-0.03em", margin: 0 },
  heroP: { fontSize: 14, color: "rgba(255,255,255,0.52)", lineHeight: 1.75, margin: 0, maxWidth: 290 },
  featureList: { display: "flex", flexDirection: "column", gap: 14 },
  featureItem: { display: "flex", alignItems: "center", gap: 12 },
  featureIcon: { fontSize: 17 },
  featureLabel: { fontSize: 13, color: "rgba(255,255,255,0.60)", fontWeight: 500 },
  blob1: { position: "absolute", width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)", top: -100, right: -100, zIndex: 1 },
  blob2: { position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)", bottom: -70, left: -70, zIndex: 1 },
  rightPanel: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" },
  formCard: { width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 22 },
  formHeader: { display: "flex", flexDirection: "column", gap: 4, marginBottom: 4 },
  formTitle: { fontSize: 26, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em", margin: 0 },
  formSubtitle: { fontSize: 13.5, color: "#94a3b8", margin: 0 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase" as const },
  inputWrap: { display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "0 14px", height: 48, transition: "border-color 0.15s, box-shadow 0.15s" },
  input: { flex: 1, border: "none", outline: "none", fontSize: 14, color: "#0f172a", background: "transparent", fontFamily: "inherit" },
  roleRow: { display: "flex", flexDirection: "column" as const, gap: 10 },
  roleBtn: { display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", transition: "all 0.15s", textAlign: "left" as const, position: "relative" as const, width: "100%" },
  roleBtnActivePatient: { borderColor: "#3b82f6", background: "#f0f7ff", boxShadow: "0 0 0 3px rgba(59,130,246,0.10)" },
  roleBtnActiveDoctor: { borderColor: "#10b981", background: "#f0fdf7", boxShadow: "0 0 0 3px rgba(16,185,129,0.10)" },
  roleIconWrap: { width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s" },
  roleTextGroup: { display: "flex", flexDirection: "column" as const, gap: 1 },
  roleName: { fontSize: 14, fontWeight: 700, lineHeight: 1 },
  roleDesc: { fontSize: 12, color: "#94a3b8" },
  roleCheck: { marginLeft: "auto", width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "opacity 0.15s" },
  errorBox: { display: "flex", alignItems: "center", background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: 10, padding: "10px 14px", fontSize: 13 },
  ctaBtn: { display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "15px 20px", borderRadius: 14, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit", letterSpacing: "-0.01em" },
  ctaBtnReady: { background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)", color: "#fff", boxShadow: "0 8px 24px rgba(37,99,235,0.28)" },
  ctaBtnDim: { background: "#f1f5f9", color: "#94a3b8", cursor: "not-allowed" },
  hint: { textAlign: "center" as const, fontSize: 12, color: "#cbd5e1", margin: "-6px 0 0" },
  footer: { textAlign: "center" as const, fontSize: 11, color: "#cbd5e1", marginTop: 2 },
  successCard: { background: "#fff", borderRadius: 20, border: "1px solid #e2e8f0", padding: "40px 32px", textAlign: "center" as const, display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 8, boxShadow: "0 8px 32px rgba(0,0,0,0.06)", maxWidth: 320, width: "100%" },
  successIconRing: { width: 56, height: 56, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  successName: { fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 },
  successWallet: { fontSize: 11, color: "#94a3b8", margin: 0 },
  rolePill: { marginTop: 4, padding: "4px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, textTransform: "capitalize" as const },
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  .medsync-input::placeholder { color: #cbd5e1; }
  .medsync-input:focus { outline: none; }
  .input-focus-ring:focus-within { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.10) !important; }
  .role-btn:hover { border-color: #94a3b8 !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
  .cta-ready:hover { box-shadow: 0 12px 28px rgba(37,99,235,0.36) !important; transform: translateY(-1px); }
  .cta-ready:active { transform: scale(0.98); }
  @media (max-width: 700px) { div[style*="flex: 0 0 420px"] { display: none !important; } }
`