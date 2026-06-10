import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { CreateWorkoutLogDto } from './dto/create-workout-log.dto';

@Injectable()
export class WorkoutsService {
  constructor(private prisma: PrismaService) {}

  // --- Routine Builder ---
  async createRoutine(userId: string, createRoutineDto: CreateRoutineDto) {
    const { name, description, exercises } = createRoutineDto;

    return this.prisma.workoutRoutine.create({
      data: {
        userId,
        name,
        description,
        routineExercises: {
          create: exercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            order: ex.order,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight || 0,
          })),
        },
      },
      include: {
        routineExercises: {
          include: {
            exercise: true,
          },
        },
      },
    });
  }

  async findRoutines(userId: string) {
    return this.prisma.workoutRoutine.findMany({
      where: { userId },
      include: {
        routineExercises: {
          include: {
            exercise: true,
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findRoutine(userId: string, id: string) {
    const routine = await this.prisma.workoutRoutine.findFirst({
      where: { id, userId },
      include: {
        routineExercises: {
          include: {
            exercise: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!routine) {
      throw new NotFoundException(`Workout routine not found`);
    }

    return routine;
  }

  async deleteRoutine(userId: string, id: string) {
    const routine = await this.findRoutine(userId, id);
    return this.prisma.workoutRoutine.delete({
      where: { id: routine.id },
    });
  }

  // --- Workout Logging ---
  async createWorkoutLog(userId: string, createWorkoutLogDto: CreateWorkoutLogDto) {
    const { routineId, startTime, endTime, notes, setLogs } = createWorkoutLogDto;

    return this.prisma.workoutLog.create({
      data: {
        userId,
        routineId: routineId || null,
        startTime: startTime ? new Date(startTime) : new Date(),
        endTime: endTime ? new Date(endTime) : new Date(),
        notes,
        setLogs: {
          create: setLogs.map((set) => ({
            exerciseId: set.exerciseId,
            setNumber: set.setNumber,
            weight: set.weight,
            reps: set.reps,
            isCompleted: set.isCompleted ?? true,
          })),
        },
      },
      include: {
        setLogs: {
          include: {
            exercise: true,
          },
        },
        routine: true,
      },
    });
  }

  async findWorkoutLogs(userId: string) {
    return this.prisma.workoutLog.findMany({
      where: { userId },
      include: {
        setLogs: {
          include: {
            exercise: true,
          },
          orderBy: [{ exerciseId: 'asc' }, { setNumber: 'asc' }],
        },
        routine: true,
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async findWorkoutLog(userId: string, id: string) {
    const log = await this.prisma.workoutLog.findFirst({
      where: { id, userId },
      include: {
        setLogs: {
          include: {
            exercise: true,
          },
          orderBy: [{ exerciseId: 'asc' }, { setNumber: 'asc' }],
        },
        routine: true,
      },
    });

    if (!log) {
      throw new NotFoundException(`Workout log not found`);
    }

    return log;
  }

  async deleteWorkoutLog(userId: string, id: string) {
    const log = await this.findWorkoutLog(userId, id);
    return this.prisma.workoutLog.delete({
      where: { id: log.id },
    });
  }
}
