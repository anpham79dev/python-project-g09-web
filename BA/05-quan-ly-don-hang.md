# Module 05: Quản Lý & Tra Cứu Đơn Hàng (Order History & Receipts)

## Tổng quan
Module **Quản lý Đơn hàng** lưu trữ toàn bộ lịch sử các giao dịch bán hàng đã thực hiện tại tiệm bánh. Module này phục vụ công tác tra cứu hóa đơn cho khách khi có khiếu nại, đối soát doanh thu cuối ca của thu ngân và in lại hóa đơn nhiệt khi cần thiết.

---

## User Stories

### US-05.1: Xem danh sách và lọc lịch sử hóa đơn
- **Là một** Nhân viên thu ngân hoặc Quản trị viên,
- **Tôi muốn** xem bảng lịch sử toàn bộ các đơn hàng đã tạo kèm công cụ lọc theo trạng thái, hình thức thanh toán hoặc tìm kiếm theo mã đơn / tên khách,
- **Để** nhanh chóng tìm lại giao dịch cần kiểm tra.

### US-05.2: Xem chi tiết nội dung từng hóa đơn
- **Là một** Nhân viên hoặc Quản lý,
- **Tôi muốn** nhấp vào một dòng đơn hàng để mở trang xem chi tiết toàn diện (danh sách từng món, số lượng, đơn giá, chiết khấu, ghi chú và thu ngân phụ trách),
- **Để** giải quyết khiếu nại hoặc kiểm tra lại thành phần món khách đã đặt.

### US-05.3: In lại hóa đơn bán hàng
- **Là một** Nhân viên thu ngân,
- **Tôi muốn** bấm nút "In hóa đơn" trên trang chi tiết đơn hàng,
- **Để** in lại phiếu thanh toán cho khách hàng nếu máy in gặp sự cố hoặc khách có nhu cầu nhận lại hóa đơn giấy.

---

## Acceptance Criteria (Given - When - Then)

### Kịch bản US-05.1: Danh sách và bộ lọc đơn hàng
#### Kịch bản 5.1.1: Tìm kiếm đơn hàng theo mã hóa đơn (Happy Path)
- **Given** người dùng đang ở trang `/orders`.
- **When** người dùng nhập mã `"HD-260816-01"` vào ô tìm kiếm.
- **Then** bảng dữ liệu hiển thị chính xác dòng đơn hàng có mã `HD-260816-01` của khách hàng tương ứng.

#### Kịch bản 5.1.2: Lọc đơn hàng theo hình thức thanh toán
- **Given** người dùng đang ở trang `/orders`.
- **When** người dùng chọn bộ lọc Hình thức thanh toán là `"Chuyển khoản QR"`.
- **Then** bảng dữ liệu chỉ hiển thị các đơn hàng thanh toán qua QR Pay có gắn Tag màu cyan.

---

### Kịch bản US-05.2: Xem chi tiết đơn hàng
#### Kịch bản 5.2.1: Mở chi tiết đơn hàng hợp lệ (Happy Path)
- **Given** người dùng đang ở trang danh sách `/orders`.
- **When** người dùng nhấp chuột vào bất kỳ dòng nào hoặc bấm icon con mắt "Chi tiết".
- **Then** hệ thống chuyển hướng sang trang `/orders/[id]` (ví dụ: `/orders/ord-1001`), hiển thị đầy đủ thông tin: Mã đơn, Thời gian, Thu ngân, Bảng danh sách từng món bánh có ảnh minh họa và Khung tổng kết thanh toán.

#### Kịch bản 5.2.2: Truy cập mã đơn hàng không tồn tại (Error / Not Found)
- **Given** người dùng nhập trực tiếp URL `/orders/ord-99999` không có trong hệ thống.
- **When** trang web thực hiện tải dữ liệu.
- **Then** hệ thống hiển thị thông báo lỗi "Không tìm thấy thông tin đơn hàng!" và tự động điều hướng an toàn trở lại trang danh sách `/orders`.

---

### Kịch bản US-05.3: Thao tác In hóa đơn
#### Kịch bản 5.3.1: Mở hộp thoại in / xuất PDF của trình duyệt (Happy Path)
- **Given** người dùng đang ở trang chi tiết đơn hàng `/orders/ord-1001`.
- **When** người dùng bấm nút "In hóa đơn" ở góc phải phía trên.
- **Then** hệ thống gọi hàm `window.print()`, mở hộp thoại in gốc của trình duyệt (cho phép in ra giấy hoặc chọn "Save as PDF") với định dạng phiếu hóa đơn bán lẻ chuẩn, ẩn toàn bộ thanh điều hướng và nút thao tác.

---

## Business Rules (Quy tắc nghiệp vụ)

1. **Quy tắc sinh mã hóa đơn (`code`)**:
   - Định dạng mã: `HD-YYMMDD-XX` (trong đó `YYMMDD` là năm-tháng-ngày tạo đơn, `XX` là số thứ tự tăng dần trong ngày dạng 2 chữ số: 01, 02,...).
2. **Quy tắc bảo toàn dữ liệu (Read-only)**:
   - Đơn hàng sau khi đã thanh toán tại POS là bản ghi lịch sử cố định, trang chi tiết `/orders/[id]` chỉ có tính năng **Xem và In**, tuyệt đối không cho phép sửa đổi số lượng hoặc giá trị đơn hàng nhằm đảm bảo tính toàn vẹn của sổ sách kế toán.
3. **Phân quyền truy cập**:
   - Cả hai vai trò `ADMIN` và `STAFF` đều được phép truy cập xem danh sách và chi tiết đơn hàng.

---

## Phạm vi kỹ thuật liên quan

- **Routes**:
  - `/orders` ([`app/orders/page.tsx`](file:///Users/gnuhh/Project/python/fe/app/orders/page.tsx))
  - `/orders/[id]` ([`app/orders/[id]/page.tsx`](file:///Users/gnuhh/Project/python/fe/app/orders/%5Bid%5D/page.tsx))
- **File dùng chung liên quan**:
  - `lib/mock-data.ts`: Schema `Order`, `OrderItem`.
  - `lib/api.ts`: Hàm `getOrders()` và `getOrderDetail()`.
