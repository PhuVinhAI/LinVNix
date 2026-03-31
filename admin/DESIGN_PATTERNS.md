# Design Patterns cho Admin Frontend

## 📋 Tổng quan

Document này mô tả các Design Patterns được áp dụng trong LinVNix Admin Panel, tối ưu cho nghiệp vụ admin frontend.

---

## 🎯 1. PRESENTATION PATTERNS

### 1.1. Container/Presenter Pattern (Smart/Dumb Components)

**Mục đích**: Tách biệt logic và UI

```typescript
// ❌ BAD: Logic và UI lẫn lộn
function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    setLoading(true);
    const data = await api.get('/users');
    setUsers(data);
    setLoading(false);
  };
  
  return <table>{/* render users */}</table>;
}

// ✅ GOOD: Tách Container (logic) và Presenter (UI)

// Container - Smart Component (có logic)
function UsersPageContainer() {
  const { data: users, isLoading } = useUsers();
  const { mutate: deleteUser } = useDeleteUser();
  
  return (
    <UsersPresenter 
      users={users} 
      loading={isLoading}
      onDelete={deleteUser}
    />
  );
}

// Presenter - Dumb Component (chỉ UI)
interface UsersPresenterProps {
  users: User[];
  loading: boolean;
  onDelete: (id: string) => void;
}

function UsersPresenter({ users, loading, onDelete }: UsersPresenterProps) {
  if (loading) return <LoadingSpinner />;
  
  return (
    <div>
      <UsersTable data={users} onDelete={onDelete} />
    </div>
  );
}
```

### 1.2. Compound Components Pattern

**Mục đích**: Tạo components linh hoạt, dễ customize

```typescript
// ✅ DataTable với Compound Components
function DataTable({ children }: { children: React.ReactNode }) {
  return <div className="data-table">{children}</div>;
}

DataTable.Header = function Header({ children }: { children: React.ReactNode }) {
  return <div className="table-header">{children}</div>;
};

DataTable.Body = function Body({ children }: { children: React.ReactNode }) {
  return <div className="table-body">{children}</div>;
};

DataTable.Row = function Row({ children }: { children: React.ReactNode }) {
  return <div className="table-row">{children}</div>;
};

// Usage
<DataTable>
  <DataTable.Header>
    <DataTable.Row>
      <th>Name</th>
      <th>Email</th>
    </DataTable.Row>
  </DataTable.Header>
  <DataTable.Body>
    {users.map(user => (
      <DataTable.Row key={user.id}>
        <td>{user.name}</td>
        <td>{user.email}</td>
      </DataTable.Row>
    ))}
  </DataTable.Body>
</DataTable>
```

### 1.3. Render Props Pattern

**Mục đích**: Share logic giữa components

```typescript
// ✅ Pagination với Render Props
interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  children: (props: {
    currentPage: number;
    totalPages: number;
    goToPage: (page: number) => void;
    nextPage: () => void;
    prevPage: () => void;
  }) => React.ReactNode;
}

function Pagination({ totalItems, itemsPerPage, children }: PaginationProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  return children({
    currentPage,
    totalPages,
    goToPage: setCurrentPage,
    nextPage: () => setCurrentPage(p => Math.min(p + 1, totalPages)),
    prevPage: () => setCurrentPage(p => Math.max(p - 1, 1)),
  });
}

// Usage
<Pagination totalItems={100} itemsPerPage={10}>
  {({ currentPage, totalPages, nextPage, prevPage }) => (
    <div>
      <span>Page {currentPage} of {totalPages}</span>
      <button onClick={prevPage}>Previous</button>
      <button onClick={nextPage}>Next</button>
    </div>
  )}
</Pagination>
```

---

## 🏗️ 2. ARCHITECTURAL PATTERNS

### 2.1. Repository Pattern

**Mục đích**: Abstraction layer cho data access

