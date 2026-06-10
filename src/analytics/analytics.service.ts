import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(userId: string) {
    const logs = await this.prisma.workoutLog.findMany({
      where: { userId },
      include: {
        setLogs: {
          include: {
            exercise: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    const muscleGroupDist: Record<string, number> = {
      Arms: 0,
      Back: 0,
      Legs: 0,
      Chest: 0,
      Shoulders: 0,
      Core: 0,
      Cardio: 0,
      FullBody: 0,
    };

    let totalVolume = 0;
    const volumeOverTime = logs.map((log) => {
      let logVolume = 0;
      log.setLogs.forEach((set) => {
        if (set.isCompleted) {
          const setVolume = set.weight * set.reps;
          logVolume += setVolume;
          
          const muscle = set.exercise.muscleGroup;
          if (muscle in muscleGroupDist) {
            muscleGroupDist[muscle] += 1;
          }
        }
      });
      totalVolume += logVolume;
      return {
        date: log.startTime.toISOString().split('T')[0],
        volume: logVolume,
        name: log.notes || 'Workout',
      };
    });

    const frequencyByWeek: Record<string, number> = {};
    logs.forEach((log) => {
      const date = new Date(log.startTime);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const startOfWeek = new Date(date.setDate(diff)).toISOString().split('T')[0];
      
      frequencyByWeek[startOfWeek] = (frequencyByWeek[startOfWeek] || 0) + 1;
    });

    const frequencyData = Object.entries(frequencyByWeek).map(([week, count]) => ({
      week,
      count,
    }));

    const muscleData = Object.entries(muscleGroupDist).map(([subject, A]) => ({
      subject,
      A,
      fullMark: Math.max(...Object.values(muscleGroupDist), 10),
    }));

    return {
      totalWorkouts: logs.length,
      totalVolume,
      volumeOverTime: volumeOverTime.slice(-10),
      frequencyData,
      muscleData,
    };
  }

  async getOneRepMaxHistory(userId: string, exerciseId: string, days: number = 30) {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new NotFoundException(`Exercise not found`);
    }

    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    const setLogs = await this.prisma.setLog.findMany({
      where: {
        exerciseId,
        isCompleted: true,
        workoutLog: {
          userId,
          startTime: {
            gte: dateLimit,
          },
        },
      },
      include: {
        workoutLog: true,
      },
      orderBy: {
        workoutLog: {
          startTime: 'asc',
        },
      },
    });

    const dailyMaxes: Record<string, number> = {};

    setLogs.forEach((set) => {
      const dateStr = set.workoutLog.startTime.toISOString().split('T')[0];
      const oneRepMax = set.reps === 1 ? set.weight : set.weight * (1 + set.reps / 30);
      const rounded1RM = Math.round(oneRepMax * 10) / 10;

      if (!dailyMaxes[dateStr] || rounded1RM > dailyMaxes[dateStr]) {
        dailyMaxes[dateStr] = rounded1RM;
      }
    });

    const history = Object.entries(dailyMaxes).map(([date, oneRepMax]) => ({
      date,
      oneRepMax,
    }));

    return {
      exerciseName: exercise.name,
      history,
    };
  }
}
