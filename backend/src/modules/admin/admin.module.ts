import { Module } from '@nestjs/common';
import { AdminController } from './presentation/admin.controller';
import { AdminDashboardService } from './application/admin-dashboard.service';
import { UsersModule } from '../users/users.module';
import { CoursesModule } from '../courses/courses.module';
import { ExercisesModule } from '../exercises/exercises.module';
import { UsersService } from '../users/application/users.service';
import { CourseContentService } from '../courses/application/course-content.service';
import { ExercisesService } from '../exercises/application/exercises.service';
import {
  USER_STATS_PORT,
  COURSE_STATS_PORT,
  EXERCISE_STATS_PORT,
} from './application/ports/dashboard-stats.ports';

@Module({
  imports: [UsersModule, CoursesModule, ExercisesModule],
  controllers: [AdminController],
  providers: [
    AdminDashboardService,
    {
      provide: USER_STATS_PORT,
      useExisting: UsersService,
    },
    {
      provide: COURSE_STATS_PORT,
      useExisting: CourseContentService,
    },
    {
      provide: EXERCISE_STATS_PORT,
      useExisting: ExercisesService,
    },
  ],
  exports: [AdminDashboardService],
})
export class AdminModule {}