```typescript
// Interface (Contract)
interface IUsersRepository {
  findAll(params: GetUsersParams): Promise<PaginatedResult<User>>;
  findById(id: string): Promise<User>;
  create(data: CreateUserDto): Promise<User>;
  update(id: string, data: UpdateUserDto): Promise<User>;
  delete(id: string): Promise<void>;
}

// Implementation
class UsersRepository implements IUsersRepository {
  constructor(private apiClient: ApiClient) {}
  
  async findAll(params: GetUsersParams): Promise<PaginatedResult<User>> {
    const response = await this.apiClient.get<PaginatedResult<User>>('/users', { params });
    return response.data;
  }
  
  async findById(id: string): Promise<User> {
    const response = await this.apiClient.get<User>(`/users/${id}`);
    return response.data;
  }
  
  async create(data: CreateUserDto): Promise<User> {
    const response = await this.apiClient.post<User>('/users', data);
    return response.data;
  }
  
  async update(id: string, data: UpdateUserDto): Promise<User> {
    const response = await this.apiClient.patch<User>(`/users/${id}`, data);
    return response.data;
  }
  
  async delete(id: string): Promise<void> {
    await this.apiClient.delete(`/users/${id}`);
  }
}

// Usage trong Service
class UsersService {
  constructor(private repository: IUsersRepository) {}
  
  async getAllUsers(params: GetUsersParams) {
    return this.repository.findAll(params);
  }
}
```

### 2.2. Service Layer Pattern

**Mục đích**: Business logic layer

```typescript
// Service chứa business logic
class CoursesService {
  constructor(
    private coursesRepo: ICoursesRepository,
    private unitsRepo: IUnitsRepository,
    private lessonsRepo: ILessonsRepository
  ) {}
  
  // Business logic: Tạo course với units và lessons
  async createCourseWithContent(data: CreateCourseWithContentDto): Promise<Course> {
    // 1. Create course
    const course = await this.coursesRepo.create({
      title: data.title,
      description: data.description,
      level: data.level,
    });
    
    // 2. Create units
    for (const unitData of data.units) {
      const unit = await this.unitsRepo.create({
        ...unitData,
        courseId: course.id,
      });
      
      // 3. Create lessons for each unit
      for (const lessonData of unitData.lessons) {
        await this.lessonsRepo.create({
          ...lessonData,
          unitId: unit.id,
        });
      }
    }
    
    return course;
  }
  
  // Business logic: Publish course (validate trước khi publish)
  async publishCourse(id: string): Promise<Course> {
    const course = await this.coursesRepo.findById(id);
    
    // Validation
    if (!course.units || course.units.length === 0) {
      throw new Error('Course must have at least one unit');
    }
    
    // Update status
    return this.coursesRepo.update(id, { isPublished: true });
  }
}
```

### 2.3. Factory Pattern

**Mục đích**: Tạo objects theo type

```typescript
// Factory cho Exercise forms
type ExerciseType = 'multiple_choice' | 'fill_blank' | 'matching' | 'ordering';

interface ExerciseFormConfig {
  component: React.ComponentType<any>;
  defaultValues: any;
  validationSchema: any;
}

class ExerciseFormFactory {
  private static configs: Record<ExerciseType, ExerciseFormConfig> = {
    multiple_choice: {
      component: MultipleChoiceForm,
      defaultValues: { options: ['', '', '', ''], correctAnswer: 0 },
      validationSchema: multipleChoiceSchema,
    },
    fill_blank: {
      component: FillBlankForm,
      defaultValues: { blanks: [''] },
      validationSchema: fillBlankSchema,
    },
    matching: {
      component: MatchingForm,
      defaultValues: { pairs: [{ left: '', right: '' }] },
      validationSchema: matchingSchema,
    },
    ordering: {
      component: OrderingForm,
      defaultValues: { items: [''] },
      validationSchema: orderingSchema,
    },
  };
  
  static create(type: ExerciseType): ExerciseFormConfig {
    const config = this.configs[type];
    if (!config) {
      throw new Error(`Unknown exercise type: ${type}`);
    }
    return config;
  }
}

// Usage
function ExerciseEditor({ type }: { type: ExerciseType }) {
  const config = ExerciseFormFactory.create(type);
  const FormComponent = config.component;
  
  return (
    <FormComponent 
      defaultValues={config.defaultValues}
      validationSchema={config.validationSchema}
    />
  );
}
```

### 2.4. Strategy Pattern

**Mục đích**: Encapsulate algorithms, dễ thay đổi

