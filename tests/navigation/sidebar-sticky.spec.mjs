import { chromium } from 'playwright';

async function testSidebarSticky() {
  console.log('=' .repeat(70));
  console.log('🚀 KIỂM THỬ TỰ ĐỘNG: SIDEBAR ERP CỐ ĐỊNH (STICKY) KHI CUỘN TRANG DÀI');
  console.log('=' .repeat(70));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // 1. Đăng nhập Admin
    console.log('\n[1/5] 🔐 Đăng nhập tài khoản Quản trị viên (Admin)...');
    await page.goto('http://localhost:3000/login');
    const adminBtn = page.getByRole('button', { name: /Admin \(Quản lý\)|Quản trị viên/i });
    await adminBtn.click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: /Đăng nhập hệ thống/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('  ✅ Đăng nhập Admin thành công.');

    // 2. Kiểm thử Sticky trên trang Kế toán (/accounting) - Trang danh sách dài
    console.log('\n[2/5] 💰 Kiểm thử Sider Sticky trên trang Kế Toán (/accounting)...');
    await page.goto('http://localhost:3000/accounting');
    await page.waitForTimeout(1000);

    const sider = page.locator('aside.ant-layout-sider');
    const header = page.locator('header.ant-layout-header');

    const initialBox = await sider.boundingBox();
    console.log(`  👉 Vị trí Sidebar ban đầu: y=${initialBox?.y}, height=${initialBox?.height}`);

    // Cuộn xuống 800px
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(400);

    const scrollYAccounting = await page.evaluate(() => window.scrollY);
    const scrolledBoxAccounting = await sider.boundingBox();
    const scrolledHeaderBoxAccounting = await header.boundingBox();

    console.log(`  👉 ScrollY = ${scrollYAccounting}px`);
    console.log(`  👉 Vị trí Sidebar sau khi cuộn: y=${scrolledBoxAccounting?.y}`);
    console.log(`  👉 Vị trí Topbar sau khi cuộn: y=${scrolledHeaderBoxAccounting?.y}`);

    if (scrolledBoxAccounting?.y !== 0) {
      throw new Error(`Sidebar bị trôi khi cuộn trang! y=${scrolledBoxAccounting?.y} (kỳ vọng y=0)`);
    }
    if (scrolledHeaderBoxAccounting?.y !== 0) {
      throw new Error(`Header bị trôi khi cuộn trang! y=${scrolledHeaderBoxAccounting?.y} (kỳ vọng y=0)`);
    }
    console.log('  ✅ Sidebar & Topbar giữ nguyên vị trí cố định (y=0) khi cuộn trang Kế toán.');

    // 3. Kiểm thử Sticky trên trang Sản phẩm (/products)
    console.log('\n[3/5] 🥐 Kiểm thử Sider Sticky trên trang Sản Phẩm (/products)...');
    await page.goto('http://localhost:3000/products');
    await page.waitForTimeout(1000);

    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(400);

    const scrolledBoxProducts = await sider.boundingBox();
    console.log(`  👉 Vị trí Sidebar sau khi cuộn trên /products: y=${scrolledBoxProducts?.y}`);
    if (scrolledBoxProducts?.y !== 0) {
      throw new Error(`Sidebar bị trôi trên /products! y=${scrolledBoxProducts?.y}`);
    }
    console.log('  ✅ Sidebar giữ nguyên vị trí cố định (y=0) khi cuộn trang Sản phẩm.');

    // 4. Kiểm thử Sticky trên trang Đơn Hàng (/orders)
    console.log('\n[4/5] 📄 Kiểm thử Sider Sticky trên trang Đơn Hàng (/orders)...');
    await page.goto('http://localhost:3000/orders');
    await page.waitForTimeout(1000);

    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(400);

    const scrolledBoxOrders = await sider.boundingBox();
    console.log(`  👉 Vị trí Sidebar sau khi cuộn trên /orders: y=${scrolledBoxOrders?.y}`);
    if (scrolledBoxOrders?.y !== 0) {
      throw new Error(`Sidebar bị trôi trên /orders! y=${scrolledBoxOrders?.y}`);
    }
    console.log('  ✅ Sidebar giữ nguyên vị trí cố định (y=0) khi cuộn trang Đơn hàng.');

    // 5. Kiểm thử Sticky khi Sidebar ở trạng thái Thu gọn (Collapsed 80px)
    console.log('\n[5/5] ↔️ Kiểm thử Sider Sticky khi Thu Gọn (Collapsed 80px)...');
    await page.goto('http://localhost:3000/accounting');
    await page.waitForTimeout(1000);

    // Bấm nút thu gọn
    const collapseBtn = page.locator('header button').first();
    await collapseBtn.click();
    await page.waitForTimeout(500);

    const collapsedWidth = (await sider.boundingBox())?.width;
    console.log(`  👉 Chiều rộng Sidebar thu gọn: ${collapsedWidth}px`);

    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(400);

    const scrolledBoxCollapsed = await sider.boundingBox();
    console.log(`  👉 Vị trí Sidebar thu gọn sau khi cuộn: y=${scrolledBoxCollapsed?.y}`);
    if (scrolledBoxCollapsed?.y !== 0) {
      throw new Error(`Sidebar thu gọn bị trôi! y=${scrolledBoxCollapsed?.y}`);
    }
    console.log('  ✅ Sidebar thu gọn giữ nguyên vị trí cố định (y=0) khi cuộn.');

    console.log('\n' + '=' .repeat(70));
    console.log('🎉 XÁC NHẬN 100%: SIDEBAR & TOPBAR ĐÃ CỐ ĐỊNH (STICKY) HOÀN HẢO KHI CUỘN!');
    console.log('=' .repeat(70));
  } catch (err) {
    console.error('\n❌ KIỂM THỬ THẤT BẠI:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testSidebarSticky();
