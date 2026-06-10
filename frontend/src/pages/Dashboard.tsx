import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Dumbbell, Calendar, Flame, TrendingUp, Loader2, ArrowRight } from 'lucide-react';

interface DashboardStats {
  totalWorkouts: number;
  totalVolume: number;
  volumeOverTime: Array<{ date: string; volume: number; name: string }>;
  frequencyData: Array<{ week: string; count: number }>;
  muscleData: Array<{ subject: string; A: number; fullMark: number }>;
}

interface OneRepMaxHistory {
  exerciseName: string;
  history: Array<{ date: string; oneRepMax: number }>;
}

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
}

export const Dashboard: React.FC<{ setPage: (page: string) => void }> = ({ setPage }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [timeRange, setTimeRange] = useState<number>(30);
  const [oneRepMax, setOneRepMax] = useState<OneRepMaxHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [loading1RM, setLoading1RM] = useState(false);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/analytics/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching dashboard stats', err);
    }
  };

  const fetchExercises = async () => {
    try {
      const res = await api.get('/exercises');
      setExercises(res.data);
      const compound = res.data.find(
        (e: Exercise) =>
          e.name.includes('Press') ||
          e.name.includes('Squat') ||
          e.name.includes('Deadlift') ||
          e.name.includes('Row')
      );
      if (compound) {
        setSelectedExerciseId(compound.id);
      } else if (res.data.length > 0) {
        setSelectedExerciseId(res.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching exercises', err);
    }
  };

  const fetchOneRepMax = async () => {
    if (!selectedExerciseId) return;
    setLoading1RM(true);
    try {
      const res = await api.get(`/analytics/1rm`, {
        params: { exerciseId: selectedExerciseId, days: timeRange },
      });
      setOneRepMax(res.data);
    } catch (err) {
      console.error('Error fetching 1RM history', err);
    } finally {
      setLoading1RM(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchDashboardStats(), fetchExercises()]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedExerciseId) {
      fetchOneRepMax();
    }
  }, [selectedExerciseId, timeRange]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!stats || stats.totalWorkouts === 0) {
    return (
      <div className="flex-1 p-6 md:p-10 flex flex-col justify-center items-center text-center gap-6 max-w-2xl mx-auto min-h-[80vh]">
        <div className="p-5 bg-emerald-500/10 rounded-full text-emerald-500 border border-emerald-500/20">
          <Dumbbell className="w-12 h-12" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">No Workouts Logged Yet</h2>
          <p className="text-zinc-400">
            Welcome to FlexFlow! Start by seeding default exercises, setting up a workout routine, and checking off your first session to view advanced analytics, radar distributions, and 1RM metrics.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <button
            onClick={() => setPage('exercises')}
            className="px-6 py-3.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-xl text-sm font-semibold transition-all cursor-pointer min-h-[48px]"
          >
            Browse Exercise Library
          </button>
          <button
            onClick={() => setPage('routines')}
            className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/10 flex items-center gap-2 justify-center transition-all cursor-pointer min-h-[48px]"
          >
            Create Your First Routine
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-10 overflow-y-auto pb-24 md:pb-10 max-w-7xl mx-auto w-full">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Fitness Dashboard</h1>
          <p className="text-zinc-400 text-sm mt-1">Real-time statistics & visual progress trackers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Workouts</p>
            <p className="text-2xl font-bold mt-0.5">{stats.totalWorkouts}</p>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Volume Lifted</p>
            <p className="text-2xl font-bold mt-0.5">{stats.totalVolume.toLocaleString()} kg</p>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl flex items-center gap-4 sm:col-span-2 lg:col-span-1">
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Frequency (This Week)</p>
            <p className="text-2xl font-bold mt-0.5">
              {stats.frequencyData.length > 0 ? stats.frequencyData[stats.frequencyData.length - 1].count : 0} workouts
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        <div className="lg:col-span-8 bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl flex flex-col gap-4">
          <div>
            <h3 className="font-bold text-base">Training Volume Trend</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Total weight lifted per workout (last 10 sessions)</p>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.volumeOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#fff' }}
                />
                <Area type="monotone" dataKey="volume" name="Volume (kg)" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVolume)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl flex flex-col gap-4">
          <div>
            <h3 className="font-bold text-base">Target Distribution</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Focus split by volume/sets across muscle groups</p>
          </div>
          <div className="h-[280px] w-full flex items-center justify-center">
            {stats.muscleData.every((d) => d.A === 0) ? (
              <p className="text-zinc-500 text-xs">Complete sets to see split</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={stats.muscleData}>
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis dataKey="subject" stroke="#a1a1aa" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="#52525b" fontSize={9} />
                  <Radar name="Sets Logged" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base">1-Rep Max (1RM) Trend</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Calculated historical strength curves (Epley Formula)</p>
            </div>
            
            <div className="flex items-center gap-3 font-sans">
              <select
                value={selectedExerciseId}
                onChange={(e) => setSelectedExerciseId(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-emerald-500 min-h-[38px] cursor-pointer"
              >
                {exercises.map((ex) => (
                  <option key={ex.id} value={ex.id} className="bg-zinc-900 text-white">
                    {ex.name}
                  </option>
                ))}
              </select>

              <div className="flex bg-zinc-800 p-0.5 rounded-lg border border-zinc-700">
                {[7, 30, 90].map((days) => (
                  <button
                    key={days}
                    onClick={() => setTimeRange(days)}
                    className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
                      timeRange === days ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {days}D
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-[280px] w-full relative">
            {loading1RM ? (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/20 backdrop-blur-[1px]">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              </div>
            ) : null}

            {!oneRepMax || oneRepMax.history.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-zinc-500 text-xs">No completed set logs found for this exercise within {timeRange} days.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={oneRepMax.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="oneRepMax" name="Estimated 1RM (kg)" stroke="#10b981" strokeWidth={2.5} activeDot={{ r: 6 }} dot={{ strokeWidth: 2, r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl flex flex-col gap-4">
          <div>
            <h3 className="font-bold text-base">Weekly Frequency</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Number of training sessions logged per calendar week</p>
          </div>
          <div className="h-[280px] w-full">
            {stats.frequencyData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-zinc-500 text-xs">No data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.frequencyData} margin={{ top: 10, right: 0, left: -30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="week" stroke="#71717a" fontSize={9} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} allowDecimals={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#fff' }}
                  />
                  <Bar dataKey="count" name="Workouts" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
