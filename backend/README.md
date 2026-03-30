# LinVNix Backend API

Backend API cho ứng dụng học tiếng Việt với NestJS và PostgreSQL.

## Cấu trúc dự án

```
src/
├── config/                      # Configuration files
│   ├── app.config.ts
│   ├── database.config.ts
│   └── jwt.config.ts
│
├── common/                      # Shared kernel
│   ├── decorators/              # Custom decorators (@CurrentUser, @Public)
│   ├── enums/                   # Shared enums
│   ├── filters/                 # Exception filters
│   └── interceptors/            # Response interceptors
│
├── database/                    # Database layer
│   ├── base/                    # Base entities
│   ├── migrations/              # TypeORM migrations
│   └── seeds/                   # Seed data
│
└── modules/                     # Feature modules
    ├── auth/                    # Authentication
    ├── users/                   # User management
    ├── courses/                 # Courses, Units, Lessons
    ├── contents/                # Lesson contents
    ├── vocabularies/            # Vocabularies & user vocabularies
    ├── grammar/                 # Grammar rules
    ├── exercises/               # Exercises & results
    └── progress/                # User progress tracking
```

## Design Patterns

- **Clean Architecture**: Tách biệt domain, application, presentation layers
- **Repository Pattern**: Abstract data access
- **Service Layer**: Business logic
- **DTO Pattern**: Data transfer objects
- **Dependency Injection**: NestJS built-in

## Cài đặt

```bash
# Install dependencies
bun install

# Copy environment file
cp .env.example .env

# Start PostgreSQL
cd ..
bun run db:up
```

## Chạy ứng dụng

```bash
# Development
bun run start:dev

# Production
bun run build
bun run start:prod
```

## API Documentation

Swagger docs: http://localhost:3000/api/docs

## Database Schema

### Core Entities

1. **Users** - Người dùng
2. **Courses** - Khóa học (A1, A2, B1, B2, C1, C2)
3. **Units** - Đơn vị học trong course
4. **Lessons** - Bài học (vocabulary, grammar, reading, listening...)
5. **Lesson Contents** - Nội dung bài học (text, audio, video...)
6. **Vocabularies** - Từ vựng
7. **Grammar Rules** - Ngữ pháp
8. **Exercises** - Bài tập
9. **User Progress** - Tiến độ học
10. **User Exercise Results** - Kết quả bài tập
11. **User Vocabularies** - Từ vựng đã học (spaced repetition)

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Đăng ký
- `POST /api/v1/auth/login` - Đăng nhập

### Users
- `GET /api/v1/users/me` - Thông tin user
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
```

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT + Passport
- **Validation**: class-validator
- **Documentation**: Swagger
- **Runtime**: Bun
