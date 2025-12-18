import React from 'react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onNavigate, currentPage }) => {
  const navItems = [
    { id: 'home', label: 'Explore', icon: 'fa-compass' },
    { id: 'careers', label: 'Careers', icon: 'fa-briefcase' },
  ];

  if (user) {
    navItems.push({ id: 'portfolio', label: 'My Portfolio', icon: 'fa-user-astronaut' });
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer group" onClick={() => onNavigate('home')}>
            <span className="text-2xl font-bold text-stone-900 tracking-tight group-hover:opacity-80 transition-opacity">
              <i className="fas fa-bolt mr-2 text-stone-900"></i>
              Creative Lancer
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    currentPage === item.id
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <i className={`fas ${item.icon} mr-2`}></i>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* User / Login */}
          <div className="hidden md:block">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-stone-500 text-sm">Hi, {user.name}</span>
                <button
                  onClick={onLogout}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-full text-sm font-medium transition-colors border border-stone-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('auth')}
                className="bg-stone-900 hover:bg-stone-800 text-white px-6 py-2 rounded-full text-sm font-bold shadow-sm transition-all transform hover:scale-105"
              >
                Join Now
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => onNavigate(currentPage === 'menu' ? 'home' : 'menu')}
              className="inline-flex items-center justify-center p-2 rounded-md text-stone-400 hover:text-stone-900 hover:bg-stone-100 focus:outline-none"
            >
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {currentPage === 'menu' && (
        <div className="md:hidden bg-white border-b border-stone-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
             {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                >
                  <i className={`fas ${item.icon} mr-3 w-5`}></i>
                  {item.label}
                </button>
              ))}
              {!user ? (
                 <button
                  onClick={() => onNavigate('auth')}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-stone-900 hover:bg-stone-50 font-bold"
                >
                  <i className="fas fa-sign-in-alt mr-3 w-5"></i>
                  Login / Join
                </button>
              ) : (
                 <button
                  onClick={onLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-stone-50"
                >
                  <i className="fas fa-sign-out-alt mr-3 w-5"></i>
                  Logout
                </button>
              )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;