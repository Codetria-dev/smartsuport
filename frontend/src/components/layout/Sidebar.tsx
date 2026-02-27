import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

const getNavigation = (): Array<{ nameKey: string; href: string; icon: string; roles?: string[] }> => [
  { nameKey: 'nav:dashboard', href: '/dashboard', icon: '' },
  { nameKey: 'nav:registerClient', href: '/register-client', icon: '', roles: ['PROVIDER', 'ADMIN'] },
  { nameKey: 'nav:clients', href: '/clients', icon: '', roles: ['PROVIDER', 'ADMIN'] },
  { nameKey: 'nav:availability', href: '/availability', icon: '', roles: ['PROVIDER', 'ADMIN'] },
  { nameKey: 'nav:plans', href: '/billing/plans', icon: '' },
  { nameKey: 'nav:adminDashboard', href: '/admin/dashboard', icon: '', roles: ['ADMIN'] },
  { nameKey: 'nav:adminUsers', href: '/admin/users', icon: '', roles: ['ADMIN'] },
];

export default function Sidebar() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigation = getNavigation();

  return (
    <aside className="app-sidebar">
      <nav>
        <ul>
          {navigation
            .filter((item) => !item.roles || (user && item.roles.includes(String(user.role).toUpperCase())))
            .map((item) => (
              <li key={item.nameKey}>
                <NavLink to={item.href} end={item.href === '/dashboard'}>
                  {item.icon ? <span>{item.icon}</span> : null}
                  <span>{t(item.nameKey)}</span>
                </NavLink>
              </li>
            ))}
        </ul>

        {user && (
          <div className="sidebar-account">
            <p className="sidebar-account-title">{t('nav:account')}</p>
            <ul>
              <li>
                <NavLink to="/profile">
                  <span aria-hidden />
                  <span>{t('nav:profile')}</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/settings">
                  <span aria-hidden />
                  <span>{t('nav:settings')}</span>
                </NavLink>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </aside>
  );
}
