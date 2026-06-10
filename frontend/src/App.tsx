import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Routines } from './pages/Routines';
import { Exercises } from './pages/Exercises';
import { ActiveWorkout } from './pages/ActiveWorkout';
import { Loader2 } from 'lucide-react';

import type { Routine } from './types';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [page, setPage] = useState<string>('dashboard');
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(() => {
    const saved = localStorage.getItem('active_routine');
    return saved ? JSON.parse(saved) : null;
  });

  const startActiveWorkout = (routine: Routine) => {
    setActiveRoutine(routine);
    localStorage.setItem('active_routine', JSON.stringify(routine));
    setPage('active-workout');
  };

  const cancelWorkout = () => {
    setActiveRoutine(null);
    localStorage.removeItem('active_routine');
    setPage('routines');
  };

  const onWorkoutFinished = () => {
    setActiveRoutine(null);
    localStorage.removeItem('active_routine');
    setPage('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-zinc-950 text-zinc-50 font-sans">
      <Navbar
        currentPage={page}
        setPage={setPage}
        activeWorkoutInProgress={activeRoutine !== null}
      />
      
      <main className="flex-grow flex flex-col min-h-0">
        {page === 'dashboard' && <Dashboard setPage={setPage} />}
        {page === 'routines' && (
          <Routines startActiveWorkout={startActiveWorkout} />
        )}
        {page === 'exercises' && <Exercises />}
        {page === 'active-workout' && activeRoutine && (
          <ActiveWorkout
            activeRoutine={activeRoutine}
            cancelWorkout={cancelWorkout}
            onWorkoutFinished={onWorkoutFinished}
          />
        )}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
