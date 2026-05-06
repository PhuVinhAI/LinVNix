# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview
This is **LinVNix**, a monorepo containing a NestJS (v11) backend API and a Flutter mobile app. The primary package manager and runtime is `bun`.

## High-Level Architecture
- **Backend (NestJS)**: Located in `/backend`. Uses TypeORM with PostgreSQL, Redis for caching and queues (Bull), and JWT/Google OAuth for authentication. 
- **Modules (`/backend/src/modules/`)**: Organized by business domains such as `users`, `auth`, `courses`, `contents`, `vocabularies`, `grammar`, `exercises`, `progress`, and `admin`.
- **Infrastructure (`/backend/src/infrastructure/`)**: Contains external integrations like `cache`, `logging`, `mail`, `queue`, `storage`, and `archiving`.
- **Global Interceptors/Filters**: 
  - Uses `LoggingInterceptor` and `LoggingService` for custom logging.
  - Uses `TransformInterceptor` to format all API responses globally.
  - Uses `HttpExceptionFilter` to map errors.
  - Uses `ClassSerializerInterceptor` combined with `@Exclude()` on entities/DTOs for securing sensitive data (like passwords).
  - Globally protected by `JwtAuthGuard` (use `@Public()` to bypass) and `ThrottlerGuard`.

## Common Development Commands

All commands are run from the repository root via `bun run`.

### Infrastructure & Services
- `bun run db:up` - Start PostgreSQL and Redis via docker-compose
- `bun run db:down` - Stop services

### Backend Development
- `bun run backend:dev` - Run the backend in development watch mode
- `bun run backend:build` - Build the backend for production
- `bun run backend:start` - Run the built backend

### Backend Testing (Run inside `/backend` directory)
- `bun run test` - Run unit tests
- `bun run test:integration` - Run all integration tests
- `bun run test:integration:auth` - Run auth integration tests (and similar commands for courses, progress, etc.)
- `bun run test:e2e` - Run e2e tests

### Mobile Development
- `bun run mobile:run` - Run the Flutter application
- `bun run mobile:build:android` / `bun run mobile:build:ios` - Build mobile apps

## Important Development Conventions
1. **Always use Bun**: Stick to `bun install` and `bun run` instead of npm/yarn.
2. **NestJS Modules**: When creating new features, organize them logically into controllers, services, entities, and DTOs inside a dedicated module in `backend/src/modules/`.
3. **Authentication**: All endpoints are protected by default. If creating a public endpoint (e.g., login, register), decorate it with `@Public()`.
4. **Environment Variables**: Never commit `.env`. Refer to `.env.example` for required variables.
5. **Data Protection**: Remember to use `class-transformer` decorators like `@Exclude()` on TypeORM entities to prevent passwords or tokens from leaking in API responses.