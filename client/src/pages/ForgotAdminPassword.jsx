import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'react-toastify'
import { API_URL, parseJsonSafe } from '../config/api'

export default function ForgotAdminPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function sendOtp(event) {
    event.preventDefault()
    if (loading) return

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/admin/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const result = await parseJsonSafe(response)

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to send OTP')
      }

      setStep(2)
      toast.success('If the admin account exists, an OTP has been sent.')
    } catch (error) {
      toast.error(error.message === 'Failed to fetch'
        ? 'Backend connection failed'
        : error.message)
    } finally {
      setLoading(false)
    }
  }

  async function resetPassword(event) {
    event.preventDefault()
    if (loading) return

    if (!/^\d{6}$/.test(otp)) {
      toast.error('Enter the 6-digit OTP')
      return
    }

    if (password.length < 8 || password.length > 128) {
      toast.error('Password must be 8–128 characters')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/admin/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password }),
      })

      const result = await parseJsonSafe(response)

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Password reset failed')
      }

      toast.success('Password changed successfully')
      navigate('/admin/login', { replace: true })
    } catch (error) {
      toast.error(error.message === 'Failed to fetch'
        ? 'Backend connection failed'
        : error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-screen min-h-[100dvh] place-items-center bg-cream px-4 py-6 text-text">
      <section className="w-full max-w-sm rounded-2xl border border-border bg-surface p-7 shadow-sm">
        <Link
          to="/admin/login"
          className="mb-6 inline-flex items-center gap-2 text-sm text-text-muted transition hover:text-primary"
        >
          <ArrowLeft size={17} />
          Back to login
        </Link>

        <h1 className="mb-2 font-serif text-2xl">
          {step === 1 ? 'Forgot Password?' : 'Verify OTP'}
        </h1>

        <p className="mb-6 text-sm leading-6 text-text-muted">
          {step === 1
            ? 'Enter your admin email to receive a verification code.'
            : `Enter the 6-digit code sent to ${email}, then choose a new password.`}
        </p>

        {step === 1 ? (
          <form onSubmit={sendOtp} className="space-y-5">
            <div>
              <label htmlFor="reset-email" className="mb-2 block text-sm font-medium">
                Email address
              </label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter admin email"
                className="w-full rounded-lg border border-border bg-background px-3.5 py-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white transition hover:bg-primary-hover disabled:opacity-60"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={resetPassword} className="space-y-4">
            <div>
              <label htmlFor="reset-otp" className="mb-2 block text-sm font-medium">
                6-digit OTP
              </label>
              <input
                id="reset-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter OTP"
                className="w-full rounded-lg border border-border bg-background px-3.5 py-3 text-sm tracking-widest outline-none focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="new-password" className="mb-2 block text-sm font-medium">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-lg border border-border bg-background px-3.5 py-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter new password"
                className="w-full rounded-lg border border-border bg-background px-3.5 py-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white transition hover:bg-primary-hover disabled:opacity-60"
            >
              {loading ? 'Updating...' : 'Verify OTP & Reset Password'}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setOtp('')
                setPassword('')
                setConfirmPassword('')
                setStep(1)
              }}
              className="w-full py-2 text-sm text-primary hover:underline disabled:opacity-60"
            >
              Request a new OTP
            </button>
          </form>
        )}
      </section>
    </main>
  )
}