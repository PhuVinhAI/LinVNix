# LinVNix Admin Panel - Tech Stack & Architecture

## 📊 Backend Analysis Summary

### API Structure
- **Base URL**: `http://localhost:3000/api/v1`
- **13 Modules**: Auth, Users, Courses, Units, Lessons, Contents, Vocabularies, Grammar, Exercises, Progress, Admin, Cache
- **Authentication**: JWT + Refresh Token
- **Authorization**: RBAC với 45 permissions chi tiết

### Core Entities
1. User (email, roles, permissions, progress)
2. Course → Unit → Lesson (hierarchical structure)
3. LessonContent (text/audio/video/image)
4. Vocabulary (với dialect variants, FSRS spaced repetition)
5. Grammar Rules
6. Exercise (6 types: multiple_choice, fill_blank, matching, ordering, translation, listening)
7. UserProgress (tracking per lesson)

---

## 🎯 Admin Panel Features Required

### 1. Dashboard
- Total users, DAU, active courses
- Top courses by enrollment
- Exercises with high error rates
- User registration trends

### 2. User Management
- List/Search/Filter users
- View user details & progress
- Edit user info
- Manage roles & permissions
- Soft delete

### 3. Course Management
- CRUD courses, units, lessons
- Upload images
- Set levels (A1-C2)
- View enrollment stats

### 4. Content Management
- Manage lesson contents
- Upload audio/video/images
- Dialect variants support

### 5. Vocabulary Management
- CRUD vocabularies
- Upload pronunciation audio
- Manage dialect variants
- Parts of speech

### 6. Grammar Management
- CRUD grammar rules
- Manage examples

### 7. Exercise Management
- CRUD exercises (6 types)
- View statistics
- Configure options & answers

### 8. Progress & Analytics
- User progress tracking
- Learning statistics
- Exercise performance
- Vocabulary mastery

### 9. System Management
- Cache management
- Email queue
- System logs

---

## 🛠️ Current Tech Stack (Đã có)

### Core
- ✅ React 19
- ✅ TypeScript 5.9
- ✅ Vite 7.3
- ✅ React Router v7

### State Management
- ✅ TanStack React Query v5 (server state)
- ✅ Zustand v5 (client state)
- ✅ React Query DevTools

### UI Components
- ✅ Radix UI (headless components)
- ✅ Tailwind CSS v4
- ✅ Lucide React (icons)
- ✅ Framer Motion (animations)

### Validation
- ✅ Zod v4

### Desktop
- ✅ Electron 40
- ✅ Electron Vite
- ✅ Electron Builder

---

## 📦 Libraries Cần Thêm

### Essential (Bắt buộc)

```bash
bun add react-hook-form @tanstack/react-table axios date-fns
```

- **react-hook-form** - Form management với validation
- **@tanstack/react-table** - Advanced data tables (sorting, filtering, pagination)
- **axios** - HTTP client (better than fetch, interceptors support)
- **date-fns** - Date manipulation utilities

### UI Enhancements (Khuyến nghị)

```bash
bun add recharts react-hot-toast sonner
```

- **recharts** - Charts & graphs cho analytics
- **react-hot-toast** hoặc **sonner** - Toast notifications

### Optional (Tùy chọn)

```bash
bun add @dnd-kit/core @dnd-kit/sortable
```

- **@dnd-kit** - Drag & drop (cho reorder lessons, exercises)

---

## 🏗️ Recommended Architecture

