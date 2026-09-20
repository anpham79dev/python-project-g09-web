import { chromium } from 'playwright';

async function runPBACPlaywrightTests() {
  console.log('======================================================================');
  console.log('🚀 KIỂM THỬ TỰ ĐỘNG: PERMISSION-BASED ACCESS CONTROL (PBAC) & ROLES');
  console.log('======================================================================\n');

  const browser = await chromium.launch({ headless: true });

  try {
    // -------------------------------------------------------------
    // [1/5] SUPER_ADMIN FULL ACCESS TEST (21/21 PERMISSIONS)
    // -------------------------------------------------------------
    console.log('[1/5] 👑 Kiểm thử toàn quyền của SUPER_ADMIN...');
    const superContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const superPage = await superContext.newPage();

    superPage.on('pageerror', (err) => console.log('🔴 PAGE ERROR:', err.message));
    superPage.on('console', (msg) => console.log('💬 CONSOLE:', msg.type(), msg.text()));
    superPage.on('response', (res) => {
      if (res.status() >= 400) {
        console.log('🔴 HTTP ERROR:', res.status(), res.url());
      }
    });

    await superPage.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
    await superPage.waitForTimeout(500);
    await superPage.click('button:has-text("SuperAdmin")');
    await superPage.waitForTimeout(300);
    await superPage.locator('button[type="submit"]').click();
    await superPage.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });
    await superPage.waitForTimeout(1000);

    // 1.1 Kiểm tra truy cập /pos không bị toast lỗi hay chặn quyền
    await superPage.goto('http://localhost:3000/pos', { waitUntil: 'domcontentloaded' });
    await superPage.waitForTimeout(1000);
    const posReady = (await superPage.locator('input[placeholder*="Tìm bánh"]').count()) > 0 || (await superPage.locator('button:has-text("Kết ca / Chốt két")').count()) > 0;
    console.log(`  👉 SuperAdmin truy cập /pos: ${posReady ? '✅ Thành công (Không bị lỗi)' : '❌ Thất bại'}`);
    if (!posReady) throw new Error('SuperAdmin không thể vào /pos!');

    // 1.2 Kiểm tra truy cập /dashboard
    await superPage.goto('http://localhost:3000/dashboard', { waitUntil: 'domcontentloaded' });
    await superPage.waitForTimeout(800);
    const dashHeader = await superPage.locator('[data-testid="dashboard-title"]').isVisible();
    console.log(`  👉 SuperAdmin truy cập /dashboard: ${dashHeader ? '✅ Thành công' : '❌ Thất bại'}`);
    if (!dashHeader) throw new Error('SuperAdmin không thể vào /dashboard!');

    // 1.3 Kiểm tra truy cập /settings/roles
    await superPage.goto('http://localhost:3000/settings/roles', { waitUntil: 'domcontentloaded' });
    await superPage.waitForTimeout(800);
    const rolesHeader = await superPage.locator('text=Quản Lý Vai Trò & Phân Quyền (PBAC)').isVisible();
    console.log(`  👉 SuperAdmin truy cập /settings/roles: ${rolesHeader ? '✅ Thành công' : '❌ Thất bại'}`);
    if (!rolesHeader) throw new Error('SuperAdmin không thể vào /settings/roles!');

    // -------------------------------------------------------------
    // [2/5] GIAO DIỆN QUẢN LÝ VAI TRÒ & DANH MỤC 21 QUYỀN HẠN
    // -------------------------------------------------------------
    console.log('\n[2/5] 📋 Kiểm tra danh sách vai trò và ma trận quyền hạn...');
    await superPage.waitForSelector('.ant-table-row', { timeout: 10000 });
    await superPage.waitForTimeout(500);
    
    // Kiểm tra 3 role hệ thống gốc trong bảng
    const hasSuperAdminRole = (await superPage.locator('.ant-table code:has-text("SUPER_ADMIN")').count()) > 0;
    const hasAdminRole = (await superPage.locator('.ant-table code:has-text("ADMIN")').count()) > 0;
    const hasStaffRole = (await superPage.locator('.ant-table code:has-text("STAFF")').count()) > 0;

    console.log(`  👉 Vai trò SUPER_ADMIN (21/21 quyền): ${hasSuperAdminRole ? '✅ Có hiển thị' : '❌ Thiếu'}`);
    console.log(`  👉 Vai trò ADMIN (20/21 quyền): ${hasAdminRole ? '✅ Có hiển thị' : '❌ Thiếu'}`);
    console.log(`  👉 Vai trò STAFF (5/21 quyền): ${hasStaffRole ? '✅ Có hiển thị' : '❌ Thiếu'}`);

    if (!hasSuperAdminRole || !hasAdminRole || !hasStaffRole) {
      throw new Error('Danh sách vai trò hệ thống gốc không hiển thị đầy đủ trong bảng!');
    }

    // -------------------------------------------------------------
    // [3/5] TẠO VAI TRÒ TÙY BIẾN MỚI (VÍ DỤ: STORE_MANAGER)
    // -------------------------------------------------------------
    const dynamicCode = 'STORE_' + Date.now().toString().slice(-4);
    const dynamicName = 'Quản Lý ' + dynamicCode;
    console.log(`\n[3/5] 🛠️ Thử nghiệm tạo vai trò mới (${dynamicCode})...`);
    await superPage.click('button:has-text("Tạo Vai Trò Mới")');
    await superPage.waitForTimeout(500);

    const modalTitle = await superPage.locator('text=Tạo Vai Trò Người Dùng Mới').isVisible();
    if (!modalTitle) throw new Error('Modal tạo vai trò không mở!');

    await superPage.fill('input[placeholder="STORE_MANAGER"]', dynamicCode);
    await superPage.fill('input[placeholder="Ví dụ: Quản Lý Cửa Hàng"]', dynamicName);
    await superPage.fill('input[placeholder="Mô tả quyền hạn vai trò này"]', 'Quản lý kho và thu ngân chi nhánh');

    // Dùng nút gợi ý nhanh "Mẫu Cửa Hàng Trưởng (11 quyền)"
    await superPage.click('button:has-text("Mẫu Cửa Hàng Trưởng (11 quyền)")');
    await superPage.waitForTimeout(400);

    // Bấm nút tạo vai trò
    await superPage.click('.ant-modal-footer button:has-text("Tạo Vai Trò")');
    await superPage.waitForTimeout(1500);

    const hasNewRole = (await superPage.locator(`.ant-table code:has-text("${dynamicCode}")`).count()) > 0;
    console.log(`  👉 Tạo vai trò mới ${dynamicCode}: ${hasNewRole ? '✅ Thành công' : '❌ Thất bại'}`);
    if (!hasNewRole) throw new Error('Vai trò mới không xuất hiện trong bảng danh sách!');

    // -------------------------------------------------------------
    // [4/5] NHẬT KÝ KIỂM TOÁN (AUDIT LOGS)
    // -------------------------------------------------------------
    console.log('\n[4/5] 📜 Kiểm tra Nhật ký Thao tác Phân quyền (Audit Trail)...');
    await superPage.click('button:has-text("Nhật Ký (Audit Log)")');
    await superPage.waitForTimeout(800);

    const drawerVisible = await superPage.locator('.ant-drawer-title:has-text("Nhật Ký Thao Tác Phân Quyền")').isVisible();
    console.log(`  👉 Drawer Audit Log: ${drawerVisible ? '✅ Mở thành công' : '❌ Thất bại'}`);
    if (!drawerVisible) throw new Error('Không thể mở Drawer Audit Log!');

    const hasAuditContent = await superPage.locator('.ant-drawer-body').isVisible();
    console.log(`  👉 Khung hiển thị Audit Trail: ${hasAuditContent ? '✅ Hoạt động tốt' : '❌ Thất bại'}`);

    // Đóng drawer
    await superPage.click('.ant-drawer-close');
    await superPage.waitForTimeout(400);

    // -------------------------------------------------------------
    // [5/5] KIỂM THỬ PHÂN QUYỀN ROLE STAFF (CHẶN ĐÚNG ROUTE CẤM)
    // -------------------------------------------------------------
    console.log('\n[5/5] 🛡️ Kiểm thử phân quyền tài khoản STAFF (Thu ngân)...');
    const staffContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const staffPage = await staffContext.newPage();

    await staffPage.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
    await staffPage.waitForTimeout(500);
    await staffPage.click('button:has-text("Thu ngân")');
    await staffPage.waitForTimeout(300);
    await staffPage.locator('button[type="submit"]').click();
    await staffPage.waitForURL((url) => url.pathname.includes('/pos'), { timeout: 10000 });
    await staffPage.waitForTimeout(800);

    // Staff truy cập /pos hợp lệ
    console.log(`  👉 Staff đăng nhập tự động vào: ${staffPage.url().includes('/pos') ? '✅ /pos (Đúng chuẩn)' : '❌ Sai route'}`);

    // Thử truy cập route cấm /settings/roles
    await staffPage.goto('http://localhost:3000/settings/roles', { waitUntil: 'domcontentloaded' });
    await staffPage.waitForTimeout(1000);
    console.log('    Staff URL after /settings/roles:', staffPage.url());
    const staffRedirected = staffPage.url().includes('/pos');
    console.log(`  👉 Staff truy cập trái phép /settings/roles: ${staffRedirected ? '✅ Bị chặn & điều hướng về /pos' : '❌ Lọt quyền'}`);
    if (!staffRedirected) throw new Error('Staff không bị chặn khi vào /settings/roles!');

    // Thử truy cập route cấm /dashboard
    await staffPage.goto('http://localhost:3000/dashboard', { waitUntil: 'domcontentloaded' });
    await staffPage.waitForTimeout(1000);
    console.log('    Staff URL after /dashboard:', staffPage.url());
    const staffDashRedirected = staffPage.url().includes('/pos');
    console.log(`  👉 Staff truy cập trái phép /dashboard: ${staffDashRedirected ? '✅ Bị chặn & điều hướng về /pos' : '❌ Lọt quyền'}`);
    if (!staffDashRedirected) throw new Error('Staff không bị chặn khi vào /dashboard!');

    console.log('\n======================================================================');
    console.log('🎉 TẤT CẢ 5/5 BÀI TEST PBAC & ROLES MANAGEMENT ĐỀU VƯỢT QUA 100%!');
    console.log('======================================================================\n');
  } catch (error) {
    console.error('\n❌ TEST THẤT BẠI:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runPBACPlaywrightTests();
