# TÀI LIỆU NGHIỆP VỤ (BA): 07 - QUẢN LÝ CA LÀM VIỆC & BÁO CÁO KẾT CA (SHIFT & CASH RECONCILIATION)

## 1. TỔNG QUAN NGHIỆP VỤ & BỐI CẢNH (BUSINESS CONTEXT)

Trong các cơ sở kinh doanh F&B và tiệm bánh thủ công (Artisan Bakery), hoạt động bán hàng được phân bổ theo nhiều ca làm việc trong ngày (ví dụ: Ca sáng `07:00 - 15:00`, Ca chiều tối `15:00 - 22:00`). Tiền mặt thu được tại quầy POS luôn tiềm ẩn rủi ro thất thoát, nhầm lẫn khi thối tiền hoặc không khớp với ghi nhận trên hệ thống.

**Mục tiêu của Module Quản lý Ca & Kết Ca:**
1. **Kiểm soát rủi ro Tiền mặt (Cash Float & Discrepancy):** Cung cấp cơ chế quản lý tiền lẻ đầu ca và đối soát tiền mặt đếm thực tế cuối ca với tiền mặt lý thuyết hệ thống tính toán.
2. **Minh bạch trách nhiệm tài chính:** Phân định rõ số tiền từng thu ngân chịu trách nhiệm bàn giao cho quản lý hoặc ca kế tiếp.
3. **Phân tách dòng tiền thanh toán:** Phân loại rõ ràng Doanh thu Tiền mặt (giữ tại két), Quẹt thẻ POS (tiền về tài khoản ngân hàng qua máy POS), và Chuyển khoản QR tĩnh/động (về tài khoản tiệm).
4. **Báo cáo kết ca tổng hợp:** Giúp Quản trị viên/Chủ tiệm có góc nhìn toàn diện về hoạt động bán hàng của tất cả các ca trong ngày.

---

## 2. CÁC TÁC NHÂN & MA TRẬN PHÂN QUYỀN (ACTORS & RBAC)

| Tác nhân (Actor) | Vai trò trong hệ thống | Quyền hạn trong Module Ca & Kết Ca |
| :--- | :--- | :--- |
| **Nhân viên thu ngân (Staff)** | Bán hàng trực tiếp tại quầy POS | - Xem thông tin ca hiện tại của bản thân<br>- Bấm "Kết ca / Chốt két" tại POS<br>- Nhập số tiền thực đếm & giải trình chênh lệch<br>- In phiếu bàn giao kết ca<br>- Xem lịch sử ca của chính mình |
| **Quản trị viên (Admin)** | Chủ tiệm / Quản lý cửa hàng | - Toàn quyền truy cập trang `/shifts`<br>- Xem Báo cáo kết ca tổng hợp toàn tiệm<br>- Xem lịch sử kết ca của toàn bộ nhân viên<br>- Lọc báo cáo theo nhân viên, ngày, trạng thái ca<br>- In lại phiếu kết ca của bất kỳ ca nào trong quá khứ |

---

## 3. QUY TRÌNH NGHIỆP VỤ CHI TIẾT (BUSINESS PROCESS FLOW)

