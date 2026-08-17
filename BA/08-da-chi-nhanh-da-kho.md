# TÀI LIỆU NGHIỆP VỤ (BA): 08 - QUẢN LÝ ĐA CHI NHÁNH & ĐA KHO HÀNG (MULTI-BRANCH & MULTI-WAREHOUSE)

## 1. TỔNG QUAN NGHIỆP VỤ & BỐI CẢNH (BUSINESS CONTEXT)

Khi tiệm bánh phát triển thành chuỗi nhiều cơ sở (ví dụ: Chi nhánh Quận 1, Chi nhánh Thảo Điền...), việc quản lý số liệu tập trung và phân bổ tồn kho riêng biệt theo từng địa điểm là yêu cầu bắt buộc:

**Mục tiêu của Module Đa chi nhánh & Đa kho:**
1. **Quản lý mạng lưới chi nhánh:** Thiết lập và theo dõi thông tin từng cơ sở (Mã CN, Tên, Địa chỉ, Số hotline, Người phụ trách).
2. **Quản lý đa kho theo chi nhánh:** Mỗi chi nhánh có thể có nhiều kho trực thuộc (Kho quầy bán lẻ POS, Kho lạnh bảo quản bánh kem, Kho nguyên vật liệu).
3. **Phân bổ và kiểm soát tồn kho độc lập:** Số lượng bánh xuất bán tại quầy POS của chi nhánh nào sẽ tự động trừ đúng vào kho của chi nhánh đó, không gây lệch số liệu giữa các cơ sở.
4. **Phân quyền nhân sự theo chi nhánh:** Quản trị viên chuỗi (Admin) có góc nhìn toàn diện tất cả các cơ sở, trong khi nhân viên thu ngân (Staff) gắn với chi nhánh làm việc thực tế.

---

## 2. CÁC TÁC NHÂN & MA TRẬN PHÂN QUYỀN (ACTORS & RBAC)

| Tác nhân (Actor) | Vai trò | Quyền hạn trong Module Đa chi nhánh & Đa kho |
| :--- | :--- | :--- |
| **Quản trị viên (Admin)** | Chủ chuỗi tiệm bánh | - Toàn quyền thêm, sửa, xem thông tin mọi chi nhánh tại `/branches`<br>- Chuyển đổi góc nhìn nhanh giữa các chi nhánh qua Branch Switcher trên Navbar<br>- Điều chỉnh số lượng tồn kho của bất kỳ sản phẩm nào tại mọi kho hàng<br>- Phân bổ nhân sự vào chi nhánh làm việc |
| **Thu ngân (Staff)** | Bán hàng tại cơ sở | - Bán hàng và xuất đơn tại kho quầy bán lẻ của chi nhánh được phân công<br>- Xem tồn kho thực tế của các món tại chi nhánh mình đang trực |

---

## 3. QUY TRÌNH NGHIỆP VỤ CHI TIẾT (BUSINESS PROCESS FLOW)