```
admin/app/
├── pages/                          # Page components
│   ├── dashboard/
│   │   └── DashboardPage.tsx
│   ├── users/
│   │   ├── UsersListPage.tsx
│   │   └── UserDetailPage.tsx
│   ├── courses/
│   │   ├── CoursesListPage.tsx
│   │   ├── CourseDetailPage.tsx
│   │   └── CourseEditorPage.tsx
│   ├── lessons/
│   │   └── LessonEditorPage.tsx
│   ├── vocabularies/
│   │   ├── VocabulariesListPage.tsx
│   │   └── VocabularyEditorPage.tsx
│   ├── exercises/
│   │   ├── ExercisesListPage.tsx
│   │   └── ExerciseEditorPage.tsx
│   ├── progress/
│   │   └── ProgressAnalyticsPage.tsx
│   ├── settings/
│   │   └── SettingsPage.tsx
│   └── auth/
│       └── LoginPage.tsx
│
├── components/                     # Reusable components
│   ├── common/                     # Common UI
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   └── Card.tsx
│   ├── forms/                      # Form components
│   │   ├── UserForm.tsx
│   │   ├── CourseForm.tsx
│   │   ├── VocabularyForm.tsx
│   │   └── ExerciseForm.tsx
│   ├── tables/                     # Table components
│   │   ├── DataTable.tsx
│   │   ├── UsersTable.tsx
│   │   ├── CoursesTable.tsx
│   │   └── VocabulariesTable.tsx
│   ├── charts/                     # Chart components
│   │   ├── LineChart.tsx
│   │   ├── BarChart.tsx
│   │   └── PieChart.tsx
│   ├── layout/                     # Layout components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MainLayout.tsx
│   └── modals/                     # Modal components
│       ├── ConfirmModal.tsx
│       └── FormModal.tsx
│
├── hooks/                          # Custom React hooks
│   ├── useApi.ts                   # API calls wrapper
│   ├── useAuth.ts                  # Auth state & actions
│   ├── useTable.ts                 # Table logic
│   ├── useForm.ts                  # Form logic
│   └── usePagination.ts            # Pagination logic
│
├── services/                       # API services
│   ├── api.ts                      # Axios instance
│   ├── auth.service.ts             # Auth endpoints
│   ├── users.service.ts            # Users endpoints
│   ├── courses.service.ts          # Courses endpoints
│   ├── vocabularies.service.ts     # Vocabularies endpoints
│   ├── exercises.service.ts        # Exercises endpoints
│   └── progress.service.ts         # Progress endpoints
│
├── store/                          # Zustand stores
│   ├── auth.store.ts               # Auth state
│   ├── ui.store.ts                 # UI state (sidebar, theme)
│   └── filters.store.ts            # Filter state
│
├── types/                          # TypeScript types
│   ├── api.types.ts                # API request/response types
│   ├── models.types.ts             # Entity types
│   ├── forms.types.ts              # Form types
│   └── enums.ts                    # Enums (sync với backend)
│
├── utils/                          # Utility functions
│   ├── api-client.ts               # API client setup
│   ├── validators.ts               # Validation helpers
│   ├── formatters.ts               # Format helpers
│   └── constants.ts                # Constants
│
└── styles/                         # Global styles
    └── globals.css
```

---

## 🔌 API Integration Pattern

### 1. API Client Setup

```typescript
// services/api.ts
import axios from 'axios';
import { getPlatformConfig } from '@/lib/platform';

const config = getPlatformConfig();

const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh token logic
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 2. Service Layer

```typescript
// services/users.service.ts
import apiClient from './api';
import type { User, PaginatedResult } from '@/types/models.types';

export const usersService = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get<PaginatedResult<User>>('/users', { params }),
  
  getById: (id: string) =>
    apiClient.get<User>(`/users/${id}`),
  
  update: (id: string, data: Partial<User>) =>
    apiClient.patch<User>(`/users/${id}`, data),
  
  delete: (id: string) =>
    apiClient.delete(`/users/${id}`),
};
```

### 3. React Query Hook

```typescript
// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '@/services/users.service';

export const useUsers = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersService.getAll(params),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      usersService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
```

---

## 🎨 UI Component Pattern

### Using shadcn/ui + Radix UI

```typescript
// components/tables/DataTable.tsx
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';

export function DataTable<TData>({ data, columns }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  
  return (
    <div className="rounded-md border">
      <table>
        {/* Table implementation */}
      </table>
    </div>
  );
}
```

---

## 🔐 Authentication Flow

1. Login → Get access token + refresh token
2. Store tokens in localStorage (web) hoặc secure storage (Electron)
3. Add token to all API requests via interceptor
4. On 401 error → Try refresh token
5. If refresh fails → Redirect to login

---

## 📝 Next Steps

1. ✅ Install required libraries
2. ✅ Setup API client với Axios
3. ✅ Create type definitions (sync với backend)
4. ✅ Setup authentication flow
5. ✅ Create layout components (Sidebar, Header)
6. ✅ Implement Dashboard page
7. ✅ Implement User Management
8. ✅ Implement Course Management
9. ✅ Implement Vocabulary Management
10. ✅ Implement Exercise Management
11. ✅ Implement Analytics & Charts

---

## 🚀 Development Workflow

```bash
# Web mode (fast development)
bun run dev:web

# Desktop mode (test Electron features)
bun run dev

# Type checking
bun run typecheck

# Build web
bun run build:web

# Build desktop
bun run build:win  # or build:mac, build:linux
```
