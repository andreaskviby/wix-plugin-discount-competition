import React from 'react';
import { NavLink } from 'react-router-dom';
import { SidePanel } from '@wix/design-system';

const Sidebar = () => {
  const navigationItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: '📊'
    },
    {
      path: '/competitions',
      label: 'Competitions',
      icon: '🎮'
    },
    {
      path: '/analytics',
      label: 'Analytics',
      icon: '📈'
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: '⚙️'
    }
  ];

  return (
    <div className="sidebar">
      <nav>
        <ul className="sidebar-nav">
          {navigationItems.map((item) => (
            <li key={item.path} className="sidebar-nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-nav-link ${isActive ? 'active' : ''}`
                }
              >
                <span className="sidebar-nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;