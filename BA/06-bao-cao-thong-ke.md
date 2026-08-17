# Module 06: Báo Cáo Doanh Thu & Bảng Điều Khiển (Executive Dashboard & Analytics)

## Tổng quan
Module **Báo cáo Thống kê & Bảng điều khiển (Dashboard)** là công cụ ra quyết định chuyên sâu dành riêng cho chủ tiệm bánh và cấp quản lý. Module trực quan hóa toàn diện hoạt động kinh doanh đa chiều: bộ lọc khoảng thời gian linh hoạt (Hôm nay / 7 ngày / 30 ngày / Tùy chọn), 4 chỉ số KPI cốt lõi kèm so sánh kỳ trước, xu hướng doanh thu Recharts, cơ cấu phương thức thanh toán, phân bổ doanh số theo danh mục bánh, bảng xếp hạng năng suất bán hàng của từng thu ngân, cảnh báo tồn kho chi tiết (có liên kết sửa nhanh) và danh sách sản phẩm bán chậm/tồn đọng.

Giao diện được phân nhóm thông minh theo **Ant Design Tabs** để giữ trang gọn gàng, trực quan và không bị cuộn dài lê thê.

---

## User Stories

### US-06.1: Lọc báo cáo theo khoảng thời gian linh hoạt
- **Là một** Chủ tiệm bánh (Admin),
- **Tôi muốn** lựa chọn khoảng thời gian xem báo cáo (*Hôm nay / 7 ngày qua / 30 ngày qua / Khoảng ngày tùy chọn*),
- **Để** toàn bộ 4 thẻ KPI, các biểu đồ và bảng xếp hạng số liệu cập nhật đồng bộ theo thời gian thực và so sánh với kỳ trước liền kề.

### US-06.2: Theo dõi các chỉ số KPI tài chính & Tăng trưởng
- **Là một** Chủ tiệm bánh (Admin),
- **Tôi muốn** theo dõi tức thời Doanh thu kỳ này, Tổng số đơn hàng, Giá trị trung bình mỗi đơn (AOV) và tỷ lệ tăng trưởng so với kỳ trước,
- **Để** đánh giá sức mua và nhịp độ kinh doanh của tiệm.

### US-06.3: Phân tích cơ cấu phương thức thanh toán & Danh mục
- **Là một** Quản lý tiệm bánh,
- **Tôi muốn** xem biểu đồ tròn/cột thể hiện tỷ trọng doanh thu giữa Tiền mặt / Thẻ POS / Chuyển khoản QR và tỷ trọng đóng góp của từng nhóm bánh (Bánh Mì Nghệ Nhân, Pastry, Bánh Kem, Đồ Uống),
- **Để** nắm bắt thói quen thanh toán của khách hàng và tối ưu cơ cấu sản phẩm.

### US-06.4: Bảng xếp hạng hiệu suất nhân viên thu ngân
- **Là một** Quản lý tiệm bánh,
- **Tôi muốn** xem bảng liệt kê chi tiết từng nhân viên: số hóa đơn hoàn tất, tổng doanh thu tạo ra, giá trị trung bình/đơn,
- **Để** đánh giá năng suất làm việc, khen thưởng ca làm hiệu quả và cân đối phân ca hợp lý.

