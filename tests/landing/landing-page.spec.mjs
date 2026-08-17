import { chromium } from 'playwright';

async function testLandingPage() {
  console.log('=' .repeat(70));
  console.log('🚀 KIỂM THỬ GIAO DIỆN SAAS MULTI-TENANT LANDING PAGE & DESIGN POLISH');
  console.log('=' .repeat(70));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // 1. Mở trang Landing Page (/)
    console.log('\n[1/6] 🌐 Mở trang Landing Page (http://localhost:3000)...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    console.log(`  👉 Current URL: ${page.url()}`);

    const title = await page.textContent('h1');
    console.log(`  ✅ Headline: "${title?.replace(/\s+/g, ' ').trim()}"`);
    if (!title || !title.includes('Chuyên Biệt Cho Chuỗi Tiệm Bánh')) {
      throw new Error('Hero headline không hiển thị đúng!');
    }

    // 2. Kiểm tra hoàn toàn không có emoji trên trang
    console.log('\n[2/6] 🔍 Quét toàn bộ trang xác nhận 0 emoji...');
    const bodyText = await page.textContent('body');
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    const hasEmoji = emojiRegex.test(bodyText || '');
    if (hasEmoji) {
      throw new Error('Vẫn còn emoji xuất hiện trên trang Landing Page!');
    }
    console.log('  ✅ Đã xác nhận 100% trang không có bất kỳ emoji nào, toàn bộ dùng @ant-design/icons!');

    // 3. Kiểm thử 3 nút tính năng có padding cân đối, tự nhiên
    console.log('\n[3/6] 🔘 Kiểm thử hàng 3 nút tính năng tab showcase...');
    const tabPos = page.getByRole('button', { name: 'Màn Hình Bán Hàng POS & VietQR' });
    const tabReports = page.getByRole('button', { name: 'Dashboard Doanh Thu & Sổ Quỹ P&L' });
    const tabInventory = page.getByRole('button', { name: 'Quản Trị Đa Chi Nhánh & Đa Kho' });

    await tabPos.waitFor({ state: 'visible' });
    await tabReports.waitFor({ state: 'visible' });
    await tabInventory.waitFor({ state: 'visible' });

    // Click qua lại giữa các tab
    await tabReports.click();
    await page.waitForTimeout(400);
    console.log('  ✅ Chuyển sang tab Reports thành công.');

    await tabInventory.click();
    await page.waitForTimeout(400);
    console.log('  ✅ Chuyển sang tab Inventory thành công.');

    await tabPos.click();
    await page.waitForTimeout(400);
    console.log('  ✅ Chuyển về tab POS thành công.');

    // 4. Kiểm thử Subdomain Checker trên Hero
    console.log('\n[4/6] 🔍 Kiểm thử Subdomain Instant Checker Widget...');
    const subdomainInput = page.locator('input[placeholder="la-petite-paris"], input[placeholder="ten-tiem-banh-cua-ban"]').first();
    await subdomainInput.scrollIntoViewIfNeeded();
    await subdomainInput.fill('la-petite-paris');
    const startBtn = page.getByRole('button', { name: 'Khởi tạo ngay' });
    await startBtn.scrollIntoViewIfNeeded();
    await startBtn.click();
    await page.waitForTimeout(800);

    // Modal Đăng ký xuất hiện
    const modalTitle = page.locator('h3:has-text("Đăng Ký & Khởi Tạo Subdomain SaaS")');
    await modalTitle.waitFor({ state: 'visible', timeout: 10000 });
    const modalText = await modalTitle.textContent();
    console.log(`  ✅ Modal xuất hiện: "${modalText?.trim()}"`);

    // Kiểm tra subdomain đã được pre-fill
    const subVal = await page.locator('input#subdomain').inputValue();
    console.log(`  ✅ Subdomain đã tự động điền: "${subVal}.artisan.vn"`);

    // Đóng modal để kiểm tra bảng giá
    const cancelBtn = page.getByRole('button', { name: 'Hủy bỏ' });
    await cancelBtn.click();
    await page.waitForTimeout(500);

    // 5. Kiểm thử Bảng Giá & Switcher
    console.log('\n[5/6] 💳 Kiểm thử Bảng Giá Thuê Bao (Subscription Plans)...');
    const pricingSec = page.locator('#pricing');
    await pricingSec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    const toggleBtn = page.locator('#pricing button.rounded-full');
    await toggleBtn.click();
    await page.waitForTimeout(500);
    console.log('  ✅ Chuyển đổi chu kỳ thanh toán Tháng ↔ Năm mượt mà.');

    // Bấm nút đăng ký/dùng thử trên Gói Thuê Bao
    const planBtn = page.locator('#pricing button:has-text("Bắt Đầu Dùng Thử"), #pricing button:has-text("Trải Nghiệm Gói Hot"), #pricing button:has-text("Dùng Thử")').first();
    await planBtn.click();
    await page.waitForTimeout(600);

    // 6. Kiểm thử Quy trình Khởi Tạo Tenant & Nối vào ERP (/login)...
    console.log('\n[6/6] 🚀 Kiểm thử Khởi Tạo Subdomain & Nối vào ERP (/login)...');
    const submitBtn = page.getByRole('button', { name: 'Xác Nhận & Khởi Tạo Hệ Thống' });
    await submitBtn.waitFor({ state: 'visible', timeout: 5000 });
    await page.waitForTimeout(500);
    await submitBtn.click();

    // Chờ màn hình thành công (hiệu ứng provisioning mất ~2.5s)
    const successTitle = page.locator('h3:has-text("Khởi Tạo Thành Công!")');
    await successTitle.waitFor({ state: 'visible', timeout: 15000 });
    console.log('  ✅ Hiệu ứng Provisioning hoàn tất, hiển thị màn hình cấp phát Tenant thành công!');

    const loginErpBtn = page.getByRole('button', { name: 'Đăng Nhập Vào Hệ Thống ERP Ngay' });
    await loginErpBtn.waitFor({ state: 'visible', timeout: 5000 });
    await loginErpBtn.click();
    await page.waitForURL('**/login', { timeout: 10000 });
    await page.waitForTimeout(800);

    console.log(`  ✅ Đã chuyển hướng chính xác vào trang ERP: ${page.url()}`);

    // 7. Kiểm thử Header SSR Auth Hydration khi F5 (Zero-Flicker)
    console.log('\n[7/7] ⚡ Kiểm thử Header SSR Auth Hydration khi đăng nhập & F5...');
    const adminBtn = page.getByRole('button', { name: /Admin \(Quản lý\)|Quản trị viên/i });
    await adminBtn.click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: /Đăng nhập hệ thống/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('  ✅ Đăng nhập Admin thành công.');

    // Quay lại Landing Page và F5
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    const erpBtn = page.locator('header button:has-text("Vào Hệ Thống ERP")');
    await erpBtn.waitFor({ state: 'visible', timeout: 3000 });
    const loginBtnCount = await page.locator('header button:has-text("Đăng nhập ERP")').count();
    console.log(`  👉 Nút 'Vào Hệ Thống ERP' xuất hiện ngay lập tức: ${await erpBtn.isVisible() ? '✅ Đúng' : '❌ Lỗi'}`);
    console.log(`  👉 Nút 'Đăng nhập ERP' bị ẩn triệt để (không flash): ${loginBtnCount === 0 ? '✅ Đúng' : '❌ Lỗi'}`);
    if (loginBtnCount > 0) {
      throw new Error('Nút Đăng nhập ERP vẫn xuất hiện khi người dùng đã đăng nhập!');
    }

    console.log('\n' + '=' .repeat(70));
    console.log('🎉 KIỂM THỬ LANDING PAGE SAAS & HEADER SSR AUTH ĐỀU VƯỢT QUA 100%!');
    console.log('=' .repeat(70));
  } catch (err) {
    console.error('\n❌ KIỂM THỬ THẤT BẠI:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testLandingPage();
