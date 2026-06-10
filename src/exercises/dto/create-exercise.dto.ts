import { IsEnum, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export enum MuscleGroup {
  Arms = 'Arms',
  Back = 'Back',
  Legs = 'Legs',
  Chest = 'Chest',
  Shoulders = 'Shoulders',
  Core = 'Core',
  Cardio = 'Cardio',
  FullBody = 'FullBody',
}

export class CreateExerciseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(MuscleGroup)
  muscleGroup: MuscleGroup;

  @IsString()
  @IsNotEmpty()
  equipmentType: string;

  @IsInt()
  @Min(0)
  defaultRestPeriod: number;
}
