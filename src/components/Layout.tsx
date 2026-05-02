import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { 
  LayoutDashboard, 
  Stethoscope, 
  Calendar, 
  History, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X,
  ShieldCheck,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, isAdmin, isDoctor, isPatient } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, show: !!user },
    { label: 'Symptom Checker', path: '/symptoms', icon: Stethoscope, show: true },
    { label: 'Find Doctors', path: '/doctors', icon: Search, show: isPatient },
    { label: 'My Appointments', path: '/appointments', icon: Calendar, show: isPatient || isDoctor },
    { label: 'Admin', path: '/admin', icon: ShieldCheck, show: isAdmin },
  ];

  return (
    <div className="min-h-screen bg-bg-light text-text-main selection:bg-accent selection:text-white flex">
      {/* Sidebar Navigation - Floating Glassy */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 transform transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
        md:translate-x-0 md:static md:inset-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        p-4 md:p-6 shrink-0
      `}>
        <div className="h-full glass rounded-[2.5rem] flex flex-col border border-black/[0.03] shadow-xl overflow-hidden">
          <div className="p-8">
            <Link to="/" className="flex items-center gap-3 mb-12 group">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.2)] group-hover:scale-110 transition-transform duration-500">
                <Stethoscope className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="font-semibold tracking-tighter text-xl leading-none">PrimeMed</h1>
                <p className="text-[10px] uppercase tracking-[0.3em] text-accent mt-1 font-bold">System</p>
              </div>
            </Link>

            <nav className="space-y-2">
              {navItems.filter(item => item.show).map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300
                      ${isActive 
                        ? 'bg-accent/10 text-accent shadow-[inset_0_0_20px_rgba(14,165,233,0.05)]' 
                        : 'text-text-dim hover:text-text-main hover:bg-black/[0.02]'}
                    `}
                  >
                    <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-accent' : ''}`} />
                    <span className="text-sm font-medium tracking-tight">{item.label}</span>
                    {isActive && <div className="ml-auto w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_8px_rgba(14,165,233,0.6)]" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto p-8 space-y-6">
            {user ? (
              <div className="space-y-6">
                <div className="p-4 bg-black/[0.01] border border-black/[0.03] rounded-3xl flex items-center gap-3">
                  <Avatar className="w-10 h-10 border border-black/5">
                    <AvatarImage src={user.photoURL || ''} />
                    <AvatarFallback className="bg-accent/10 text-accent text-xs font-bold">
                      {user.displayName?.charAt(0) || user.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-text-main truncate">{user.displayName || 'User'}</p>
                    <p className="text-[10px] text-text-dim uppercase tracking-widest truncate">{profile?.role || 'Patient'}</p>
                  </div>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-4 px-4 py-3.5 text-text-dim hover:text-error hover:bg-error/5 rounded-2xl transition-all duration-300 group"
                >
                  <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                  <span className="text-sm font-medium tracking-tight">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-black/5 text-text-main hover:bg-black/5 rounded-xl h-11">
                    Log in
                  </Button>
                </Link>
                <Link to="/login?signup=true" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-accent text-white hover:bg-accent/90 font-bold rounded-xl h-11 shadow-lg shadow-accent/20">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Header - Glassy */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 glass z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-lg shadow-accent/20">
            <Stethoscope className="text-white w-5 h-5" />
          </div>
          <span className="font-semibold tracking-tighter text-lg">PrimeMed <span className="text-accent italic">System</span></span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-black/5 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Desktop Header - Atmospheric */}
        <header className="hidden md:flex h-20 items-center justify-between px-12 z-40 shrink-0">
          <div className="flex items-center gap-8">
            <div className="h-8 w-px bg-black/5" />
            <div className="flex items-center gap-2 text-text-dim text-[10px] uppercase tracking-[0.3em] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.6)]" />
              Network Status: Secure
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-bg-light bg-white shadow-sm flex items-center justify-center text-[10px] font-bold text-text-dim">
                  {i}
                </div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-bg-light bg-accent flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-accent/20">
                +
              </div>
            </div>
            <div className="h-8 w-px bg-black/5" />
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-text-dim font-bold">Current Node</p>
              <p className="text-xs font-bold text-text-main">Primary-Alpha-9</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-12 pb-12 pt-20 md:pt-0">
          <div className="max-w-7xl mx-auto w-full py-6 md:py-10">
            {children}
          </div>
          
          {/* Footer */}
          <footer className="border-t border-black/5 py-12 mt-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-text-dim text-[10px] uppercase tracking-[0.3em] font-bold">
              <div className="flex items-center gap-3">
                <span className="text-accent font-bold text-xs tracking-tighter">PrimeMed <span className="italic">System</span></span>
                <span className="opacity-20">/</span>
                <span className="opacity-60">© 2026 Intelligence Systems</span>
              </div>
              <div className="flex gap-10">
                <Link to="/privacy" className="hover:text-accent transition-colors">Privacy Protocol</Link>
                <Link to="/terms" className="hover:text-accent transition-colors">Terms of Service</Link>
              </div>
            </div>
          </footer>
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

