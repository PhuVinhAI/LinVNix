# LinVNix Admin Panel

Admin panel cho LinVNix - Universal app chạy được cả trên Web và Desktop (Electron).

## Tính năng

- ✅ **Universal App**: Một codebase, chạy được cả web và desktop
- ✅ **Platform Detection**: Tự động phát hiện môi trường và adapt logic
- ✅ **React + TypeScript**: Type-safe development
- ✅ **Vite**: Lightning-fast HMR
- ✅ **TailwindCSS + Shadcn UI**: Modern UI components
- ✅ **Electron**: Native desktop app capabilities
- ✅ **Bun**: Fast package manager

## Tech Stack

- **Frontend**: React 19, TypeScript, TailwindCSS, Shadcn UI
- **Build Tool**: Vite, Electron Vite
- **Desktop**: Electron
- **Package Manager**: Bun

## Cài đặt

```bash
# Clone repo (đã có sẵn trong monorepo)
cd admin

# Install dependencies
bun install
```

## Development

### Chạy Web Mode

```bash
bun run dev:web
```

App sẽ chạy tại `http://localhost:5173`

### Chạy Desktop Mode (Electron)

```bash
bun run dev
```

Electron app sẽ tự động mở.

## Platform Detection

App tự động phát hiện môi trường và adapt logic:

```typescript
import { isElectron, isWeb, getPlatformConfig } from '@/lib/platform'

// Kiểm tra platform
if (isElectron()) {
  // Logic cho Electron
} else {
  // Logic cho Web
}

// Lấy config theo platform
const config = getPlatformConfig()
console.log(config.platform) // 'electron' | 'web'
console.log(config.apiBaseUrl) // API URL tùy platform
```

## Conveyor API

Conveyor là IPC system cho Electron. Trong web mode, nó tự động dùng mock implementation:

```typescript
import { useConveyor } from '@/app/hooks/use-conveyor'

function MyComponent() {
  const { version } = useConveyor('app')
  
  // Trong Electron: gọi real API
  // Trong Web: gọi mock API
  const appVersion = await version()
}
```

## Build

### Build Web

```bash
bun run build:web
```

Output: `dist-web/`

### Build Desktop

```bash
# Windows
bun run build:win

# macOS
bun run build:mac

# Linux
bun run build:linux
```

Output: `dist/`

## Scripts

- `bun run dev` - Chạy Electron dev mode
- `bun run dev:web` - Chạy web dev mode
- `bun run typecheck` - Check TypeScript errors
- `bun run lint` - Lint code
- `bun run format` - Format code với Prettier
- `bun run build:web` - Build web app
- `bun run build:win` - Build Windows app
- `bun run build:mac` - Build macOS app
- `bun run build:linux` - Build Linux app

## Environment Variables

Tạo file `.env`:

```bash
VITE_API_URL=http://localhost:3000/api/v1
```

## Cấu trúc thư mục

```
admin/
├── app/                    # React app (renderer process)
│   ├── components/        # UI components
│   ├── hooks/            # React hooks
│   ├── styles/           # CSS files
│   ├── app.tsx           # Root component
│   ├── renderer.tsx      # Entry point
│   └── index.html        # HTML template
├── lib/                   # Shared libraries
│   ├── conveyor/         # IPC system
│   │   └── api/
│   │       ├── universal.ts    # Universal conveyor
│   │       └── web-mock.ts     # Web mock
│   ├── platform/         # Platform detection
│   ├── main/             # Electron main process
│   └── preload/          # Electron preload scripts
├── resources/            # Build resources
├── vite.config.ts        # Vite config (web)
├── electron.vite.config.ts  # Electron Vite config
└── package.json
```

## Lưu ý

- Web mode không có custom titlebar (chỉ Electron mới có)
- Một số API chỉ hoạt động trong Electron (file system, native dialogs, etc.)
- Dùng platform detection để handle conditional logic
- Mock API được tự động sử dụng trong web mode

## License

MIT
