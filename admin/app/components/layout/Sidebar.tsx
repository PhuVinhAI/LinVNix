import { NavLink } from 'react-router';
import { ROUTES } from '../../../lib/shared/constants';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BookMarked,
  FileText,
  Settings,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { name: 'Người dùng', href: ROUTES.USERS, icon: Users },
  { name: 'Khóa học', href: ROUTES.COURSES, icon: BookOpen },
  { name: 'Từ vựng', href: ROUTES.VOCABULARIES, icon: BookMarked },
  { name: 'Bài tập', href: ROUTES.EXERCISES, icon: FileText },
  { name: 'Cài đặt', href: ROUTES.SETTINGS, icon: Settings },
];

/**
 * Sidebar Component
 */
export function Sidebar() {
  return (
    <aside className="w-64 border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-6">
        <h1 className="text-xl font-bold text-card-foreground">
          LinVNix Admin
        </h1>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 p-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
