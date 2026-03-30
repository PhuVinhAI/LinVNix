# LinVNix Backend Architecture

## Tổng quan

Backend được xây dựng theo **Clean Architecture** và **Domain-Driven Design** với NestJS, PostgreSQL, và Redis.

## Cấu trúc dự án

```
backend/src/
├── main.ts                          # Entry point
├── app.module.ts                    # Root module
│
├── config/                          # Configuration layer
│   ├── app.config.ts               # App settings
│   ├── database.config.ts          # Database config
│   └── jwt.config.ts               # JWT config
│
├── common/                          # Shared kernel
│   ├── decorators/                 # @CurrentUser, @Public
│   ├── enums/                      # Shared enums
│   ├── filters/                    # Exception filters
│   ├── interceptors/               # Transform interceptor
│   ├── pipes/                      # Validation pipes
│   ├── interfaces/                 # Shared interfaces
│   ├── constants/                  # App constants
│   └── utils/                      # Helper functions
│
├── database/                        # Database layer
│   ├── base/                       # Base entity
│   ├── migrations/                 # TypeORM migrations
│   └── seeds/                      # Seed data
│
└── modules/                         # Feature modules
    ├── auth/                       # Authentication
    ├── users/                      # User management
    ├── courses/                    # Courses, Units, Lessons
    ├── contents/                   # Lesson contents
    ├── vocabularies/               # Vocabularies
    ├── grammar/                    # Grammar rules
    ├── exercises/                  # Exercises
    └── progress/                   # Progress tracking
```

## Design Patterns

### 1. Repository Pattern
Tách biệt data access logic khỏi business logic.

```typescript
// Repository
class UsersRepository {
  async findById(id: string): Promise<User | null>
  async create(data: Partial<User>): Promise<User>
}

// Service sử dụng Repository
class UsersService {
  constructor(private usersRepository: UsersRepository) {}
}
```

### 2. Service Layer Pattern
Business logic tập trung trong service layer.

```typescript
class ExercisesService {
  async submitAnswer(userId, exerciseId, answer) {
    // Business logic
    const exercise = await this.findById(exerciseId);
    const isCorrect = this.checker.checkAnswer(...);
    return this.saveResult(...);
  }
}
```

### 3. Strategy Pattern
Sử dụng cho exercise checking với nhiều loại bài tập khác nhau.

```typescript
class ExerciseCheckerService {
  checkAnswer(type: ExerciseType, userAnswer, correctAnswer) {
    switch (type) {
      case ExerciseType.MULTIPLE_CHOICE:
        return this.checkMultipleChoice(...);
      case ExerciseType.FILL_BLANK:
        return this.checkFillBlank(...);
      // ...
    }
  }
}
```

### 4. DTO Pattern
Data Transfer Objects cho validation và transformation.

```typescript
class RegisterDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
}
```

## Database Schema

### Core Entities

1. **Users** - Người dùng
2. **Courses** - Khóa học (A1-C2)
3. **Units** - Đơn vị học
4. **Lessons** - Bài học
5. **LessonContents** - Nội dung bài học
6. **Vocabularies** - Từ vựng
7. **UserVocabularies** - Từ vựng đã học (spaced repetition)
8. **GrammarRules** - Ngữ pháp
9. **Exercises** - Bài tập
10. **UserExerciseResults** - Kết quả bài tập
11. **UserProgress** - Tiến độ học

### Relationships

```
User 1---N UserProgress
User 1---N UserVocabulary
User 1---N UserExerciseResult

Course 1---N Unit
Unit 1---N Lesson
Lesson 1---N LessonContent
Lesson 1---N Vocabulary
Lesson 1---N GrammarRule
Lesson 1---N Exercise

Vocabulary 1---N UserVocabulary
Exercise 1---N UserExerciseResult
Lesson 1---N UserProgress
```

## Module Structure

Mỗi module tuân theo cấu trúc:

