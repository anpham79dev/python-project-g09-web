# Module 03: Điểm Bán Hàng Tại Quầy (Point of Sale - POS)

## Tổng quan
Module **Bán hàng tại quầy (POS)** là trung tâm vận hành trực tiếp hàng ngày của tiệm bánh. Giao diện được thiết kế chuyên biệt chia 2 cột (65% thực đơn danh mục / 35% giỏ hàng cố định), tối ưu cho tốc độ thao tác nhanh của thu ngân trong giờ cao điểm với cơ chế tìm kiếm tức thì, điều chỉnh số lượng linh hoạt và thanh toán đa kênh (QR Pay, Tiền mặt, Thẻ).

---

## User Stories

### US-03.1: Tìm kiếm và chọn món bánh vào giỏ hàng
- **Là một** Nhân viên thu ngân,
- **Tôi muốn** duyệt nhanh danh mục hoặc tìm kiếm món bánh và bấm vào thẻ để thêm vào giỏ hàng,
- **Để** phục vụ khách gọi món nhanh chóng mà không cần nhớ mã sản phẩm.

### US-03.2: Điều chỉnh giỏ hàng và thông tin khách hàng
- **Là một** Nhân viên thu ngân,
- **Tôi muốn** tăng/giảm số lượng món, xóa món, nhập tên khách, SĐT, ghi chú yêu cầu (ví dụ: ít đá, cắt bánh) và áp dụng giảm giá,
- **Để** hoàn thiện đơn hàng chính xác theo nhu cầu riêng của từng khách hàng.

### US-03.3: Thanh toán tức thì và in hóa đơn
- **Là một** Nhân viên thu ngân,
- **Tôi muốn** chọn phương thức thanh toán phù hợp (QR, Tiền mặt, Thẻ) và bấm nút Thanh toán,
- **Để** hoàn tất giao dịch bán hàng, hệ thống tự động trừ tồn kho và hiển thị hóa đơn thành công cho khách.

---

## Acceptance Criteria (Given - When - Then)

### Kịch bản US-03.1: Chọn món vào đơn hàng
#### Kịch bản 3.1.1: Thêm món còn hàng vào giỏ (Happy Path)
- **Given** thu ngân đang ở màn hình `/pos` và giỏ hàng đang trống.
- **When** thu ngân nhấp chuột vào thẻ bánh `"Croissant Bơ Pháp"`.
- **Then** sản phẩm xuất hiện trong danh sách giỏ hàng bên phải với số lượng là 1, tổng tiền tạm tính tự động cập nhật là `35.000 ₫`, và thẻ sản phẩm bên trái hiển thị huy hiệu badge số `1`.

#### Kịch bản 3.1.2: Thêm món đã hết hàng vào giỏ (Edge Case / Blocking)
- **Given** sản phẩm `"Cheesecake Cháy"` có tồn kho `stock = 0`.
- **When** thu ngân cố tình nhấp chuột vào thẻ sản phẩm này.
- **Then** thẻ hiển thị lớp phủ mờ "HẾT HÀNG", con trỏ chuyển sang trạng thái cấm (`cursor-not-allowed`) và hệ thống hiển thị thông báo cảnh báo: *"Sản phẩm 'Cheesecake Cháy' hiện đã hết hàng!"*, không thêm vào giỏ.

---

### Kịch bản US-03.2: Tùy chỉnh giỏ hàng & Giảm giá
#### Kịch bản 3.2.1: Tăng số lượng món vượt quá tồn kho (Edge Case)
- **Given** món `"Bánh Kem Dâu Tây"` chỉ còn tồn kho 6 cái, trong giỏ hàng hiện đã có 6 cái.
- **When** thu ngân bấm nút dấu cộng `(+)` trên dòng sản phẩm trong giỏ.
- **Then** hệ thống không tăng số lượng lên 7, giữ nguyên số lượng 6 và hiển thị thông báo: *"Số lượng đã đạt giới hạn tồn kho (6)"*.

#### Kịch bản 3.2.2: Áp dụng chiết khấu giảm giá (Happy Path)
- **Given** giỏ hàng có tổng tạm tính là `200.000 ₫`.
- **When** thu ngân nhập số tiền giảm giá `20.000 ₫` vào ô "Giảm giá khuyến mãi".
- **Then** dòng "TỔNG THANH TOÁN" lập tức cập nhật thành `180.000 ₫`.

---

### Kịch bản US-03.3: Thanh toán và xuất hóa đơn
#### Kịch bản 3.3.1: Thanh toán thành công bằng Chuyển khoản QR (Happy Path)
- **Given** giỏ hàng có ít nhất 1 sản phẩm hợp lệ, thu ngân chọn phương thức thanh toán "Chuyển khoản".
- **When** thu ngân bấm nút "Thanh toán (xxx ₫)".
- **Then** hệ thống tạo đơn hàng với mã hóa đơn duy nhất dạng `HD-YYMMDD-XX`, hiển thị Modal popup thành công kèm chi tiết đơn, tự động làm sạch giỏ hàng bên phải và cập nhật lại số lượng tồn kho của các món vừa bán trong lưới bên trái.

#### Kịch bản 3.3.2: Bấm thanh toán khi giỏ hàng rỗng (Edge Case)
- **Given** giỏ hàng không có bất kỳ sản phẩm nào (`cart.length === 0`).
- **When** nút Thanh toán ở trạng thái vô hiệu hóa (`disabled`) hoặc người dùng kích hoạt lệnh thanh toán.
- **Then** hệ thống cảnh báo *"Giỏ hàng đang trống! Vui lòng chọn món"* và không phát sinh bất kỳ giao dịch nào.

---

## Business Rules (Quy tắc nghiệp vụ)

1. **Bố cục giao diện chuẩn Stitch (65% / 35%)**:
   - Cột trái chiếm ~65% độ rộng: hiển thị thanh tìm kiếm, danh mục dạng pill tab và lưới card sản phẩm có ảnh chất lượng cao.
   - Cột phải chiếm ~35% (tối thiểu 380px): giỏ hàng cố định với padding chuẩn `px-5`, tất cả khối con thẳng hàng dọc 100%.
2. **Quy tắc tính toán tiền tệ**:
   - $\text{Tạm tính} = \sum (\text{Đơn giá} \times \text{Số lượng})$.
   - $\text{Tổng thanh toán} = \max(0, \text{Tạm tính} - \text{Giảm giá})$.
3. **Quy tắc hoàn tất giao dịch**:
   - Tại quầy POS, khi bấm Thanh toán là giao dịch hoàn tất ngay lập tức (trạng thái `COMPLETED`), không có trạng thái xử lý trung gian.
   - Nhân viên thực hiện đơn hàng tự động được gắn theo tài khoản đang đăng nhập (`staffId`, `staffName`).

---

## Phạm vi kỹ thuật liên quan

- **Routes**:
  - `/pos` ([`app/pos/page.tsx`](file:///Users/gnuhh/Project/python/fe/app/pos/page.tsx))
- **File dùng chung liên quan**:
  - `lib/mock-data.ts`: Định nghĩa kiểu dữ liệu `Product`, `Order`, `OrderItem`.
  - `lib/api.ts`: Hàm `getProducts()` và `createOrder()`.
