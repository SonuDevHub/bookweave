
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { UserRound, Mail, ShieldCheck, CalendarDays, LogOut } from 'lucide-react'
import { toast } from 'react-toastify'
import { clearAdminSession, getStoredAdmin } from '../utils/adminAuth'

export default function AdminProfile() {
  const navigate = useNavigate()
  const [admin] = useState(() => getStoredAdmin())

  function handleLogout() {
    clearAdminSession()
    toast.success('Logged out successfully')
    navigate('/admin/login', { replace: true })
  }

  const name = admin.name || admin.fullName || 'Administrator'
  const email = admin.email || 'Not available'
  const role = admin.role || 'Admin'

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <div>
        <p className="mb-1 text-sm text-text-muted">Account settings</p>
        <h1 className="font-heading text-3xl font-semibold text-text-primary">
          Admin Profile
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          View your administrator account information.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="bg-primary/5 px-6 py-8 sm:px-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-white">
              <UserRound size={38} />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-semibold text-text-primary">{name}</h2>
              <p className="mt-1 text-sm text-text-muted">{email}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <ShieldCheck size={14} />
                {role}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-6 sm:p-8">
          <h3 className="font-semibold text-text-primary">Account Information</h3>

          <ProfileItem
            icon={UserRound}
            label="Full Name"
            value={name}
          />

          <ProfileItem
            icon={Mail}
            label="Email Address"
            value={email}
          />

          <ProfileItem
            icon={ShieldCheck}
            label="Account Role"
            value={role}
          />

          <ProfileItem
            icon={CalendarDays}
            label="Account Created"
            value={
              admin.createdAt
                ? new Date(admin.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Not available'
            }
          />
        </div>
      </div>

      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-surface p-5 sm:flex-row sm:items-center sm:p-6">
        <div>
          <h3 className="font-semibold text-text-primary">Sign out</h3>
          <p className="mt-1 text-sm text-text-muted">
            Sign out from your BookWeave admin account.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </div>
  )
}

function ProfileItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 border-b border-border pb-4 last:border-0 last:pb-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background text-text-muted">
        <Icon size={19} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-text-muted">{label}</p>
        <p className="mt-1 break-words text-sm font-medium text-text-primary">
          {value}
        </p>
      </div>
    </div>
  )
}
