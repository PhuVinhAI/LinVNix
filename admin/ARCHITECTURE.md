# LinVNix Admin - Clean Architecture

## 🏛️ Architecture Overview

Admin panel được xây dựng theo **Clean Architecture** và **Domain-Driven Design**, tương tự backend.

## 📁 Cấu trúc thư mục

```
admin/
├── app/                                    # Application Layer (UI)
│   ├── pages/                             # Page components (Presentation)
│   │   ├── auth/
│   │   │   └── LoginPage.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── users/
│   │   │   ├── UsersListPage.tsx
│   │   │   └── UserDetailPage.tsx
│   │   ├── courses/
│   │   │   ├── CoursesListPage.tsx
│   │   │   ├── CourseDetailPage.tsx
│   │   │   └── CourseEditorPage.tsx
│   │   ├── vocabularies/
│   │   │   ├── VocabulariesListPage.tsx
│   │   │   └── VocabularyEditorPage.tsx
│   │   ├── exercises/
│   │   │   ├── ExercisesListPage.tsx
│   │   │   └── ExerciseEditorPage.tsx
│   │   └── settings/
│   │       └── SettingsPage.tsx
│   │
│   ├── components/                        # Reusable UI Components
│   │   ├── ui/                           # shadcn/ui components
│   │   ├── layout/                       # Layout components
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── common/                       # Common components
│   │   │   ├── DataTable.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── forms/                        # Form components
│   │   │   ├── UserForm.tsx
│   │   │   ├── CourseForm.tsx
│   │   │   └── VocabularyForm.tsx
│   │   └── charts/                       # Chart components
│   │       ├── LineChart.tsx
│   │       └── BarChart.tsx
│   │
│   ├── hooks/                            # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useTable.ts
│   │   └── usePagination.ts
│   │
│   ├── router/                           # Routing configuration
│   │   ├── index.tsx
│   │   └── routes.tsx
│   │
│   ├── styles/                           # Global styles
│   │   └── globals.css
│   │
│   ├── app.tsx                           # Root component
│   ├── renderer.tsx                      # Entry point
│   └── index.html                        # HTML template
│
├── lib/                                   # Library Layer
│   ├── core/                             # Core Domain Layer
│   │   ├── domain/                       # Domain entities & types
│   │   │   ├── entities/
│   │   │   │   ├── User.ts
│   │   │   │   ├── Course.ts
│   │   │   │   ├── Vocabulary.ts
│   │   │   │   └── Exercise.ts
│   │   │   ├── enums/
│   │   │   │   ├── UserLevel.enum.ts
│   │   │   │   ├── Role.enum.ts
│   │   │   │   ├── Permission.enum.ts
│   │   │   │   └── ExerciseType.enum.ts
│   │   │   └── types/
│   │   │       ├── api.types.ts
│   │   │       └── common.types.ts
│   │   │
│   │   ├── application/                  # Application Services
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── users.service.ts
│   │   │   │   ├── courses.service.ts
│   │   │   │   ├── vocabularies.service.ts
│   │   │   │   └── exercises.service.ts
│   │   │   ├── repositories/             # Repository interfaces
│   │   │   │   ├── IAuthRepository.ts
│   │   │   │   ├── IUsersRepository.ts
│   │   │   │   └── ICoursesRepository.ts
│   │   │   └── use-cases/                # Use cases (optional)
│   │   │       └── LoginUseCase.ts
│   │   │
│   │   └── infrastructure/               # Infrastructure Layer
│   │       ├── api/                      # API client
│   │       │   ├── client.ts             # Axios instance
│   │       │   ├── interceptors.ts       # Request/Response interceptors
│   │       │   └── endpoints.ts          # API endpoints constants
│   │       ├── repositories/             # Repository implementations
│   │       │   ├── AuthRepository.ts
│   │       │   ├── UsersRepository.ts
│   │       │   └── CoursesRepository.ts
│   │       ├── storage/                  # Local storage
│   │       │   ├── LocalStorage.ts
│   │       │   └── SecureStorage.ts      # For Electron
│   │       └── cache/                    # Cache layer
│   │           └── QueryCache.ts
│   │
│   ├── shared/                           # Shared utilities
│   │   ├── utils/                        # Utility functions
│   │   │   ├── validators.ts
│   │   │   ├── formatters.ts
│   │   │   └── helpers.ts
│   │   ├── constants/                    # Constants
│   │   │   └── index.ts
│   │   ├── config/                       # Configuration
│   │   │   └── app.config.ts
│   │   └── errors/                       # Error handling
│   │       ├── AppError.ts
│   │       └── ErrorHandler.ts
│   │
│   ├── state/                            # State Management
│   │   ├── stores/                       # Zustand stores
│   │   │   ├── auth.store.ts
│   │   │   ├── ui.store.ts
│   │   │   └── filters.store.ts
│   │   └── providers/                    # React Context providers
│   │       └── QueryProvider.tsx
│   │
│   ├── platform/                         # Platform detection
│   │   └── index.ts
│   │
│   ├── conveyor/                         # IPC (Electron)
│   │   ├── api/
│   │   └── handlers/
│   │
│   ├── main/                             # Electron main process
│   │   └── main.ts
│   │
│   ├── preload/                          # Electron preload
│   │   └── preload.ts
│   │
│   └── utils.ts                          # Shared utils
│
├── resources/                            # Build resources
│   └── build/
│
├── .env                                  # Environment variables
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts                        # Web build config
├── electron.vite.config.ts               # Electron build config
├── ARCHITECTURE.md                       # This file
├── TECH_STACK.md                         # Tech stack documentation
└── README.md
```

