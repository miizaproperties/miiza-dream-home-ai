import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Home, ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { isAdmin, isAgentOnly } from '../utils/roleUtils';

export const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar on window resize (if desktop)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Base navigation items available to all users
  const baseNavItems = [
    { path: '/admin', label: 'Overview', roles: ['all'] },
    { path: '/admin/properties', label: 'Properties', roles: ['all'] },
    { path: '/admin/viewings', label: 'Viewings', roles: ['all'] },
    { path: '/admin/contacts', label: 'Contacts', roles: ['all'] },
  ];

  // Admin-only navigation items
  const adminNavItems = [
    { path: '/admin/analytics', label: 'Analytics', roles: ['admin'] },
    { path: '/admin/users', label: 'Users', roles: ['admin'] },
    { path: '/admin/agents', label: 'Agents', roles: ['admin'] },
  ];

  // Content management navigation items (admin only)
  const contentNavItems = [
    { path: '/admin/careers', label: 'Careers', roles: ['admin'] },
    { path: '/admin/articles', label: 'Article & News', roles: ['admin'] },
    { path: '/admin/legal', label: 'Legal Notice', roles: ['admin'] },
  ];

  // Company section navigation items (admin only)
  const companyNavItems = [
    { path: '/admin/announcements', label: 'Announcements', roles: ['admin'] },
    { path: '/admin/testimonials', label: 'Testimonials', roles: ['admin'] },
    { path: '/admin/events', label: 'Events', roles: ['admin'] },
  ];

  // Filter navigation items based on user role
  const getNavItems = () => {
    const isUserAdmin = isAdmin(user);
    const isUserAgentOnly = isAgentOnly(user);

    let items = baseNavItems.filter(item => item.roles.includes('all'));

    if (isUserAdmin) {
      items = [...items, ...adminNavItems, ...contentNavItems, ...companyNavItems];
    }

    if (isUserAgentOnly) {
      // For agents, update the overview path to point to agent dashboard
      items = items.map(item => 
        item.path === '/admin' && item.label === 'Overview' 
          ? { ...item, path: '/admin/agent' }
          : item
      );
    }

    return items;
  };

  const navItems = getNavItems();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  // Group navigation items for better organization
  const groupedNavItems = () => {
    const isUserAdmin = isAdmin(user);
    const isUserAgentOnly = isAgentOnly(user);
    
    const groups: { title?: string; items: typeof baseNavItems }[] = [];
    
    // Main navigation group - apply agent path transformation if needed
    let mainNavItems = baseNavItems.filter(item => item.roles.includes('all'));
    
    if (isUserAgentOnly) {
      // For agents, update the overview path to point to agent dashboard
      mainNavItems = mainNavItems.map(item => 
        item.path === '/admin' && item.label === 'Overview' 
          ? { ...item, path: '/admin/agent' }
          : item
      );
    }
    
    groups.push({
      items: mainNavItems
    });
    
    if (isUserAdmin) {
      // Analytics & Management group
      groups.push({
        title: 'Analytics & Management',
        items: adminNavItems
      });
      
      // Content Management group
      groups.push({
        title: 'Content Management',
        items: contentNavItems
      });
      
      // Company group
      groups.push({
        title: 'Company',
        items: companyNavItems
      });
    }
    
    return groups;
  };

  const navGroups = groupedNavItems();

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50/60 via-blue-50/40 to-gray-50/70 overflow-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sticky Sidebar */}
      <aside
        className={`w-64 bg-white border-r border-blue-200/60 flex flex-col fixed left-0 top-0 bottom-0 z-50 lg:z-10 shadow-lg transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-blue-200/60 bg-white flex items-center justify-between">
          <Link 
            to={isAgentOnly(user) ? '/admin/agent' : '/admin'} 
            className="flex items-center gap-3 hover:opacity-90 transition-opacity group"
          >
            <img
              src="/Miiza-02.png"
              alt="MIIZA REALTORS"
              className="h-8 lg:h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="hidden sm:block">
              <p className="text-xs text-gray-700 font-medium">{isAdmin(user) ? 'Admin Dashboard' : 'Agent Portal'}</p>
            </div>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-blue-100/50 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 lg:py-6">
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-6 lg:mb-8 last:mb-0 px-3">
              {group.title && (
                <div className="px-2 mb-3 mt-2 first:mt-0">
                  <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                    {group.title}
                  </h3>
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  // Handle active state for both /admin and /admin/agent routes
                  const isActive = location.pathname === item.path || 
                    (item.path !== '/admin' && item.path !== '/admin/agent' && location.pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`block px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium w-full ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm font-semibold'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-900'
                      }`}
                      title={item.label}
                    >
                      <span className="block truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 flex flex-col overflow-hidden bg-gradient-to-br from-blue-50/40 via-blue-50/30 to-gray-50/50">
        {/* Top Header Bar */}
        <div className="sticky top-0 z-20 bg-gradient-to-r from-blue-50/70 via-blue-100/40 to-blue-50/70 backdrop-blur-sm border-b border-blue-200/60 px-4 sm:px-6 lg:px-8 py-3 lg:py-4 shadow-sm">
          <div className="flex items-center justify-between lg:justify-end gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-blue-100/50 rounded-lg transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                >
                  <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm">
                    {user.first_name ? user.first_name[0].toUpperCase() : user.username[0].toUpperCase()}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="font-medium text-gray-900 text-sm">
                      {user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user.username}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-[150px]">{user.email}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 hidden md:block ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-30" 
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-gradient-to-br from-blue-50/90 to-white rounded-xl border border-blue-200/60 shadow-lg z-40 py-2">
                      <div className="px-4 py-3 border-b border-blue-200/60 bg-blue-50/30">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm">
                            {user.first_name ? user.first_name[0].toUpperCase() : user.username[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate text-sm">
                              {user.first_name && user.last_name
                                ? `${user.first_name} ${user.last_name}`
                                : user.username}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="py-2">
                        <Link
                          to="/"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          <Home className="mr-3 w-4 h-4" />
                          Back to Site
                        </Link>
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          <LogOut className="mr-3 w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

