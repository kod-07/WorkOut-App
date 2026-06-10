import React, { useState, useEffect } from 'react';
import api from '../api';
import { Search, Plus, Dumbbell, Sparkles, Loader2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipmentType: string;
  defaultRestPeriod: number;
}

const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Arms', 'Shoulders', 'Core', 'Cardio', 'FullBody'];

export const Exercises: React.FC = () => {
  const { token } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('');
  const [seeding, setSeeding] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('Chest');
  const [equipmentType, setEquipmentType] = useState('Barbell');
  const [defaultRestPeriod, setDefaultRestPeriod] = useState(60);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const res = await api.get('/exercises', {
        params: {
          search: search || undefined,
          muscleGroup: selectedMuscle || undefined,
        },
      });
      setExercises(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExercises();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedMuscle]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await api.get('/exercises/seed');
      await fetchExercises();
    } catch (err) {
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);
    try {
      await api.post('/exercises', {
        name,
        muscleGroup,
        equipmentType,
        defaultRestPeriod: Number(defaultRestPeriod),
      });
      setShowAddModal(false);
      setName('');
      setDefaultRestPeriod(60);
      fetchExercises();
    } catch (err: any) {
      setAddError(err.response?.data?.message || 'Failed to add exercise');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-10 overflow-y-auto pb-24 md:pb-10 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Exercise Library</h1>
          <p className="text-zinc-400 text-sm mt-1">Browse, search, and manage exercises</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold transition-all min-h-[48px] cursor-pointer"
          >
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-emerald-400" />}
            Auto Seed Defaults
          </button>
          {token && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/10 transition-all min-h-[48px] cursor-pointer"
            >
              <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
              New Exercise
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white min-h-[48px]"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedMuscle('')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap min-h-[48px] cursor-pointer transition-all ${
              selectedMuscle === ''
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Muscles
          </button>
          {MUSCLE_GROUPS.map((group) => (
            <button
              key={group}
              onClick={() => setSelectedMuscle(group)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap min-h-[48px] cursor-pointer transition-all ${
                selectedMuscle === group
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : exercises.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 border border-zinc-800 border-dashed rounded-3xl p-6 bg-zinc-900/10">
          <Dumbbell className="w-10 h-10 text-zinc-650 mb-3" />
          <h3 className="font-semibold text-lg">No exercises found</h3>
          <p className="text-zinc-500 text-xs mt-1 max-w-sm">
            Try adjusting your search criteria, or click "Auto Seed Defaults" above to quickly populate typical compound movements.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map((ex) => (
            <div
              key={ex.id}
              className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl flex flex-col justify-between hover:border-zinc-700 transition-all duration-205 group"
            >
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{ex.name}</h3>
                  <span className="bg-zinc-800 text-zinc-300 text-[10px] font-semibold px-2 py-1 rounded-md border border-zinc-800">
                    {ex.equipmentType}
                  </span>
                </div>
                <div className="flex gap-2 mt-1">
                  <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/10">
                    {ex.muscleGroup}
                  </span>
                </div>
              </div>
              <div className="text-[10px] text-zinc-500 mt-4 flex items-center justify-between border-t border-zinc-800 pt-3">
                <span>Default Rest Period</span>
                <span className="font-semibold text-zinc-350">{ex.defaultRestPeriod}s</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-200 p-1.5 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold mb-4">Add Custom Exercise</h3>

            {addError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-4">
                {addError}
              </div>
            )}

            <form onSubmit={handleAddExercise} className="flex flex-col gap-4 font-sans">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400">Exercise Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Incline Bench Press"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white min-h-[48px]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400">Muscle Group</label>
                <select
                  value={muscleGroup}
                  onChange={(e) => setMuscleGroup(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white min-h-[48px] cursor-pointer"
                >
                  {MUSCLE_GROUPS.map((group) => (
                    <option key={group} value={group} className="bg-zinc-900 text-white">
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400">Equipment Type</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Barbell, Dumbbell, Cables"
                  value={equipmentType}
                  onChange={(e) => setEquipmentType(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white min-h-[48px]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400">Default Rest Period (seconds)</label>
                <input
                  type="number"
                  required
                  min={0}
                  placeholder="60"
                  value={defaultRestPeriod}
                  onChange={(e) => setDefaultRestPeriod(Number(e.target.value))}
                  className="bg-zinc-800 border border-zinc-700 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white min-h-[48px]"
                />
              </div>

              <button
                type="submit"
                disabled={addLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-2 min-h-[48px] cursor-pointer"
              >
                {addLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Exercise'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
