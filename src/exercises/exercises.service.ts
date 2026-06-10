import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExerciseDto, MuscleGroup } from './dto/create-exercise.dto';

@Injectable()
export class ExercisesService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string, muscleGroup?: MuscleGroup) {
    const where: any = {};

    if (search) {
      where.name = { contains: search };
    }

    if (muscleGroup) {
      where.muscleGroup = muscleGroup;
    }

    return this.prisma.exercise.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }

    return exercise;
  }

  async create(createExerciseDto: CreateExerciseDto) {
    const { name, muscleGroup, equipmentType, defaultRestPeriod } = createExerciseDto;

    const existing = await this.prisma.exercise.findUnique({
      where: { name },
    });

    if (existing) {
      throw new ConflictException(`Exercise with name "${name}" already exists`);
    }

    return this.prisma.exercise.create({
      data: {
        name,
        muscleGroup,
        equipmentType,
        defaultRestPeriod,
      },
    });
  }

  async seed() {
    const defaultExercises = [
      { name: 'Bench Press', muscleGroup: MuscleGroup.Chest, equipmentType: 'Barbell', defaultRestPeriod: 90 },
      { name: 'Incline Dumbbell Press', muscleGroup: MuscleGroup.Chest, equipmentType: 'Dumbbell', defaultRestPeriod: 90 },
      { name: 'Squat', muscleGroup: MuscleGroup.Legs, equipmentType: 'Barbell', defaultRestPeriod: 120 },
      { name: 'Deadlift', muscleGroup: MuscleGroup.Back, equipmentType: 'Barbell', defaultRestPeriod: 120 },
      { name: 'Pull Up', muscleGroup: MuscleGroup.Back, equipmentType: 'Bodyweight', defaultRestPeriod: 90 },
      { name: 'Barbell Row', muscleGroup: MuscleGroup.Back, equipmentType: 'Barbell', defaultRestPeriod: 90 },
      { name: 'Overhead Press', muscleGroup: MuscleGroup.Shoulders, equipmentType: 'Barbell', defaultRestPeriod: 90 },
      { name: 'Lateral Raise', muscleGroup: MuscleGroup.Shoulders, equipmentType: 'Dumbbell', defaultRestPeriod: 60 },
      { name: 'Bicep Curl', muscleGroup: MuscleGroup.Arms, equipmentType: 'Dumbbell', defaultRestPeriod: 60 },
      { name: 'Tricep Pushdown', muscleGroup: MuscleGroup.Arms, equipmentType: 'Cables', defaultRestPeriod: 60 },
      { name: 'Plank', muscleGroup: MuscleGroup.Core, equipmentType: 'Bodyweight', defaultRestPeriod: 60 },
      { name: 'Hanging Leg Raise', muscleGroup: MuscleGroup.Core, equipmentType: 'Bodyweight', defaultRestPeriod: 60 },
      { name: 'Treadmill Run', muscleGroup: MuscleGroup.Cardio, equipmentType: 'Machine', defaultRestPeriod: 0 },
    ];

    let seededCount = 0;
    for (const ex of defaultExercises) {
      const existing = await this.prisma.exercise.findUnique({
        where: { name: ex.name },
      });
      if (!existing) {
        await this.prisma.exercise.create({ data: ex });
        seededCount++;
      }
    }
    return { message: `Seeded ${seededCount} exercises`, total: defaultExercises.length };
  }
}
