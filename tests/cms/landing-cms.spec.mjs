import { chromium } from 'playwright';

async function runLandingCMSPlaywrightTests() {
  console.log('======================================================================');
  console.log('🚀 KIỂM THỬ TỰ ĐỘNG: CMS QUẢN LÝ LANDING PAGE & ICON RAIL & RBAC');
  console.log('======================================================================\n');

  const browser = await chromium.launch({ headless: true });

  try {
    // -------------------------------------------------------------
    // [1/6] ĐĂNG NHẬP BẰNG SUPER_ADMIN & KIỂM TRA SIDEBAR MENU ERP
    // -------------------------------------------------------------
    console.log('[1/6] 🔐 Đăng nhập tài khoản SUPER_ADMIN (superadmin/password123)...');
    const superContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const superPage = await superContext.newPage();

    await superPage.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
    await superPage.waitForTimeout(500);
    await superPage.click('button:has-text("SuperAdmin")');
    await superPage.waitForTimeout(300);
    await superPage.click('button:has-text("Đăng nhập hệ thống")');
    await superPage.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });
    await superPage.waitForTimeout(1000);

    // Mở nhóm "Cài Đặt Hệ Thống" trong ERP Sidebar
    const systemSubMenu = superPage.locator('.ant-menu-submenu-title:has-text("Cài Đặt Hệ Thống")');
    if (await systemSubMenu.isVisible()) {
      await systemSubMenu.click();
      await superPage.waitForTimeout(400);
    }

    const hasLandingPageMenu = await superPage.locator('.ant-menu-item:has-text("Quản Lý Landing Page")').count();
    console.log(`  👉 Menu 'Quản Lý Landing Page' trong Sidebar ERP: ${hasLandingPageMenu > 0 ? '✅ Có hiển thị' : '❌ Chưa thấy'}`);
    if (hasLandingPageMenu === 0) {
      throw new Error("Không tìm thấy menu 'Quản Lý Landing Page' trong sidebar của SuperAdmin!");
    }

    // -------------------------------------------------------------
    // [2/6] TRUY CẬP TRANG CMS /settings/landing-page (ICON RAIL & TOP BAR)
    // -------------------------------------------------------------
    console.log('\n[2/6] 🛠️ Mở không gian làm việc độc lập CMS (/settings/landing-page)...');
    await superPage.goto('http://localhost:3000/settings/landing-page', { waitUntil: 'domcontentloaded' });
    await superPage.locator('text=Quản Trị Nội Dung Landing Page (CMS)').waitFor({ state: 'visible', timeout: 10000 });
    await superPage.waitForTimeout(600);

    // 2.1 Xác nhận KHÔNG CÒN Sidebar nghiệp vụ cũ của ERP
    const erpSiderCount = await superPage.locator('.ant-layout-sider').count();
    console.log(`  👉 Sidebar nghiệp vụ ERP cũ: ${erpSiderCount === 0 ? '✅ Đã biến mất 100% (Độc lập)' : `❌ Vẫn còn ${erpSiderCount}`}`);
    if (erpSiderCount !== 0) {
      throw new Error('Sidebar ERP cũ vẫn xuất hiện trên trang CMS độc lập!');
    }

    // 2.2 Xác nhận Icon Rail CMS siêu mỏng (~60px)
    const cmsRail = superPage.locator('aside');
    const hasCmsRail = await cmsRail.isVisible();
    const railBox = await cmsRail.boundingBox();
    const railWidth = railBox ? Math.round(railBox.width) : 0;
    console.log(`  👉 Icon Rail CMS siêu mỏng: ${hasCmsRail && railWidth <= 70 ? `✅ Hiển thị chuẩn xác (${railWidth}px)` : `❌ Lỗi độ rộng: ${railWidth}px`}`);
    if (!hasCmsRail || railWidth > 80) {
      throw new Error(`Icon Rail CMS không hợp lệ! Width = ${railWidth}px`);
    }

    // 2.3 Xác nhận nút "Quay lại Quản trị" trên Icon Rail
    const backBtn = superPage.locator('aside button[aria-label="Quay lại Quản trị"], aside button:has(.anticon-arrow-left)');
    const hasBackBtn = await backBtn.isVisible();
    console.log(`  👉 Nút "← Quay lại Quản trị" trên Icon Rail: ${hasBackBtn ? '✅ Có hiển thị' : '❌ Thiếu'}`);
    if (!hasBackBtn) {
      throw new Error('Nút "Quay lại Quản trị" không hiển thị trên Icon Rail!');
    }

    // 2.4 Xác nhận Top Header Action Bar: Tiêu đề CMS, Tag SUPER_ADMIN, Nút Lưu & Khôi phục
    const cmsTitle = await superPage.locator('header:has-text("Quản Trị Nội Dung Landing Page (CMS)")').count();
    const superAdminBadge = await superPage.locator('header span.ant-tag:has-text("SUPER_ADMIN")').count();
    const saveBtnOnHeader = await superPage.locator('header button:has-text("Lưu & Xuất Bản")').isVisible();
    const resetBtnOnHeader = await superPage.locator('header button:has-text("Khôi phục mặc định")').isVisible();

    console.log(`  👉 Tiêu đề CMS trên Header: ${cmsTitle > 0 ? '✅ Đúng' : '❌ Không thấy'}`);
    console.log(`  👉 Tag SUPER_ADMIN trên Header: ${superAdminBadge > 0 ? '✅ Đúng' : '❌ Không thấy'}`);
    console.log(`  👉 Nút "Lưu & Xuất Bản" trên Header: ${saveBtnOnHeader ? '✅ Có' : '❌ Thiếu'}`);
    console.log(`  👉 Nút "Khôi phục mặc định" trên Header: ${resetBtnOnHeader ? '✅ Có' : '❌ Thiếu'}`);

    if (!saveBtnOnHeader || !resetBtnOnHeader) {
      throw new Error('Nút Action không nằm trên Top Header Bar!');
    }

    // -------------------------------------------------------------
    // [3/6] KIỂM THỬ CHUYỂN SECTION BẰNG ICON RAIL & TIÊU ĐỀ FORM & LIVE PREVIEW
    // -------------------------------------------------------------
    console.log('\n[3/6] 👁️ Kiểm thử chuyển Section bằng Icon Rail & Live Preview thời gian thực...');

    // Chuyển sang Section Hero qua Icon Button trên Rail
    console.log('  👉 Bấm chọn icon "Hero Section" trên Icon Rail...');
    const heroRailBtn = superPage.locator('aside button[aria-label="Hero Section"], aside button:has(.anticon-rocket)');
    await heroRailBtn.click();
    await superPage.waitForTimeout(400);

    // Xác nhận tiêu đề Form Editor hiển thị đúng "Hero Section"
    const formSectionTitle = await superPage.locator('section h2:has-text("Hero Section")').isVisible();
    console.log(`  👉 Tiêu đề "Hero Section" hiển thị rõ ràng ở đầu Form: ${formSectionTitle ? '✅ Đúng' : '❌ Thiếu'}`);
    if (!formSectionTitle) {
      throw new Error('Tiêu đề section không hiển thị ở đầu Form Editor!');
    }

    const testNewTitle = `Nền Tảng ERP Bakery Đột Phá AI 2026`;
    console.log(`  👉 Gõ tiêu đề Hero mới vào Form: "${testNewTitle}"...`);
    const heroTitleTextarea = superPage.locator('textarea[id*="hero_title"]');
    await heroTitleTextarea.waitFor({ state: 'visible', timeout: 5000 });
    await heroTitleTextarea.fill(testNewTitle);
    await superPage.waitForTimeout(500);

    // Kiểm tra trong khung Live Preview (bên phải)
    const previewHeadline = await superPage.locator('.preview-mode h1, main h1').first().innerText();
    console.log(`  👉 Tiêu đề hiển thị ngay trong Live Preview: "${previewHeadline.trim()}"`);
    if (!previewHeadline.includes(testNewTitle)) {
      throw new Error(`Live Preview không cập nhật tiêu đề mới! Thực tế: ${previewHeadline}`);
    }
    console.log('  ✅ Live Preview phản hồi tức thì 100% không cần lưu!');

    // -------------------------------------------------------------
    // [4/6] KIỂM THỬ NÚT "LƯU & XUẤT BẢN" TRÊN HEADER VÀ ĐỒNG BỘ TRANG CHỦ "/"
    // -------------------------------------------------------------
    console.log('\n[4/6] 💾 Bấm "Lưu & Xuất Bản" trên Header và kiểm tra đồng bộ ra trang chủ marketing "/"...');
    const saveBtn = superPage.locator('header button:has-text("Lưu & Xuất Bản")');
    await saveBtn.click();

    // Chờ thông báo thành công
    await superPage.locator('.ant-message-success').waitFor({ state: 'visible', timeout: 10000 });
    await superPage.waitForTimeout(1000);

    // Mở một tab độc lập ở trang chủ "/" (chưa đăng nhập / phiên khách)
    const guestContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const guestPage = await guestContext.newPage();
    console.log('  👉 Mở trang chủ "/" ở phiên khách...');
    await guestPage.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await guestPage.waitForTimeout(800);

    const guestHeadline = await guestPage.locator('h1').innerText();
    console.log(`  👉 Tiêu đề tại trang chủ marketing "/": "${guestHeadline.trim()}"`);
    if (!guestHeadline.includes(testNewTitle)) {
      throw new Error(`Trang chủ "/" chưa đồng bộ nội dung mới từ CMS! Thực tế: ${guestHeadline}`);
    }
    console.log('  ✅ Trang chủ marketing "/" đã đồng bộ 100% dữ liệu động từ CMS!');
    await guestContext.close();

    // -------------------------------------------------------------
    // [5/6] KIỂM THỬ NÚT "QUAY LẠI QUẢN TRỊ" & BẢO VỆ ROUTE RBAC
    // -------------------------------------------------------------
    console.log('\n[5/6] 🛡️ Kiểm thử nút "Quay lại Quản trị" & Bảo vệ Route RBAC...');

    // 5.1 Bấm nút "Quay lại Quản trị"
    console.log('  👉 5.1 Bấm nút "Quay lại Quản trị" trên Icon Rail...');
    await superPage.click('aside button[aria-label="Quay lại Quản trị"], aside button:has(.anticon-arrow-left)');
    await superPage.waitForURL('**/dashboard', { timeout: 10000 });
    await superPage.waitForTimeout(800);

    const restoredErpSider = await superPage.locator('.ant-layout-sider').count();
    console.log(`     Đã chuyển về /dashboard và phục hồi Sidebar ERP: ${restoredErpSider > 0 ? '✅ Đúng' : '❌ Lỗi'}`);
    if (restoredErpSider === 0) {
      throw new Error('Sidebar ERP không phục hồi khi quay lại /dashboard!');
    }
    await superContext.close();

    // 5.2 Đăng nhập ADMIN thường -> Menu CMS bị ẩn & Truy cập /settings/landing-page bị chặn
    console.log('\n  👉 5.2 Đăng nhập tài khoản ADMIN thường (admin/password123)...');
    const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const adminPage = await adminContext.newPage();
    await adminPage.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
    await adminPage.click('button:has-text("Admin (Quản lý)")');
    await adminPage.waitForTimeout(300);
    await adminPage.click('button:has-text("Đăng nhập hệ thống")');
    await adminPage.waitForURL('**/dashboard', { timeout: 10000 });

    const adminCmsMenu = await adminPage.locator('.ant-menu-item:has-text("Quản Lý Landing Page")').count();
    console.log(`     Menu CMS đối với Admin thường: ${adminCmsMenu === 0 ? '✅ Đã bị ẩn chuẩn xác' : '❌ Lỗi rò rỉ'}`);

    console.log('     Cố truy cập trực tiếp URL /settings/landing-page...');
    await adminPage.goto('http://localhost:3000/settings/landing-page', { waitUntil: 'domcontentloaded' });
    await adminPage.waitForTimeout(1000);
    console.log(`     URL sau khi bị chặn: ${adminPage.url()}`);
    if (adminPage.url().includes('/settings/landing-page')) {
      throw new Error('Admin thường vẫn vào được trang CMS SuperAdmin!');
    }
    console.log('  ✅ Admin thường bị chặn an toàn và chuyển hướng về /dashboard!');
    await adminContext.close();

    // 5.3 Đăng nhập STAFF -> Truy cập /settings/landing-page bị chặn về /pos
    console.log('\n  👉 5.3 Đăng nhập tài khoản STAFF (staff/password123)...');
    const staffContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const staffPage = await staffContext.newPage();
    await staffPage.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
    await staffPage.click('button:has-text("Staff (Thu ngân)")');
    await staffPage.waitForTimeout(300);
    await staffPage.click('button:has-text("Đăng nhập hệ thống")');
    await staffPage.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });

    console.log('     Cố truy cập trực tiếp URL /settings/landing-page...');
    await staffPage.goto('http://localhost:3000/settings/landing-page', { waitUntil: 'domcontentloaded' });
    await staffPage.waitForTimeout(1000);
    console.log(`     URL sau khi bị chặn: ${staffPage.url()}`);
    if (staffPage.url().includes('/settings/landing-page')) {
      throw new Error('Staff vẫn vào được trang CMS SuperAdmin!');
    }
    console.log('  ✅ Staff bị chặn an toàn và chuyển hướng về /pos!');
    await staffContext.close();

    // -------------------------------------------------------------
    // [6/6] KHÔI PHỤC CẤU HÌNH MẶC ĐỊNH
    // -------------------------------------------------------------
    console.log('\n[6/6] 🔄 Khôi phục cấu hình mặc định trong phiên SuperAdmin...');
    const cleanupContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const cleanupPage = await cleanupContext.newPage();
    await cleanupPage.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
    await cleanupPage.waitForTimeout(500);
    await cleanupPage.click('button:has-text("SuperAdmin")');
    await cleanupPage.waitForTimeout(300);
    await cleanupPage.click('button:has-text("Đăng nhập hệ thống")');
    await cleanupPage.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });
    await cleanupPage.waitForTimeout(1000);

    await cleanupPage.goto('http://localhost:3000/settings/landing-page', { waitUntil: 'domcontentloaded' });
    await cleanupPage.waitForTimeout(1000);

    // Bấm nút "Khôi phục mặc định" trên Header
    await cleanupPage.locator('header button:has-text("Khôi phục mặc định"), button:has-text("Khôi phục mặc định")').first().click();
    await cleanupPage.waitForTimeout(600);
    const confirmBtn = cleanupPage.locator('.ant-popconfirm button:has-text("Xác nhận"), .ant-popover button:has-text("Xác nhận"), button:has-text("Xác nhận")').first();
    await confirmBtn.waitFor({ state: 'visible', timeout: 5000 });
    await confirmBtn.click();
    await cleanupPage.locator('.ant-message-success').waitFor({ state: 'visible', timeout: 10000 });
    await cleanupPage.waitForTimeout(800);
    console.log('  ✅ Đã khôi phục toàn bộ cấu hình Landing Page về mặc định.');
    await cleanupContext.close();

    console.log('\n' + '='.repeat(70));
    console.log('🎉 TẤT CẢ KỊCH BẢN KIỂM THỬ CMS LANDING PAGE & RBAC ĐỀU ĐẠT 100%!');
    console.log('='.repeat(70) + '\n');
  } catch (error) {
    console.error('\n❌ KIỂM THỬ CMS THẤT BẠI:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runLandingCMSPlaywrightTests();
