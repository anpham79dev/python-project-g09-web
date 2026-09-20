# TÀI LIỆU NGHIỆP VỤ (BA): 09 - CÀI ĐẶT HỆ THỐNG & CẤU HÌNH CA ĐỘNG (SYSTEM SETTINGS & SHIFT TEMPLATES)

## 1. TỔNG QUAN NGHIỆP VỤ & BỐI CẢNH (BUSINESS CONTEXT)

Để hệ thống phần mềm quản lý tiệm bánh linh hoạt theo từng mô hình vận hành của cửa hàng mà **không cần can thiệp vào mã nguồn (Hardcode)**, toàn bộ các quy tắc bán hàng, khung giờ ca làm việc, thông tin in phiếu và tài khoản nhận thanh toán QR đều được quản lý tập trung tại module Cài Đặt Hệ Thống.

**Mục tiêu của Module Cài đặt Hệ thống:**
1. **Cấu hình Ca làm việc động (Dynamic Shift Templates):** Cho phép Quản trị viên tự do định nghĩa các ca làm việc (Ca sáng, Ca chiều tối, Ca gãy tăng cường) kèm khung giờ và số tiền lẻ đầu ca gợi ý.
2. **Cấu hình Thông tin Thương hiệu & Mẫu in Hóa đơn:** Quản lý tên tiệm, slogan, hotline, địa chỉ và lời chúc chân trang trên hóa đơn POS.
3. **Cấu hình Tài khoản Thanh toán VietQR:** Lưu trữ thông tin tài khoản ngân hàng (Tên ngân hàng, Số tài khoản, Chủ tài khoản) để phục vụ thanh toán chuyển khoản QR tự động.
4. **Cấu hình Quy tắc Kiểm soát POS & Tồn kho:** Thiết lập ngưỡng cảnh báo tồn thấp, tỷ lệ thuế VAT mặc định, chế độ chặn bán âm kho, và quy định bắt buộc giải trình khi chốt ca lệch két.

---

## 2. CÁC TÁC NHÂN & MA TRẬN PHÂN QUYỀN (ACTORS & RBAC)

| Tác nhân (Actor) | Quyền hạn trong Module Cài Đặt Hệ Thống |
| :--- | :--- |
| **Quản trị viên (Admin)** | - Toàn quyền truy cập trang `/settings`<br>- Thêm, sửa, xóa các Ca làm mẫu (Shift Templates)<br>- Thay đổi thông tin tiệm bánh và tài khoản ngân hàng VietQR<br>- Bật/tắt các quy tắc vận hành POS và tồn kho |
| **Thu ngân (Staff)** | - Không có quyền truy cập vào trang `/settings`<br>- Được kế thừa các cấu hình ca mẫu khi bắt đầu ca làm việc tại POS |

---

## 3. QUY TRÌNH NGHIỆP VỤ CHI TIẾT (BUSINESS PROCESS FLOW)

### 3.1. Quy trình Quản lý Ca Làm Việc Mẫu (Shift Templates Management)
1. Admin truy cập [`/settings`](file:///Users/gnuhh/Project/python/fe/app/settings/page.tsx) $\rightarrow$ Tab **"Cấu Hình Ca Làm Việc Động"**.
2. Bấm **"Thêm Ca Làm Mẫu"** $\rightarrow$ Nhập Tên ca (e.g. "Ca sáng sớm"), Giờ bắt đầu (`06:30`), Giờ kết thúc (`14:30`), Tiền lẻ đầu ca gợi ý (`500.000 ₫`), Ghi chú nghiệp vụ và Trạng thái kích hoạt.
3. Khi ca làm được kích hoạt, danh sách ca mẫu này sẽ tự động xuất hiện trong menu chọn ca của thu ngân khi mở ca tại quầy POS.

### 3.2. Quy trình Cập nhật Thông tin In Phiếu & Tài khoản VietQR
1. Tại Tab **"Thông Tin Tiệm & Mẫu In Phiếu"**, Admin cập nhật:
   - Tên tiệm bánh, Slogan, Hotline, Địa chỉ cơ sở chính.
   - Tài khoản ngân hàng: Tên ngân hàng (e.g. `Vietcombank`), Số tài khoản, Tên chủ tài khoản.
   - Lời cảm ơn chân hóa đơn (e.g. *"Cảm ơn Quý Khách & Hẹn Gặp Lại!"*).
2. Bấm **"Lưu Thay Đổi Thông Tin"** $\rightarrow$ Thông tin mới lập tức được áp dụng cho toàn bộ phiếu in đơn hàng và phiếu kết ca trên hệ thống.

---

## 4. CẤU TRÚC DỮ LIỆU & SCHEMA (DATA DICTIONARY)

### Entity 1: `ShiftTemplate` (`shift_templates`)

| Trường dữ liệu | Kiểu | Bắt buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(64)` | Có | Khóa chính ca mẫu (e.g. `tmpl-01`) |
| `name` | `VARCHAR(100)` | Có | Tên ca làm mẫu (e.g. "Ca sáng") |
| `start_time` | `VARCHAR(10)` | Có | Giờ bắt đầu ca định dạng `HH:mm` (e.g. "06:30") |
| `end_time` | `VARCHAR(10)` | Có | Giờ kết thúc ca định dạng `HH:mm` (e.g. "14:30") |
| `default_initial_cash` | `INTEGER` | Có | Tiền mặt lẻ đầu ca gợi ý (Mặc định: 500.000 ₫) |
| `is_active` | `BOOLEAN` | Có | `true` (Áp dụng) / `false` (Tạm ẩn) |
| `note` | `TEXT` | Không | Ghi chú nghiệp vụ phân ca |

### Entity 2: `SystemSetting` (`system_settings`)

| Khóa cấu hình (`key`) | Kiểu dữ liệu | Giá trị mặc định | Diễn giải nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `store_name` | `VARCHAR` | `Artisan Bakery` | Tên tiệm hiển thị trên hóa đơn |
| `store_slogan` | `VARCHAR` | `Tiệm Bánh Thủ Công Pháp` | Khẩu hiệu in trên hóa đơn |
| `hotline` | `VARCHAR` | `0901 234 567` | Hotline đặt hàng & CSKH |
| `address` | `VARCHAR` | `123 Đường Đồng Khởi, Q.1` | Địa chỉ in trên hóa đơn |
| `default_vat_rate` | `INTEGER` | `8` | Tỷ lệ thuế VAT mặc định (8%) |
| `low_stock_threshold` | `INTEGER` | `5` | Ngưỡng cảnh báo sắp hết hàng |
| `allow_negative_stock` | `BOOLEAN` | `false` | Có cho phép bán âm kho không |
| `require_shift_reconciliation_note` | `BOOLEAN` | `true` | Bắt buộc nhập giải trình khi lệch két |
| `bank_name` | `VARCHAR` | `Vietcombank (VCB)` | Ngân hàng nhận VietQR |
| `bank_account_number` | `VARCHAR` | `1028889999` | Số tài khoản nhận tiền QR |
| `bank_account_holder` | `VARCHAR` | `TIEM BANH ARTISAN BAKERY` | Tên chủ tài khoản nhận tiền |
| `receipt_footer_note` | `VARCHAR` | `Cảm ơn Quý Khách!` | Lời cảm ơn in chân hóa đơn |
