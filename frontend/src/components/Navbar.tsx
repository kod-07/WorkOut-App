import React from 'react';
import { LayoutDashboard, Dumbbell, ClipboardList, LogOut, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentPage: string;
  setPage: (page: string) => void;
  activeWorkoutInProgress: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, setPage, activeWorkoutInProgress }) => {
  const { logout, user } = useAuth();

  if (!user) return null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'routines', label: 'Routines', icon: ClipboardList },
    { id: 'exercises', label: 'Library', icon: Dumbbell },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-zinc-900 border-r border-zinc-800 h-screen sticky top-0 p-6 justify-between shrink-0">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500 rounded-xl text-black">
              <Dumbbell className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight">FlexFlow</h1>
              <p className="text-xs text-zinc-400">Fitness Tracker</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer min-h-[48px] ${
                    isActive
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/25'
                      : 'text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}

            {activeWorkoutInProgress && (
              <button
                onClick={() => setPage('active-workout')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer min-h-[48px] ${
                  currentPage === 'active-workout'
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                } timer-active-pulse`}
              >
                <Play className="w-5 h-5 fill-current" />
                Active Workout
              </button>
            )}
          </nav>
        </div>

        <div className="flex flex-col gap-4 border-t border-zinc-800 pt-4">
          <div className="px-3 py-1">
            <p className="text-xs text-zinc-500">Logged in as</p>
            <p className="text-sm font-semibold truncate text-zinc-300">{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 cursor-pointer min-h-[48px]"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 px-6 py-2 flex justify-around items-center z-50 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-200 cursor-pointer w-[60px] h-[48px] ${
                isActive ? 'text-emerald-400' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}

        {activeWorkoutInProgress && (
          <button
            onClick={() => setPage('active-workout')}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-200 cursor-pointer w-[60px] h-[48px] ${
              currentPage === 'active-workout' ? 'text-emerald-400' : 'text-emerald-500'
            } timer-active-pulse`}
          >
            <Play className="w-5 h-5 fill-current animate-pulse" />
            <span className="text-[10px] font-bold">Active</span>
          </button>
        )}

        <button
          onClick={logout}
          className="flex flex-col items-center justify-center gap-1 rounded-xl text-zinc-400 hover:text-red-400 cursor-pointer w-[60px] h-[48px]"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-medium">Exit</span>
        </button>
      </nav>
    </>
  );
};
