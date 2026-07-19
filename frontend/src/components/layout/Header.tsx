import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  User,
  LogOut,
  Search,
  Heart,
  Settings,
  FileText,
  MessageSquare,
  BarChart3,
  Briefcase,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../common';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'professional':
        return '/pro/dashboard';
      case 'admin':
        return '/admin';
      default:
        return '/dashboard';
    }
  };

  return (
    <header className='bg-white border-b border-secondary-200 sticky top-0 z-40'>
      <div className='mx-auto px-4'>
        <div className='flex items-center justify-between h-22'>
          {/* Logo */}
          <Link to='/' className='flex items-center'>
            <img
              src='/logo/logo-large.svg'
              alt='אנשי שלומנו'
              className='h-[100px]'
            />
            <span className='text-xl font-bold text-primary-600'>
              אנשי שלומנו
            </span>
          </Link>
          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center gap-0.5'>
            <Link
              to='/search'
              className='relative group p-2 rounded-lg text-secondary-500 hover:text-primary-600 hover:bg-primary-50 transition-colors'
            >
              <Search className='w-8 h-8' />
              <span className='absolute top-full mt-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-secondary-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50'>
                חיפוש
              </span>
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className='relative group p-2 rounded-lg text-secondary-500 hover:text-primary-600 hover:bg-primary-50 transition-colors'
                >
                  <User className='w-8 h-8' />
                  <span className='absolute top-full mt-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-secondary-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50'>
                    {user?.firstName || 'החשבון שלי'}
                  </span>
                </Link>

                {user?.role === 'customer' && (
                  <>
                    {/* <Link
                      to='/favorites'
                      className='relative group p-2 rounded-lg text-secondary-500 hover:text-primary-600 hover:bg-primary-50 transition-colors'
                    >
                      <Heart className='w-8 h-8' />
                      <span className='absolute top-full mt-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-secondary-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50'>
                        מועדפים
                      </span>
                    </Link> */}
                    <Link
                      to='/quotes'
                      className='relative group p-2 rounded-lg text-secondary-500 hover:text-primary-600 hover:bg-primary-50 transition-colors'
                    >
                      <FileText className='w-8 h-8' />
                      <span className='absolute top-full mt-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-secondary-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50'>
                        הצעות מחיר
                      </span>
                    </Link>
                  </>
                )}

                {user?.role === 'professional' && (
                  <>
                    <Link
                      to='/pro/requests'
                      className='relative group p-2 rounded-lg text-secondary-500 hover:text-primary-600 hover:bg-primary-50 transition-colors'
                    >
                      <FileText className='w-8 h-8' />
                      <span className='absolute top-full mt-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-secondary-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50'>
                        בקשות
                      </span>
                    </Link>
                    <Link
                      to='/pro/chats'
                      className='relative group p-2 rounded-lg text-secondary-500 hover:text-primary-600 hover:bg-primary-50 transition-colors'
                    >
                      <MessageSquare className='w-8 h-8' />
                      <span className='absolute top-full mt-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-secondary-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50'>
                        הודעות
                      </span>
                    </Link>
                  </>
                )}

                {user?.role === 'admin' && (
                  <Link
                    to='/admin/approvals'
                    className='relative group p-2 rounded-lg text-secondary-500 hover:text-primary-600 hover:bg-primary-50 transition-colors'
                  >
                    <Briefcase className='w-8 h-8' />
                    <span className='absolute top-full mt-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-secondary-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50'>
                      אישורים
                    </span>
                  </Link>
                )}

                <div className='w-px h-6 bg-secondary-200 mx-1' />

                <button
                  onClick={handleLogout}
                  className='relative group p-2 rounded-lg text-secondary-500 hover:text-error hover:bg-red-50 transition-colors'
                >
                  <LogOut className='w-8 h-8' />
                  <span className='absolute top-full mt-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-secondary-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50'>
                    התנתקות
                  </span>
                </button>
              </>
            ) : (
              <>
                <Link to='/login'>
                  <Button variant='ghost' size='sm'>
                    התחברות
                  </Button>
                </Link>
                <Link to='/register'>
                  <Button size='sm'>הרשמה</Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className='md:hidden p-2 text-secondary-600 hover:text-secondary-800'
          >
            {isMobileMenuOpen ? (
              <X className='w-6 h-6' />
            ) : (
              <Menu className='w-6 h-6' />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className='md:hidden py-4 border-t border-secondary-200'>
            <div className='flex flex-col gap-2'>
              <Link
                to='/search'
                onClick={() => setIsMobileMenuOpen(false)}
                className='flex items-center gap-3 px-4 py-3 text-secondary-600 hover:bg-secondary-50 rounded-lg'
              >
                <Search className='w-8 h-8' />
                חיפוש
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className='flex items-center gap-3 px-4 py-3 text-secondary-600 hover:bg-secondary-50 rounded-lg'
                  >
                    <User className='w-8 h-8' />
                    {user?.firstName || 'החשבון שלי'}
                  </Link>

                  {user?.role === 'customer' && (
                    <>
                      {/* <Link
                        to='/favorites'
                        onClick={() => setIsMobileMenuOpen(false)}
                        className='flex items-center gap-3 px-4 py-3 text-secondary-600 hover:bg-secondary-50 rounded-lg'
                      >
                        <Heart className='w-8 h-8' />
                        מועדפים
                      </Link> */}
                      <Link
                        to='/quotes'
                        onClick={() => setIsMobileMenuOpen(false)}
                        className='flex items-center gap-3 px-4 py-3 text-secondary-600 hover:bg-secondary-50 rounded-lg'
                      >
                        <FileText className='w-8 h-8' />
                        הצעות מחיר
                      </Link>
                    </>
                  )}

                  {user?.role === 'professional' && (
                    <>
                      <Link
                        to='/pro/requests'
                        onClick={() => setIsMobileMenuOpen(false)}
                        className='flex items-center gap-3 px-4 py-3 text-secondary-600 hover:bg-secondary-50 rounded-lg'
                      >
                        <FileText className='w-8 h-8' />
                        בקשות
                      </Link>
                      <Link
                        to='/pro/chats'
                        onClick={() => setIsMobileMenuOpen(false)}
                        className='flex items-center gap-3 px-4 py-3 text-secondary-600 hover:bg-secondary-50 rounded-lg'
                      >
                        <MessageSquare className='w-8 h-8' />
                        הודעות
                      </Link>
                      <Link
                        to='/pro/statistics'
                        onClick={() => setIsMobileMenuOpen(false)}
                        className='flex items-center gap-3 px-4 py-3 text-secondary-600 hover:bg-secondary-50 rounded-lg'
                      >
                        <BarChart3 className='w-8 h-8' />
                        סטטיסטיקות
                      </Link>
                    </>
                  )}

                  {user?.role === 'admin' && (
                    <>
                      <Link
                        to='/admin/approvals'
                        onClick={() => setIsMobileMenuOpen(false)}
                        className='flex items-center gap-3 px-4 py-3 text-secondary-600 hover:bg-secondary-50 rounded-lg'
                      >
                        <Briefcase className='w-8 h-8' />
                        אישורים
                      </Link>
                    </>
                  )}

                  <Link
                    to={
                      user?.role === 'professional'
                        ? '/pro/settings'
                        : user?.role === 'admin'
                          ? '/admin'
                          : '/settings'
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                    className='flex items-center gap-3 px-4 py-3 text-secondary-600 hover:bg-secondary-50 rounded-lg'
                  >
                    <Settings className='w-8 h-8' />
                    הגדרות
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className='flex items-center gap-3 px-4 py-3 text-error hover:bg-red-50 rounded-lg'
                  >
                    <LogOut className='w-8 h-8' />
                    התנתקות
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to='/login'
                    onClick={() => setIsMobileMenuOpen(false)}
                    className='flex items-center gap-3 px-4 py-3 text-secondary-600 hover:bg-secondary-50 rounded-lg'
                  >
                    התחברות
                  </Link>
                  <Link
                    to='/register'
                    onClick={() => setIsMobileMenuOpen(false)}
                    className='flex items-center gap-3 px-4 py-3 text-primary-600 bg-primary-50 rounded-lg'
                  >
                    הרשמה
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
