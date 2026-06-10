import React, { useState, useEffect } from 'react';
import api from '../api';
import { useSound } from '../hooks/useSound';
import { Clock, Check, Plus, Trash2, Play, Pause, X, Loader2 } from 'lucide-react';
import type { Routine, WorkoutExercise } from '../types';

interface ActiveWorkoutProps {
  activeRoutine: Routine;
  cancelWorkout: () => void;
  onWorkoutFinished: () => void;
}

export const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({
  activeRoutine,
  cancelWorkout,
  onWorkoutFinished,
}) => {
  const { playTimerDoneSound } = useSound();
  
  const [workoutStartTime] = useState<number>(() => {
    const saved = localStorage.getItem('workout_start_time');
    if (saved) return Number(saved);
    const now = Date.now();
    localStorage.setItem('workout_start_time', String(now));
    return now;
  });
  const [elapsedTime, setElapsedTime] = useState(0);

  const [exercises, setExercises] = useState<WorkoutExercise[]>(() => {
    const saved = localStorage.getItem('workout_exercises');
    if (saved) return JSON.parse(saved);
    
    return activeRoutine.routineExercises.map((re) => ({
      exerciseId: re.exerciseId,
      name: re.exercise.name,
      muscleGroup: re.exercise.muscleGroup,
      defaultRestPeriod: re.exercise.defaultRestPeriod || 60,
      sets: Array.from({ length: re.sets }).map((_, i) => ({
        setNumber: i + 1,
        weight: re.weight,
        reps: re.reps,
        isCompleted: false,
      })),
    }));
  });

  const [notes, setNotes] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  const [restTimeLeft, setRestTimeLeft] = useState<number | null>(null);
  const [restDuration, setRestDuration] = useState<number>(60);
  const [isRestPaused, setIsRestPaused] = useState(false);

  useEffect(() => {
    localStorage.setItem('workout_exercises', JSON.stringify(exercises));
  }, [exercises]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - workoutStartTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [workoutStartTime]);

  useEffect(() => {
    if (restTimeLeft === null || isRestPaused) return;

    if (restTimeLeft <= 0) {
      playTimerDoneSound();
      setRestTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      setRestTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(interval);
  }, [restTimeLeft, isRestPaused, playTimerDoneSound]);

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return [
      hrs > 0 ? String(hrs).padStart(2, '0') : null,
      String(mins).padStart(2, '0'),
      String(secs).padStart(2, '0'),
    ]
      .filter(Boolean)
      .join(':');
  };

  const startRestTimer = (seconds: number) => {
    setRestDuration(seconds);
    setRestTimeLeft(seconds);
    setIsRestPaused(false);
  };

  const handleSetToggle = (exIndex: number, setIndex: number) => {
    const updated = [...exercises];
    const set = updated[exIndex].sets[setIndex];
    const nextCompleted = !set.isCompleted;
    set.isCompleted = nextCompleted;
    setExercises(updated);

    if (nextCompleted) {
      startRestTimer(updated[exIndex].defaultRestPeriod || 60);
    }
  };

  const handleValChange = (exIndex: number, setIndex: number, field: 'weight' | 'reps', increment: number) => {
    const updated = [...exercises];
    const set = updated[exIndex].sets[setIndex];
    if (field === 'weight') {
      set.weight = Math.max(0, Math.round((set.weight + increment) * 10) / 10);
    } else {
      set.reps = Math.max(0, set.reps + increment);
    }
    setExercises(updated);
  };

  const handleAddSet = (exIndex: number) => {
    const updated = [...exercises];
    const sets = updated[exIndex].sets;
    const lastSet = sets[sets.length - 1] || { weight: 20, reps: 10 };
    sets.push({
      setNumber: sets.length + 1,
      weight: lastSet.weight,
      reps: lastSet.reps,
      isCompleted: false,
    });
    setExercises(updated);
  };

  const handleRemoveSet = (exIndex: number, setIndex: number) => {
    const updated = [...exercises];
    updated[exIndex].sets = updated[exIndex].sets
      .filter((_, i) => i !== setIndex)
      .map((set, i) => ({ ...set, setNumber: i + 1 }));
    setExercises(updated);
  };

  const handleFinishWorkout = async () => {
    const allSets: any[] = [];
    exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        allSets.push({
          exerciseId: ex.exerciseId,
          setNumber: set.setNumber,
          weight: set.weight,
          reps: set.reps,
          isCompleted: set.isCompleted,
        });
      });
    });

    if (allSets.length === 0) {
      alert('Please add at least one set log to finish your workout.');
      return;
    }

    setSaveLoading(true);
    try {
      await api.post('/workouts/logs', {
        routineId: activeRoutine.id,
        startTime: new Date(workoutStartTime).toISOString(),
        endTime: new Date().toISOString(),
        notes,
        setLogs: allSets,
      });

      localStorage.removeItem('workout_start_time');
      localStorage.removeItem('workout_exercises');
      
      onWorkoutFinished();
    } catch (err) {
      console.error(err);
      alert('Failed to save workout log');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-10 overflow-y-auto pb-32 md:pb-40 max-w-4xl mx-auto w-full relative">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/10">
            ACTIVE WORKOUT
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1 truncate">{activeRoutine.name}</h1>
        </div>

        <div className="flex items-center gap-2.5 bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-2xl self-start md:self-auto min-h-[48px]">
          <Clock className="w-5 h-5 text-emerald-400 animate-pulse" />
          <span className="font-mono text-lg font-bold text-white leading-none">{formatTime(elapsedTime)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-6 font-sans">
        {exercises.map((ex, exIndex) => (
          <div key={ex.exerciseId} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 md:p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base md:text-lg text-white">{ex.name}</h3>
                <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md mt-1 inline-block border border-zinc-800">
                  {ex.muscleGroup} • {ex.defaultRestPeriod}s Rest
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-12 gap-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-center pb-2">
                <span className="col-span-2 text-left">Set</span>
                <span className="col-span-4">Weight (kg)</span>
                <span className="col-span-4">Reps</span>
                <span className="col-span-2">Done</span>
              </div>

              {ex.sets.map((set, setIndex) => (
                <div
                  key={setIndex}
                  className={`grid grid-cols-12 gap-1 items-center py-2.5 border-b border-zinc-800/50 ${
                    set.isCompleted ? 'opacity-55' : ''
                  }`}
                >
                  <span className="col-span-2 text-sm font-bold text-zinc-400 pl-1">{set.setNumber}</span>

                  <div className="col-span-4 flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleValChange(exIndex, setIndex, 'weight', -2.5)}
                      disabled={set.isCompleted}
                      className="w-8 h-8 bg-zinc-800 rounded-md text-zinc-300 hover:text-white flex items-center justify-center text-xs font-bold transition-all disabled:opacity-50 min-h-[48px] min-w-[32px] cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      disabled={set.isCompleted}
                      value={set.weight}
                      onChange={(e) => {
                        const updated = [...exercises];
                        updated[exIndex].sets[setIndex].weight = Number(e.target.value);
                        setExercises(updated);
                      }}
                      className="w-14 bg-zinc-900 border border-zinc-800 text-center py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-500 text-white disabled:text-zinc-300 disabled:bg-zinc-950/40 min-h-[38px]"
                    />
                    <button
                      onClick={() => handleValChange(exIndex, setIndex, 'weight', 2.5)}
                      disabled={set.isCompleted}
                      className="w-8 h-8 bg-zinc-800 rounded-md text-zinc-300 hover:text-white flex items-center justify-center text-xs font-bold transition-all disabled:opacity-50 min-h-[48px] min-w-[32px] cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <div className="col-span-4 flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleValChange(exIndex, setIndex, 'reps', -1)}
                      disabled={set.isCompleted}
                      className="w-8 h-8 bg-zinc-800 rounded-md text-zinc-300 hover:text-white flex items-center justify-center text-xs font-bold transition-all disabled:opacity-50 min-h-[48px] min-w-[32px] cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      disabled={set.isCompleted}
                      value={set.reps}
                      onChange={(e) => {
                        const updated = [...exercises];
                        updated[exIndex].sets[setIndex].reps = Number(e.target.value);
                        setExercises(updated);
                      }}
                      className="w-12 bg-zinc-900 border border-zinc-800 text-center py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-500 text-white disabled:text-zinc-300 disabled:bg-zinc-950/40 min-h-[38px]"
                    />
                    <button
                      onClick={() => handleValChange(exIndex, setIndex, 'reps', 1)}
                      disabled={set.isCompleted}
                      className="w-8 h-8 bg-zinc-800 rounded-md text-zinc-300 hover:text-white flex items-center justify-center text-xs font-bold transition-all disabled:opacity-50 min-h-[48px] min-w-[32px] cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <div className="col-span-2 flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => handleSetToggle(exIndex, setIndex)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border cursor-pointer min-h-[48px] min-w-[40px] transition-all duration-200 ${
                        set.isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                          : 'border-zinc-700 bg-zinc-800/40 text-zinc-400 hover:border-zinc-500'
                      }`}
                    >
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    </button>
                    {ex.sets.length > 1 && !set.isCompleted && (
                      <button
                        onClick={() => handleRemoveSet(exIndex, setIndex)}
                        className="text-red-500 hover:text-red-400 p-1.5 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleAddSet(exIndex)}
              className="mt-2 flex items-center justify-center gap-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-xl text-xs font-semibold transition-all min-h-[48px] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Set
            </button>
          </div>
        ))}

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-3">
          <h3 className="font-bold text-sm text-zinc-300">Workout Notes</h3>
          <textarea
            placeholder="Feeling strong today! Bench press sets felt smooth..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white min-h-[80px]"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => {
              if (window.confirm('Cancel workout? Active tracking progress will be lost.')) {
                localStorage.removeItem('workout_start_time');
                localStorage.removeItem('workout_exercises');
                cancelWorkout();
              }
            }}
            className="flex-1 border border-zinc-800 hover:border-zinc-750 text-red-400 bg-red-500/5 hover:bg-red-500/10 py-3.5 rounded-xl text-sm font-semibold transition-all min-h-[48px] cursor-pointer"
          >
            Cancel Workout
          </button>
          
          <button
            onClick={handleFinishWorkout}
            disabled={saveLoading}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
          >
            {saveLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5 stroke-[2.5]" />}
            Finish Workout
          </button>
        </div>
      </div>

      {restTimeLeft !== null && (
        <div className="fixed bottom-[72px] md:bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900/90 border border-zinc-800/80 backdrop-blur-md px-6 py-3.5 rounded-full flex items-center gap-5 shadow-2xl z-45 max-w-md w-[92%] sm:w-auto">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">REST TIMER</span>
            <span className="font-mono text-xl font-black text-emerald-400 leading-none">
              {restTimeLeft}s <span className="text-zinc-500 text-xs font-normal">/ {restDuration}s</span>
            </span>
          </div>

          <div className="flex items-center gap-2 border-l border-zinc-800 pl-4">
            <button
              onClick={() => setIsRestPaused(!isRestPaused)}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-full cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              {isRestPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
            </button>
            <button
              onClick={() => setRestTimeLeft((prev) => (prev !== null ? prev + 30 : null))}
              className="px-2.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-[10px] font-bold cursor-pointer min-h-[40px]"
            >
              +30s
            </button>
            <button
              onClick={() => setRestTimeLeft(null)}
              className="p-2 bg-zinc-800/50 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-full cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