### US-06.5: Quản trị tồn kho cảnh báo & Hàng bán chậm/tồn đọng
- **Là một** Chủ tiệm bánh,
- **Tôi muốn** có bảng chi tiết các mặt hàng $\le 5$ hoặc hết hàng để bấm vào đi thẳng tới trang chỉnh sửa nhập kho ([`/products/[id]/edit`](file:///Users/gnuhh/Project/python/fe/app/products/[id]/edit/page.tsx)), kèm bảng đối trọng các món bán chậm nhất/0 đơn,
- **Để** kịp thời nhập nguyên liệu nướng bánh và lên chương trình khuyến mãi xả hàng tồn đọng.

---

## Acceptance Criteria (Given - When - Then)

### Kịch bản 6.1: Chuyển đổi bộ lọc khoảng thời gian
- **Given** người quản lý có vai trò `ADMIN` đăng nhập vào hệ thống.
- **When** người dùng bấm chọn mốc "7 ngày qua" hoặc "30 ngày qua".
- **Then** toàn bộ 4 thẻ KPI, biểu đồ xu hướng doanh thu (chuyển sang dạng từng ngày), cơ cấu thanh toán, danh mục, hiệu suất nhân viên và danh sách sản phẩm bán chạy/bán chậm lập tức được tính toán lại theo khoảng ngày đã chọn.

### Kịch bản 6.2: Phân tích Doanh thu theo Phương thức thanh toán
- **Given** người quản lý đang ở Tab "Thanh toán & Danh mục".
- **When** dữ liệu được tải.
- **Then** biểu đồ tròn Recharts hiển thị tỷ trọng phân bổ (ví dụ: Chuyển khoản QR 72.8%, Quẹt thẻ 19.5%, Tiền mặt 7.7%) kèm thanh tiến trình Progress Ant Design và số tiền cụ thể.

### Kịch bản 6.3: Xem chi tiết Cảnh báo tồn kho và liên kết sửa nhanh
- **Given** người quản lý đang ở Tab "Cảnh báo Tồn kho & Hàng chậm bán" hoặc bấm vào thẻ "Cảnh báo tồn kho" ở trên cùng.
- **When** người dùng bấm nút "Nhập thêm / Sửa" tại dòng sản phẩm đang báo "Sắp hết" (ví dụ: Bánh Mì Phô Mai Bơ Tỏi Hàn Quốc tồn 1 cái).
- **Then** hệ thống điều hướng trực tiếp tới trang chỉnh sửa sản phẩm [`/products/prod-010/edit`](file:///Users/gnuhh/Project/python/fe/app/products/[id]/edit/page.tsx) để cập nhật số lượng nhập kho mới.

---

## Business Rules (Quy tắc nghiệp vụ)

1. **Công thức tính toán so sánh kỳ trước**:
   - Khoảng thời gian so sánh có độ dài bằng chính xác độ dài kỳ đang chọn (ví dụ: chọn 7 ngày từ 10/08-16/08 $\rightarrow$ so sánh với 7 ngày trước đó từ 03/08-09/08).
   - $\text{Tăng trưởng doanh thu (\%)} = \frac{\text{Doanh thu kỳ này} - \text{Doanh thu kỳ trước}}{\text{Doanh thu kỳ trước}} \times 100\%$.
2. **Quy tắc phân loại tồn kho & chậm bán**:
   - Mức cảnh báo tồn kho: $\le 5$ cái (màu cam "Sắp hết"), $= 0$ cái (màu đỏ "Hết hàng").
   - Hàng bán chậm: Ưu tiên các sản phẩm có doanh số thấp nhất trong kỳ và tồn kho còn nhiều.
3. **Phân quyền truy cập**:
   - Chỉ người dùng có vai trò `ADMIN` mới được phép truy cập trang `/dashboard`. Tài khoản `STAFF` bị chặn và chuyển hướng sang `/pos`.

---

## Phạm vi kỹ thuật liên quan

- **Routes**:
  - `/dashboard` ([`fe/app/dashboard/page.tsx`](file:///Users/gnuhh/Project/python/fe/app/dashboard/page.tsx))
- **Backend API**:
  - `GET /api/dashboard/stats?range=today|7days|30days|custom&start_date=...&end_date=...` ([`be/app/routers/dashboard.py`](file:///Users/gnuhh/Project/python/be/app/routers/dashboard.py))
- **File dùng chung liên quan**:
  - `fe/lib/mock-data.ts`: Schema mở rộng `DashboardStats`, `PaymentMethodStat`, `CategoryStat`, `StaffPerformanceStat`, `LowStockDetailItem`, `SlowSellingProduct`.
  - `fe/lib/api.ts`: Hàm `getDashboardStats(params)`.
  - Thư viện: `recharts` (AreaChart, PieChart, BarChart, ResponsiveContainer, Cell, Tooltip), `dayjs`, `antd` (Tabs, Segmented, DatePicker, Table, Card, Progress, Avatar).