```typescript
// Strategy cho Export data
interface ExportStrategy {
  export(data: any[]): Promise<Blob>;
}

class CSVExportStrategy implements ExportStrategy {
  async export(data: any[]): Promise<Blob> {
    const csv = data.map(row => Object.values(row).join(',')).join('\n');
    return new Blob([csv], { type: 'text/csv' });
  }
}

class JSONExportStrategy implements ExportStrategy {
  async export(data: any[]): Promise<Blob> {
    const json = JSON.stringify(data, null, 2);
    return new Blob([json], { type: 'application/json' });
  }
}

class ExcelExportStrategy implements ExportStrategy {
  async export(data: any[]): Promise<Blob> {
    // Use library like xlsx
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
}

// Context
class DataExporter {
  constructor(private strategy: ExportStrategy) {}
  
  setStrategy(strategy: ExportStrategy) {
    this.strategy = strategy;
  }
  
  async export(data: any[]): Promise<Blob> {
    return this.strategy.export(data);
  }
}

// Usage
const exporter = new DataExporter(new CSVExportStrategy());
const blob = await exporter.export(users);

// Change strategy
exporter.setStrategy(new JSONExportStrategy());
const jsonBlob = await exporter.export(users);
```

### 2.5. Observer Pattern (với React Query)

**Mục đích**: Subscribe to data changes

```typescript
// React Query tự động implement Observer pattern
function UsersListPage() {
  // Observer: Component tự động re-render khi data thay đổi
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.getAll(),
  });
  
  return <UsersTable data={users} />;
}

function UserDetailPage({ id }: { id: string }) {
  // Observer: Component này cũng subscribe vào 'users' query
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.getAll(),
  });
  
  const user = users?.find(u => u.id === id);
  return <UserDetail user={user} />;
}

// Khi mutation xảy ra, tất cả observers đều được notify
function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => usersService.delete(id),
    onSuccess: () => {
      // Invalidate query → notify all observers
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

---

## 🎨 3. UI/UX PATTERNS

### 3.1. Optimistic Updates Pattern

**Mục đích**: Cải thiện UX bằng cách update UI trước khi API response

```typescript
function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      usersService.update(id, data),
    
    // Optimistic update
    onMutate: async ({ id, data }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['users', id] });
      
      // Snapshot previous value
      const previousUser = queryClient.getQueryData<User>(['users', id]);
      
      // Optimistically update
      queryClient.setQueryData<User>(['users', id], old => ({
        ...old!,
        ...data,
      }));
      
      return { previousUser };
    },
    
    // Rollback on error
    onError: (err, variables, context) => {
      queryClient.setQueryData(['users', variables.id], context?.previousUser);
    },
    
    // Refetch on success
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
    },
  });
}
```

### 3.2. Infinite Scroll Pattern

**Mục đích**: Load data progressively

```typescript
function useInfiniteUsers(params: GetUsersParams) {
  return useInfiniteQuery({
    queryKey: ['users', 'infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      usersService.getAll({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

function UsersInfiniteList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteUsers({});
  
  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage) {
        fetchNextPage();
      }
    },
  });
  
  return (
    <div>
      {data?.pages.map((page) =>
        page.items.map((user) => <UserCard key={user.id} user={user} />)
      )}
      <div ref={ref}>
        {isFetchingNextPage && <LoadingSpinner />}
      </div>
    </div>
  );
}
```

### 3.3. Skeleton Loading Pattern

**Mục đích**: Better loading UX

```typescript
function UsersTable() {
  const { data: users, isLoading } = useUsers();
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return <Table data={users} />;
}
```

### 3.4. Error Boundary Pattern

**Mục đích**: Graceful error handling

```typescript
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  state = { hasError: false, error: undefined };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error tracking service
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Usage
<ErrorBoundary fallback={<ErrorFallback />}>
  <UsersPage />
</ErrorBoundary>
```

---

## 🔐 4. STATE MANAGEMENT PATTERNS

### 4.1. Server State vs Client State

**Mục đích**: Tách biệt server state và client state

```typescript
// ✅ Server State - React Query
function UsersPage() {
  // Server state: data từ API
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.getAll(),
  });
  
  // Client state: UI state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  return (
    <div>
      <SearchInput value={searchTerm} onChange={setSearchTerm} />
      <UsersTable 
        data={users}
        selectedIds={selectedIds}
        onSelect={setSelectedIds}
      />
    </div>
  );
}
```

### 4.2. Global State Pattern (Zustand)

**Mục đích**: Share state across components

```typescript
// Auth Store
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  
  login: async (email, password) => {
    const { user, token } = await authService.login(email, password);
    set({ user, token, isAuthenticated: true });
    localStorage.setItem('token', token);
  },
  
  logout: () => {
    set({ user: null, token: null, isAuthenticated: false });
    localStorage.removeItem('token');
  },
  
  setUser: (user) => set({ user }),
}));

