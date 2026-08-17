# Module 04: Quản Lý & Tự Động Trừ Tồn Kho (Inventory Management)

## Tổng quan
Module **Quản lý Tồn kho** chịu trách nhiệm kiểm soát số lượng bánh có sẵn trong ngày, ngăn chặn tình trạng bán âm hoặc nhận đơn vượt quá số lượng bánh thực tế trong tủ trưng bày. Hệ thống tự động trừ tồn kho theo thời gian thực ngay khi hoàn tất đơn thanh toán và cảnh báo mặt hàng sắp hết cho thợ làm bánh chuẩn bị mẻ mới.

---

## User Stories

### US-04.1: Tự động trừ tồn kho khi bán hàng
- **Là một** Hệ thống quản lý tiệm bánh,
- **Tôi muốn** tự động khấu trừ số lượng tồn kho của từng món bánh theo đúng số lượng khách đã mua trong đơn hàng POS,
- **Để** số liệu kho luôn chính xác với thực tế tại quầy và không bán vượt khả năng cung cấp.

### US-04.2: Tự động chuyển trạng thái cảnh báo tồn kho
- **Là một** Hệ thống,
- **Tôi muốn** tự động chuyển trạng thái mặt hàng thành "Sắp hết" khi tồn kho $\le 5$ và "Hết hàng" khi tồn kho $= 0$,
- **Để** thợ bánh chủ động nướng bổ sung và thu ngân nắm rõ trạng thái bánh.

### US-04.3: Theo dõi chỉ số tồn kho trên bảng điều khiển
- **Là một** Quản trị viên,
- **Tôi muốn** xem nhanh số lượng mặt hàng đang rơi vào tình trạng cảnh báo (sắp hết / hết hàng) trên Dashboard và bảng sản phẩm,
- **Để** có kế hoạch nhập nguyên liệu và lên lịch làm bánh hợp lý.

---

## Acceptance Criteria (Given - When - Then)

### Kịch bản US-04.1: Khấu trừ kho tự động
#### Kịch bản 4.1.1: Trừ kho thành công sau khi hoàn tất đơn POS (Happy Path)
- **Given** món `"Croissant Bơ Pháp"` có tồn kho hiện tại là `45` cái.
- **When** thu ngân tạo đơn hàng bán `10` cái Croissant và thanh toán thành công.
- **Then** số lượng tồn kho của món bánh này trong hệ thống lập tức giảm xuống còn `35` cái, số liệu đồng bộ trên cả màn hình POS, danh sách sản phẩm và Dashboard.

#### Kịch bản 4.1.2: Sản phẩm bị mua hết sạch tồn kho (Edge Case)
- **Given** món `"Bánh Mì Phô Mai Bơ Tỏi"` chỉ còn đúng `2` cái trong kho.
- **When** thu ngân tạo đơn hàng mua `2` cái và bấm thanh toán.
- **Then** tồn kho của sản phẩm giảm về `0`, trạng thái sản phẩm lập tức chuyển từ `low_stock` sang `out_of_stock`, thẻ sản phẩm trên quầy POS bị vô hiệu hóa kèm nhãn "HẾT HÀNG".

---

### Kịch bản US-04.2: Phân ngưỡng cảnh báo kho
#### Kịch bản 4.2.1: Chuyển sang ngưỡng cảnh báo "Sắp hết" (Threshold Trigger)
- **Given** món `"Pain au Chocolat"` có tồn kho là `6` cái (trạng thái "Còn hàng").
- **When** phát sinh đơn hàng mua `2` cái (tồn kho giảm còn `4` cái).
- **Then** hệ thống tự động cập nhật trạng thái mặt hàng thành `low_stock` ("Sắp hết"), hiển thị Tag màu cam trên bảng quản lý sản phẩm.

---

### Kịch bản US-04.3: Truy vết và liên kết kho từ Dashboard
#### Kịch bản 4.3.1: Nhấp vào cảnh báo tồn kho trên Dashboard
- **Given** trang `/dashboard` hiển thị thẻ KPI "Cảnh báo tồn kho: 3 mặt hàng".
- **When** quản lý bấm vào liên kết *"Kiểm tra kho ngay →"*.
- **Then** hệ thống tự động điều hướng sang trang `/products` để quản lý kiểm tra chi tiết các món sắp hết hàng.

---

## Business Rules (Quy tắc nghiệp vụ)

1. **Nguyên tắc không bán âm (Non-negative Inventory)**:
   - Tồn kho tối thiểu là `0`. Hệ thống không cho phép tồn kho âm dưới bất kỳ trường hợp nào.
   - $\text{Tồn kho mới} = \max(0, \text{Tồn kho cũ} - \text{Số lượng bán})$.
2. **Ngưỡng trạng thái tồn kho cố định**:
   - `stock == 0`: Trạng thái `out_of_stock` (Hết hàng - Đỏ).
   - `1 <= stock <= 5`: Trạng thái `low_stock` (Sắp hết - Vàng cam).
   - `stock > 5`: Trạng thái `in_stock` (Còn hàng - Xanh lục).
3. **Cơ chế lưu trữ Mock State**:
   - Trong chế độ Mock (`NEXT_PUBLIC_USE_MOCK=true`), dữ liệu tồn kho được cập nhật trực tiếp vào `localStorage` (key `artisan_mock_products`) để đảm bảo tính nhất quán dữ liệu xuyên suốt toàn bộ ứng dụng.

---

## Phạm vi kỹ thuật liên quan

- **Routes**:
  - Giao diện bán hàng trừ kho: `/pos` ([`app/pos/page.tsx`](file:///Users/gnuhh/Project/python/fe/app/pos/page.tsx))
  - Giao diện bảng kho: `/products` ([`app/products/page.tsx`](file:///Users/gnuhh/Project/python/fe/app/products/page.tsx))
  - Cảnh báo kho KPI: `/dashboard` ([`app/dashboard/page.tsx`](file:///Users/gnuhh/Project/python/fe/app/dashboard/page.tsx))
- **File dùng chung liên quan**:
  - `lib/mock-data.ts`: Schema `Product`, cờ trạng thái `in_stock | low_stock | out_of_stock`.
  - `lib/api.ts`: Logic trừ kho tự động trong hàm `createOrder()` và các hàm CRUD sản phẩm `updateProduct()`.
