# Artisan Bakery - Hệ Thống Quản Lý & Vận Hành Tiệm Bánh

> **Dự án Frontend Web Application** phục vụ toàn diện vận hành tiệm bánh thủ công (Artisan Bakery): Bán lẻ tại quầy (POS), Quản lý thực đơn & tồn kho đa chi nhánh, Sổ quỹ thu chi kế toán, Quản lý ca làm việc kết ca, Phân quyền động PBAC và Báo cáo kinh doanh thời gian thực.

---

## 🌟 Giới Thiệu Dự Án & Các Phân Hệ Chính

**Artisan Bakery** được thiết kế chuẩn mực, giao diện hiện đại với tông màu Emerald chủ đạo (`#10B981`), tối ưu cho cả nhân viên bán hàng lẫn chủ tiệm bánh:

1. **Điều Hướng & Xác Thực An Toàn (Authentication & Smart Redirect):**
   - Tuyến đường gốc (`/`) tự động điều hướng thông minh: kiểm tra thời hạn token JWT để đưa ngay vào không gian làm việc (`/dashboard` hoặc `/pos`), hoặc đưa về `/login` nếu chưa đăng nhập.
2. **Điểm Bán Hàng Tại Quầy (POS Bán Lẻ Siêu Tốc):**
   - Bố cục 2 cột chuẩn mực (65% menu chọn món / 35% giỏ hàng), tìm kiếm theo tên hoặc mã bánh, quét đơn tức thì.
   - Hỗ trợ đa hình thức thanh toán (Tiền mặt, Chuyển khoản QR, Thẻ), tự động trừ tồn kho theo chi nhánh và in hóa đơn nhiệt.
3. **Quản Lý Đa Chi Nhánh & Đa Kho (Multi-Branch & Warehouses):**
   - Quản lý mạng lưới chi nhánh và kho lưu trữ (Kho Bánh Tươi, Kho Đông Lạnh,...).
   - Bảng điều khiển và bộ lọc toàn hệ thống cho phép xem dữ liệu theo từng chi nhánh cụ thể.
4. **Quản Lý Ca Làm Việc & Kết Ca Đối Soát (Shifts & Cash Reconciliation):**
   - Quy trình mở ca (khai báo số dư tiền mặt ban đầu), theo dõi doanh thu theo ca.
   - Đóng ca / Kết ca: Tự động tổng hợp số liệu tiền mặt và chuyển khoản, đối chiếu với số tiền thực tế trong két, phát hiện và giải trình chênh lệch thừa/thiếu.
5. **Kế Toán Sổ Quỹ Thu Chi & Đối Soát Ngân Hàng (Accounting):**
   - Quản lý thu chi tổng thể, lập phiếu thu / phiếu chi có chứng từ đính kèm.
   - Phân hệ đối soát giao dịch ngân hàng: Tự động khớp lệnh chuyển khoản với dữ liệu hóa đơn bán hàng.
6. **Phân Quyền Động PBAC (Permission-Based Access Control):**
   - Quản lý ma trận 20 quyền hạn nguyên tử trên 9 phân hệ.
   - Cho phép tạo vai trò tùy biến (Custom Roles) và phân quyền chi tiết cho từng nhóm nhân sự.
7. **Báo Cáo Doanh Thu & Bảng Điều Khiển (Dashboard KPIs):**
   - Trực quan hóa doanh thu theo từng khung giờ trong ngày (Recharts Area Chart) và Top 5 sản phẩm bán chạy nhất.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Công nghệ / Thư viện | Phiên bản | Vai trò & Mục đích sử dụng |
| :--- | :--- | :--- |
| **Next.js (App Router)** | `15+ / 16.3.1` | Framework React chính, Server Components, SSR/CSR tối ưu hóa Routing và Fonts |
| **TypeScript** | `5.x` | Định kiểu dữ liệu tĩnh chặt chẽ, an toàn cho toàn bộ mô hình dữ liệu |
| **Ant Design** | `v6 / v5-patch` | Thư viện UI Component chính (Button, Table, Form, Modal, Select, Tag, Drawer...) |
| **Tailwind CSS** | `v4` | Quản lý layout, flexbox, grid system và khoảng cách linh hoạt |
| **Recharts** | `3.x` | Biểu đồ diện tích (AreaChart) phân bổ doanh thu theo khung giờ tại Dashboard |
| **Axios** | `1.19.x` | HTTP Client gọi API backend kèm Request/Response Interceptor |
| **Lucide React / Ant Icons** | Latest | Bộ icon giao diện hiện đại, trực quan |
| **Google Fonts** | `next/font` | `Be Vietnam Pro` (UI tiếng Việt sắc nét) & `Inter` (Hiển thị số liệu tài chính) |