// UI Store
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: 'light',
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
}));

// Usage
function Header() {
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  
  return (
    <header>
      <button onClick={toggleSidebar}>Toggle Sidebar</button>
      <span>{user?.fullName}</span>
      <button onClick={logout}>Logout</button>
    </header>
  );
}
```

### 4.3. Form State Pattern (React Hook Form)

**Mục đích**: Efficient form state management

```typescript
interface UserFormData {
  email: string;
  fullName: string;
  currentLevel: UserLevel;
}

const userSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  currentLevel: z.nativeEnum(UserLevel),
});

function UserForm({ user, onSubmit }: { user?: User; onSubmit: (data: UserFormData) => void }) {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: user || {
      email: '',
      fullName: '',
      currentLevel: UserLevel.A1,
    },
  });
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input {...form.register('email')} />
      {form.formState.errors.email && <span>{form.formState.errors.email.message}</span>}
      
      <Input {...form.register('fullName')} />
      <Select {...form.register('currentLevel')}>
        {Object.values(UserLevel).map(level => (
          <option key={level} value={level}>{level}</option>
        ))}
      </Select>
      
      <button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

---

## 🔄 5. DATA FETCHING PATTERNS

### 5.1. Prefetching Pattern

**Mục đích**: Load data trước khi user cần

```typescript
function UsersListPage() {
  const queryClient = useQueryClient();
  const { data: users } = useUsers();
  
  // Prefetch user detail khi hover
  const handleMouseEnter = (userId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['users', userId],
      queryFn: () => usersService.getById(userId),
    });
  };
  
  return (
    <div>
      {users?.map(user => (
        <Link
          key={user.id}
          to={`/users/${user.id}`}
          onMouseEnter={() => handleMouseEnter(user.id)}
        >
          {user.fullName}
        </Link>
      ))}
    </div>
  );
}
```

### 5.2. Parallel Queries Pattern

**Mục đích**: Fetch multiple data simultaneously

```typescript
function DashboardPage() {
  // Parallel queries
  const { data: stats } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => adminService.getStats(),
  });
  
  const { data: topCourses } = useQuery({
    queryKey: ['dashboard', 'top-courses'],
    queryFn: () => coursesService.getTopCourses(),
  });
  
  const { data: recentUsers } = useQuery({
    queryKey: ['dashboard', 'recent-users'],
    queryFn: () => usersService.getRecent(),
  });
  
  // Hoặc dùng useQueries cho dynamic queries
  const results = useQueries({
    queries: [
      { queryKey: ['stats'], queryFn: () => adminService.getStats() },
      { queryKey: ['top-courses'], queryFn: () => coursesService.getTopCourses() },
      { queryKey: ['recent-users'], queryFn: () => usersService.getRecent() },
    ],
  });
  
  return (
    <div>
      <StatsCards data={stats} />
      <TopCourses data={topCourses} />
      <RecentUsers data={recentUsers} />
    </div>
  );
}
```

### 5.3. Dependent Queries Pattern

**Mục đích**: Query phụ thuộc vào query khác

```typescript
function LessonDetailPage({ lessonId }: { lessonId: string }) {
  // Query 1: Get lesson
  const { data: lesson } = useQuery({
    queryKey: ['lessons', lessonId],
    queryFn: () => lessonsService.getById(lessonId),
  });
  
  // Query 2: Get unit (dependent on lesson)
  const { data: unit } = useQuery({
    queryKey: ['units', lesson?.unitId],
    queryFn: () => unitsService.getById(lesson!.unitId),
    enabled: !!lesson?.unitId, // Only run when lesson is loaded
  });
  
  // Query 3: Get course (dependent on unit)
  const { data: course } = useQuery({
    queryKey: ['courses', unit?.courseId],
    queryFn: () => coursesService.getById(unit!.courseId),
    enabled: !!unit?.courseId,
  });
  
  return (
    <div>
      <Breadcrumb>
        <BreadcrumbItem>{course?.title}</BreadcrumbItem>
        <BreadcrumbItem>{unit?.title}</BreadcrumbItem>
        <BreadcrumbItem>{lesson?.title}</BreadcrumbItem>
      </Breadcrumb>
      <LessonDetail lesson={lesson} />
    </div>
  );
}
```

