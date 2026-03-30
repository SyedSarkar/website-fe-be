import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

interface DashboardNavProps {
  userType: 'user' | 'admin'
  isCollapsed?: boolean
  onToggle?: () => void
}

export default function DashboardNav({ userType, isCollapsed = false }: DashboardNavProps) {
  const { user } = useAuth()
  const location = useLocation()

  const userNavItems = [
    { path: '/dashboard', label: 'Overview', icon: '🏠' },
    { path: '/assessment', label: 'Assessments', icon: '📊' },
    { path: '/courses', label: 'Courses', icon: '📚' },
    { path: '/progress', label: 'Progress', icon: '📈' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ]

  const adminNavItems = [
    { path: '/admin/dashboard', label: 'Overview', icon: '🏠' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/performance', label: 'Performance', icon: '📊' },
    { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
    { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ]

  const navItems = userType === 'admin' ? adminNavItems : userNavItems

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <nav className={`flex flex-col ${isCollapsed ? 'items-center' : 'items-start'} space-y-2`}>
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            isActive(item.path)
              ? 'bg-teal-100 text-teal-700'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
          title={isCollapsed ? item.label : undefined}
        >
          <span className={`${isCollapsed ? '' : 'mr-3'}`}>{item.icon}</span>
          {!isCollapsed && <span>{item.label}</span>}
        </Link>
      ))}
      
      {/* User Info */}
      {!isCollapsed && (
        <div className="mt-auto pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 px-3 py-2">
            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
              <span className="text-teal-600 font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