---

## 📂 Cấu Trúc Thư Mục Dự Án

```text
fe/
├── .env.local                    # Biến môi trường cấu hình Mock Data & API URL
├── DESIGN.md                     # Tài liệu Design Tokens & Specs trích xuất từ Google Stitch
├── README.md                     # Hướng dẫn dự án & kiến trúc hệ thống
├── middleware.ts                 # Next.js Middleware kiểm tra Auth & phân quyền Route Guards
│
├── BA/                           # 📑 THƯ MỤC TÀI LIỆU NGHIỆP VỤ (BUSINESS ANALYSIS)
│   ├── 01-dang-nhap-phan-quyen.md
│   ├── 02-quan-ly-danh-muc-san-pham.md
│   ├── 03-ban-hang-pos.md
│   ├── 04-quan-ly-ton-kho.md
│   ├── 05-quan-ly-don-hang.md
│   ├── 06-bao-cao-thong-ke.md
│   ├── 07-quan-ly-ca-ket-ca.md
│   ├── 07-quan-ly-nhan-vien.md
│   ├── 08-da-chi-nhanh-da-kho.md
│   ├── 09-cau-hinh-he-thong-va-ca-dong.md
│   └── 10-ke-toan-so-quy-thu-chi.md
│
├── lib/                          # TẦNG DỊCH VỤ DÙNG CHUNG (SHARED CORE LAYER)
│   ├── axios.ts                  # Axios instance với interceptor tự động gắn Bearer Token
│   ├── mock-data.ts              # Schema TypeScript & bộ dữ liệu mẫu khởi tạo
│   ├── auth.ts                   # Quản lý phiên đăng nhập và phân quyền PBAC / Role
│   ├── rbac-config.ts            # Định nghĩa 20 quyền hạn nguyên tử & cấu hình vai trò
│   └── api.ts                    # CỔNG API DUY NHẤT (Chuyển đổi Mock <-> FastAPI linh hoạt)
│
├── app/                          # CÁC TRANG ỨNG DỤNG (APP ROUTER)
│   ├── layout.tsx                # Font Be Vietnam Pro + AntdRegistry Wrapper
│   ├── client-layout.tsx         # ConfigProvider Theme Emerald (#10B981) + Header + Sidebar
│   ├── globals.css               # Cấu hình Tokens & CSS variables cho Tailwind v4
│   ├── page.tsx                  # Điều hướng thông minh (Tự động vào Dashboard/POS hoặc Login)
│   ├── login/page.tsx            # Trang Đăng nhập & Nút chọn nhanh tài khoản thử nghiệm
│   ├── pos/page.tsx              # Bán hàng POS 2 cột, giỏ hàng, thanh toán & in hóa đơn
│   ├── products/
│   │   ├── page.tsx              # Bảng quản lý kho bánh, lọc danh mục & trạng thái
│   │   ├── new/page.tsx          # Form thêm sản phẩm mới (Live Card Preview)
│   │   └── [id]/edit/page.tsx    # Form chỉnh sửa thông tin sản phẩm
│   ├── orders/
│   │   ├── page.tsx              # Lịch sử đơn hàng, lọc trạng thái & phương thức thanh toán
│   │   └── [id]/page.tsx         # Chi tiết hóa đơn bán lẻ & in phiếu thanh toán
│   ├── branches/page.tsx         # Quản lý chi nhánh & kiểm soát tồn kho từng kho
│   ├── shifts/page.tsx           # Quản lý ca làm việc, mở ca, đóng ca & đối soát tiền mặt
│   ├── accounting/page.tsx       # Sổ quỹ thu chi, quản lý phiếu thu/chi & đối soát ngân hàng
│   ├── dashboard/page.tsx        # Báo cáo doanh thu KPI, biểu đồ Recharts, Top 5 bán chạy
│   ├── settings/
│   │   ├── page.tsx              # Cài đặt hệ thống, thông tin tiệm bánh & mẫu ca làm việc
│   │   └── roles/page.tsx        # Ma trận phân quyền PBAC & Quản lý vai trò tùy biến
│   └── users/
│       ├── page.tsx              # Quản lý danh sách nhân sự & tài khoản
│       └── new/page.tsx          # Form tạo mới tài khoản nhân viên
│
└── tests/                        # BỘ KIỂM THỬ TỰ ĐỘNG (AUTOMATED TEST SUITE)
    ├── e2e/full-flow.spec.mjs
    ├── auth/route-guard.spec.mjs
    ├── rbac/pbac-roles.spec.mjs
    ├── accounting/accounting-branch-filter.spec.mjs
    ├── accounting/icons-header.spec.mjs
    ├── branch/branch-reload.spec.mjs
    ├── dashboard/branch-filter.spec.mjs
    └── navigation/sidebar.spec.mjs
```

