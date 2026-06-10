import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    if (process.env.RESET_DB === 'true') {
      console.log('RESET_DB environment variable is set to true. Resetting database...');
      try {
        await this.$transaction([
          this.setLog.deleteMany(),
          this.workoutLog.deleteMany(),
          this.routineExercise.deleteMany(),
          this.workoutRoutine.deleteMany(),
          this.user.deleteMany(),
          this.exercise.deleteMany(),
        ]);
        console.log('All database tables cleared successfully.');

        const defaultExercises = [
          { name: 'Bench Press', muscleGroup: 'Chest', equipmentType: 'Barbell', defaultRestPeriod: 90 },
          { name: 'Incline Dumbbell Press', muscleGroup: 'Chest', equipmentType: 'Dumbbell', defaultRestPeriod: 90 },
          { name: 'Squat', muscleGroup: 'Legs', equipmentType: 'Barbell', defaultRestPeriod: 120 },
          { name: 'Deadlift', muscleGroup: 'Back', equipmentType: 'Barbell', defaultRestPeriod: 120 },
          { name: 'Pull Up', muscleGroup: 'Back', equipmentType: 'Bodyweight', defaultRestPeriod: 90 },
          { name: 'Barbell Row', muscleGroup: 'Back', equipmentType: 'Barbell', defaultRestPeriod: 90 },
          { name: 'Overhead Press', muscleGroup: 'Shoulders', equipmentType: 'Barbell', defaultRestPeriod: 90 },
          { name: 'Lateral Raise', muscleGroup: 'Shoulders', equipmentType: 'Dumbbell', defaultRestPeriod: 60 },
          { name: 'Bicep Curl', muscleGroup: 'Arms', equipmentType: 'Dumbbell', defaultRestPeriod: 60 },
          { name: 'Tricep Pushdown', muscleGroup: 'Arms', equipmentType: 'Cables', defaultRestPeriod: 60 },
          { name: 'Plank', muscleGroup: 'Core', equipmentType: 'Bodyweight', defaultRestPeriod: 60 },
          { name: 'Hanging Leg Raise', muscleGroup: 'Core', equipmentType: 'Bodyweight', defaultRestPeriod: 60 },
          { name: 'Treadmill Run', muscleGroup: 'Cardio', equipmentType: 'Machine', defaultRestPeriod: 0 },
        ];

        for (const ex of defaultExercises) {
          await this.exercise.create({ data: ex });
        }
        console.log('Database seeded with default exercises.');
      } catch (err) {
        console.error('Failed to reset/seed database:', err);
      }
    }

    // Auto-create a test user if no users exist
    try {
      const userCount = await this.user.count();
      if (userCount === 0) {
        const passwordHash = await bcryptjs.hash('password123', 10);
        await this.user.create({
          data: {
            email: 'test@example.com',
            passwordHash,
          },
        });
        console.log('Default test user (test@example.com / password123) created.');
      }
    } catch (err) {
      console.error('Failed to auto-create test user:', err);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