### 3.1. Quy trình Khởi tạo Chi Nhánh & Kho Mặc Định
1. Admin truy cập trang [`/branches`](file:///Users/gnuhh/Project/python/fe/app/branches/page.tsx) và bấm **"Thêm Chi Nhánh Mới"**.
2. Nhập Mã chi nhánh (e.g. `CN-BT`), Tên chi nhánh, Địa chỉ hoạt động, SĐT và Quản lý phụ trách.
3. Khi tạo mới chi nhánh thành công, hệ thống **tự động khởi tạo 1 Kho Quầy Bán Lẻ mặc định** (`KHO-[MÃ CN]-POS`) để sẵn sàng phục vụ bán hàng tại quầy POS.

### 3.2. Quy trình Quản lý & Điều Chỉnh Tồn Kho Theo Từng Kho
1. Tại Tab **"Quản Lý Tồn Kho Theo Từng Kho"**, người dùng sử dụng bộ lọc để chọn Chi nhánh và Kho hàng cần kiểm kê.
2. Hệ thống liệt kê toàn bộ danh mục sản phẩm cùng số lượng tồn kho thực tế tại kho đó.
3. Người dùng bấm **"Điều chỉnh"** $\rightarrow$ Nhập số lượng tồn kho thực tế sau khi kiểm đếm $\rightarrow$ Lưu cập nhật.
4. Trạng thái tồn kho được tính toán tự động:
   - `Còn hàng` ($\text{Số lượng} > \text{Ngưỡng cảnh báo}$)
   - `Sắp hết` ($0 < \text{Số lượng} \le \text{Ngưỡng cảnh báo}$)
   - `Hết hàng` ($\text{Số lượng} = 0$)

---

## 4. CẤU TRÚC DỮ LIỆU & SCHEMA (DATA DICTIONARY)

### Entity 1: `Branch` (`branches`)

| Trường dữ liệu | Kiểu | Bắt buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(64)` | Có | Khóa chính (e.g. `branch-001`) |
| `code` | `VARCHAR(50)` | Có | Mã định danh duy nhất (e.g. `CN-Q1`, `CN-TD`) |
| `name` | `VARCHAR(150)` | Có | Tên chi nhánh |
| `address` | `VARCHAR(255)` | Có | Địa chỉ hoạt động |
| `phone` | `VARCHAR(20)` | Có | Hotline liên hệ cơ sở |
| `manager_name` | `VARCHAR(100)` | Không | Quản lý phụ trách cơ sở |
| `status` | `VARCHAR(20)` | Có | `ACTIVE` (Hoạt động) / `INACTIVE` (Tạm dừng) |

### Entity 2: `Warehouse` (`warehouses`)

| Trường dữ liệu | Kiểu | Bắt buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(64)` | Có | Khóa chính kho (e.g. `wh-001`) |
| `branch_id` | `VARCHAR(64)` | Có | Khóa ngoại liên kết với `branches.id` |
| `code` | `VARCHAR(50)` | Có | Mã kho (e.g. `KHO-Q1-POS`) |
| `name` | `VARCHAR(150)` | Có | Tên kho |
| `warehouse_type` | `VARCHAR(50)` | Có | `RETAIL` (Quầy bán lẻ) / `COLD_STORAGE` (Kho lạnh) / `CENTRAL` (Kho tổng) |

### Entity 3: `StockItem` (`stock_items`)

| Trường dữ liệu | Kiểu | Bắt buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(64)` | Có | Khóa chính bản ghi tồn kho |
| `warehouse_id` | `VARCHAR(64)` | Có | Khóa ngoại kho hàng (`warehouses.id`) |
| `product_id` | `VARCHAR(64)` | Có | Khóa ngoại sản phẩm (`products.id`) |
| `quantity` | `INTEGER` | Có | Số lượng tồn kho thực tế tại kho này |
| `min_alert_stock` | `INTEGER` | Có | Ngưỡng cảnh báo sắp hết (Mặc định: 5) |

---

## 5. CƠ CHẾ ĐỒNG BỘ DỮ LIỆU ĐA CHI NHÁNH TỨC THÌ (EVENT-DRIVEN SCOPING)

1. **Sự kiện Broadcast toàn cục (`artisan_branch_changed`)**:
   - Khi Admin đổi chi nhánh trên Topbar, sự kiện CustomEvent `artisan_branch_changed` lập tức được phát ra.
   - Các màn hình đang mở tự động phản ứng và đồng bộ dữ liệu:
     - **`/pos` (Bán hàng):** Reset giỏ hàng của chi nhánh cũ, nạp tồn kho kho quầy và ca làm của chi nhánh mới; mọi đơn hàng tạo mới tự động gắn `branch_id`.
     - **`/products` (Kho hàng):** Tự động lọc tồn kho theo chi nhánh.
     - **`/orders` (Lịch sử đơn):** Lọc danh sách hóa đơn theo chi nhánh được chọn.
     - **`/shifts` (Ca làm việc):** Nạp ca hiện tại và lịch sử ca đối soát của chi nhánh được chọn.
     - **`/dashboard` (Báo cáo):** Cập nhật toàn bộ biểu đồ, KPI và top bán chạy theo chi nhánh được chọn.
     - **`/accounting` (Sổ quỹ):** Cập nhật phiếu thu/chi và bảng P&L theo chi nhánh được chọn.
2. **Khóa an toàn đối với Nhân viên Thu ngân**:
   - Thu ngân không thể đổi chi nhánh trái phép; toàn bộ phiên đăng nhập của thu ngân bị ràng buộc chặt chẽ với cơ sở được Admin phân công.

