# 🪙 CoinRadar — Giám sát thị trường tài chính

Ứng dụng web giám sát thị trường tài chính (cổ phiếu, crypto, vàng) với biểu đồ kỹ thuật, cảnh báo giá, tin tức và AI chat.

## 🛠️ Công nghệ sử dụng

| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| **Next.js** | 16 (App Router) | Framework React full-stack |
| **TypeScript** | 5 | Strict typing |
| **Tailwind CSS** | 4 | Utility-first CSS |
| **shadcn/ui** | New York style | Component library |
| **Prisma** | 6 (SQLite) | ORM & Database |
| **Zustand** | 5 | State management |
| **Framer Motion** | 12 | Animations |
| **Node.js** | ≥ 18 | Runtime (khuyến nghị 20+) |
| **Bun** | ≥ 1.0 | Package manager (hoặc npm/yarn/pnpm) |

---

## 📋 Yêu cầu hệ thống

Trước khi bắt đầu, đảm bảo máy tính Windows của bạn đã cài đặt:

1. **Node.js** ≥ 18.x → [Tải tại đây](https://nodejs.org/)
   - Mở **Command Prompt** hoặc **PowerShell**, gõ:
   ```bash
   node -v
   npm -v
   ```
   - Nếu hiển thị phiên bản thì đã cài đúng.

2. **Git** → [Tải tại đây](https://git-scm.com/download/win)
   - Kiểm tra:
   ```bash
   git --version
   ```

3. **Editor** — Khuyến nghị [VS Code](https://code.visualstudio.com/) + extension [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

---

## 🚀 Hướng dẫn khởi động trên Windows

### Bước 1: Clone repository

Mở **Command Prompt** hoặc **PowerShell**, chạy lệnh:

```bash
git clone https://github.com/TuanAnhAut/coin-radar-web.git
cd coin-radar-web
```

### Bước 2: Cài đặt dependencies

Bạn có thể dùng **npm** (đi kèm Node.js) hoặc cài **Bun** để nhanh hơn.

#### Cách 1: Dùng npm (không cần cài thêm gì)

```bash
npm install
```

#### Cách 2: Dùng Bun (nhanh hơn, khuyến nghị)

Cài Bun trên Windows:
```bash
powershell -c "irm bun.sh/install.ps1 | iex"
```

Sau đó cài dependencies:
```bash
bun install
```

### Bước 3: Cấu hình biến môi trường

Tạo file `.env` trong thư mục gốc dự án (nếu chưa có):

```env
DATABASE_URL=file:./db/custom.db
```

> ⚠️ File `.env` đã có trong repo. Nếu bị lỗi database, kiểm tra đường dẫn trong `DATABASE_URL` đúng thư mục `db/custom.db`.

### Bước 4: Khởi tạo Database (Prisma)

```bash
# Nếu dùng npm
npx prisma db push

# Nếu dùng Bun
bunx prisma db push
```

Lệnh này sẽ:
- Tạo thư mục `db/` nếu chưa có
- Tạo file `db/custom.db` (SQLite database)
- Áp dụng schema từ `prisma/schema.prisma`

### Bước 5: Chạy dev server

```bash
# Nếu dùng npm
npm run dev

# Nếu dùng Bun
bun run dev
```

Server sẽ khởi động tại **http://localhost:3000**

Mở trình duyệt và truy cập: **http://localhost:3000**

---

## 📁 Cấu trúc dự án

```
coin-radar-web/
├── prisma/
│   └── schema.prisma          # Database schema (SQLite)
├── db/
│   └── custom.db              # SQLite database file
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout (theme, metadata)
│   │   ├── page.tsx           # Entry page
│   │   ├── globals.css        # Global styles
│   │   └── api/               # API routes
│   │       ├── assets/        # Market assets
│   │       ├── alerts/        # Alert management
│   │       ├── news/          # Financial news
│   │       ├── auth/          # Login, register, OTP
│   │       └── user/          # Profile, password, 2FA
│   ├── components/
│   │   ├── layout/            # Header, sidebar, bottom nav
│   │   ├── home/              # Home dashboard
│   │   ├── market/            # Market view, chart detail
│   │   ├── chart/             # Canvas chart, indicators, tools
│   │   ├── alerts/            # Alert hub, builder
│   │   ├── news/              # News page
│   │   ├── chat/              # Expert directory, AI chat
│   │   ├── auth/              # Login, register, OTP screens
│   │   ├── profile/           # Profile dashboard
│   │   └── ui/                # shadcn/ui components
│   ├── store/
│   │   └── app-store.ts       # Zustand global state
│   └── lib/
│       ├── db.ts              # Prisma client
│       ├── types.ts           # TypeScript interfaces
│       ├── format.ts          # Formatting utilities
│       └── utils.ts           # General utilities
├── public/                    # Static assets
├── .env                       # Environment variables
├── package.json               # Dependencies & scripts
├── tsconfig.json              # TypeScript config
├── next.config.ts             # Next.js config
└── tailwind.config.ts         # Tailwind CSS config
```

---

## 🔧 Các lệnh hữu ích

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Chạy dev server (http://localhost:3000) |
| `npm run lint` | Kiểm tra code quality (ESLint) |
| `npx prisma db push` | Áp dụng schema thay đổi vào database |
| `npx prisma studio` | Mở Prisma Studio xem database trực tiếp |
| `npx prisma generate` | Tạo lại Prisma Client |

---

## ❓ Xử lý lỗi phổ biến trên Windows

### 1. Lỗi `port 3000 is already in use`

Port 3000 đang bị ứng dụng khác sử dụng. Tìm và kill process:

```bash
# Tìm process dùng port 3000
netstat -ano | findstr :3000

# Kill process (thay PID bằng số tìm được)
taskkill /PID <PID> /F
```

Hoặc dùng port khác:
```bash
npx next dev -p 3001
```

### 2. Lỗi `prisma db push` không hoạt động

Đảm bảo file `.env` tồn tại và `DATABASE_URL` trỏ đúng:

```env
DATABASE_URL=file:./db/custom.db
```

Nếu vẫn lỗi, thử xóa database và tạo lại:
```bash
del db\custom.db
npx prisma db push
```

### 3. Lỗi `EACCES` hoặc permission denied trên Windows

Chạy Command Prompt / PowerShell với quyền **Administrator**.

### 4. Lỗi `sharp` (native module) trên Windows

Module `sharp` cần C++ build tools. Nếu lỗi:

```bash
npm install --global windows-build-tools
# Hoặc cài Visual Studio Build Tools từ Microsoft
```

### 5. Xóa cache và cài lại (clean install)

Nếu gặp lỗi khó hiểu, thử cài lại từ đầu:

```bash
# Xóa node_modules và cache
rmdir /s /q node_modules
del package-lock.json

# Cài lại
npm install

# Xóa cache Next.js
rmdir /s /q .next

# Chạy lại
npm run dev
```

---

## 📝 Lưu ý

- Dữ liệu hiện tại là **mock data** (dữ liệu giả) — các API trả về dữ liệu mẫu cho mục đích phát triển.
- Database sử dụng **SQLite** — không cần cài đặt database server riêng.
- Ứng dụng sử dụng **dark theme** mặc định (hỗ trợ light/dark mode).
- Tài khoản đăng nhập test: nhập **bất kỳ email/mật khẩu** đều đăng nhập được (mock auth).
