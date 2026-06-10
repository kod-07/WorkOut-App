import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboardStats(@GetUser('id') userId: string) {
    return this.analyticsService.getDashboardStats(userId);
  }

  @Get('1rm')
  getOneRepMaxHistory(
    @GetUser('id') userId: string,
    @Query('exerciseId') exerciseId: string,
    @Query('days') days?: string,
  ) {
    const parsedDays = days ? parseInt(days, 10) : 30;
    return this.analyticsService.getOneRepMaxHistory(userId, exerciseId, parsedDays);
  }
}
