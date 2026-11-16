import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'

export default function AppShell() {
  const { user, logout } = useAuth()
  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/problems', label: 'Problems' },
    { to: '/submissions', label: 'Submissions' },
    { to: '/leaderboard', label: 'Leaderboard' },
    ...(user ? [{ to: `/profile/${user.username}`, label: 'Profile' }] : []),
    ...(user?.role === 'admin' ? [{ to: '/admin/problems', label: 'Admin' }] : []),
  ]
  const item = 'rounded-lg px-3 py-2 text-sm transition focus-visible:outline-2 focus-visible:outline-indigo-400'

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="bg-slate-950 p-4 text-slate-300 md:sticky md:top-0 md:h-screen md:w-60">
        <NavLink to="/" className="mb-5 flex items-center gap-2 text-lg font-bold text-white">
          <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-sky-400 text-sm">{'</>'}</span>
          CodeArena
        </NavLink>
        <nav aria-label="Main" className="flex gap-1 overflow-x-auto md:flex-col">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `${item} ${isActive ? 'bg-indigo-500/20 text-white ring-1 ring-indigo-400/40' : 'hover:bg-white/10 hover:text-white'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <button onClick={logout} className={`${item} text-left hover:bg-white/10 hover:text-white`}>Sign out</button>
          ) : (
            <NavLink to="/login" className={`${item} hover:bg-white/10 hover:text-white`}>Sign in</NavLink>
          )}
        </nav>
      </aside>
      <main className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-8">
        <Outlet />
      </main>
    </div>
  )
}
