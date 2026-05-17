import { Module } from '@nestjs/common';
import { AgentService } from './application/agent.service';
import { ConversationsModule } from '../conversations/conversations.module';
import { UsersModule } from '../users/users.module';
import { DailyGoalsModule } from '../daily-goals/daily-goals.module';
import { ProgressModule } from '../progress/progress.module';
import { ExercisesModule } from '../exercises/exercises.module';
import { VocabulariesModule } from '../vocabularies/vocabularies.module';
import { CoursesModule } from '../courses/courses.module';
import { EchoTool } from './tools/echo.tool';
import { GetUserSummaryTool } from './tools/get-user-summary.tool';
import { GetProgressOverviewTool } from './tools/get-progress-overview.tool';
import { ListRecentExerciseResultsTool } from './tools/list-recent-exercise-results.tool';
import { ListBookmarksTool } from './tools/list-bookmarks.tool';
import { ToggleBookmarkTool } from './tools/toggle-bookmark.tool';
import { SearchVocabularyTool } from './tools/search-vocabulary.tool';
import { SearchGrammarRulesTool } from './tools/search-grammar-rules.tool';
import { FindLessonsTool } from './tools/find-lessons.tool';
import { GetLessonDetailTool } from './tools/get-lesson-detail.tool';
import { ProposeCreateDailyGoalTool } from './tools/propose-create-daily-goal.tool';
import { ProposeUpdateDailyGoalTool } from './tools/propose-update-daily-goal.tool';
import { ProposeGenerateCustomExerciseSetTool } from './tools/propose-generate-custom-exercise-set.tool';

@Module({
  imports: [
    ConversationsModule,
    UsersModule,
    DailyGoalsModule,
    ProgressModule,
    ExercisesModule,
    VocabulariesModule,
    CoursesModule,
  ],
  providers: [
    AgentService,
    EchoTool,
    GetUserSummaryTool,
    GetProgressOverviewTool,
    ListRecentExerciseResultsTool,
    ListBookmarksTool,
    ToggleBookmarkTool,
    SearchVocabularyTool,
    SearchGrammarRulesTool,
    FindLessonsTool,
    GetLessonDetailTool,
    ProposeCreateDailyGoalTool,
    ProposeUpdateDailyGoalTool,
    ProposeGenerateCustomExerciseSetTool,
    {
      provide: 'TOOLS',
      useFactory: (
        echoTool: EchoTool,
        getUserSummaryTool: GetUserSummaryTool,
        getProgressOverviewTool: GetProgressOverviewTool,
        listRecentExerciseResultsTool: ListRecentExerciseResultsTool,
        listBookmarksTool: ListBookmarksTool,
        toggleBookmarkTool: ToggleBookmarkTool,
        searchVocabularyTool: SearchVocabularyTool,
        searchGrammarRulesTool: SearchGrammarRulesTool,
        findLessonsTool: FindLessonsTool,
        getLessonDetailTool: GetLessonDetailTool,
        proposeCreateDailyGoalTool: ProposeCreateDailyGoalTool,
        proposeUpdateDailyGoalTool: ProposeUpdateDailyGoalTool,
        proposeGenerateCustomExerciseSetTool: ProposeGenerateCustomExerciseSetTool,
      ) => [
        echoTool,
        getUserSummaryTool,
        getProgressOverviewTool,
        listRecentExerciseResultsTool,
        listBookmarksTool,
        toggleBookmarkTool,
        searchVocabularyTool,
        searchGrammarRulesTool,
        findLessonsTool,
        getLessonDetailTool,
        proposeCreateDailyGoalTool,
        proposeUpdateDailyGoalTool,
        proposeGenerateCustomExerciseSetTool,
      ],
      inject: [
        EchoTool,
        GetUserSummaryTool,
        GetProgressOverviewTool,
        ListRecentExerciseResultsTool,
        ListBookmarksTool,
        ToggleBookmarkTool,
        SearchVocabularyTool,
        SearchGrammarRulesTool,
        FindLessonsTool,
        GetLessonDetailTool,
        ProposeCreateDailyGoalTool,
        ProposeUpdateDailyGoalTool,
        ProposeGenerateCustomExerciseSetTool,
      ],
    },
  ],
  exports: [AgentService],
})
export class AgentModule {}
