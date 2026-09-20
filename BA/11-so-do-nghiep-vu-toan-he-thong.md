# TỔNG HỢP TOÀN BỘ SƠ ĐỒ NGHIỆP VỤ HỆ THỐNG (ARTISAN BAKERY ERP)

> **Dự án:** Hệ thống Quản lý Đơn hàng & Vận hành Chuỗi Tiệm Bánh (Artisan Bakery Management System)  
> **Backend:** FastAPI, SQLAlchemy 2.0, PostgreSQL 16, PBAC 21 Permissions, Pessimistic Locking (`with_for_update`)  
> **Frontend:** Next.js 16 (App Router), React 19, Ant Design v6, Tailwind CSS, Recharts  
> **Tài liệu chuẩn:** Bao phủ 100% nghiệp vụ theo 10 tài liệu BA và mã nguồn hệ thống.

---

## MỤC LỤC

1. [Sơ Đồ 1: Bản Đồ Kiến Trúc Nghiệp Vụ Tổng Thể](#1-sơ-đồ-1-bản-đồ-kiến-trúc-nghiệp-vụ-tổng-thể-system-business-map)
2. [Sơ Đồ 2: Thực Thể Dữ Liệu Toàn Hệ Thống (ERD)](#2-sơ-đồ-2-thực-thể-dữ-liệu-toàn-hệ-thống-comprehensive-erd)
3. [Sơ Đồ 3: Luồng Xác Thực, Edge Route Guard & PBAC](#3-sơ-đồ-3-luồng-xác-thực-edge-route-guard--phân-quyền-pbac-động)
4. [Sơ Đồ 4: Nghiệp Vụ Bán Hàng POS & Giao Dịch Kho Nguyên Tử](#4-sơ-đồ-4-nghiệp-vụ-bán-hàng-pos--giao-dịch-kho-nguyên-tử-atomic-pos)
5. [Sơ Đồ 5: Vòng Đời Ca Làm Việc & Đối Soát Két Tiền Mặt](#5-sơ-đồ-5-vòng-đời-ca-làm-việc--đối-soát-két-tiền-mặt)
6. [Sơ Đồ 6: Sổ Quỹ Thu Chi & Kế Toán Quản Trị Lãi Lỗ (P&L)](#6-sơ-đồ-6-sổ-quỹ-thu-chi--kế-toán-quản-trị-lãi-lỗ-pl)
7. [Sơ Đồ 7: Cơ Chế Đa Chi Nhánh, Đa Kho & Đồng Bộ Real-time](#7-sơ-đồ-7-cơ-chế-đa-chi-nhánh-đa-kho--đồng-bộ-thời-gian-thực)
8. [Sơ Đồ 8: Bộ Máy Phân Tích & Báo Cáo Điều Hành Dashboard](#8-sơ-đồ-8-bộ-máy-phân-tích--báo-cáo-điều-hành-dashboard)
9. [Sơ Đồ 9: Cài Đặt Hệ Thống, VietQR & Mẫu Ca Làm Việc Động](#9-sơ-đồ-9-cài-đặt-hệ-thống-vietqr--mẫu-ca-làm-việc-động)
10. [Ma Trận 21 Quyền Hạn Nguyên Tử (PBAC) & Ánh Xạ Source Code](#10-ma-trận-21-quyền-hạn-nguyên-tử-pbac--ánh-xạ-file-source-code)

---

## 1. Sơ Đồ 1: Bản Đồ Kiến Trúc Nghiệp Vụ Tổng Thể (System Business Map)

```mermaid
flowchart TD
    %% Định nghĩa các Actor
    subgraph ACTORS ["CÁC TÁC NHÂN HỆ THỐNG"]
        Actor_SuperAdmin["Super Admin - Tổng Quản Trị"]
        Actor_Admin["Admin - Chủ Chuỗi / Quản Lý"]
        Actor_Staff["Staff - Thu Ngân Tại Quầy"]
        Actor_Customer["Khách Hàng Mua Bánh"]
    end

    %% Giao diện người dùng
    subgraph FRONTEND ["FRONTEND WEB (NEXT.JS 16 & ANTD V6)"]
        UI_Login["Trang Đăng Nhập (/login)"]
        UI_Edge["Edge Route Guard (middleware.ts)"]
        UI_Pos["Quầy Bán Hàng POS (/pos)"]
        UI_Shift["Quản Lý Ca & Chốt Két (/shifts)"]
        UI_Products["Quản Lý Sản Phẩm & Kho (/products)"]
        UI_Orders["Lịch Sử Đơn Hàng (/orders)"]
        UI_Accounting["Sổ Quỹ & Kế Toán P&L (/accounting)"]
        UI_Branches["Quản Lý Chi Nhánh & Kho (/branches)"]
        UI_Users["Quản Trị Nhân Sự (/users)"]
        UI_Roles["Phân Quyền Động PBAC (/settings/roles)"]
        UI_Settings["Cài Đặt Hệ Thống & Ca Mẫu (/settings)"]
        UI_Dashboard["Bảng Điều Khiển KPIs (/dashboard)"]
    end

    %% Tầng xử lý nghiệp vụ Backend API
    subgraph BACKEND_API ["FASTAPI BACKEND SERVICES (g09-api-ref)"]
        API_Auth["/api/auth - Xác thực JWT & Me Profile"]
        API_Roles["/api/roles & /permissions - Quản lý 21 Quyền PBAC"]
        API_Shifts["/api/shifts - Vòng đời Ca & Đối soát Két"]
        API_Orders["/api/orders - Checkout POS Atomic & Trừ kho"]
        API_Products["/api/products - Danh mục, Giá & Mức tồn"]
        API_Branches["/api/branches - Chi nhánh & Kho hàng"]
        API_Accounting["/api/accounting - Phiếu Thu/Chi & P&L"]
        API_Dashboard["/api/dashboard - Thống kê KPIs theo Giờ/Ngày/Kỳ"]
        API_Settings["/api/settings - Ca làm việc mẫu & Cấu hình tiệm"]
    end

    %% Cơ sở dữ liệu tập trung
    subgraph DATABASE ["CƠ SỞ DỮ LIỆU POSTGRESQL 16"]
        DB_Users[("users")]
        DB_Roles[("roles & role_permissions")]
        DB_Perms[("permissions (21)")]
        DB_Branches[("branches & warehouses")]
        DB_Stock[("stock_items")]
        DB_Products[("products")]
        DB_Shifts[("work_shifts & shift_templates")]
        DB_Orders[("orders & order_items")]
        DB_Tx[("transactions (Thu/Chi)")]
        DB_Audit[("audit_logs")]
        DB_Settings[("system_settings")]
    end

    %% Thiết bị ngoại vi
    subgraph EXTERNAL ["DỊCH VỤ NGOẠI VI & THIẾT BỊ"]
        Device_Printer["Máy In Hóa Đơn Nhiệt 80mm"]
        Bank_VietQR["Hệ Thống Ngân Hàng VietQR"]
    end

    %% Liên kết Actor vào Giao diện
    Actor_Staff -->|"1. Đăng nhập ca"| UI_Login
    Actor_Staff -->|"2. Bán hàng & Chốt ca"| UI_Pos
    Actor_Staff -->|"3. Bàn giao tiền két"| UI_Shift
    Actor_Customer -->|"Mua bánh & Trả tiền"| UI_Pos

    Actor_Admin -->|"Quản trị nghiệp vụ"| UI_Login
    Actor_Admin --> UI_Dashboard
    Actor_Admin --> UI_Products
    Actor_Admin --> UI_Accounting
    Actor_Admin --> UI_Branches
    Actor_Admin --> UI_Users
    Actor_Admin --> UI_Settings

    Actor_SuperAdmin --> UI_Roles

    %% Edge Middleware kiểm tra phiên
    UI_Login --> UI_Edge
    UI_Edge -->|"Kiểm tra hạn JWT & Role"| UI_Pos
    UI_Edge -->|"Kiểm tra hạn JWT & Role"| UI_Dashboard

    %% Frontend gọi API Backend
    UI_Login -.-> API_Auth
    UI_Pos -.-> API_Orders
    UI_Pos -.-> API_Shifts
    UI_Shift -.-> API_Shifts
    UI_Products -.-> API_Products
    UI_Orders -.-> API_Orders
    UI_Accounting -.-> API_Accounting
    UI_Branches -.-> API_Branches
    UI_Users -.-> API_Auth
    UI_Roles -.-> API_Roles
    UI_Settings -.-> API_Settings
    UI_Dashboard -.-> API_Dashboard

    %% Backend tương tác DB
    API_Auth --> DB_Users
    API_Roles --> DB_Roles
    API_Roles --> DB_Perms
    API_Roles --> DB_Audit
    API_Shifts --> DB_Shifts
    API_Orders --> DB_Orders
    API_Orders --> DB_Stock
    API_Orders --> DB_Products
    API_Products --> DB_Products
    API_Products --> DB_Stock
    API_Branches --> DB_Branches
    API_Accounting --> DB_Tx
    API_Accounting --> DB_Orders
    API_Dashboard --> DB_Orders
    API_Dashboard --> DB_Stock
    API_Settings --> DB_Settings

    %% Tương tác ngoại vi
    UI_Pos -->|"Tạo mã QR Động"| Bank_VietQR
    UI_Pos -->|"In Hóa Đơn Bán Lẻ"| Device_Printer
    UI_Shift -->|"In Phiếu Bàn Giao Két"| Device_Printer
```

---

## 2. Sơ Đồ 2: Thực Thể Dữ Liệu Toàn Hệ Thống (Comprehensive ERD)

```mermaid
erDiagram
    permissions {
        varchar id PK "Mã quyền, ví dụ: perm-pos-access"
        varchar code UK "Mã định danh duy nhất (pos:access)"
        varchar name "Tên hiển thị quyền"
        varchar module "Phân hệ (POS, Kho, Kế Toán...)"
        text description "Mô tả chi tiết quyền hạn"
        timestamptz created_at "Thời điểm tạo quyền"
    }

    roles {
        varchar id PK "Mã vai trò, ví dụ: role-admin"
        varchar code "Mã vai trò (SUPER_ADMIN, ADMIN, STAFF)"
        varchar name "Tên vai trò"
        text description "Mô tả vai trò"
        boolean is_system "Cờ vai trò mặc định hệ thống"
        int permissions_version "Phiên bản quyền hạn để đối soát"
        timestamptz created_at "Thời gian tạo"
        timestamptz updated_at "Thời gian cập nhật"
    }

    role_permissions {
        varchar role_id PK,FK "Liên kết roles.id"
        varchar permission_id PK,FK "Liên kết permissions.id"
    }

    branches {
        varchar id PK "Mã chi nhánh (branch-001)"
        varchar code "Mã cơ sở (CN-Q1, CN-TD)"
        varchar name "Tên chi nhánh"
        varchar address "Địa chỉ cơ sở"
        varchar phone "Hotline liên hệ"
        varchar manager_name "Quản lý phụ trách"
        varchar status "ACTIVE / INACTIVE"
        timestamp created_at "Ngày tạo"
    }

    warehouses {
        varchar id PK "Mã kho hàng (wh-001)"
        varchar branch_id FK "Thuộc chi nhánh nào"
        varchar code "Mã kho (KHO-Q1-POS)"
        varchar name "Tên kho (Kho Quầy Bán Lẻ, Kho Lạnh...)"
        varchar warehouse_type "RETAIL / COLD_STORAGE / CENTRAL"
        varchar status "ACTIVE / INACTIVE"
        timestamp created_at "Ngày tạo"
    }

    users {
        varchar id PK "Mã nhân viên (user-001)"
        varchar username UK "Tên đăng nhập chữ thường duy nhất"
        varchar hashed_password "Mật khẩu băm Bcrypt"
        varchar full_name "Họ và tên nhân viên"
        varchar email "Email liên hệ"
        varchar phone "Số điện thoại"
        varchar role_id FK "Liên kết vai trò roles.id"
        varchar role "Role code dự phòng (STAFF, ADMIN)"
        varchar status "ACTIVE / INACTIVE"
        varchar default_branch_id FK "Chi nhánh mặc định phân công"
        varchar last_active_branch_id FK "Chi nhánh đăng nhập gần nhất"
        timestamptz created_at "Ngày tạo tài khoản"
        timestamptz updated_at "Ngày cập nhật"
    }

    products {
        varchar id PK "Mã sản phẩm (prod-001)"
        varchar name "Tên loại bánh"
        varchar category "Danh mục (Bánh mì nghệ nhân, Pastry...)"
        int price "Giá niêm yết (VND >= 1.000)"
        int stock "Tổng tồn kho đồng bộ toàn hệ thống"
        text description "Mô tả thành phần, hương vị bánh"
        varchar image "Đường dẫn hình ảnh bánh"
        boolean is_deleted "Cờ xóa mềm (Soft Delete)"
        timestamptz created_at "Ngày tạo sản phẩm"
        timestamptz updated_at "Ngày cập nhật"
    }

    stock_items {
        varchar id PK "Mã bản ghi tồn kho"
        varchar warehouse_id FK "Liên kết warehouses.id"
        varchar product_id FK "Liên kết products.id"
        int quantity "Số lượng tồn kho thực tế tại kho này"
        int min_alert_stock "Ngưỡng cảnh báo sắp hết (Mặc định 5)"
        timestamp created_at "Ngày tạo"
        timestamp updated_at "Ngày cập nhật"
    }

    orders {
        varchar id PK "Mã định danh đơn (ord-1001)"
        varchar code UK "Mã hóa đơn dạng HD-YYMMDD-XX"
        varchar customer_name "Tên khách mua hàng"
        varchar customer_phone "SĐT khách hàng"
        varchar branch_id FK "Chi nhánh phát sinh đơn"
        varchar warehouse_id FK "Kho xuất hàng bán"
        varchar staff_id FK "Nhân viên thu ngân lập đơn"
        varchar staff_name "Họ tên thu ngân"
        int subtotal "Tổng tiền hàng tạm tính"
        int discount "Chiết khấu giảm giá"
        int total_amount "Tổng thanh toán sau giảm giá"
        varchar payment_method "CASH / CARD / QR_TRANSFER"
        varchar status "COMPLETED / CANCELLED"
        text note "Ghi chú đơn hàng"
        timestamptz created_at "Thời điểm thanh toán"
        timestamptz updated_at "Thời điểm cập nhật"
    }

    order_items {
        varchar id PK "Mã dòng chi tiết đơn"
        varchar order_id FK "Thuộc đơn hàng orders.id"
        varchar product_id FK "Mã bánh mua products.id"
        varchar product_name "Tên bánh tại thời điểm mua"
        int price "Đơn giá tại thời điểm mua"
        int quantity "Số lượng mua"
        int subtotal "Thành tiền (price * quantity)"
        varchar image "Ảnh minh họa sản phẩm"
    }

    shift_templates {
        varchar id PK "Mã ca mẫu (tmpl-01)"
        varchar name "Tên ca (Ca sáng, Ca chiều tối)"
        varchar start_time "Giờ bắt đầu (06:30)"
        varchar end_time "Giờ kết thúc (14:30)"
        int default_initial_cash "Tiền lẻ gợi ý đầu ca (500.000đ)"
        boolean is_active "Trạng thái kích hoạt"
        text note "Ghi chú phân ca"
        timestamp created_at "Ngày tạo"
    }

    work_shifts {
        varchar id PK "Mã ca làm việc (shift-abc12345)"
        varchar branch_id FK "Chi nhánh mở ca"
        varchar template_id FK "Mẫu ca shift_templates.id"
        varchar shift_name "Tên ca kèm ngày làm việc"
        varchar staff_id FK "Thu ngân mở ca (users.id)"
        varchar staff_name "Tên thu ngân"
        timestamp start_time "Giờ bắt đầu ca"
        timestamp end_time "Giờ đóng ca"
        int initial_cash "Tiền lẻ đầu ca (mặc định 500.000đ)"
        int cash_revenue "Lũy kế thu tiền mặt"
        int card_revenue "Lũy kế thu quẹt thẻ"
        int qr_revenue "Lũy kế thu chuyển khoản QR"
        int total_revenue "Tổng doanh thu trong ca"
        int orders_count "Tổng số đơn hoàn tất"
        int expected_cash "Tiền mặt lý thuyết két"
        int actual_cash "Tiền mặt thực đếm khi chốt ca"
        int difference "Chênh lệch két (actual - expected)"
        varchar status "OPEN / CLOSED"
        text note "Ghi chú giải trình chênh lệch"
        timestamp created_at "Thời gian tạo"
    }

    transactions {
        varchar id PK "Mã giao dịch (tx-001)"
        varchar code UK "Mã chứng từ PT-YYMMDD-XXX / PC-YYMMDD-XXX"
        varchar transaction_type "INCOME (Thu) / EXPENSE (Chi)"
        varchar category "Hạng mục (Bột mì, Mặt bằng, Điện, Lương...)"
        int amount "Số tiền phát sinh"
        varchar branch_id FK "Chi nhánh phát sinh"
        varchar payment_method "CASH / BANK_TRANSFER"
        varchar recipient_payer "Người nộp hoặc người nhận tiền"
        text note "Diễn giải chi tiết khoản thu/chi"
        varchar created_by "Người lập phiếu"
        timestamptz created_at "Ngày lập chứng từ"
    }

    audit_logs {
        varchar id PK "Mã nhật ký"
        varchar user_id FK "Người thực hiện users.id"
        varchar user_name "Tên người thao tác"
        varchar action "Hành động (UPDATE_ROLE_PERMISSIONS...)"
        varchar target_type "Đối tượng bị tác động (ROLE, USER)"
        varchar target_id "Mã đối tượng"
        varchar target_name "Tên đối tượng"
        text changes_summary "Tóm tắt thay đổi quyền"
        text details_json "Chi tiết dạng JSON"
        varchar ip_address "Địa chỉ IP người dùng"
        timestamptz created_at "Thời điểm thao tác"
    }

    system_settings {
        varchar key PK "Khóa cấu hình (store_name, bank_account...)"
        text value "Giá trị cấu hình"
        varchar description "Mô tả tham số"
        timestamp updated_at "Ngày cập nhật"
    }

    roles ||--o{ role_permissions : "gán quyền"
    permissions ||--o{ role_permissions : "được gán"
    roles ||--o{ users : "thuộc vai trò"
    branches ||--o{ warehouses : "sở hữu kho"
    branches ||--o{ users : "chi nhánh làm việc"
    warehouses ||--o{ stock_items : "chứa hàng"
    products ||--o{ stock_items : "tồn tại kho"
    users ||--o{ orders : "thu ngân tạo đơn"
    branches ||--o{ orders : "nơi phát sinh đơn"
    warehouses ||--o{ orders : "kho xuất đơn"
    orders ||--|{ order_items : "gồm các món"
    products ||--o{ order_items : "xuất bán"
    users ||--o{ work_shifts : "thu ngân mở ca"
    branches ||--o{ work_shifts : "chi nhánh làm việc"
    shift_templates ||--o{ work_shifts : "áp dụng mẫu ca"
    branches ||--o{ transactions : "chi nhánh thu/chi"
    users ||--o{ audit_logs : "ghi nhật ký thao tác"
```

---

## 3. Sơ Đồ 3: Luồng Xác Thực, Edge Route Guard & Phân Quyền PBAC Động

```mermaid
sequenceDiagram
    autonumber
    actor Staff as Nhân Viên Thu Ngân (Staff)
    actor Admin as Quản Trị Viên (Admin)
    participant Browser as Trình Duyệt Client (Next.js)
    participant Edge as Edge Middleware (middleware.ts)
    participant AuthAPI as Backend /api/auth & /api/roles
    participant DB as PostgreSQL Database

    rect rgb(240, 248, 255)
        note over Staff, DB: GIAI ĐOẠN 1: ĐĂNG NHẬP VÀ CẤP PHÁT TOKEN PHÂN QUYỀN
        Staff->>Browser: Nhập username, password tại /login
        Browser->>AuthAPI: POST /api/auth/login { username, password }
        AuthAPI->>DB: Truy vấn user & băm Bcrypt kiểm tra password
        DB-->>AuthAPI: Trả về thông tin User, Role & Permissions (21 quyền)
        AuthAPI->>AuthAPI: Ký JWT Token kèm payload { sub, role, default_branch_id, exp }
        AuthAPI-->>Browser: Trả về { access_token, user: { id, role, defaultBranchId, permissions } }
        Browser->>Browser: Lưu Token vào Cookies & LocalStorage (artisan_token, artisan_permissions)
    end

    rect rgb(255, 250, 240)
        note over Staff, Edge: GIAI ĐOẠN 2: EDGE ROUTE GUARD & KHÓA CHI NHÁNH STAFF
        Browser->>Edge: Truy cập trang gốc (/)
        Edge->>Edge: Giải mã exp từ JWT Token (exp * 1000 < Date.now() ?)
        alt Token đã hết hạn
            Edge-->>Browser: Xóa Cookies phiên & Điều hướng cưỡng bức về /login
        else Token còn hiệu lực & Role == STAFF
            Edge-->>Browser: Chuyển hướng thông minh vào quầy bán hàng /pos
            Browser->>Browser: Khóa cố định Chi nhánh làm việc (Badge: 🏢 CN Quận 1, ẩn menu Admin)
        else Token còn hiệu lực & Role == ADMIN / SUPER_ADMIN
            Edge-->>Browser: Chuyển hướng vào Bảng Điều Khiển /dashboard
            Browser->>Browser: Kích hoạt Branch Switcher (Xem Toàn chuỗi hoặc từng cơ sở)
        end
    end

    rect rgb(255, 240, 245)
        note over Staff, Edge: GIAI ĐOẠN 3: BẢO VỆ CHỐNG TRUY CẬP VƯỢT QUYỀN (RBAC ENFORCEMENT)
        Staff->>Edge: Cố tình gõ URL Quản trị: /dashboard hoặc /products
        Edge->>Edge: Kiểm tra vai trò == STAFF (thiếu quyền dashboard:view)
        Edge-->>Browser: Chặn truy cập (403 Forbidden) & Điều hướng an toàn về /pos
    end

    rect rgb(245, 255, 245)
        note over Admin, DB: GIAI ĐOẠN 4: THAY ĐỔI VAI TRÒ ĐỘNG & GHI NHẬT KÝ KIỂM TOÁN
        Admin->>Browser: Truy cập /settings/roles -> Bật/tắt quyền cho Role "STAFF"
        Browser->>AuthAPI: PUT /api/roles/role-staff/permissions { permission_ids }
        AuthAPI->>DB: Cập nhật bảng role_permissions & tăng permissions_version
        AuthAPI->>DB: INSERT INTO audit_logs (action, target_type, target_id, changes_summary, ip_address)
        DB-->>AuthAPI: Lưu thay đổi thành công
        AuthAPI-->>Browser: Trả về vai trò đã cập nhật & ghi vết kiểm toán minh bạch
    end
```

---

## 4. Sơ Đồ 4: Nghiệp Vụ Bán Hàng POS & Giao Dịch Kho Nguyên Tử (Atomic POS)

```mermaid
sequenceDiagram
    autonumber
    actor Cashier as Thu Ngân POS
    participant POS_UI as Màn Hình Bán Hàng POS (/pos)
    participant OrderAPI as FastAPI (/api/orders)
    participant DB as PostgreSQL Transaction (ACID)
    participant Printer as Máy In Hóa Đơn Nhiệt 80mm

    Cashier->>POS_UI: Chọn các món bánh vào giỏ hàng (Croissant, Bánh Mì...)
    Cashier->>POS_UI: Nhập thông tin khách (tùy chọn), giảm giá, chọn PTTT (CASH / QR / CARD)
    Cashier->>POS_UI: Bấm nút "Thanh toán (Tổng tiền)"

    POS_UI->>OrderAPI: POST /api/orders { items, branch_id, payment_method, discount, ... }
    
    rect rgb(255, 245, 238)
        note over OrderAPI, DB: BƯỚC 1: KIỂM TRA ĐIỀU KIỆN TIÊN QUYẾT (CA MỞ)
        OrderAPI->>DB: SELECT * FROM work_shifts WHERE staff_id = :id AND status = 'OPEN'
        alt Không tìm thấy ca mở
            DB-->>OrderAPI: null
            OrderAPI-->>POS_UI: 400 Bad Request: "Chưa có ca làm việc nào đang mở! Vui lòng mở ca trước."
        end
    end

    rect rgb(238, 245, 255)
        note over OrderAPI, DB: BƯỚC 2: KHÓA BI QUAN (PESSIMISTIC LOCK) & TRỪ TỒN KHO TẠI KHO CHI NHÁNH
        OrderAPI->>DB: BEGIN TRANSACTION
        OrderAPI->>DB: Sinh mã hóa đơn tuần tự theo múi giờ VN: HD-YYMMDD-XX (Count + 1)
        
        loop Với từng sản phẩm trong giỏ hàng
            OrderAPI->>DB: SELECT * FROM stock_items WHERE warehouse_id = :wh_id AND product_id = :prod_id FOR UPDATE
            note over OrderAPI, DB: Khóa hàng này chống race condition khi nhiều thu ngân thanh toán cùng lúc
            alt Số lượng tồn kho < Số lượng đặt mua (available_qty < item.quantity)
                OrderAPI->>DB: ROLLBACK TRANSACTION
                OrderAPI-->>POS_UI: 400 Bad Request: "Sản phẩm 'X' tại kho không đủ tồn (Chỉ còn N, yêu cầu M)!"
            else Đủ tồn kho
                OrderAPI->>DB: UPDATE stock_items SET quantity = quantity - :buy_qty
                OrderAPI->>DB: UPDATE products SET stock = (SELECT SUM(quantity) FROM stock_items WHERE product_id = :prod_id)
                note over OrderAPI, DB: Đồng bộ tồn kho tức thì về bảng products
            end
        end
    end

    rect rgb(240, 255, 240)
        note over OrderAPI, DB: BƯỚC 3: TẠO ĐƠN HÀNG & CẬP NHẬT DOANH THU CA
        OrderAPI->>DB: INSERT INTO orders (code, total_amount, branch_id, warehouse_id, status='COMPLETED', ...)
        OrderAPI->>DB: INSERT INTO order_items (order_id, product_id, price, quantity, subtotal, ...)
        
        OrderAPI->>DB: Cập nhật ca làm việc hiện tại:
        note over OrderAPI, DB: orders_count += 1\ntotal_revenue += total_amount\nNếu CASH: cash_revenue += total, expected_cash = initial + cash_rev\nNếu CARD: card_revenue += total\nNếu QR: qr_revenue += total
        
        OrderAPI->>DB: COMMIT TRANSACTION
        DB-->>OrderAPI: Giao dịch thành công 100% (ACID)
    end

    OrderAPI-->>POS_UI: 201 Created: Trả về đối tượng Order hoàn chỉnh
    POS_UI->>POS_UI: Làm sạch giỏ hàng, cập nhật số lượng tồn hiển thị trên lưới sản phẩm
    POS_UI->>Printer: Kích hoạt Popup in hóa đơn bán lẻ 80mm cho khách
```

---

## 5. Sơ Đồ 5: Vòng Đời Ca Làm Việc & Đối Soát Két Tiền Mặt

### 5.1. Máy Trạng Thái Ca Làm Việc (State Machine)

```mermaid
stateDiagram-v2
    [*] --> CHUA_MO_CA: Nhân viên đăng nhập vào quầy POS

    CHUA_MO_CA --> DANG_MO_CA: POST /api/shifts/open\n(Khai báo tiền lẻ đầu ca: mặc định 500.000 ₫)
    
    state DANG_MO_CA {
        [*] --> GhiNhanDonHang
        GhiNhanDonHang --> CapNhatLuyKe: Hoàn tất đơn bán POS
        note right of CapNhatLuyKe
            Lũy kế tức thời:
            - cash_revenue += tiền mặt
            - card_revenue += quẹt thẻ
            - qr_revenue += chuyển khoản QR
            - total_revenue += tổng đơn
            - expected_cash = initial + cash_rev
        end note
        CapNhatLuyKe --> GhiNhanDonHang: Chờ đơn kế tiếp
    }

    DANG_MO_CA --> DOI_SOAT_KET: Thu ngân bấm "Kết ca / Chốt két"\nĐếm tiền mặt thực tế trong két

    state DOI_SOAT_KET {
        [*] --> TinhToanChenhLech
        note right of TinhToanChenhLech
            Chênh lệch = Tiền thực tế - Tiền lý thuyết
        end note

        TinhToanChenhLech --> KhopChuan: Chênh lệch == 0 ₫ (Khớp két 100%)
        TinhToanChenhLech --> ThuaTien: Chênh lệch > 0 ₫ (Cảnh báo thừa tiền)
        TinhToanChenhLech --> ThieuTien: Chênh lệch < 0 ₫ (Cảnh báo thiếu tiền)

        ThieuTien --> BatBuocGiaiTrinh: Nhập lý do (thối nhầm tiền, hao hụt...)
        ThuaTien --> NhapGiaiTrinh: Ghi chú giải trình nguồn thừa
        KhopChuan --> XacNhanDongCa
        BatBuocGiaiTrinh --> XacNhanDongCa
        NhapGiaiTrinh --> XacNhanDongCa
    }

    DOI_SOAT_KET --> DA_DONG_CA: POST /api/shifts/close\n(Cập nhật status = CLOSED, lưu endTime)
    
    DA_DONG_CA --> InBienBanBanGiao: Tự động gọi window.print()\nIn Phiếu Bàn Giao Kết Ca (2 chữ ký)
    InBienBanBanGiao --> [*]: Bàn giao tiền cho Quản lý / Ca sau
```

### 5.2. Quy Trình Đối Soát Két Tiền Cuối Ca (Flowchart)

```mermaid
flowchart TD
    Start(["Bắt đầu Kết Ca tại POS"]) --> CheckCurrent["GET /api/shifts/current: Lấy ca OPEN hiện tại"]
    CheckCurrent --> CalcTheory["Hệ thống tính Tiền Mặt Lý Thuyết:\nexpected_cash = initial_cash + cash_revenue"]
    CalcTheory --> InputActual["Thu ngân đếm tiền trong két và nhập: actual_cash"]
    InputActual --> CalcDiff["Tính: difference = actual_cash - expected_cash"]
    
    CalcDiff --> CheckDiff{"So sánh difference"}
    CheckDiff -->|"difference == 0"| StateZero["Trạng Thái: Khớp Chuẩn (0 ₫)\nNhãn Xanh Lục"]
    CheckDiff -->|"difference > 0"| StateSurplus["Trạng Thái: Thừa Tiền (+xx ₫)\nNhãn Vàng Cảnh Báo"]
    CheckDiff -->|"difference < 0"| StateDeficit["Trạng Thái: Thiếu Tiền (-xx ₫)\nNhãn Đỏ Báo Động"]

    StateDeficit --> RequireNote["Bắt buộc thu ngân nhập ô Ghi chú giải trình:\n'Ghi rõ nguyên nhân thiếu tiền két'"]
    StateSurplus --> OptionalNote["Nhập ghi chú giải trình tiền thừa nếu có"]
    StateZero --> ConfirmClose["Bấm nút Xác Nhận Chốt Két"]
    
    RequireNote --> ConfirmClose
    OptionalNote --> ConfirmClose

    ConfirmClose --> PostClose["POST /api/shifts/close\nCập nhật status = CLOSED, end_time = now()"]
    PostClose --> PrintReceipt["Mở hộp thoại In Phiếu Bàn Giao Kết Ca:\n- Bảng phân rã doanh thu (Tiền mặt/Thẻ/QR)\n- Đối soát két tiền & Chênh lệch\n- Chữ ký Thu Ngân & Quản Lý"]
    PrintReceipt --> Finish(["Hoàn tất ca làm việc an toàn"])
```

---

## 6. Sơ Đồ 6: Sổ Quỹ Thu Chi & Kế Toán Quản Trị Lãi Lỗ (P&L)

```mermaid
flowchart LR
    %% Dòng Tiền Vào
    subgraph INFLOW ["DÒNG TIỀN VÀO (INCOME)"]
        In_POS["Doanh Thu Bán Lẻ POS\n(Tự động đồng bộ từ orders)"]
        In_Other["Thu Thanh Lý Bao Bì / Khác\n(Lập Phiếu Thu PT-YYMMDD-XXX)"]
    end

    %% Tổng Doanh Thu
    GrossRev["TỔNG DOANH THU THUẦN\n(Gross Revenue = POS + Thu Khác)"]
    In_POS --> GrossRev
    In_Other --> GrossRev

    %% Giá Vốn Hàng Bán
    subgraph COGS ["GIÁ VỐN HÀNG BÁN (COGS)"]
        C_Mat["Nguyên Vật Liệu\n(Bột mì, Bơ Pháp, Sữa, Men)"]
        C_Pkg["Bao Bì, Hộp Bánh, Ly Cốc"]
    end
    C_Mat -.->|"Lập Phiếu Chi PC-..."| COGS_Total["Tổng Chi Phí COGS\n(Mặc định ~35% nếu chưa ghi nhận)"]
    C_Pkg -.->|"Lập Phiếu Chi PC-..."| COGS_Total

    %% Lợi Nhuận Gộp
    GrossProfit["LỢI NHUẬN GỘP (GROSS PROFIT)\n= Doanh Thu Thuần - COGS\n(Biên Lãi Gộp %)"]
    GrossRev --> GrossProfit
    COGS_Total --> GrossProfit

    %% Chi Phí Vận Hành
    subgraph OPEX ["CHI PHÍ VẬN HÀNH (OPEX)"]
        O_Rent["Thuê Mặt Bằng Chi Nhánh"]
        O_Util["Điện Lò Nướng, Nước & Tiện Ích"]
        O_Salary["Lương & Phụ Cấp Nhân Sự"]
        O_Maint["Bảo Trì Thiết Bị Bếp / Khác"]
    end
    O_Rent -.->|"Lập Phiếu Chi PC-..."| OPEX_Total["Tổng Chi Phí Vận Hành OPEX\n(Mặc định ~25% nếu chưa ghi nhận)"]
    O_Util -.->|"Lập Phiếu Chi PC-..."| OPEX_Total
    O_Salary -.->|"Lập Phiếu Chi PC-..."| OPEX_Total
    O_Maint -.->|"Lập Phiếu Chi PC-..."| OPEX_Total

    %% Lợi Nhuận Ròng
    NetProfit["LỢI NHUẬN RÒNG THỰC TẾ (NET PROFIT)\n= Lợi Nhuận Gộp - OPEX\n(Biên Lãi Ròng %)"]
    GrossProfit --> NetProfit
    OPEX_Total --> NetProfit

    %% Phân Bổ Sổ Quỹ
    subgraph BALANCES ["SỐ DƯ QUỸ TIỀN TỆ"]
        Bal_Cash["Quỹ Tiền Mặt Tại Két\n(2.000.000 ₫ + Thu - Chi Tiền Mặt)"]
        Bal_Bank["Tài Khoản Ngân Hàng\n(15.000.000 ₫ + QR/Chuyển Khoản)"]
    end

    GrossRev -->|"Dòng tiền mặt"| Bal_Cash
    GrossRev -->|"Dòng tiền chuyển khoản"| Bal_Bank
    COGS_Total -->|"Chi tiền"| Bal_Cash
    OPEX_Total -->|"Chi chuyển khoản/tiền mặt"| Bal_Bank
```

---

## 7. Sơ Đồ 7: Cơ Chế Đa Chi Nhánh, Đa Kho & Đồng Bộ Thời Gian Thực

```mermaid
flowchart TD
    AdminClick["Admin chọn Chi Nhánh trên Topbar\n(Ví dụ: 'Chi Nhánh Thảo Điền' hoặc 'Toàn Chuỗi')"]
    
    AdminClick --> EmitEvent["Phát sự kiện trình duyệt toàn cục:\nwindow.dispatchEvent(new CustomEvent('artisan_branch_changed', { detail: { branchId } }))"]
    EmitEvent --> LocalStore["Cập nhật localStorage.setItem('artisan_active_branch', branchId)"]

    subgraph SUBSCRIBERS ["CÁC MÀN HÌNH ĐĂNG KÝ NHẬN SỰ KIỆN TỰ ĐỘNG LÀM MỚI"]
        Sub_POS["/pos (Quầy Bán Hàng):\n- Reset giỏ hàng cũ\n- Tải lại tồn kho của Kho Quầy thuộc Chi nhánh mới\n- Nạp ca làm việc của Chi nhánh mới\n- Gán branch_id mới cho đơn thanh toán"]
        
        Sub_Products["/products (Kho Hàng):\n- Lọc bảng tồn kho theo đúng chi nhánh đã chọn\n- Hiển thị cảnh báo hết hàng riêng cho cơ sở"]
        
        Sub_Orders["/orders (Lịch Sử Đơn):\n- Lọc danh sách hóa đơn theo branch_id tương ứng"]
        
        Sub_Shifts["/shifts (Quản Lý Ca):\n- Tải danh sách ca và bảng đối soát két của cơ sở mới"]
        
        Sub_Dashboard["/dashboard (Báo Cáo KPIs):\n- Tính lại toàn bộ 4 KPI, doanh thu theo giờ và Top 5 bán chạy theo chi nhánh"]
        
        Sub_Accounting["/accounting (Sổ Quỹ & P&L):\n- Lọc phiếu Thu/Chi và bảng Lãi Lỗ P&L riêng cho cơ sở"]
    end

    EmitEvent --> Sub_POS
    EmitEvent --> Sub_Products
    EmitEvent --> Sub_Orders
    EmitEvent --> Sub_Shifts
    EmitEvent --> Sub_Dashboard
    EmitEvent --> Sub_Accounting

    subgraph STAFF_LOCK ["KHÓA CỐ ĐỊNH PHÂN QUYỀN ĐỐI VỚI NHÂN VIÊN (STAFF)"]
        StaffScope["Thu ngân đăng nhập -> Hệ thống nhận diện user.defaultBranchId"]
        StaffScope --> TopbarBadge["Topbar hiển thị Huy hiệu cố định: 🏢 [Tên Chi Nhánh Gán]"]
        TopbarBadge --> NoSwitcher["Không có nút chuyển chi nhánh -> Tránh nhầm lẫn doanh thu và kho"]
    end
```

---

## 8. Sơ Đồ 8: Bộ Máy Phân Tích & Báo Cáo Điều Hành Dashboard

```mermaid
flowchart TD
    subgraph INPUTS ["THAM SỐ ĐẦU VÀO TỪ GIAO DIỆN (/dashboard)"]
        RangeFilter["Khoảng Thời Gian: Hôm Nay / 7 Ngày / 30 Ngày / Tùy Chọn"]
        BranchFilter["Bộ Lọc Chi Nhánh: Toàn Chuỗi hoặc Cơ Sở Cụ Thể"]
    end

    subgraph ENGINE ["BỘ MÁY XỬ LÝ SỐ LIỆU (routers/dashboard.py)"]
        VNTz["Quy đổi mốc thời gian theo múi giờ Việt Nam (VN_TZ = UTC+7)"]
        DateBounds["Xác định khoảng UTC bắt đầu và kết thúc kỳ hiện tại (cur_start, cur_end)"]
        PrevBounds["Xác định khoảng đối ứng của kỳ trước (prev_start, prev_end)"]
        
        CalcGrowth["Công thức tính tăng trưởng:\nGrowth (%) = ((Kỳ này - Kỳ trước) / Kỳ trước) * 100"]
    end

    INPUTS --> VNTz
    VNTz --> DateBounds
    DateBounds --> PrevBounds
    PrevBounds --> CalcGrowth

    subgraph KPIS ["4 THẺ KPI ĐIỀU HÀNH CỐT LÕI"]
        KPI_Rev["1. Tổng Doanh Thu Kỳ Này (₫)\nKèm tỷ lệ tăng trưởng so với kỳ trước"]
        KPI_Orders["2. Tổng Số Đơn Hoàn Tất\nKèm tỷ lệ tăng trưởng so với kỳ trước"]
        KPI_AOV["3. Giá Trị Trung Bình / Đơn (AOV)\nAOV = Tổng Doanh Thu / Tổng Số Đơn"]
        KPI_Alert["4. Cảnh Báo Tồn Kho\nSố mặt hàng stock <= 5 (sắp hết) hoặc stock == 0 (hết hàng)"]
    end

    CalcGrowth --> KPI_Rev
    CalcGrowth --> KPI_Orders
    CalcGrowth --> KPI_AOV
    DateBounds --> KPI_Alert

    subgraph CHARTS ["BIỂU ĐỒ & BẢNG PHÂN TÍCH CHUYÊN SÂU (ANTD TABS)"]
        Tab_Trend["Tab 1: Xu Hướng Bán Hàng\nBiểu đồ Recharts AreaChart doanh thu theo giờ/ngày"]
        Tab_Payment["Tab 2: Cơ Cấu Thanh Toán & Nhóm Bánh\nBiểu đồ tròn Recharts PieChart (QR 72.8%, Thẻ 19.5%, Tiền mặt 7.7%)"]
        Tab_Staff["Tab 3: Xếp Hạng Năng Suất Thu Ngân\nBảng xếp hạng nhân viên theo: Số đơn, Doanh thu, AOV"]
        Tab_Stock["Tab 4: Cảnh Báo Tồn & Hàng Chậm Bán\n- Top 5 Bánh bán chạy nhất\n- Bảng bánh sắp hết (kèm nút 'Nhập thêm / Sửa' -> /products/[id]/edit)\n- Bảng sản phẩm bán chậm tồn đọng"]
    end

    KPI_Rev --> Tab_Trend
    KPI_Orders --> Tab_Payment
    KPI_AOV --> Tab_Staff
    KPI_Alert --> Tab_Stock
```

---

## 9. Sơ Đồ 9: Cài Đặt Hệ Thống, VietQR & Mẫu Ca Làm Việc Động

```mermaid
flowchart LR
    subgraph SETTINGS_MODULE ["CÀI ĐẶT HỆ THỐNG (/settings)"]
        direction TB
        
        subgraph TAB_STORE ["Thông Tin Thương Hiệu & In Hóa Đơn"]
            S_Name["Tên tiệm: Artisan Bakery"]
            S_Slogan["Khẩu hiệu: Tiệm Bánh Thủ Công Pháp"]
            S_Contact["Hotline & Địa chỉ cơ sở chính"]
            S_Footer["Lời cảm ơn chân bill: Cảm ơn Quý Khách & Hẹn Gặp Lại!"]
        end

        subgraph TAB_VIETQR ["Cấu Hình Thanh Toán VietQR Tự Động"]
            Q_Bank["Tên ngân hàng: Vietcombank (VCB)"]
            Q_AccNum["Số tài khoản nhận tiền: 1028889999"]
            Q_AccName["Chủ tài khoản: TIEM BANH ARTISAN BAKERY"]
        end

        subgraph TAB_RULES ["Quy Tắc Vận Hành POS & Kho"]
            R_VAT["Tỷ lệ thuế VAT mặc định (8%)"]
            R_Threshold["Ngưỡng cảnh báo tồn kho thấp (5 bánh)"]
            R_Negative["Chặn bán âm kho (allow_negative_stock = false)"]
            R_Reconcile["Bắt buộc giải trình khi lệch két (true)"]
        end

        subgraph TAB_SHIFTS ["Quản Lý Ca Làm Việc Mẫu (Dynamic Templates)"]
            T_Morning["Ca sáng: 06:30 - 14:30 (Tiền lẻ: 500.000 ₫)"]
            T_Evening["Ca chiều: 14:30 - 22:30 (Tiền lẻ: 500.000 ₫)"]
            T_Split["Ca gãy / Tăng cường: 11:00 - 19:00"]
        end
    end

    TAB_STORE -->|"Hiển thị trên hóa đơn"| PrintBill["Phiếu In Bán Lẻ POS & Bàn Giao Két"]
    TAB_VIETQR -->|"Tạo mã QR động"| QRPay["Mã QR Pay Khách Quét Tại Quầy"]
    TAB_RULES -->|"Kiểm soát giao dịch"| AtomicCheckout["Quy Trình Kiểm Tra & Trừ Kho POS"]
    TAB_SHIFTS -->|"Gợi ý khi nhân viên mở ca"| OpenShiftScreen["Popup Khởi Tạo Ca Làm Việc Tại POS"]
```

---

## 10. Ma Trận 21 Quyền Hạn Nguyên Tử (PBAC) & Ánh Xạ File Source Code

| STT | Mã Quyền (`code`) | Tên Quyền Nghiệp Vụ | Phân Hệ | SUPER ADMIN | ADMIN (Chủ Chuỗi) | STAFF (Thu Ngân) | File Source Code Cài Đặt Chính |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **1** | `dashboard:view` | Xem Báo Cáo & Thống Kê | Tổng Quan | :white_check_mark: | :white_check_mark: | :x: | `g09-api-ref/app/routers/dashboard.py` / `python-project-g09-web/app/dashboard/page.tsx` |
| **2** | `pos:access` | Truy Cập Quầy Thu Ngân | POS | :white_check_mark: | :white_check_mark: | :white_check_mark: | `python-project-g09-web/app/(pos)/pos/page.tsx` |
| **3** | `pos:checkout` | Thanh Toán & In Hóa Đơn | POS | :white_check_mark: | :white_check_mark: | :white_check_mark: | `g09-api-ref/app/routers/orders.py` |
| **4** | `products:read` | Xem Danh Mục Sản Phẩm | Sản Phẩm | :white_check_mark: | :white_check_mark: | :white_check_mark: | `g09-api-ref/app/routers/products.py` / `python-project-g09-web/app/products/page.tsx` |
| **5** | `products:write` | Thêm / Sửa / Xóa Sản Phẩm | Sản Phẩm | :white_check_mark: | :white_check_mark: | :x: | `python-project-g09-web/app/products/new/page.tsx` |
| **6** | `inventory:read` | Xem Tồn Kho Chi Nhánh | Kho Hàng | :white_check_mark: | :white_check_mark: | :x: | `python-project-g09-web/app/branches/page.tsx` |
| **7** | `inventory:write` | Điều Chỉnh Tồn Kho Thực Tế | Kho Hàng | :white_check_mark: | :white_check_mark: | :x: | `g09-api-ref/app/routers/branches.py` |
| **8** | `orders:read` | Xem Lịch Sử Đơn Hàng | Đơn Hàng | :white_check_mark: | :white_check_mark: | :white_check_mark: | `g09-api-ref/app/routers/orders.py` / `python-project-g09-web/app/orders/page.tsx` |
| **9** | `orders:export` | In Lại & Xuất Hóa Đơn | Đơn Hàng | :white_check_mark: | :white_check_mark: | :white_check_mark: | `python-project-g09-web/app/orders/[id]/page.tsx` |
| **10** | `shifts:read` | Xem Ca & Lịch Sử Đối Soát | Ca Làm | :white_check_mark: | :white_check_mark: | :white_check_mark: | `g09-api-ref/app/routers/shifts.py` / `python-project-g09-web/app/shifts/page.tsx` |
| **11** | `shifts:manage` | Mở/Đóng Ca & Quản Lý Mẫu | Ca Làm | :white_check_mark: | :white_check_mark: | :x: | `g09-api-ref/app/routers/shifts.py` |
| **12** | `accounting:read` | Xem Sổ Quỹ Thu Chi | Kế Toán | :white_check_mark: | :white_check_mark: | :x: | `g09-api-ref/app/routers/accounting.py` / `python-project-g09-web/app/accounting/page.tsx` |
| **13** | `accounting:write`| Lập Phiếu Thu / Phiếu Chi | Kế Toán | :white_check_mark: | :white_check_mark: | :x: | `g09-api-ref/app/routers/accounting.py` |
| **14** | `accounting:pnl` | Xem Báo Cáo Lãi Lỗ P&L | Kế Toán | :white_check_mark: | :white_check_mark: | :x: | `g09-api-ref/app/routers/accounting.py` |
| **15** | `branches:read` | Xem Danh Sách Chi Nhánh | Chi Nhánh | :white_check_mark: | :white_check_mark: | :x: | `g09-api-ref/app/routers/branches.py` |
| **16** | `branches:manage`| Thêm / Sửa Chi Nhánh & Kho | Chi Nhánh | :white_check_mark: | :white_check_mark: | :x: | `python-project-g09-web/app/branches/page.tsx` |
| **17** | `users:read` | Xem Danh Sách Nhân Sự | Nhân Sự | :white_check_mark: | :white_check_mark: | :x: | `g09-api-ref/app/routers/users.py` / `python-project-g09-web/app/users/page.tsx` |
| **18** | `users:manage` | Thêm / Sửa / Khóa Nhân Viên | Nhân Sự | :white_check_mark: | :white_check_mark: | :x: | `python-project-g09-web/app/users/new/page.tsx` |
| **19** | `roles:manage` | Quản Lý Vai Trò & Phân Quyền | Hệ Thống | :white_check_mark: | :white_check_mark: | :x: | `g09-api-ref/app/routers/roles.py` / `python-project-g09-web/app/settings/roles/page.tsx` |
| **20** | `settings:manage`| Cài Đặt Hệ Thống & Ca Mẫu | Hệ Thống | :white_check_mark: | :white_check_mark: | :x: | `g09-api-ref/app/routers/settings.py` / `python-project-g09-web/app/settings/page.tsx` |
| **21** | `landing_page:edit`| Quản Trị Nội Dung Landing CMS | CMS | :white_check_mark: | :x: | :x: | `g09-api-ref/app/routers/landing_config.py` |
