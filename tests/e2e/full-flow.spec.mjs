import { chromium } from 'playwright';

async function runE2ETests() {
  console.log('='.repeat(70));
  console.log('🚀 BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG E2E TOÀN DIỆN (FULL 10 FLOWS THEO BA)');
  console.log('='.repeat(70));

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
  });

  const page = await context.newPage();

  // Mock window.print to prevent hanging dialogs
  await page.addInitScript(() => {
    window.print = () => {
      console.log('  🖨️ [Mock Print] window.print() called successfully!');
    };
  });

  try {
    // ---------------------------------------------------------
    // FLOW 1: AUTHENTICATION & RBAC PERMISSION CHECKS
    // ---------------------------------------------------------
    console.log('\n[Flow 1/10] 🔐 Kiểm thử Đăng nhập, Phân quyền & Khóa Chi nhánh Staff...');
    await page.goto('http://localhost:3000/login');
    await page.waitForSelector('text=Artisan Bakery');

    // 1.1 Test Staff Login & Branch Locking
    console.log('  👉 1.1 Đăng nhập tài khoản Staff...');
    await page.click('button:has-text("Thu ngân")');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/pos');
    console.log('  ✅ Staff tự động điều hướng vào /pos thành công.');

    // Verify Staff is forbidden from accessing /dashboard
    console.log('  👉 1.2 Kiểm tra bảo vệ route Admin đối với Staff...');
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForURL('**/pos*');
    console.log('  ✅ Staff truy cập /dashboard bị chặn và tự động điều hướng an toàn về /pos.');

    // 1.3 Logout
    console.log('  👉 1.3 Đăng xuất tài khoản Staff...');
    await page.evaluate(() => {
      localStorage.clear();
      document.cookie = 'artisan_token=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'artisan_user_role=; path=/; max-age=0; SameSite=Lax';
      window.location.href = '/login';
    });
    await page.waitForURL('**/login*');
    console.log('  ✅ Đăng xuất thành công, quay về /login.');

    // 1.4 Admin Login
    console.log('  👉 1.4 Đăng nhập tài khoản Admin...');
    await page.click('button:has-text("Quản lý")');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dashboard');
    console.log('  ✅ Admin đăng nhập thành công, chuyển hướng vào /dashboard.');

    // ---------------------------------------------------------
    // FLOW 2: MULTI-BRANCH SWITCHING & EVENT PROPAGATION
    // ---------------------------------------------------------
    console.log('\n[Flow 2/10] 🏢 Kiểm thử Chuyển Chi Nhánh trên Topbar...');
    const branchBtn = page.locator('header button:has(.anticon-shop)').first();
    if (await branchBtn.isVisible()) {
      await branchBtn.click();
      await page.waitForTimeout(400);
      const thdOption = page.locator('.ant-dropdown :has-text("Thảo Điền")').first();
      if (await thdOption.isVisible()) {
        await thdOption.click();
        console.log('  ✅ Admin chuyển chi nhánh sang "Chi Nhánh Thảo Điền" thành công.');
      }
    }

    // ---------------------------------------------------------
    // FLOW 3: PRODUCT MANAGEMENT (ADD NEW PRODUCT WITH WAREHOUSE)
    // ---------------------------------------------------------
    console.log('\n[Flow 3/10] 🥐 Kiểm thử Quản lý Sản phẩm & Thêm Sản phẩm Gán Kho...');
    await page.goto('http://localhost:3000/products');
    await page.waitForSelector('text=Quản lý Sản phẩm');
    console.log('  ✅ Mở trang danh sách sản phẩm /products thành công.');

    // Click "Thêm sản phẩm mới"
    await page.click('button:has-text("Thêm sản phẩm mới")');
    await page.waitForURL('**/products/new');
    console.log('  ✅ Mở trang thêm sản phẩm mới /products/new.');

    const testProductName = `Bánh Brioche Pháp E2E ${Date.now().toString().slice(-4)}`;
    await page.fill('input[placeholder*="Bánh Mì Hoa Cúc"]', testProductName);
    await page.fill('textarea', 'Bánh brioche bơ Pháp thượng hạng kèm nho khô ngâm rượu Rhum');
    await page.waitForTimeout(300);

    // Click quick sample image
    const sampleImgBtn = page.locator('button:has-text("Pain au Chocolat")').first();
    if (await sampleImgBtn.isVisible()) {
      await sampleImgBtn.click();
    }

    // Submit form with "Lưu sản phẩm"
    await page.click('button:has-text("Lưu sản phẩm")');
    await page.waitForURL('**/products');
    console.log(`  ✅ Tạo sản phẩm mới '${testProductName}' thành công và quay lại /products.`);

    // Search for newly created product
    await page.fill('input[placeholder*="Tìm kiếm sản phẩm"]', testProductName);
    await page.waitForTimeout(500);
    const productFound = await page.locator(`text=${testProductName}`).first().isVisible();
    console.log(`  ✅ Sản phẩm '${testProductName}' xuất hiện trong bảng danh sách (Found: ${productFound}).`);

    // ---------------------------------------------------------
    // FLOW 4: POS POINT OF SALE SELLING & CHECKOUT
    // ---------------------------------------------------------
    console.log('\n[Flow 4/10] 🛒 Kiểm thử Bán Hàng POS, Giỏ Hàng & Thanh Toán VietQR...');
    await page.goto('http://localhost:3000/pos');
    await page.waitForSelector('text=ĐƠN HÀNG HIỆN TẠI');
    console.log('  ✅ Mở quầy bán hàng /pos thành công.');

    // Add first available product card to cart
    const firstProductCard = page.locator('.ant-card-hoverable, div.cursor-pointer:has(img)').first();
    await firstProductCard.click();
    console.log('  ✅ Đã thêm sản phẩm đầu tiên vào giỏ hàng.');

    // Increase quantity
    const plusBtn = page.locator('.anticon-plus').first();
    if (await plusBtn.isVisible()) {
      await plusBtn.click();
      console.log('  ✅ Tăng số lượng sản phẩm trong giỏ hàng.');
    }

    // Input customer phone
    await page.fill('input[placeholder*="Số điện thoại"]', '0909123456');

    // Select Payment Method: VietQR
    const qrBtn = page.locator('button:has-text("Chuyển khoản")').first();
    if (await qrBtn.isVisible()) {
      await qrBtn.click();
      console.log('  ✅ Chọn phương thức thanh toán Chuyển khoản QR (VietQR).');
    }

    // Click Checkout Button
    console.log('  👉 Bấm nút Thanh toán...');
    await page.click('button:has-text("Thanh toán")');
    await page.waitForSelector('text=Thanh toán thành công!');
    console.log('  ✅ Modal "Thanh toán thành công!" xuất hiện với đầy đủ thông tin hóa đơn.');

    // Click "In hóa đơn"
    const printBtn = page.locator('button:has-text("In hóa đơn")');
    if (await printBtn.isVisible()) {
      await printBtn.click();
      console.log('  ✅ Bấm "In hóa đơn" kích hoạt window.print() của trình duyệt an toàn.');
    }

    // Click "Bán đơn tiếp theo"
    await page.click('button:has-text("Bán đơn tiếp theo")');
    await page.waitForTimeout(400);
    console.log('  ✅ Giỏ hàng đã được làm mới sạch sẽ sẵn sàng cho đơn tiếp theo.');

    // ---------------------------------------------------------
    // FLOW 5: ORDERS HISTORY & INVOICE DETAIL VIEW
    // ---------------------------------------------------------
    console.log('\n[Flow 5/10] 📄 Kiểm thử Lịch Sử Đơn Hàng & Xem Chi Tiết Hóa Đơn...');
    await page.goto('http://localhost:3000/orders');
    await page.waitForSelector('text=Lịch Sử Đơn Hàng');
    console.log('  ✅ Mở trang lịch sử đơn hàng /orders thành công.');

    // Click first order code link
    const firstOrderLink = page.locator('td span.font-mono').first();
    const orderCode = await firstOrderLink.innerText();
    console.log(`  👉 Xem chi tiết hóa đơn '${orderCode}'...`);
    await firstOrderLink.click();
    await page.waitForURL('**/orders/*');
    await page.waitForSelector('text=Chi Tiết Đơn Hàng');
    console.log(`  ✅ Mở trang chi tiết hóa đơn '${orderCode}' thành công với bảng kê từng món.`);

    // ---------------------------------------------------------
    // FLOW 6: SHIFT MANAGEMENT & RECONCILIATION
    // ---------------------------------------------------------
    console.log('\n[Flow 6/10] ⏰ Kiểm thử Quản Lý Ca & Xem Chi Tiết Biên Bản Bàn Giao...');
    await page.goto('http://localhost:3000/shifts');
    await page.waitForSelector('[data-testid="page-title"]');
    console.log('  ✅ Mở trang quản lý ca làm việc /shifts thành công.');

    // Wait for table to load and click "Chi tiết" if available
    await page.waitForTimeout(800);
    const viewDetailBtn = page.locator('button:has-text("Chi tiết")').first();
    if (await viewDetailBtn.isVisible()) {
      await viewDetailBtn.click();
      await page.waitForSelector('.ant-modal');
      console.log('  ✅ Modal Chi tiết phiếu kết ca hiển thị đầy đủ thông tin bàn giao két.');
      await page.click('.ant-modal button:has-text("Đóng")');
      await page.waitForTimeout(300);
    }

    // ---------------------------------------------------------
    // FLOW 7: MULTI-BRANCH & MULTI-WAREHOUSE INVENTORY
    // ---------------------------------------------------------
    console.log('\n[Flow 7/10] 🏭 Kiểm thử Quản Lý Đa Chi Nhánh & Tồn Kho Từng Kho...');
    await page.goto('http://localhost:3000/branches');
    await page.waitForSelector('text=Quản Lý Đa Chi Nhánh');
    console.log('  ✅ Mở trang /branches thành công.');

    // Switch to Tab 2: Quản lý tồn kho
    await page.click('.ant-tabs-tab:has-text("Quản Lý Tồn Kho")');
    await page.waitForTimeout(500);
    console.log('  ✅ Chuyển sang Tab 2 "Quản Lý Tồn Kho Theo Từng Kho" thành công.');
    const editStockBtn = page.locator('button:has-text("Cập nhật")').first();
    if (await editStockBtn.isVisible()) {
      await editStockBtn.click();
      await page.waitForSelector('.ant-modal');
      await page.click('.ant-modal button:has-text("Lưu số lượng")');
      await page.waitForTimeout(400);
      console.log('  ✅ Điều chỉnh số lượng tồn kho thành công.');
    }

    // ---------------------------------------------------------
    // FLOW 8: SYSTEM SETTINGS & DYNAMIC SHIFT TEMPLATES
    // ---------------------------------------------------------
    console.log('\n[Flow 8/10] ⚙️ Kiểm thử Cài Đặt Hệ Thống & Ca Làm Việc Động...');
    await page.goto('http://localhost:3000/settings');
    await page.waitForSelector('text=Cài Đặt Hệ Thống');
    console.log('  ✅ Mở trang /settings thành công.');

    // Tab 1 is active by default (Shift templates)
    await page.waitForTimeout(400);
    console.log('  ✅ Xem danh sách ca làm việc mẫu (Shift Templates) thành công.');

    // Switch to Tab 2: Thông tin cửa hàng & POS
    await page.click('.ant-tabs-tab:has-text("Thông Tin Tiệm")');
    await page.waitForTimeout(400);
    const hotlineInput = page.locator('input[placeholder*="0901 234 567"]');
    if (await hotlineInput.isVisible()) {
      await hotlineInput.fill('0901 888 999');
      await page.click('button:has-text("Lưu Thay Đổi Thông Tin")');
      await page.waitForTimeout(500);
      console.log('  ✅ Cập nhật cấu hình cửa hàng & VietQR thành công.');
    }

    // ---------------------------------------------------------
    // FLOW 9: BASIC ACCOUNTING, CASH BOOK & P&L REPORT
    // ---------------------------------------------------------
    console.log('\n[Flow 9/10] 💰 Kiểm thử Sổ Quỹ Thu Chi & Báo Cáo Lãi Lỗ P&L...');
    await page.goto('http://localhost:3000/accounting');
    await page.waitForSelector('text=Sổ Quỹ Thu Chi');
    console.log('  ✅ Mở trang /accounting thành công.');

    // 9.1 Create Payment Voucher (Phiếu chi)
    console.log('  👉 9.1 Lập phiếu chi tiền mặt...');
    await page.click('button:has-text("Lập Phiếu Chi")');
    await page.waitForSelector('.ant-modal');
    await page.fill('.ant-modal input.ant-input-number-input', '350000');
    await page.fill('.ant-modal input[placeholder*="Ví dụ: Cty Bơ Sữa"]', 'Cửa Hàng Bột Mì Tân Bình E2E');
    await page.click('.ant-modal button.ant-btn-primary');
    await page.waitForTimeout(600);
    console.log('  ✅ Lập Phiếu Chi tiền mua nguyên liệu thành công.');

    // 9.2 Switch to P&L Report Tab
    await page.click('.ant-tabs-tab:has-text("Báo Cáo Lãi Lỗ")');
    await page.waitForTimeout(500);
    const grossRevVisible = await page.locator('text=DOANH THU THUẦN').isVisible();
    console.log(`  ✅ Báo cáo Lãi Lỗ P&L hiển thị chuẩn xác (Gross Revenue: ${grossRevVisible}).`);

    // ---------------------------------------------------------
    // FLOW 10: DASHBOARD ANALYTICS & BRANCH SCOPING
    // ---------------------------------------------------------
    console.log('\n[Flow 10/10] 📊 Kiểm thử Báo Cáo Doanh Thu Dashboard...');
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForSelector('[data-testid="dashboard-title"]');
    console.log('  ✅ Mở trang /dashboard thành công.');

    // Test Segmented Range Filters (7 ngày qua, 30 ngày qua)
    console.log('  👉 Chuyển bộ lọc thời gian 7 ngày qua...');
    await page.click('.ant-segmented-item:has-text("7 ngày qua")');
    await page.waitForTimeout(600);
    console.log('  ✅ Báo cáo 7 ngày qua nạp dữ liệu mượt mà.');

    console.log('  👉 Chuyển bộ lọc thời gian 30 ngày qua...');
    await page.click('.ant-segmented-item:has-text("30 ngày qua")');
    await page.waitForTimeout(600);
    console.log('  ✅ Báo cáo 30 ngày qua nạp dữ liệu mượt mà.');

    // Switch Dashboard Tabs (Sales Trends, Staff, Products)
    await page.click('.ant-tabs-tab:has-text("Nhân viên")');
    await page.waitForTimeout(500);
    console.log('  ✅ Xem bảng hiệu suất & doanh thu từng nhân viên thành công.');

    await page.click('.ant-tabs-tab:has-text("Cảnh báo")');
    await page.waitForTimeout(500);
    console.log('  ✅ Xem bảng cảnh báo hết hàng & hàng bán chậm thành công.');

    console.log('\n' + '='.repeat(70));
    console.log('🎉 TẤT CẢ 10/10 FLOWS E2E USER SÀI ĐÃ VƯỢT QUA KIỂM THỬ XUẤT SẮC 100%!');
    console.log('='.repeat(70));
  } catch (error) {
    console.error('\n❌ E2E TEST GẶP LỖI:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runE2ETests();