### 5.4. Polling Pattern

**Mục đích**: Auto-refresh data

```typescript
function SystemLogsPage() {
  const { data: logs } = useQuery({
    queryKey: ['system', 'logs'],
    queryFn: () => systemService.getLogs(),
    refetchInterval: 5000, // Poll every 5 seconds
    refetchIntervalInBackground: true, // Continue polling when tab is inactive
  });
  
  return <LogsTable data={logs} />;
}
```

---

## 🛡️ 6. SECURITY & AUTHORIZATION PATTERNS

### 6.1. Protected Route Pattern

**Mục đích**: Route protection based on authentication

```typescript
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
}

// Usage in router
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
    <Route index element={<DashboardPage />} />
    <Route path="users" element={<UsersPage />} />
  </Route>
</Routes>
```

### 6.2. Permission-Based Rendering Pattern

**Mục đích**: Show/hide UI based on permissions

```typescript
// Hook để check permission
function usePermission(permission: Permission): boolean {
  const { user } = useAuthStore();
  
  return user?.roles.some(role =>
    role.permissions.includes(permission)
  ) ?? false;
}

// Component wrapper
function PermissionGuard({ 
  permission, 
  children, 
  fallback = null 
}: { 
  permission: Permission; 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const hasPermission = usePermission(permission);
  
  if (!hasPermission) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

// Usage
function UsersPage() {
  return (
    <div>
      <h1>Users</h1>
      <PermissionGuard permission={Permission.USER_CREATE}>
        <button>Create User</button>
      </PermissionGuard>
      
      <UsersTable />
    </div>
  );
}

// Hoặc dùng hook trực tiếp
function UserActions({ user }: { user: User }) {
  const canEdit = usePermission(Permission.USER_UPDATE);
  const canDelete = usePermission(Permission.USER_DELETE);
  
  return (
    <div>
      {canEdit && <button>Edit</button>}
      {canDelete && <button>Delete</button>}
    </div>
  );
}
```

### 6.3. Role-Based Access Pattern

**Mục đích**: Access control based on roles

```typescript
function useRole(role: Role): boolean {
  const { user } = useAuthStore();
  return user?.roles.some(r => r.name === role) ?? false;
}

function RoleGuard({ 
  roles, 
  children, 
  fallback = null 
}: { 
  roles: Role[]; 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const hasRole = user?.roles.some(r => roles.includes(r.name as Role)) ?? false;
  
  if (!hasRole) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

// Usage
<RoleGuard roles={[Role.ADMIN]} fallback={<AccessDenied />}>
  <AdminPanel />
</RoleGuard>
```

---

## 📊 7. TABLE & LIST PATTERNS

### 7.1. Server-Side Pagination Pattern

**Mục đích**: Efficient large dataset handling

```typescript
function UsersTable() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState<ColumnFiltersState>([]);
  
  // Fetch data với pagination, sorting, filtering
  const { data, isLoading } = useQuery({
    queryKey: ['users', pagination, sorting, filters],
    queryFn: () => usersService.getAll({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      sortBy: sorting[0]?.id,
      sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
      ...Object.fromEntries(filters.map(f => [f.id, f.value])),
    }),
    keepPreviousData: true, // Keep old data while fetching new
  });
  
  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    pageCount: data?.totalPages ?? 0,
    state: {
      pagination,
      sorting,
      columnFilters: filters,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setFilters,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });
  
  return <DataTable table={table} loading={isLoading} />;
}
```

### 7.2. Row Selection Pattern

**Mục đích**: Multi-select rows for bulk actions

```typescript
function UsersTable() {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { data: users } = useUsers();
  
  const table = useReactTable({
    data: users ?? [],
    columns,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
  });
  
  const selectedUsers = table.getSelectedRowModel().rows.map(row => row.original);
  
  const handleBulkDelete = async () => {
    await Promise.all(selectedUsers.map(user => usersService.delete(user.id)));
    setRowSelection({});
  };
  
  return (
    <div>
      {selectedUsers.length > 0 && (
        <div className="bulk-actions">
          <span>{selectedUsers.length} selected</span>
          <button onClick={handleBulkDelete}>Delete Selected</button>
        </div>
      )}
      <DataTable table={table} />
    </div>
  );
}
```

