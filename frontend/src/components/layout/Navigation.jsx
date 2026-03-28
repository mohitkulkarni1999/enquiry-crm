import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAppContext } from '../../contexts/AppContext';
import { NavigationIcons, BusinessIcons, ActionIcons, UIIcons } from '../ui/Icons';
import Button from '../ui/Button';

const Navigation = ({ collapsed = false, onToggle }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);
  const { user, logout } = useAuth();
  const { enquiries } = useAppContext();

  const unassignedCount = enquiries.filter(e => !e.assignedTo).length;

  const NavButton = ({ active, label, onClick, badge, icon: IconComponent, disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={collapsed ? label : ''}
      className={`w-full flex items-center ${collapsed ? 'justify-center px-2 py-3' : 'justify-between px-4 py-4'} rounded-xl text-sm font-semibold transition-all duration-300 group ${active
          ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-xl shadow-blue-500/30 transform scale-105 border border-blue-400/20'
          : disabled
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-gray-900 hover:shadow-lg hover:scale-102 border border-transparent hover:border-gray-200'
        }`}
    >
      <div className={`flex items-center ${collapsed ? '' : 'space-x-3'}`}>
        {IconComponent && (
          <IconComponent
            size={20}
            className={`transition-all duration-300 ${active ? 'text-white' : disabled ? 'text-gray-400' : 'text-gray-500 group-hover:text-blue-600'
              }`}
          />
        )}
        {!collapsed && <span className="font-medium">{label}</span>}
      </div>
      {badge && !collapsed && (
        <span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold">
          {badge}
        </span>
      )}
      {badge && collapsed && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 bg-red-500 text-white rounded-full text-xs font-bold">
          {badge}
        </span>
      )}
    </button>
  );

  const getRoleBasedNavigation = () => {
    if (user?.role === 'SUPER_ADMIN') {
      return [
        {
          section: 'Super Admin',
          icon: NavigationIcons.settings,
          items: [
            { path: '/super-admin', label: 'Super Admin Dashboard', icon: NavigationIcons.dashboard },
            { path: '/form-builder', label: 'Edit Enquiry Form', icon: ActionIcons.edit },
            { path: '/analytics', label: 'System Analytics', icon: BusinessIcons.trending },
            { path: '/crm-dashboard', label: 'CRM Overview', icon: NavigationIcons.crm },
            { path: '/sales', label: 'Sales Management', icon: BusinessIcons.users },
          ]
        }
      ];
    }

    if (user?.role === 'CRM_ADMIN') {
      return [
        {
          section: 'CRM Management',
          icon: NavigationIcons.crm,
          items: [
            { path: '/crm-dashboard', label: 'CRM Dashboard', icon: NavigationIcons.dashboard },
            { path: '/form-builder', label: 'Edit Enquiry Form', icon: ActionIcons.edit },
            { path: '/sales', label: 'Sales Management', icon: BusinessIcons.users, badge: unassignedCount > 0 ? unassignedCount : null },
            { path: '/sales-team-performance', label: 'Team Performance', icon: BusinessIcons.award },
            { path: '/analytics', label: 'Analytics & Reports', icon: BusinessIcons.trending },
          ]
        }
      ];
    }

    if (user?.role === 'SALES') {
      return [
        {
          section: 'Sales Portal',
          icon: BusinessIcons.briefcase,
          items: [
            { path: '/sales-dashboard', label: 'My Dashboard', icon: NavigationIcons.dashboard },
          ]
        }
      ];
    }

    return [];
  };

  const navigationSections = getRoleBasedNavigation();

  const sidebarContent = (isMobile = false) => (
    <>
      {/* Header */}
      <div className={`border-b border-gray-200 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 ${
        isMobile ? 'px-6 py-6' : collapsed ? 'px-2 py-4' : 'px-6 py-6'
      }`}>
        <div className={`flex items-center ${
          !isMobile && collapsed ? 'justify-center' : 'space-x-3'
        }`}>
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
            <BusinessIcons.briefcase size={(!isMobile && collapsed) ? 20 : 28} className="text-white" />
          </div>
          {(isMobile || !collapsed) && (
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">Enquiry CRM</h1>
              <p className="text-sm text-blue-100">Professional Lead Management</p>
            </div>
          )}
          {isMobile && (
            <button onClick={() => setMobileOpen(false)} className="p-2 hover:bg-white/20 rounded-lg">
              <ActionIcons.close size={20} className="text-white" />
            </button>
          )}
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className={`border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 ${
          !isMobile && collapsed ? 'px-2 py-3' : 'px-6 py-5'
        }`}>
          <div className={`flex items-center ${
            !isMobile && collapsed ? 'justify-center' : 'space-x-3'
          }`}>
            <div className={`bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg ${
              !isMobile && collapsed ? 'w-8 h-8 text-sm' : 'w-12 h-12 text-lg'
            }`} title={(!isMobile && collapsed) ? user.username : ''}>
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            {(isMobile || !collapsed) && (
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-lg truncate">{user.username}</p>
                <p className="text-sm text-gray-600 font-medium">{user.role?.replace('_', ' ')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className={`space-y-8 ${
        !isMobile && collapsed ? 'p-2' : 'p-6'
      }`}>
        {navigationSections.map((section, index) => (
          <div key={index}>
            {(isMobile || !collapsed) && (
              <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-4 flex items-center bg-gray-100 px-3 py-2 rounded-lg">
                <section.icon size={16} className="mr-2 text-blue-600" />
                {section.section}
              </div>
            )}
            {!isMobile && collapsed && (
              <div className="mb-4 flex justify-center">
                <section.icon size={20} className="text-blue-600" title={section.section} />
              </div>
            )}
            <div className="space-y-2">
              {section.items.map((item, itemIndex) => (
                <NavButton
                  key={itemIndex}
                  active={location.pathname === item.path}
                  label={item.label}
                  icon={item.icon}
                  badge={item.badge}
                  onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        <div className="pt-8 mt-8 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            icon={<ActionIcons.close size={16} />}
            className="w-full justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200"
            title={(!isMobile && collapsed) ? 'Logout' : ''}
          >
            {(isMobile || !collapsed) && 'Logout'}
          </Button>
        </div>

        {/* Professional footer */}
        {(isMobile || !collapsed) && (
          <div className="text-xs text-gray-500 text-center bg-gray-50 rounded-lg p-3">
            <p className="font-semibold text-gray-700">Professional CRM Suite</p>
            <p className="mt-1 text-gray-500">v3.0.0</p>
          </div>
        )}
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 md:hidden bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl shadow-lg"
        aria-label="Open menu"
      >
        <UIIcons.menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar (drawer) */}
      <aside className={`fixed left-0 top-0 h-full w-72 bg-white border-r border-gray-200 shadow-2xl z-50 overflow-y-auto transition-transform duration-300 md:hidden ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {sidebarContent(true)}
      </aside>

      {/* Desktop sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-2xl z-50 overflow-y-auto transition-all duration-300 hidden md:block ${collapsed ? 'w-16' : 'w-72'
        }`}>
        {sidebarContent(false)}
      </aside>

      {/* Desktop Toggle Button */}
      <button
        onClick={() => onToggle(!collapsed)}
        className={`fixed top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-r-lg shadow-lg z-50 transition-all duration-300 hidden md:block ${collapsed ? 'left-16' : 'left-72'
          }`}
        title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        <UIIcons.chevronLeft
          size={16}
          className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
        />
      </button>
    </>
  );
};

export default Navigation;
