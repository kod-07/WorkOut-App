import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { CreateWorkoutLogDto } from './dto/create-workout-log.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@Controller('workouts')
@UseGuards(JwtAuthGuard)
export class WorkoutsController {
  constructor(private workoutsService: WorkoutsService) {}

  // --- Routines ---
  @Post('routines')
  createRoutine(
    @GetUser('id') userId: string,
    @Body() createRoutineDto: CreateRoutineDto,
  ) {
    return this.workoutsService.createRoutine(userId, createRoutineDto);
  }

  @Get('routines')
  findRoutines(@GetUser('id') userId: string) {
    return this.workoutsService.findRoutines(userId);
  }

  @Get('routines/:id')
  findRoutine(
    @GetUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.workoutsService.findRoutine(userId, id);
  }

  @Delete('routines/:id')
  deleteRoutine(
    @GetUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.workoutsService.deleteRoutine(userId, id);
  }

  // --- Logs ---
  @Post('logs')
  createWorkoutLog(
    @GetUser('id') userId: string,
    @Body() createWorkoutLogDto: CreateWorkoutLogDto,
  ) {
    return this.workoutsService.createWorkoutLog(userId, createWorkoutLogDto);
  }

  @Get('logs')
  findWorkoutLogs(@GetUser('id') userId: string) {
    return this.workoutsService.findWorkoutLogs(userId);
  }

  @Get('logs/:id')
  findWorkoutLog(
    @GetUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.workoutsService.findWorkoutLog(userId, id);
  }

  @Delete('logs/:id')
  deleteWorkoutLog(
    @GetUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.workoutsService.deleteWorkoutLog(userId, id);
  }
}