### 7.3. Column Visibility Pattern

**Mục đích**: User-customizable columns

```typescript
function UsersTable() {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  
  const table = useReactTable({
    data: users ?? [],
    columns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  });
  
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger>Columns</DropdownMenuTrigger>
        <DropdownMenuContent>
          {table.getAllLeafColumns().map(column => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={column.getToggleVisibilityHandler()}
            >
              {column.id}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <DataTable table={table} />
    </div>
  );
}
```

---

## 🎭 8. MODAL & DIALOG PATTERNS

### 8.1. Controlled Modal Pattern

**Mục đích**: Centralized modal state management

```typescript
// Modal Store
interface ModalState {
  modals: Record<string, boolean>;
  openModal: (id: string) => void;
  closeModal: (id: string) => void;
  toggleModal: (id: string) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  modals: {},
  openModal: (id) => set((state) => ({ modals: { ...state.modals, [id]: true } })),
  closeModal: (id) => set((state) => ({ modals: { ...state.modals, [id]: false } })),
  toggleModal: (id) => set((state) => ({ 
    modals: { ...state.modals, [id]: !state.modals[id] } 
  })),
}));

// Usage
function UsersPage() {
  const { modals, openModal, closeModal } = useModalStore();
  
  return (
    <div>
      <button onClick={() => openModal('create-user')}>Create User</button>
      
      <Dialog open={modals['create-user']} onOpenChange={() => closeModal('create-user')}>
        <DialogContent>
          <UserForm onSuccess={() => closeModal('create-user')} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

### 8.2. Confirmation Dialog Pattern

**Mục đích**: Reusable confirmation dialog

```typescript
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

function ConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button 
            variant={variant} 
            onClick={handleConfirm} 
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Usage
function UserActions({ user }: { user: User }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const { mutateAsync: deleteUser } = useDeleteUser();
  
  return (
    <>
      <button onClick={() => setShowConfirm(true)}>Delete</button>
      
      <ConfirmDialog
        open={showConfirm}
        title="Delete User"
        description={`Are you sure you want to delete ${user.fullName}?`}
        onConfirm={async () => {
          await deleteUser(user.id);
          setShowConfirm(false);
        }}
        onCancel={() => setShowConfirm(false)}
        confirmText="Delete"
        variant="destructive"
      />
    </>
  );
}
```

---

## 🚀 9. PERFORMANCE PATTERNS

### 9.1. Memoization Pattern

```typescript
// Memoize expensive computations
function UsersTable({ users }: { users: User[] }) {
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [users]);
  
  const usersByRole = useMemo(() => {
    return users.reduce((acc, user) => {
      const role = user.roles[0]?.name || 'USER';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [users]);
  
  return <Table data={sortedUsers} stats={usersByRole} />;
}

// Memoize callbacks
function UserRow({ user, onDelete }: { user: User; onDelete: (id: string) => void }) {
  const handleDelete = useCallback(() => {
    onDelete(user.id);
  }, [user.id, onDelete]);
  
  return (
    <tr>
      <td>{user.fullName}</td>
      <td><button onClick={handleDelete}>Delete</button></td>
    </tr>
  );
}

// Memoize components
const MemoizedUserCard = React.memo(UserCard, (prev, next) => {
  return prev.user.id === next.user.id && prev.user.updatedAt === next.user.updatedAt;
});
```

### 9.2. Virtual Scrolling Pattern

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualizedUsersList({ users }: { users: User[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Estimated row height
    overscan: 5, // Render 5 extra items
  });
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const user = users[virtualRow.index];
          return (
            <div
              key={user.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <UserCard user={user} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### 9.3. Debounce & Throttle Pattern

```typescript
// Debounce search input
function SearchInput({ onSearch }: { onSearch: (term: string) => void }) {
  const [value, setValue] = useState('');
  
  const debouncedSearch = useMemo(
    () => debounce((term: string) => onSearch(term), 300),
    [onSearch]
  );
  
  useEffect(() => {
    debouncedSearch(value);
  }, [value, debouncedSearch]);
  
  return <input value={value} onChange={(e) => setValue(e.target.value)} />;
}

// Throttle scroll handler
function InfiniteScroll() {
  const handleScroll = useCallback(
    throttle(() => {
      // Handle scroll
    }, 200),
    []
  );
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
}
```

---

## 📝 10. FORM PATTERNS

### 10.1. Multi-Step Form Pattern

```typescript
function MultiStepCourseForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<CreateCourseDto>>({});
  
  const updateFormData = (data: Partial<CreateCourseDto>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };
  
  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);
  
  const handleSubmit = async () => {
    await coursesService.create(formData as CreateCourseDto);
  };
  
  return (
    <div>
      <StepIndicator currentStep={step} totalSteps={3} />
      
      {step === 1 && (
        <CourseBasicInfoForm 
          data={formData} 
          onNext={(data) => {
            updateFormData(data);
            handleNext();
          }}
        />
      )}
      
      {step === 2 && (
        <CourseUnitsForm
          data={formData}
          onNext={(data) => {
            updateFormData(data);
            handleNext();
          }}
          onBack={handleBack}
        />
      )}
      
      {step === 3 && (
        <CourseReviewForm
          data={formData}
          onSubmit={handleSubmit}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
```

### 10.2. Dynamic Form Fields Pattern

```typescript
function VocabularyForm() {
  const { control, register } = useForm<VocabularyFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'examples',
  });
  
  return (
    <form>
      <Input {...register('word')} placeholder="Word" />
      <Input {...register('translation')} placeholder="Translation" />
      
      <div>
        <h3>Examples</h3>
        {fields.map((field, index) => (
          <div key={field.id}>
            <Input {...register(`examples.${index}.sentence`)} placeholder="Sentence" />
            <Input {...register(`examples.${index}.translation`)} placeholder="Translation" />
            <button type="button" onClick={() => remove(index)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={() => append({ sentence: '', translation: '' })}>
          Add Example
        </button>
      </div>
    </form>
  );
}
```

### 10.3. Conditional Fields Pattern

```typescript
function ExerciseForm() {
  const { watch, register } = useForm<ExerciseFormData>();
  const exerciseType = watch('exerciseType');
  
  return (
    <form>
      <Select {...register('exerciseType')}>
        <option value="multiple_choice">Multiple Choice</option>
        <option value="fill_blank">Fill in the Blank</option>
        <option value="matching">Matching</option>
      </Select>
      
      {exerciseType === 'multiple_choice' && (
        <MultipleChoiceOptions control={control} />
      )}
      
      {exerciseType === 'fill_blank' && (
        <FillBlankOptions control={control} />
      )}
      
      {exerciseType === 'matching' && (
        <MatchingOptions control={control} />
      )}
    </form>
  );
}
```

---

## 🎯 11. BEST PRACTICES SUMMARY

### DO's ✅

1. **Separation of Concerns**: Tách logic và UI
2. **Type Safety**: Dùng TypeScript đầy đủ
3. **Error Handling**: Handle errors gracefully
4. **Loading States**: Show loading indicators
5. **Optimistic Updates**: Better UX
6. **Memoization**: Optimize performance
7. **Code Reusability**: DRY principle
8. **Accessibility**: ARIA labels, keyboard navigation
9. **Security**: Permission checks, input validation
10. **Testing**: Unit tests, integration tests

### DON'Ts ❌

1. **Prop Drilling**: Dùng Context/Zustand thay vì
2. **Inline Functions**: Dùng useCallback
3. **Direct DOM Manipulation**: Dùng React refs
4. **Hardcoded Values**: Dùng constants
5. **Mixed Concerns**: Tách presentation và logic
6. **Ignoring Errors**: Always handle errors
7. **No Loading States**: Always show loading
8. **Premature Optimization**: Optimize when needed
9. **Large Components**: Split into smaller ones
10. **No Type Safety**: Always use TypeScript

---

## 📚 References

- [React Patterns](https://reactpatterns.com/)
- [TanStack Query Patterns](https://tanstack.com/query/latest/docs/react/guides/advanced-ssr)
- [React Hook Form Best Practices](https://react-hook-form.com/advanced-usage)
- [Clean Architecture Frontend](https://dev.to/bespoyasov/clean-architecture-on-frontend-4311)