```
module/
├── module.module.ts              # Module definition
├── domain/                       # Entities
│   └── entity.entity.ts
├── application/                  # Business logic
│   ├── service.ts
│   └── repositories/
│       └── repository.ts
├── presentation/                 # Controllers
│   └── controller.ts
└── dto/                         # Data Transfer Objects
    ├── create.dto.ts
    └── update.dto.ts
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Đăng ký
- `POST /api/v1/auth/login` - Đăng nhập

### Users
- `GET /api/v1/users/me` - Profile
- `PATCH /api/v1/users/me` - Cập nhật profile

### Courses
- `GET /api/v1/courses` - Danh sách khóa học
- `GET /api/v1/courses/:id` - Chi tiết khóa học

### Units
- `GET /api/v1/units/course/:courseId` - Units theo course
- `GET /api/v1/units/:id` - Chi tiết unit

### Lessons
- `GET /api/v1/lessons/unit/:unitId` - Lessons theo unit
- `GET /api/v1/lessons/:id` - Chi tiết lesson

### Contents
- `GET /api/v1/contents/lesson/:lessonId` - Nội dung theo lesson

### Vocabularies
- `GET /api/v1/vocabularies/lesson/:lessonId` - Từ vựng theo lesson
- `POST /api/v1/vocabularies/:id/learn` - Thêm vào danh sách học
- `POST /api/v1/vocabularies/:id/review` - Ôn tập từ vựng
- `GET /api/v1/vocabularies/my-vocabularies` - Từ đã học
- `GET /api/v1/vocabularies/due-review` - Từ cần ôn

### Grammar
- `GET /api/v1/grammar/lesson/:lessonId` - Ngữ pháp theo lesson

### Exercises
- `GET /api/v1/exercises/lesson/:lessonId` - Bài tập theo lesson
- `POST /api/v1/exercises/:id/submit` - Nộp bài
- `GET /api/v1/exercises/my-results` - Kết quả của user
- `GET /api/v1/exercises/my-stats` - Thống kê

### Progress
- `GET /api/v1/progress` - Toàn bộ tiến độ
- `GET /api/v1/progress/lesson/:lessonId` - Tiến độ 1 lesson
- `POST /api/v1/progress/lesson/:lessonId/start` - Bắt đầu học
- `POST /api/v1/progress/lesson/:lessonId/complete` - Hoàn thành
- `PATCH /api/v1/progress/lesson/:lessonId/time` - Cập nhật thời gian

## Security

### Authentication
- JWT tokens với expiration
- Password hashing với bcrypt
- Bearer token authentication

### Authorization
- JWT Guard global
- @Public decorator cho public endpoints
- @CurrentUser decorator để lấy user hiện tại

### Rate Limiting
- Throttler guard: 10 requests/60s

### Validation
- class-validator cho DTOs
- Global validation pipe
- Transform interceptor

## Features

### Spaced Repetition
Thuật toán ôn tập từ vựng:
- Interval: 1, 3, 7, 14, 30 days
- Mastery levels: Learning, Familiar, Mastered
- Auto-schedule next review

### Exercise Checking
Hỗ trợ nhiều loại bài tập:
- Multiple choice
- Fill in the blank
- Matching
- Ordering
- Translation (với similarity check)
- Listening

### Progress Tracking
- Theo dõi status: not_started, in_progress, completed
- Lưu score, time spent
- Last accessed tracking

## Tech Stack

- **Framework**: NestJS 11
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **ORM**: TypeORM
- **Authentication**: JWT + Passport
- **Validation**: class-validator
- **Documentation**: Swagger
- **Runtime**: Bun

## Environment Variables

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=linvnix

# Application
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# API
API_PREFIX=api
API_VERSION=v1
```

## Running the Application

```bash
# Development
bun run start:dev

# Production
bun run build
bun run start:prod

# Database
docker-compose up -d
```

## API Documentation

Swagger UI: http://localhost:3000/api/docs

## Future Enhancements

1. **AI Integration** (Phase 2)
   - Chatbot conversation
   - Speech recognition
   - Pronunciation assessment
   - Personalized recommendations

2. **Infrastructure** (Phase 2)
   - Redis caching
   - File storage (S3/local)
   - Logging service
   - Email notifications

3. **Advanced Features**
   - Real-time chat
   - Voice recording
   - Image upload
   - Video lessons
