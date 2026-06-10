import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Play, Trash2, Dumbbell, ClipboardList, ArrowLeft, Loader2, Save } from 'lucide-react';

import type { Routine, Exercise } from '../types';

interface RoutinesProps {
  startActiveWorkout: (routine: Routine) => void;
}

export const Routines: React.FC<RoutinesProps> = ({ startActiveWorkout }) => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  const [isBuilding, setIsBuilding] = useState(false);
  const [routineName, setRoutineName] = useState('');
  const [routineDesc, setRoutineDesc] = useState('');
  const [builderExercises, setBuilderExercises] = useState<Array<{
    exerciseId: string;
    sets: number;
    reps: number;
    weight: number;
  }>>([]);
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchRoutines = async () => {
    setLoading(true);
    try {
      const res = await api.get('/workouts/routines');
      setRoutines(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExercises = async () => {
    try {
      const res = await api.get('/exercises');
      setExercises(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRoutines();
    fetchExercises();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this routine?')) return;
    try {
      await api.delete(`/workouts/routines/${id}`);
      fetchRoutines();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddExerciseToBuilder = () => {
    if (exercises.length === 0) return;
    setBuilderExercises([
      ...builderExercises,
      { exerciseId: exercises[0].id, sets: 3, reps: 10, weight: 20 },
    ]);
  };

  const handleRemoveExerciseFromBuilder = (index: number) => {
    setBuilderExercises(builderExercises.filter((_, i) => i !== index));
  };

  const handleBuilderExerciseChange = (index: number, field: string, value: any) => {
    const updated = [...builderExercises];
    updated[index] = { ...updated[index], [field]: value };
    setBuilderExercises(updated);
  };

  const handleSaveRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routineName.trim()) return;
    if (builderExercises.length === 0) {
      alert('Please add at least one exercise to the routine.');
      return;
    }

    setSaveLoading(true);
    try {
      await api.post('/workouts/routines', {
        name: routineName,
        description: routineDesc,
        exercises: builderExercises.map((be, index) => ({
          exerciseId: be.exerciseId,
          order: index,
          sets: Number(be.sets),
          reps: Number(be.reps),
          weight: Number(be.weight),
        })),
      });
      setIsBuilding(false);
      setRoutineName('');
      setRoutineDesc('');
      setBuilderExercises([]);
      fetchRoutines();
    } catch (err) {
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (isBuilding) {
    return (
      <div className="flex-1 p-6 md:p-10 overflow-y-auto pb-24 md:pb-10 max-w-4xl mx-auto w-full">
        <button
          onClick={() => setIsBuilding(false)}
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm font-semibold transition-all cursor-pointer min-h-[48px] px-2"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
          Back to Routines
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Routine Builder</h1>
          <p className="text-zinc-400 text-sm mt-1">Design a customized workout routine template</p>
        </div>

        <form onSubmit={handleSaveRoutine} className="flex flex-col gap-6 font-sans">
          <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400">Routine Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Pull Day, Legs A, Upper Body"
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white min-h-[48px]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400">Description (Optional)</label>
              <textarea
                placeholder="Focus on compound pulling movements..."
                value={routineDesc}
                onChange={(e) => setRoutineDesc(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white min-h-[80px]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Routine Exercises</h2>
              <button
                type="button"
                onClick={handleAddExerciseToBuilder}
                className="flex items-center gap-1.5 px-4 py-2 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-xl text-xs font-semibold transition-all min-h-[48px] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Exercise
              </button>
            </div>

            {builderExercises.length === 0 ? (
              <div className="text-center py-12 border border-zinc-800 border-dashed rounded-2xl p-6 bg-zinc-900/10">
                <Dumbbell className="w-8 h-8 text-zinc-700 mb-2 mx-auto" />
                <p className="text-zinc-400 text-xs">Add an exercise using the button above to begin layout</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {builderExercises.map((be, index) => (
                  <div
                    key={index}
                    className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
                  >
                    <div className="flex items-center gap-3 w-full md:w-1/3">
                      <span className="bg-zinc-800 text-zinc-400 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0">
                        {index + 1}
                      </span>
                      <select
                        value={be.exerciseId}
                        onChange={(e) => handleBuilderExerciseChange(index, 'exerciseId', e.target.value)}
                        className="bg-zinc-800 border border-zinc-700 text-xs text-white rounded-xl p-3 focus:outline-none focus:border-emerald-500 w-full min-h-[48px] cursor-pointer"
                      >
                        {exercises.map((ex) => (
                          <option key={ex.id} value={ex.id} className="bg-zinc-900 text-white">
                            {ex.name} ({ex.muscleGroup})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-3 items-center w-full md:w-auto">
                      <div className="flex flex-col gap-1 items-center">
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold">Sets</span>
                        <input
                          type="number"
                          min={1}
                          required
                          value={be.sets}
                          onChange={(e) => handleBuilderExerciseChange(index, 'sets', Number(e.target.value))}
                          className="bg-zinc-800 border border-zinc-700 text-center w-14 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500 min-h-[38px]"
                        />
                      </div>

                      <div className="flex flex-col gap-1 items-center">
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold">Reps</span>
                        <input
                          type="number"
                          min={1}
                          required
                          value={be.reps}
                          onChange={(e) => handleBuilderExerciseChange(index, 'reps', Number(e.target.value))}
                          className="bg-zinc-800 border border-zinc-700 text-center w-14 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500 min-h-[38px]"
                        />
                      </div>

                      <div className="flex flex-col gap-1 items-center">
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold">Weight (kg)</span>
                        <input
                          type="number"
                          min={0}
                          required
                          value={be.weight}
                          onChange={(e) => handleBuilderExerciseChange(index, 'weight', Number(e.target.value))}
                          className="bg-zinc-800 border border-zinc-700 text-center w-16 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500 min-h-[38px]"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveExerciseFromBuilder(index)}
                      className="p-3 bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-all self-end md:self-auto cursor-pointer min-h-[48px] min-w-[48px] flex items-center justify-center"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saveLoading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 mt-4 min-h-[48px] cursor-pointer"
          >
            {saveLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4.5 h-4.5" />}
            Save Routine
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-10 overflow-y-auto pb-24 md:pb-10 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Workout Routines</h1>
          <p className="text-zinc-400 text-sm mt-1">Launch an active session or build a new schedule</p>
        </div>

        <button
          onClick={() => setIsBuilding(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/10 transition-all min-h-[48px] cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
          Create Routine
        </button>
      </div>

      {routines.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 border border-zinc-800 border-dashed rounded-3xl p-6 bg-zinc-900/10 max-w-xl mx-auto">
          <ClipboardList className="w-10 h-10 text-zinc-650 mb-3" />
          <h3 className="font-semibold text-lg">No routines created yet</h3>
          <p className="text-zinc-550 text-xs mt-1 max-w-sm">
            Routines compile exercises to guide your training. Click the button above to build and save your first routine template (e.g. Pull Day).
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {routines.map((routine) => (
            <div
              key={routine.id}
              className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-zinc-700 transition-all duration-200"
            >
              <div>
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h3 className="font-bold text-lg text-white truncate">{routine.name}</h3>
                  <button
                    onClick={(e) => handleDelete(routine.id, e)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
                {routine.description && (
                  <p className="text-zinc-400 text-xs line-clamp-2 mb-4 leading-relaxed">{routine.description}</p>
                )}

                <div className="flex flex-col gap-2 mt-2 border-t border-zinc-800 pt-4 mb-6">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">Exercises ({routine.routineExercises.length})</span>
                  <div className="flex flex-wrap gap-1.5">
                    {routine.routineExercises.slice(0, 4).map((re) => (
                      <span key={re.id} className="bg-zinc-800 text-zinc-350 text-[10px] px-2.5 py-1 rounded-md border border-zinc-800">
                        {re.exercise.name} ({re.sets}x{re.reps})
                      </span>
                    ))}
                    {routine.routineExercises.length > 4 && (
                      <span className="bg-zinc-800 text-zinc-400 text-[10px] px-2 py-0.5 rounded-md border border-zinc-800">
                        +{routine.routineExercises.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => startActiveWorkout(routine)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Workout
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
