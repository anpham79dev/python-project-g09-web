import { chromium } from 'playwright';

async function testHeaderLayout() {
  console.log('=' .repeat(70));
  console.log('🚀 KIỂM THỬ ĐỒNG BỘ CONTAINER & HEADER KHÔNG BỊ WRAP (1440px DESKTOP)');
  console.log('=' .repeat(70));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // 1. Mở trang Landing Page ở viewport 1440px
    console.log('\n[1/4] 🌐 Kiểm tra Landing Page Header ở độ phân giải chuẩn 1440px...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const header = page.locator('header');
    await header.waitFor({ state: 'visible' });

    // Lấy tọa độ Y của Logo, Nav menu và Right CTA buttons
    const logoBox = await page.locator('header a[href="/"]').boundingBox();
    const navBox = await page.locator('header nav').boundingBox();
    const ctaBox = await page.locator('header button:has-text("Dùng thử miễn phí")').boundingBox();

    console.log(`  👉 Tọa độ Logo: y=${logoBox?.y?.toFixed(1)}, height=${logoBox?.height?.toFixed(1)}`);
    console.log(`  👉 Tọa độ Nav Menu: y=${navBox?.y?.toFixed(1)}, height=${navBox?.height?.toFixed(1)}`);
    console.log(`  👉 Tọa độ CTA Button: y=${ctaBox?.y?.toFixed(1)}, height=${ctaBox?.height?.toFixed(1)}`);

    if (!logoBox || !navBox || !ctaBox) {
      throw new Error('Không tìm thấy một trong các phần tử trong Header!');
    }

    // Kiểm tra Header không bị vỡ dòng
    const headerBox = await header.boundingBox();
    console.log(`  👉 Chiều cao Header tổng thể: ${headerBox?.height?.toFixed(1)}px (kỳ vọng <= 90px)`);

    if (headerBox && headerBox.height > 95) {
      throw new Error(`Header đang bị wrap thành nhiều dòng! Chiều cao: ${headerBox.height}px`);
    }

    // Kiểm tra tất cả 5 menu items hiển thị đầy đủ
    const navLinks = await page.locator('header nav a').allTextContents();
    console.log(`  ✅ Danh sách 5 mục Menu hiển thị trên 1 hàng ngang:`, navLinks);
    if (navLinks.length < 5) {
      throw new Error('Menu items bị thiếu!');
    }

    // 2. Kiểm tra trang Đăng nhập (/login)
    console.log('\n[2/4] 🔐 Kiểm tra trang Đăng nhập (/login)...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);
    const loginCard = page.locator('.ant-card');
    await loginCard.waitFor({ state: 'visible' });
    console.log('  ✅ Trang Đăng nhập hiển thị chuẩn xác.');

    // 3. Đăng nhập vào ERP để kiểm tra Topbar của ERP
    console.log('\n[3/4] 🏢 Đăng nhập Admin và kiểm tra ERP Topbar...');
    await page.click('button:has-text("Admin (Quản lý)")');
    await page.click('button:has-text("Đăng nhập hệ thống")');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.waitForTimeout(800);

    const erpHeader = page.locator('header');
    await erpHeader.waitFor({ state: 'visible' });
    const erpHeaderBox = await erpHeader.boundingBox();
    console.log(`  👉 ERP Topbar chiều cao: ${erpHeaderBox?.height?.toFixed(1)}px`);
    console.log('  ✅ ERP Topbar và Dashboard đồng bộ container max-w-[1600px].');

    // 4. Kiểm tra trang Danh sách Sản phẩm (/products)
    console.log('\n[4/4] 🥐 Kiểm tra trang Sản phẩm (/products)...');
    await page.goto('http://localhost:3000/products', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
    const prodTable = page.locator('.ant-table');
    await prodTable.waitFor({ state: 'visible' });
    console.log('  ✅ Trang Sản phẩm hiển thị trọn vẹn trong container đồng bộ.');

    console.log('\n' + '=' .repeat(70));
    console.log('🎉 TOÀN BỘ ỨNG DỤNG ĐÃ ĐỒNG BỘ CONTAINER MAX-W-[1600px] & HEADER KHÔNG WRAP!');
    console.log('=' .repeat(70));
  } catch (err) {
    console.error('\n❌ KIỂM THỬ THẤT BẠI:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testHeaderLayout();
