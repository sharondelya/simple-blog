import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/useAuth';
import { useRouter } from 'next/router';

const Header = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600">
            SimpleBlog
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Home
            </Link>
            {user && user.role === 'admin' && (
              <>
                <Link href="/admin/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Admin Dashboard
                </Link>
                <Link href="/admin/users" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Users
                </Link>
                <Link href="/admin/blogs" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Blogs
                </Link>
                <Link href="/admin/comments" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Comments
                </Link>
                <Link href="/admin/reports" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Reports
                </Link>
              </>
            )}
            {user && user.role !== 'admin' && (
              <>
                <Link href="/blog/create" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Write
                </Link>
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Dashboard
                </Link>
              </>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Hi, {user.username}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              <Link href="/" className="text-gray-700 hover:text-blue-600 py-2">
                Home
              </Link>
              {user && user.role === 'admin' && (
                <>
                  <Link href="/admin/dashboard" className="text-gray-700 hover:text-blue-600 py-2">
                    Admin Dashboard
                  </Link>
                  <Link href="/admin/users" className="text-gray-700 hover:text-blue-600 py-2">
                    Users
                  </Link>
                  <Link href="/admin/blogs" className="text-gray-700 hover:text-blue-600 py-2">
                    Blogs
                  </Link>
                  <Link href="/admin/comments" className="text-gray-700 hover:text-blue-600 py-2">
                    Comments
                  </Link>
                  <Link href="/admin/reports" className="text-gray-700 hover:text-blue-600 py-2">
                    Reports
                  </Link>
                </>
              )}
              {user && user.role !== 'admin' && (
                <>
                  <Link href="/blog/create" className="text-gray-700 hover:text-blue-600 py-2">
                    Write
                  </Link>
                  <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 py-2">
                    Dashboard
                  </Link>
                </>
              )}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="text-left text-red-600 py-2"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link href="/login" className="text-gray-700 hover:text-blue-600 py-2">
                    Login
                  </Link>
                  <Link href="/register" className="text-blue-600 py-2">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;