---

## 🗺️ Danh Sách Tuyến Đường & Phân Quyền (Routes & Permissions)

| Tuyến đường | Mục đích sử dụng | Quyền hạn truy cập |
| :--- | :--- | :--- |
| `/` | Điều hướng thông minh (Vào trang làm việc nếu có token hợp lệ, hoặc vào Login) | Công khai (Public) |
| `/login` | Đăng nhập hệ thống & Chọn nhanh tài khoản demo | Công khai (Public) |
| `/dashboard` | Thống kê KPI doanh thu, biểu đồ phân bổ giờ, Top 5 | Quyền `dashboard:view` (SUPER_ADMIN, ADMIN) |
| `/pos` | Giao diện thu ngân bán hàng, giỏ hàng, in hóa đơn | Quyền `orders:create` (Mọi thu ngân/quản lý) |
| `/products` | Bảng quản lý kho bánh, tìm kiếm, lọc danh mục | Quyền `products:view` |
| `/products/new` | Form thêm món mới (Live Card Preview) | Quyền `products:create` |
| `/products/[id]/edit`| Form chỉnh sửa giá, mô tả, tồn kho món bánh | Quyền `products:edit` |
| `/orders` | Lịch sử đơn hàng, lọc theo ngày/trạng thái | Quyền `orders:view` |
| `/orders/[id]` | Màn hình xem chi tiết và in lại hóa đơn | Quyền `orders:view` |
| `/shifts` | Quản lý ca làm việc, mở ca, kết ca & đối soát két | Quyền `shifts:view` / `shifts:manage` |
| `/branches` | Quản lý danh sách chi nhánh & kho lưu trữ | Quyền `branches:view` / `branches:manage` |
| `/accounting` | Sổ quỹ thu chi, phiếu thu/chi, đối soát ngân hàng | Quyền `accounting:view` / `accounting:manage` |
| `/settings` | Cấu hình hệ thống, thuế VAT, mẫu ca làm | Quyền `settings:view` / `settings:manage` |
| `/settings/roles` | Ma trận quản lý vai trò & 20 quyền hạn PBAC | Quyền `roles:view` / `roles:manage` |
| `/users` | Bảng danh sách nhân viên & phân quyền | Quyền `users:view` |
| `/users/new` | Form thêm nhân viên mới và gán vai trò | Quyền `users:create` |

---

## 🔄 Cơ Chế Chuyển Đổi Mock Data <-> FastAPI (`NEXT_PUBLIC_USE_MOCK`)

Hệ thống được thiết kế với **Kiến trúc Cổng API tập trung (`lib/api.ts`)**:

- **Chế độ Mock (`NEXT_PUBLIC_USE_MOCK=true`)**: 
  - Toàn bộ dữ liệu đọc và ghi thông qua `localStorage` trong trình duyệt.
  - Có giả lập độ trễ mạng ~300ms để kiểm thử loading spinners.
  - **Dữ liệu sống (Stateful)**: Tạo đơn tại POS, thêm món mới hay mở ca đều được lưu trữ và đồng bộ tức thì giữa tất cả các trang (F5 không mất dữ liệu).
- **Chế độ Real API (`NEXT_PUBLIC_USE_MOCK=false`)**:
  - Tự động gọi REST API thật của FastAPI Backend (`http://localhost:8000/api`) qua Axios Client kèm Bearer JWT Token.

---

## 👥 Danh Sách Tài Khoản Thử Nghiệm (Demo Accounts)

Tại màn hình đăng nhập `/login`, bạn có thể bấm trực tiếp vào các nút chọn nhanh tài khoản:

