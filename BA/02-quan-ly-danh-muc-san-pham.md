# Module 02: Quản Lý Danh Mục & Sản Phẩm (Product & Catalog Management)

## Tổng quan
Module **Quản lý Danh mục & Sản phẩm** cho phép chủ tiệm bánh và quản lý thiết lập danh mục mặt hàng, niêm yết giá bán, cấu hình tồn kho ban đầu, tải hình ảnh đại diện và mô tả hương vị của từng món bánh. Module này đóng vai trò là nguồn dữ liệu chuẩn cho toàn bộ hoạt động bán lẻ tại quầy thu ngân (POS).

---

## User Stories

### US-02.1: Xem danh sách và tìm kiếm sản phẩm
- **Là một** Quản trị viên,
- **Tôi muốn** xem bảng danh sách toàn bộ các loại bánh, kèm tính năng tìm kiếm và lọc theo danh mục hoặc trạng thái tồn kho,
- **Để** nắm bắt nhanh tình hình các mặt hàng hiện đang kinh doanh trong tiệm.

### US-02.2: Thêm mới sản phẩm bánh vào thực đơn
- **Là một** Quản trị viên,
- **Tôi muốn** tạo mới sản phẩm với tên, danh mục, đơn giá, tồn kho, mô tả và hình ảnh đại diện,
- **Để** đưa mặt hàng mới ra quầy bán cho khách hàng.

### US-02.3: Chỉnh sửa thông tin sản phẩm
- **Là một** Quản trị viên,
- **Tôi muốn** cập nhật lại giá bán, tồn kho hoặc mô tả thành phần của sản phẩm đã có,
- **Để** phản ánh đúng chiến lược giá và thông tin thực tế của tiệm.

### US-02.4: Xóa sản phẩm khỏi danh mục
- **Là một** Quản trị viên,
- **Tôi muốn** xóa một món bánh không còn kinh doanh,
- **Để** giữ cho danh mục thực đơn luôn tinh gọn và không gây nhầm lẫn cho thu ngân.

---

## Acceptance Criteria (Given - When - Then)

### Kịch bản US-02.1: Xem và lọc danh sách sản phẩm
#### Kịch bản 2.1.1: Tìm kiếm sản phẩm theo từ khóa (Happy Path)
- **Given** người quản lý đang ở trang `/products`.
- **When** người dùng nhập từ khóa `"Croissant"` vào ô tìm kiếm.
- **Then** bảng dữ liệu lọc lập tức và chỉ hiển thị các sản phẩm có tên hoặc mô tả chứa từ khóa `"Croissant"`.

#### Kịch bản 2.1.2: Lọc sản phẩm theo danh mục và trạng thái tồn kho
- **Given** người quản lý đang ở trang `/products`.
- **When** người dùng chọn Danh mục `"Bánh Mì Nghệ Nhân (Artisan)"` và Trạng thái `"Còn hàng (>5)"`.
- **Then** bảng dữ liệu chỉ hiển thị các loại bánh mì nghệ nhân có số lượng tồn kho lớn hơn 5 cái.

---

### Kịch bản US-02.2: Thêm mới sản phẩm
#### Kịch bản 2.2.1: Tạo sản phẩm mới thành công (Happy Path)
- **Given** người quản lý đang ở trang `/products/new`.
- **When** người dùng nhập đầy đủ Tên sản phẩm `"Bánh Mì Hoa Cúc Pháp"`, chọn Danh mục `"Bánh Mì Ngọt & Pastry"`, nhập Đơn giá `45.000 ₫`, Tồn kho `20`, chọn URL ảnh và bấm "Lưu sản phẩm".
- **Then** hệ thống tạo sản phẩm thành công, hiển thị thông báo "Thêm sản phẩm mới thành công!", lưu vào cơ sở dữ liệu và chuyển hướng về `/products`.