### 3.1. Quy trình Mở Ca (Shift Initialization)
1. Khi nhân viên đăng nhập và truy cập quầy POS ([`/pos`](file:///Users/gnuhh/Project/python/fe/app/pos/page.tsx)), hệ thống kiểm tra ca đang mở (`OPEN`) của nhân viên.
2. Nếu chưa có ca mở, hệ thống tự động khởi tạo ca mới với tiền mặt lẻ đầu ca mặc định (`500.000 ₫`).
3. Mọi đơn hàng (`orders`) do nhân viên tạo và hoàn tất thanh toán sẽ được liên kết trực tiếp với ca làm việc hiện hành.

### 3.2. Quy trình Kết Ca & Đối Soát Tiền Mặt (Shift Close & Reconciliation)
1. **Bước 1 - Yêu cầu kết ca:** Cuối ca, thu ngân bấm nút **"Kết ca / Chốt két"** trên thanh công cụ POS hoặc Navbar.
2. **Bước 2 - Hệ thống tổng hợp tức thời:**
   - Số lượng đơn hàng đã bán trong ca (`ordersCount`).
   - Doanh thu theo phương thức: Tiền mặt (`cashRevenue`), Quẹt thẻ (`cardRevenue`), Chuyển khoản QR (`qrRevenue`), Tổng doanh thu (`totalRevenue`).
   - Tiền mặt lý thuyết trong két:
     $$\text{Tiền mặt lý thuyết} = \text{Tiền lẻ đầu ca (500.000 ₫)} + \text{Doanh thu tiền mặt trong ca}$$
3. **Bước 3 - Nhập tiền thực đếm:** Thu ngân đếm tiền mặt thực tế trong két và nhập vào ô **"Tiền mặt thực tế đếm được"** (`actualCash`).
4. **Bước 4 - Tính chênh lệch tự động:**
   $$\text{Chênh lệch} = \text{Tiền thực tế} - \text{Tiền lý thuyết}$$
   - Nếu $\text{Chênh lệch} = 0$: Hệ thống gắn nhãn `✓ Khớp chuẩn (0 ₫)`.
   - Nếu $\text{Chênh lệch} > 0$: Thừa tiền (màu vàng cảnh báo).
   - Nếu $\text{Chênh lệch} < 0$: Thiếu tiền (màu đỏ cảnh báo). Bắt buộc/Khuyến nghị nhập ô **"Ghi chú giải trình"** (`note`).
5. **Bước 5 - Xác nhận & Đóng ca:**
   - Cập nhật trạng thái ca sang `CLOSED`, lưu `endTime = now()`.
   - Hệ thống tự động mở hộp thoại in trình duyệt (`window.print()`) để in **Phiếu Bàn Giao Kết Ca (Shift Summary Receipt)** cho thu ngân ký bàn giao tiền mặt cho Quản lý.

---

## 4. CẤU TRÚC DỮ LIỆU & SCHEMA (DATA DICTIONARY)

### Entity: `WorkShift` (`work_shifts`)

| Trường dữ liệu | Kiểu dữ liệu | Bắt buộc | Mô tả nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(64)` | Có | Khóa chính mã ca (e.g. `shift-bad12514`) |
| `shift_name` | `VARCHAR(100)` | Có | Tên ca làm việc (e.g. "Ca sáng (07:00 - 15:00) - 16/08/2026") |
| `staff_id` | `VARCHAR(64)` | Có | ID nhân viên thu ngân mở ca (FK `users.id`) |
| `staff_name` | `VARCHAR(100)` | Có | Tên đầy đủ nhân viên thu ngân |
| `start_time` | `TIMESTAMP` | Có | Thời điểm bắt đầu mở ca |
| `end_time` | `TIMESTAMP` | Không | Thời điểm chốt ca (NULL khi đang OPEN) |
| `initial_cash` | `INTEGER` | Có | Tiền mặt lẻ đầu ca (mặc định 500.000 ₫) |
| `cash_revenue` | `INTEGER` | Có | Tổng tiền mặt thu được từ các đơn hàng trong ca |
| `card_revenue` | `INTEGER` | Có | Tổng tiền thu qua quẹt thẻ POS trong ca |
| `qr_revenue` | `INTEGER` | Có | Tổng tiền thu qua chuyển khoản QR trong ca |
| `total_revenue` | `INTEGER` | Có | Tổng doanh thu phát sinh trong ca |
| `orders_count` | `INTEGER` | Có | Tổng số đơn hàng đã hoàn tất trong ca |
| `expected_cash` | `INTEGER` | Có | Tiền mặt lý thuyết két (`initial_cash + cash_revenue`) |
| `actual_cash` | `INTEGER` | Có | Tiền mặt thực tế thu ngân đếm được khi chốt ca |
| `difference` | `INTEGER` | Có | Số tiền chênh lệch két (`actual_cash - expected_cash`) |
| `status` | `VARCHAR(20)` | Có | Trạng thái ca: `OPEN` (Đang mở), `CLOSED` (Đã chốt ca) |
| `note` | `TEXT` | Không | Ghi chú giải trình của thu ngân khi kết ca |
| `created_at` | `TIMESTAMP` | Có | Thời gian tạo bản ghi |

---

## 5. CÁC ĐIỂM TIẾP XÚC GIAO DIỆN (UI/UX SPECIFICATIONS)

### 5.1. Nút Chốt Ca & Modal Đối Soát tại POS ([`/pos`](file:///Users/gnuhh/Project/python/fe/app/pos/page.tsx))
- Nằm trên thanh công cụ tìm kiếm và lọc danh mục tại màn hình bán hàng.
- Modal chốt ca gồm 3 khối:
  1. Thẻ tóm tắt thông tin ca làm việc & số đơn.
  2. Bảng phân rã doanh thu theo Tiền mặt / Thẻ / QR.
  3. Khung đối soát két tiền: Đối chiếu Tiền đầu ca, Doanh thu tiền mặt, Ô nhập Tiền thực tế, Tag chênh lệch két và Ghi chú giải trình.

### 5.2. Trang Quản Lý & Báo Cáo Ca ([`/shifts`](file:///Users/gnuhh/Project/python/fe/app/shifts/page.tsx))
- **Khối 4 Thống kê Đầu Trang (Executive Metric Cards):**
  1. *Tổng ca làm việc*: Số ca đã chốt / đang mở.
  2. *Tổng doanh thu*: Tổng doanh số hoàn tất qua các ca.
  3. *Tiền mặt thực thu*: Số tiền mặt thực tế nộp vào két tiền tiệm.
  4. *Tổng chênh lệch két*: Tổng số tiền thừa/thiếu toàn tiệm.
- **Thanh Công Cụ Toolbar:**
  - Lọc theo nhân viên (`Select` nhân viên).
  - Lọc theo trạng thái ca (`OPEN` / `CLOSED`).
  - Lọc theo ngày làm việc (`DatePicker`).
  - Nút "Làm mới" và "Mở quầy POS".
- **Bảng Lịch Sử Kết Ca:**
  - Cột: Mã & Tên ca, Thu ngân (Avatar), Thời gian ca (bắt đầu $\rightarrow$ kết thúc, thời lượng), Số đơn, Tổng doanh thu, Tiền thực tế, Chênh lệch két, Trạng thái ca, Nút Xem chi tiết & In lại phiếu.

### 5.3. Mẫu In Phiếu Bàn Giao Kết Ca (`#pos-shift-receipt` & `#shift-printable-receipt`)
- Định dạng in nhiệt tiêu chuẩn 80mm / A4 qua `window.print()`.
- Hiển thị đầy đủ thông tin thương hiệu Artisan Bakery, mã ca, thu ngân, bảng phân rã doanh thu, bảng đối soát két tiền, ghi chú giải trình và 2 ô chữ ký bàn giao (Thu ngân bàn giao / Quản lý nhận ca).
