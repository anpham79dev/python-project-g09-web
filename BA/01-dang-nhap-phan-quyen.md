# Module 01: Đăng Nhập & Phân Quyền Người Dùng (Authentication & RBAC)

## Tổng quan
Module **Đăng nhập & Phân quyền** cung cấp cơ chế định danh an toàn cho nhân viên và quản lý tiệm bánh khi truy cập vào hệ thống phần mềm quản lý tiệm bánh. Tính năng này đảm bảo dữ liệu kinh doanh quan trọng (doanh thu, cấu hình giá, thông tin nhân sự) chỉ dành cho Quản trị viên, đồng thời tối ưu giao diện bán hàng tinh gọn cho Thu ngân tại quầy.

---

## User Stories

### US-01.1: Đăng nhập vào hệ thống
- **Là một** Nhân viên thu ngân hoặc Quản trị viên,
- **Tôi muốn** nhập tên đăng nhập và mật khẩu được cấp,
- **Để** truy cập vào giao diện làm việc tương ứng với quyền hạn của mình.

### US-01.2: Phân quyền truy cập theo vai trò (RBAC)
- **Là một** Quản trị viên (Admin),
- **Tôi muốn** hệ thống chỉ hiển thị và cho phép nhân viên Thu ngân (Staff) truy cập màn hình Bán hàng (POS) và Lịch sử đơn hàng,
- **Để** bảo mật các thông tin nhạy cảm về doanh thu báo cáo và cấu hình tài khoản.

### US-01.3: Đăng xuất khỏi phiên làm việc
- **Là một** Nhân viên hoặc Quản lý,
- **Tôi muốn** có thể chủ động đăng xuất khi hết ca làm việc,
- **Để** đảm bảo an toàn cho ca bán hàng tiếp theo và không bị lẫn lộn lịch sử thao tác.

---

## Acceptance Criteria (Given - When - Then)

### Kịch bản US-01.1: Đăng nhập hệ thống
#### Kịch bản 1.1.1: Đăng nhập thành công với vai trò Quản trị viên (Happy Path)
- **Given** người dùng đang ở trang `/login` và chưa có phiên đăng nhập hợp lệ.
- **When** người dùng nhập Tên đăng nhập `admin` và Mật khẩu `password123`, sau đó bấm nút "Đăng nhập hệ thống".
- **Then** hệ thống xác thực thành công, lưu trữ JWT Token và thông tin `{ role: 'ADMIN' }` vào `localStorage`, đồng thời điều hướng người dùng tới trang Tổng quan Báo cáo `/dashboard`.

#### Kịch bản 1.1.2: Đăng nhập thành công với vai trò Thu ngân (Happy Path)
- **Given** người dùng đang ở trang `/login`.
- **When** người dùng bấm nút tài khoản mẫu "Staff (Thu ngân)" và bấm nút "Đăng nhập hệ thống".
- **Then** hệ thống xác thực thành công và tự động điều hướng người dùng trực tiếp vào màn hình Quầy bán hàng `/pos`.

#### Kịch bản 1.1.3: Đăng nhập thất bại do sai thông tin (Edge Case / Error)
- **Given** người dùng đang ở trang `/login`.
- **When** người dùng nhập Tên đăng nhập không tồn tại hoặc mật khẩu rỗng rồi bấm Đăng nhập.
- **Then** hệ thống hiển thị thông báo cảnh báo lỗi màu đỏ (Alert) với nội dung rõ ràng, không điều hướng và giữ nguyên dữ liệu đã nhập ở ô username.

---

### Kịch bản US-01.2: Kiểm soát quyền truy cập trang
#### Kịch bản 1.2.1: Nhân viên Thu ngân truy cập trang quản trị trái phép
- **Given** người dùng đã đăng nhập với vai trò `STAFF`.
- **When** người dùng cố tình nhập URL trang quản trị trên thanh địa chỉ trình duyệt (ví dụ: `/dashboard`, `/products`, `/users`).
- **Then** hệ thống chặn truy cập, hiển thị thông báo lỗi "Bạn không có quyền truy cập..." và tự động điều hướng an toàn về trang `/pos`.

#### Kịch bản 1.2.2: Người dùng chưa đăng nhập truy cập trang nội bộ
- **Given** người dùng chưa có Token xác thực trong trình duyệt.
- **When** người dùng mở bất kỳ trang nào thuộc hệ thống (ví dụ: `/pos` hoặc `/orders`).
- **Then** hệ thống lập tức chuyển hướng về trang `/login`.

---

### Kịch bản US-01.3: Đăng xuất tài khoản
#### Kịch bản 1.3.1: Đăng xuất phiên làm việc (Happy Path)
- **Given** người dùng đang đăng nhập và ở bất kỳ màn hình nào.
- **When** người dùng bấm vào Avatar/Tên người dùng ở góc trên cùng bên phải và chọn "Đăng xuất".
- **Then** hệ thống xóa sạch `token` và thông tin `user` khỏi `localStorage`, xóa toàn bộ cookie xác thực, sau đó điều hướng về trang `/login`.

---

### Kịch bản US-01.4: Điều hướng thông minh từ tuyến đường gốc (`/`)
#### Kịch bản 1.4.1: Chưa đăng nhập hoặc Token đã hết hạn truy cập `/`
- **Given** người dùng chưa đăng nhập hoặc cookie Token `artisan_token` đã quá thời hạn hiệu lực (`exp < now`).
- **When** người dùng truy cập vào địa chỉ gốc của ứng dụng (`http://localhost:3000/`).
- **Then** Edge Middleware và Server Component lập tức dọn dẹp các cookie phiên không hợp lệ và tự động chuyển hướng người dùng thẳng về trang `/login`.

