# Module 07: Quản Lý Nhân Viên & Tài Khoản (Staff & User Management)

## Tổng quan
Module **Quản lý Nhân viên & Tài khoản** cho phép chủ tiệm bánh tạo và quản lý danh sách các tài khoản truy cập vào phần mềm. Quản trị viên có thể cấp tài khoản cho thu ngân mới, thiết lập mật khẩu ban đầu, phân chia vai trò rõ ràng (Admin hoặc Staff) và quản lý trạng thái kích hoạt của từng nhân sự trong tiệm.

---

## User Stories

### US-07.1: Xem danh sách và tìm kiếm nhân viên
- **Là một** Quản trị viên,
- **Tôi muốn** xem bảng danh sách toàn bộ nhân viên kèm thông tin liên hệ (Email, SĐT) và vai trò,
- **Để** quản lý cơ cấu nhân sự và các tài khoản đang hoạt động trong tiệm.

### US-07.2: Thêm mới tài khoản nhân viên
- **Là một** Quản trị viên,
- **Tôi muốn** tạo mới tài khoản cho nhân viên mới vào làm bằng cách nhập Họ tên, Username, Mật khẩu tạm, Email, SĐT và chọn vai trò (Admin / Staff),
- **Để** cấp quyền đăng nhập và bắt đầu ca làm việc cho nhân viên.

---

## Acceptance Criteria (Given - When - Then)

### Kịch bản US-07.1: Tra cứu danh sách nhân viên
#### Kịch bản 7.1.1: Tìm kiếm nhân viên theo tên hoặc số điện thoại (Happy Path)
- **Given** người quản trị đang ở trang `/users`.
- **When** người dùng nhập tên `"Thu Ngân"` hoặc SĐT `"0912345678"` vào ô tìm kiếm.
- **Then** bảng dữ liệu lọc ngay lập tức và chỉ hiển thị đúng thông tin của nhân viên Trần Thị Thu Ngân kèm tag vai trò màu xanh (Thu ngân).

---

### Kịch bản US-07.2: Tạo tài khoản nhân viên mới
#### Kịch bản 7.2.1: Tạo tài khoản Thu ngân thành công (Happy Path)
- **Given** người quản trị đang ở trang form `/users/new`.
- **When** người dùng nhập Họ tên `"Hoàng Thị Ánh Tuyết"`, Username `"tuyetht"`, Mật khẩu `"Abc@12345"`, Email `"tuyet@artisanbakery.vn"`, SĐT `"0911223344"`, chọn thẻ vai trò "Nhân viên Thu ngân (Staff)" và bấm "Tạo tài khoản".
- **Then** hệ thống lưu tài khoản mới thành công, hiển thị thông báo "Tạo tài khoản nhân viên mới thành công!" và chuyển hướng về trang `/users` có xuất hiện nhân viên mới.

#### Kịch bản 7.2.2: Tên đăng nhập không đúng định dạng ký tự (Validation Error)
- **Given** người quản trị đang ở trang `/users/new`.
- **When** người dùng nhập Username có chứa dấu cách hoặc ký tự đặc biệt `"tuyet ht@!"`.
- **Then** hệ thống báo lỗi validation ngay dưới ô nhập: *"Username chỉ gồm chữ, số và dấu gạch dưới!"* và không cho phép submit form.

#### Kịch bản 7.2.3: Email sai định dạng (Validation Error)
- **Given** người quản trị đang ở trang `/users/new`.
- **When** người dùng nhập Email không có đuôi domain `"tuyet.bakery"`.
- **Then** hệ thống báo lỗi: *"Email không đúng định dạng!"* và chặn submit form.

---

## Business Rules (Quy tắc nghiệp vụ)

1. **Quy chuẩn dữ liệu tài khoản**:
   - **`username`**: Duy nhất, tự động chuyển về chữ thường (`toLowerCase()`), chỉ chấp nhận các ký tự chữ cái không dấu `a-z`, số `0-9` và dấu gạch dưới `_`.
   - **`role`**: Bắt buộc chọn 1 trong 2 vai trò:
     - `ADMIN`: Quản trị viên toàn quyền (Tag màu tím).
     - `STAFF`: Nhân viên Thu ngân POS (Tag màu xanh dương).
   - **`status`**: Mặc định khi tạo mới là `ACTIVE` (Đang hoạt động - Tag màu xanh lục).
2. **Phân quyền truy cập**:
   - Chỉ người dùng có vai trò `ADMIN` mới có quyền truy cập vào danh sách `/users` và form tạo mới `/users/new`.

---

## Phạm vi kỹ thuật liên quan

- **Routes**:
  - `/users` ([`app/users/page.tsx`](file:///Users/gnuhh/Project/python/fe/app/users/page.tsx))
  - `/users/new` ([`app/users/new/page.tsx`](file:///Users/gnuhh/Project/python/fe/app/users/new/page.tsx))
- **File dùng chung liên quan**:
  - `lib/mock-data.ts`: Schema `User`.
  - `lib/api.ts`: Hàm `getUsers()` và `createUser()`.
