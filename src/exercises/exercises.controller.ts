import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto, MuscleGroup } from './dto/create-exercise.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('exercises')
export class ExercisesController {
  constructor(private exercisesService: ExercisesService) {}

  @Get('seed')
  seed() {
    return this.exercisesService.seed();
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('muscleGroup') muscleGroup?: MuscleGroup,
  ) {
    return this.exercisesService.findAll(search, muscleGroup);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exercisesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createExerciseDto: CreateExerciseDto) {
    return this.exercisesService.create(createExerciseDto);
  }
}
