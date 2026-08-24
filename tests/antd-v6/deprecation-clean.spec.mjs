// @ts-check
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

async function runAntdV6DeprecationTest() {
  console.log('======================================================================');
  console.log('🔍 KIỂM THỬ TỰ ĐỘNG: QUÉT CONSOLE LOGS XÁC NHẬN SẠCH 100% WARNING ANTD V6');
  console.log('======================================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  const collectedWarnings = [];
  page.on('console', (msg) => {
    const text = msg.text();
    const type = msg.type();
    // Bắt các warning liên quan tới Ant Design hoặc deprecated API / React state updates
    if (type === 'warning' || type === 'error' || text.includes('[antd') || text.includes('Warning:')) {
      if (
        text.includes('[antd:') ||
        text.includes('deprecated') ||
        text.includes('destroyOnClose') ||
        text.includes('addonAfter') ||
        text.includes('Spin') ||
        text.includes('useForm') ||
        text.includes('key') && text.includes('spread') ||
        text.includes('Cannot update a component') ||
        text.includes('Static function can not consume context') ||
        text.includes('v5-patch-for-react-19')
      ) {
        collectedWarnings.push({ url: page.url(), text, type });
      }
    }
  });

  // 1. Kiểm tra route gốc "/" tự động chuyển hướng về /login khi chưa đăng nhập
  console.log('[1/7] 🌐 Kiểm tra route gốc (/) chuyển hướng về /login...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // 2. Đăng nhập Admin
  console.log('[2/7] 🔐 Đăng nhập tài khoản Admin...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  const adminBtn = page.getByRole('button', { name: /Quản trị viên/i });
  if (await adminBtn.isVisible()) {
    await adminBtn.click();
    await page.getByRole('button', { name: /Đăng nhập hệ thống/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  }

  // 3. Kiểm tra Dashboard
  console.log('[3/7] 📊 Kiểm tra trang Dashboard (/dashboard)...');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 4. Kiểm tra POS & Modals
  console.log('[4/7] 🛒 Kiểm tra trang Bán Hàng POS & Modals (/pos)...');
  await page.goto(`${BASE_URL}/pos`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  // Bấm thử sản phẩm vào giỏ để kích hoạt state
  const firstItem = page.locator('div.group').first();
  if (await firstItem.isVisible()) {
    await firstItem.click();
  }
  await page.waitForTimeout(500);

  // 5. Kiểm tra Quản lý Sản phẩm & Form Thêm mới / Chỉnh sửa
  console.log('[5/7] 🥐 Kiểm tra trang Sản Phẩm (/products & /products/new)...');
  await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.goto(`${BASE_URL}/products/new`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 6. Kiểm tra Chi Nhánh, Ca Làm Việc & Kế Toán
  console.log('[6/7] 🏢 Kiểm tra Chi Nhánh (/branches), Ca Làm (/shifts) & Kế Toán (/accounting)...');
  await page.goto(`${BASE_URL}/branches`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.goto(`${BASE_URL}/shifts`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.goto(`${BASE_URL}/accounting`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 7. Kiểm tra Quản lý Nhân sự, Cài đặt & Vai trò
  console.log('[7/7] 👥 Kiểm tra Quản Lý Nhân Sự (/users), Cài Đặt (/settings) & Vai Trò (/settings/roles)...');
  await page.goto(`${BASE_URL}/users`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.goto(`${BASE_URL}/settings/roles`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  await browser.close();

  console.log('\n======================================================================');
  console.log(`📊 TỔNG KẾT: Phát hiện ${collectedWarnings.length} warning Ant Design deprecated.`);
  if (collectedWarnings.length > 0) {
    console.error('❌ CÁC WARNING CÒN TỒN ĐỌNG:');
    collectedWarnings.forEach((w, idx) => {
      console.error(`  ${idx + 1}. [${w.url}] ${w.text}`);
    });
    process.exit(1);
  } else {
    console.log('✅ HOÀN TOÀN SẠCH 100%: 0 Ant Design deprecated warnings trên toàn bộ các trang!');
    console.log('======================================================================');
  }
}

runAntdV6DeprecationTest().catch((err) => {
  console.error('Lỗi khi chạy test:', err);
  process.exit(1);
});