## 🎯 Layer Responsibilities

### 1. **Domain Layer** (`lib/core/domain/`)
- **Entities**: Business objects (User, Course, Vocabulary, etc.)
- **Enums**: Shared enumerations
- **Types**: TypeScript type definitions
- **Pure business logic**, không phụ thuộc vào framework

### 2. **Application Layer** (`lib/core/application/`)
- **Services**: Business logic implementation
- **Repositories**: Data access interfaces (contracts)
- **Use Cases**: Application-specific business rules
- Orchestrates domain objects

### 3. **Infrastructure Layer** (`lib/core/infrastructure/`)
- **API Client**: HTTP communication với backend
- **Repositories**: Concrete implementations
- **Storage**: LocalStorage, SecureStorage
- **Cache**: Query cache management
- External dependencies implementation

### 4. **Presentation Layer** (`app/`)
- **Pages**: Route-based page components
- **Components**: Reusable UI components
- **Hooks**: Custom React hooks
- **Router**: Routing configuration
- UI logic only, delegates to Application layer

### 5. **Shared Layer** (`lib/shared/`)
- **Utils**: Helper functions
- **Constants**: App-wide constants
- **Config**: Configuration
- **Errors**: Error handling
- Cross-cutting concerns

### 6. **State Layer** (`lib/state/`)
- **Stores**: Zustand stores (client state)
- **Providers**: React Query provider (server state)
- State management

## 🔄 Data Flow

```
User Interaction
    ↓
[Presentation Layer] - Pages/Components
    ↓
[Custom Hooks] - useAuth, useUsers, etc.
    ↓
[React Query] - Server state management
    ↓
[Application Services] - auth.service, users.service
    ↓
[Repository Interface] - IUsersRepository
    ↓
[Repository Implementation] - UsersRepository
    ↓
[API Client] - Axios
    ↓
Backend API
```

## 📦 Dependency Rules

1. **Domain** không phụ thuộc vào bất kỳ layer nào
2. **Application** chỉ phụ thuộc vào Domain
3. **Infrastructure** phụ thuộc vào Application & Domain
4. **Presentation** phụ thuộc vào Application & Domain (không trực tiếp Infrastructure)
5. **Shared** có thể được dùng bởi tất cả layers

## 🎨 Component Patterns

### Page Component
```typescript
// app/pages/users/UsersListPage.tsx
export function UsersListPage() {
  const { data, isLoading } = useUsers();
  
  return (
    <div>
      <PageHeader title="Users" />
      <UsersTable data={data} loading={isLoading} />
    </div>
  );
}
```

### Service
```typescript
// lib/core/application/services/users.service.ts
export class UsersService {
  constructor(private repository: IUsersRepository) {}
  
  async getAll(params: GetUsersParams): Promise<PaginatedResult<User>> {
    return this.repository.findAll(params);
  }
}
```

### Repository
```typescript
// lib/core/infrastructure/repositories/UsersRepository.ts
export class UsersRepository implements IUsersRepository {
  constructor(private apiClient: ApiClient) {}
  
  async findAll(params: GetUsersParams): Promise<PaginatedResult<User>> {
    const response = await this.apiClient.get('/users', { params });
    return response.data;
  }
}
```

## 🔐 Authentication Flow

```
LoginPage
  → useAuth hook
    → authService.login()
      → authRepository.login()
        → apiClient.post('/auth/login')
          → Store tokens
            → Update auth store
              → Redirect to dashboard
```

## 🚀 Benefits

1. **Testability**: Mỗi layer có thể test độc lập
2. **Maintainability**: Separation of concerns rõ ràng
3. **Scalability**: Dễ dàng thêm features mới
4. **Flexibility**: Dễ thay đổi implementation (API client, storage, etc.)
5. **Reusability**: Code có thể reuse giữa web và desktop

## 📝 Naming Conventions

- **Files**: PascalCase cho components, camelCase cho utilities
- **Folders**: kebab-case
- **Components**: PascalCase
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase với prefix `I` cho interfaces

## 🎯 Next Steps

1. ✅ Setup Clean Architecture structure
2. ✅ Create domain entities & types
3. ✅ Implement services & repositories
4. ✅ Setup API client với interceptors
5. ✅ Create page components
6. ✅ Implement authentication flow
7. ✅ Add RBAC support