#### Kịch bản 1.4.2: Đã đăng nhập với Token còn hạn truy cập `/`
- **Given** người dùng đã đăng nhập và Token còn hạn hiệu lực.
- **When** người dùng truy cập vào địa chỉ gốc (`http://localhost:3000/`).
- **Then** hệ thống tự động kiểm tra vai trò và quyền hạn:
  - Nếu là Quản trị viên (`SUPER_ADMIN`, `ADMIN`) hoặc có quyền xem báo cáo: chuyển hướng ngay vào `/dashboard`.
  - Nếu là Thu ngân (`STAFF`): chuyển hướng ngay vào quầy bán hàng `/pos`.

---

## Business Rules (Quy tắc nghiệp vụ)

1. **Phân quyền vai trò (Role Mapping)**:
   - **`SUPER_ADMIN` / `ADMIN` (Quản trị viên)**: Toàn quyền truy cập tất cả các route bao gồm: Báo cáo (`/dashboard`), Sổ quỹ kế toán (`/accounting`), Bán hàng (`/pos`), Quản lý sản phẩm & kho (`/products`, `/products/new`, `/products/[id]/edit`), Đa chi nhánh (`/branches`), Cài đặt (`/settings`, `/settings/roles`), Lịch sử đơn hàng (`/orders`, `/orders/[id]`), Quản lý tài khoản (`/users`, `/users/new`). Có quyền chuyển đổi giữa tất cả các chi nhánh ("Toàn chuỗi" hoặc từng cơ sở).
   - **`STAFF` (Thu ngân)**: Chỉ được phép truy cập các route nghiệp vụ: Bán hàng tại quầy (`/pos`), Lịch sử đơn hàng (`/orders`), Ca làm việc (`/shifts`). Topbar điều hướng tự động ẩn các menu Admin.
2. **Khóa chi nhánh làm việc theo nhân viên (Staff Branch Scoping & Locking)**:
   - Khi Admin tạo tài khoản Staff mới (`/users/new`), bắt buộc phải chỉ định **Chi nhánh làm việc** (`defaultBranchId`).
   - Khi Staff đăng nhập, hệ thống tự động nhận diện và khóa cố định phiên làm việc vào đúng chi nhánh được gán (`user.defaultBranchId`).
   - Trên Topbar của Staff hiển thị huy hiệu cố định `🏢 [Tên Chi Nhánh]` và không cho phép đổi sang chi nhánh khác nhằm ngăn ngừa sai lệch doanh thu và tồn kho giữa các cơ sở.
3. **Cơ chế lưu trữ phiên & Kiểm soát thời hạn Token (Session & JWT Expiration Guard)**:
   - Thông tin phiên được lưu giữ đồng bộ trong `localStorage` và Cookies trình duyệt (`artisan_token`, `artisan_user_role`, `artisan_permissions`).
   - Hệ thống loại bỏ hoàn toàn Landing Page công khai để tập trung 100% vào nghiệp vụ quản lý tiệm bánh nội bộ.
   - Tại tầng Edge Middleware, Token JWT được giải mã phần payload để kiểm tra trường thời gian hết hạn (`exp`):
     - Nếu `exp * 1000 < Date.now()`: Token đã hết hạn, hệ thống tự động xóa sạch các cookie phiên và chuyển hướng về `/login`.
     - Nếu còn hạn: Cho phép truy cập hoặc điều hướng thông minh vào màn hình làm việc tương ứng (`/dashboard` hoặc `/pos`).
   - Mọi request gửi tới API backend phải tự động đính kèm header `Authorization: Bearer <token>`. Nếu API trả về mã lỗi `401 Unauthorized`, hệ thống tự động xóa phiên và chuyển hướng về `/login`.

---

## Phạm vi kỹ thuật liên quan

- **Routes**:
  - `/` ([`app/page.tsx`](file:///Users/gnuhh/Project/cuoimon/python-project-g09-web/app/page.tsx)): Server Component điều hướng gốc thông minh.
  - `/login` ([`app/login/page.tsx`](file:///Users/gnuhh/Project/cuoimon/python-project-g09-web/app/login/page.tsx)): Giao diện đăng nhập xác thực.
  - Topbar & Sider Protection ([`app/client-layout.tsx`](file:///Users/gnuhh/Project/cuoimon/python-project-g09-web/app/client-layout.tsx)): Bố cục quản lý tiệm bánh phân quyền động.
  - Edge Protection ([`middleware.ts`](file:///Users/gnuhh/Project/cuoimon/python-project-g09-web/middleware.ts)): Bộ lọc bảo vệ tuyến đường và kiểm tra hạn JWT.
- **File dùng chung liên quan**:
  - `lib/auth.ts`: Định nghĩa helper `getCurrentUser`, `setAuthSession`, `clearAuthSession`, `hasPermission`.
  - `lib/rbac-config.ts`: Ma trận 20 quyền hạn nguyên tử và cấu hình vai trò hệ thống.
  - `lib/axios.ts`: Request interceptor gắn Bearer Token & Response interceptor xử lý 401.
  - `lib/api.ts`: Hàm `login()`.