| Tên đăng nhập | Mật khẩu | Họ và tên | Vai trò (Role) | Chi nhánh | Phạm vi quyền hạn |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`superadmin`** | `password123` | Tổng Quản Trị Hệ Thống | **SUPER_ADMIN** | Toàn hệ thống | Toàn bộ 21 quyền hạn (Quản lý phân quyền, CMS, Sổ quỹ, Cài đặt) |
| **`admin`** | `password123` | Nguyễn Quản Trị | **ADMIN** | CN Quận 1 | Quản lý Dashboard, Bánh, Đơn hàng, Nhân sự, Ca làm, Sổ quỹ |
| **`staff`** | `password123` | Trần Thị Thu Ngân | **STAFF** | CN Quận 1 | Bán hàng POS, Mở/Kết ca làm việc, Xem đơn hàng của mình |
| **`lethuha`** | `password123` | Lê Thu Hà | **STAFF** | CN Thảo Điền | Thu ngân chi nhánh Thảo Điền |
| **`phamminh`** | `password123` | Phạm Minh Bếp Bánh | **STAFF** | CN Quận 1 | Nhân viên bếp bánh |

---

## 📚 Tài Liệu Phân Tích Nghiệp Vụ Chi Tiết (Business Analysis)

Toàn bộ tài liệu nghiệp vụ chi tiết chuẩn Agile được lưu trữ trong thư mục [`BA/`](file:///Users/gnuhh/Project/python/fe/BA):

1. 📄 [Module 01: Đăng Nhập & Phân Quyền Người Dùng](file:///Users/gnuhh/Project/python/fe/BA/01-dang-nhap-phan-quyen.md)
2. 📄 [Module 02: Quản Lý Danh Mục & Sản Phẩm](file:///Users/gnuhh/Project/python/fe/BA/02-quan-ly-danh-muc-san-pham.md)
3. 📄 [Module 03: Điểm Bán Hàng Tại Quầy (POS)](file:///Users/gnuhh/Project/python/fe/BA/03-ban-hang-pos.md)
4. 📄 [Module 04: Quản Lý & Tự Động Trừ Tồn Kho](file:///Users/gnuhh/Project/python/fe/BA/04-quan-ly-ton-kho.md)
5. 📄 [Module 05: Quản Lý & Tra Cứu Đơn Hàng](file:///Users/gnuhh/Project/python/fe/BA/05-quan-ly-don-hang.md)
6. 📄 [Module 06: Báo Cáo Doanh Thu & Bảng Điều Khiển](file:///Users/gnuhh/Project/python/fe/BA/06-bao-cao-thong-ke.md)
7. 📄 [Module 07: Quản Lý Nhân Viên & Phân Quyền](file:///Users/gnuhh/Project/python/fe/BA/07-quan-ly-nhan-vien.md)
8. 📄 [Module 07 (Bổ sung): Quản Lý Ca Làm Việc & Kết Ca](file:///Users/gnuhh/Project/python/fe/BA/07-quan-ly-ca-ket-ca.md)
9. 📄 [Module 08: Quản Lý Đa Chi Nhánh & Đa Kho](file:///Users/gnuhh/Project/python/fe/BA/08-da-chi-nhanh-da-kho.md)
10. 📄 [Module 09: Cấu Hình Hệ Thống & Ca Làm Việc Động](file:///Users/gnuhh/Project/python/fe/BA/09-cau-hinh-he-thong-va-ca-dong.md)
11. 📄 [Module 10: Kế Toán & Sổ Quỹ Thu Chi](file:///Users/gnuhh/Project/python/fe/BA/10-ke-toan-so-quy-thu-chi.md)

---

## ⚡ Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### 1. Yêu cầu môi trường
- **Node.js**: Phiên bản `>= 18.18.0` hoặc `>= 20.x`
- **Package Manager**: `pnpm` (khuyên dùng) hoặc `npm` / `yarn`

### 2. Cài đặt các gói phụ thuộc
```bash
pnpm install
```

### 3. Thiết lập biến môi trường
File `.env.local` cấu hình kết nối API:
```env
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```
*(Nếu muốn chạy độc lập không cần backend, đặt `NEXT_PUBLIC_USE_MOCK=true`)*

### 4. Chạy môi trường phát triển (Dev Server)
```bash
pnpm dev
```
Mở trình duyệt tại: [http://localhost:3000](http://localhost:3000).

### 5. Chạy Kiểm Thử & Đóng Gói Sản Phẩm
```bash
# Kiểm tra định dạng code (ESLint)
pnpm lint

# Chạy bộ test tự động
node tests/e2e/full-flow.spec.mjs

# Build production đóng gói ứng dụng
pnpm build
```
