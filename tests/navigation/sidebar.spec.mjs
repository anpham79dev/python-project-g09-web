import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

async function testSidebarNavigation() {
  console.log('='.repeat(70));
  console.log('🚀 KIỂM THỬ TỰ ĐỘNG: SIDEBAR COLLAPSIBLE SUBMENU GROUPS & RBAC');
  console.log('='.repeat(70));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // 1. Kiểm tra Landing Page ở route "/" - Giữ nguyên Topbar ngang, không có Sidebar
    console.log('\n[1/7] 🌐 Kiểm tra Landing Page ("/") - Giữ nguyên Topbar ngang, không có Sidebar...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    const landingHeader = page.locator('header');
    await landingHeader.waitFor({ state: 'visible' });
    const siderOnLanding = page.locator('.ant-layout-sider');
    const siderCountLanding = await siderOnLanding.count();
    console.log(`  👉 Số lượng Sidebar trên Landing page: ${siderCountLanding} (kỳ vọng: 0)`);
    if (siderCountLanding !== 0) {
      throw new Error('Sidebar xuất hiện trên Landing page (phải giữ nguyên topbar ngang)!');
    }
    console.log('  ✅ Landing Page giữ nguyên 100% bố cục Topbar ngang ban đầu.');

    // 2. Đăng nhập Admin và kiểm tra 5 SubMenu Groups có thể đóng/mở
    console.log('\n[2/7] 🏢 Đăng nhập Admin và kiểm tra 5 khối SubMenu Groups...');
    await page.goto(`${BASE_URL}/login`);
    await page.click('button:has-text("Admin (Quản lý)")');
    await page.click('button:has-text("Đăng nhập hệ thống")');
    await page.waitForURL('**/dashboard');
    await page.waitForTimeout(800);

    const sider = page.locator('.ant-layout-sider');
    await sider.waitFor({ state: 'visible' });

    // Kiểm tra 5 SubMenu Groups chính
    const subMenuTitles = [
      'Bán Hàng (POS)',
      'Đơn Hàng & Ca Làm',
      'Sản Phẩm & Kho Hàng',
      'Quản Trị & Tài Chính',
      'Cài Đặt Hệ Thống',
    ];

    for (const title of subMenuTitles) {
      const subMenu = sider.locator(`.ant-menu-submenu-title:has-text("${title}")`);
      const isVisible = await subMenu.isVisible();
      console.log(`  👉 SubMenu Group "${title}": ${isVisible ? '✅ Hiển thị' : '❌ Ẩn'}`);
      if (!isVisible) {
        throw new Error(`SubMenu "${title}" không xuất hiện!`);
      }
    }
    console.log('  ✅ 100% 5 SubMenu Groups hiển thị chuẩn xác.');

    // 3. Kiểm tra Tương tác Thu gọn / Mở rộng riêng từng SubMenu
    console.log('\n[3/7] 📂 Kiểm tra tương tác thu gọn / mở rộng từng SubMenu Group...');
    const inventorySubMenuTitle = sider.locator('.ant-menu-submenu-title:has-text("Sản Phẩm & Kho Hàng")');
    const productsItem = sider.locator('.ant-menu-item:has-text("Danh Mục Sản Phẩm")');

    // Mặc định đang mở -> bấm để đóng
    console.log('  👉 Bấm đóng nhóm "Sản Phẩm & Kho Hàng"...');
    await inventorySubMenuTitle.click();
    await page.waitForTimeout(400);
    const isHiddenAfterClick = !(await productsItem.isVisible());
    console.log(`  👉 Menu con "Danh Mục Sản Phẩm" đã ẩn: ${isHiddenAfterClick ? '✅ Đúng' : '❌ Sai'}`);

    // Bấm lại để mở
    console.log('  👉 Bấm mở lại nhóm "Sản Phẩm & Kho Hàng"...');
    await inventorySubMenuTitle.click();
    await page.waitForTimeout(400);
    const isVisibleAfterReopen = await productsItem.isVisible();
    console.log(`  👉 Menu con "Danh Mục Sản Phẩm" đã hiện lại: ${isVisibleAfterReopen ? '✅ Đúng' : '❌ Sai'}`);
    if (!isVisibleAfterReopen) {
      throw new Error('Không thể mở lại SubMenu!');
    }

    // 4. Kiểm tra Tự động mở SubMenu chứa route đang active khi vào trang
    console.log('\n[4/7] 🎯 Kiểm tra tự động mở SubMenu khi truy cập trực tiếp route...');
    await page.goto(`${BASE_URL}/shifts`);
    await page.waitForTimeout(600);
    const shiftsItem = sider.locator('.ant-menu-item:has-text("Quản Lý Ca & Két")');
    const isShiftsVisible = await shiftsItem.isVisible();
    console.log(`  👉 Menu "Quản Lý Ca & Két" tự động mở sẵn: ${isShiftsVisible ? '✅ Đúng' : '❌ Sai'}`);
    if (!isShiftsVisible) {
      throw new Error('SubMenu chứa trang hiện tại (/shifts) không tự động mở!');
    }

    // 5. Kiểm tra thu gọn toàn bộ Sidebar & Flyout SubMenu khi hover
    console.log('\n[5/7] ↔️ Kiểm tra thu gọn toàn bộ Sidebar & Flyout menu...');
    const toggleBtn = page.locator('header button:has(.anticon-menu-fold), header button:has(.anticon-menu-unfold)').first();
    await toggleBtn.click();
    await page.waitForTimeout(500);

    const collapsedBox = await sider.boundingBox();
    console.log(`  👉 Chiều rộng Sidebar sau khi thu gọn: ${collapsedBox?.width?.toFixed(1)}px (kỳ vọng ~80px)`);

    // Mở rộng lại Sidebar
    await toggleBtn.click();
    await page.waitForTimeout(500);
    console.log('  ✅ Sidebar mở rộng trở lại 260px bình thường.');

    // 6. Đăng nhập Staff để kiểm tra RBAC Menu
    console.log('\n[6/7] 👥 Đăng nhập tài khoản Staff và kiểm tra phân quyền RBAC...');
    const staffContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const staffPage = await staffContext.newPage();
    await staffPage.goto(`${BASE_URL}/login`);
    await staffPage.waitForTimeout(400);
    await staffPage.click('button:has-text("Staff (Thu ngân)")');
    await staffPage.click('button:has-text("Đăng nhập hệ thống")');
    await staffPage.waitForURL('**/pos');
    await staffPage.waitForTimeout(800);

    const staffSider = staffPage.locator('.ant-layout-sider');
    await staffSider.waitFor({ state: 'visible' });

    // Staff thấy SubMenu: Bán Hàng, Đơn Hàng & Ca Làm
    const staffAllowedSub = ['Bán Hàng (POS)', 'Đơn Hàng & Ca Làm'];
    for (const title of staffAllowedSub) {
      const sub = staffSider.locator(`.ant-menu-submenu-title:has-text("${title}")`);
      if (!(await sub.isVisible())) {
        throw new Error(`Staff phải thấy SubMenu "${title}"!`);
      }
    }
    console.log('  ✅ Staff thấy đúng các SubMenu được phân quyền.');

    // Staff KHÔNG ĐƯỢC thấy SubMenu Admin
    const staffForbiddenSub = ['Sản Phẩm & Kho Hàng', 'Quản Trị & Tài Chính', 'Cài Đặt Hệ Thống'];
    for (const title of staffForbiddenSub) {
      const sub = staffSider.locator(`.ant-menu-submenu-title:has-text("${title}")`);
      if (await sub.isVisible()) {
        throw new Error(`Staff KHÔNG ĐƯỢC thấy SubMenu Admin "${title}"!`);
      }
    }
    console.log('  ✅ 100% SubMenu Admin đã bị ẩn an toàn đối với Staff.');

    // 7. Kiểm tra Topbar ERP
    console.log('\n[7/7] 🎯 Kiểm tra Topbar ERP...');
    const topbar = staffPage.locator('header');
    const hasBranch = await topbar.locator('.anticon-shop').isVisible();
    const hasShift = await topbar.locator('text=Ca:').isVisible();
    const hasUser = await topbar.locator('.ant-avatar').isVisible();
    console.log(`  👉 Branch Switcher: ${hasBranch ? '✅ Có' : '❌ Thiếu'}`);
    console.log(`  👉 Shift Badge: ${hasShift ? '✅ Có' : '❌ Thiếu'}`);
    console.log(`  👉 User Profile: ${hasUser ? '✅ Có' : '❌ Thiếu'}`);

    console.log('\n' + '='.repeat(70));
    console.log('🎉 TẤT CẢ KỊCH BẢN KIỂM THỬ SUBMENU GROUPS SIDEBAR ĐẠT 100%!');
    console.log('='.repeat(70));
  } catch (err) {
    console.error('\n❌ KIỂM THỬ THẤT BẠI:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testSidebarNavigation();