#### Kịch bản 2.2.2: Bỏ trống trường bắt buộc (Validation Error)
- **Given** người quản lý đang ở trang `/products/new`.
- **When** người dùng bỏ trống ô Tên sản phẩm hoặc Đơn giá rồi bấm nút "Lưu sản phẩm".
- **Then** form kích hoạt Ant Design form validation, báo lỗi màu đỏ tại các trường bắt buộc và ngăn chặn gửi dữ liệu.

---

### Kịch bản US-02.3: Chỉnh sửa sản phẩm
#### Kịch bản 2.3.1: Cập nhật giá và tồn kho thành công (Happy Path)
- **Given** người quản lý mở trang chỉnh sửa `/products/prod-001/edit`.
- **When** hệ thống tải sẵn thông tin cũ, người dùng đổi Đơn giá từ `35.000 ₫` thành `38.000 ₫` và bấm "Lưu thay đổi".
- **Then** dữ liệu cập nhật thành công, chuyển hướng về `/products` và hiển thị đơn giá mới `38.000 ₫`.

---

### Kịch bản US-02.4: Xóa sản phẩm
#### Kịch bản 2.4.1: Xác nhận xóa sản phẩm an toàn (Happy Path)
- **Given** người quản lý đang ở danh sách `/products`.
- **When** người dùng bấm vào icon thùng rác (Xóa) tại dòng sản phẩm `"Croissant Bơ Pháp"`.
- **Then** hệ thống mở Modal hộp thoại cảnh báo: *"Bạn có chắc chắn muốn xóa sản phẩm 'Croissant Bơ Pháp'?"*.
- **When** người dùng bấm nút "Xóa sản phẩm" trong modal.
- **Then** sản phẩm được loại bỏ khỏi danh sách, bảng dữ liệu tự động reload và hiển thị thông báo thành công.

---

## Business Rules (Quy tắc nghiệp vụ)

1. **Quy tắc về giá & số lượng**:
   - Đơn giá sản phẩm (`price`) phải là số nguyên dương lớn hơn hoặc bằng `1.000 VNĐ`.
   - Số lượng tồn kho ban đầu (`stock`) phải là số nguyên $\ge 0$.
2. **Quy tắc phân loại trạng thái tự động (`status`)**:
   - `stock == 0`: Trạng thái tự động chuyển thành **`Hết hàng` (out_of_stock)** với Tag màu đỏ.
   - `1 <= stock <= 5`: Trạng thái tự động là **`Sắp hết` (low_stock)** với Tag màu cam cảnh báo.
   - `stock > 5`: Trạng thái tự động là **`Còn hàng` (in_stock)** với Tag màu xanh lục.
3. **Quy tắc giao diện thêm mới (`/products/new`)**:
   - Bắt buộc có khung xem trước trực quan (Live Card Preview) mô phỏng chính xác thẻ bánh sẽ xuất hiện tại quầy POS.
4. **Phân quyền truy cập**:
   - Toàn bộ các thao tác Thêm / Sửa / Xóa sản phẩm chỉ dành riêng cho tài khoản có vai trò `ADMIN`.

---

## Phạm vi kỹ thuật liên quan

- **Routes**:
  - `/products` ([`app/products/page.tsx`](file:///Users/gnuhh/Project/python/fe/app/products/page.tsx))
  - `/products/new` ([`app/products/new/page.tsx`](file:///Users/gnuhh/Project/python/fe/app/products/new/page.tsx))
  - `/products/[id]/edit` ([`app/products/[id]/edit/page.tsx`](file:///Users/gnuhh/Project/python/fe/app/products/%5Bid%5D/edit/page.tsx))
- **File dùng chung liên quan**:
  - `lib/mock-data.ts`: Schema `Product` và danh mục `CATEGORIES`.
  - `lib/api.ts`: Các hàm `getProducts()`, `getProductById()`, `createProduct()`, `updateProduct()`, `deleteProduct()`.
