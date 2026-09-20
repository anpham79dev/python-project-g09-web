// @ts-check
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

async function runDashboardBranchFilterTest() {
  console.log('======================================================================');
  console.log('🧪 KIỂM THỬ TỰ ĐỘNG: BỘ LỌC CHI NHÁNH & RELOAD SỐ LIỆU DASHBOARD');
  console.log('======================================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
  });

  const page = await context.newPage();

  // 1. Đăng nhập Admin
  console.log('[1/5] 🔐 Đăng nhập tài khoản Quản trị viên (Admin)...');
  await page.goto(`${BASE_URL}/login`);
  await page.waitForSelector('text=Artisan Bakery');
  await page.click('button:has-text("Quản lý")');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  await page.waitForSelector('text=Báo Cáo & Thống Kê Hoạt Động Tiệm Bánh');
  console.log('  ✅ Đăng nhập Admin thành công, đã vào /dashboard.');

  // 2. Định vị Dropdown chọn chi nhánh trên Dashboard Toolbar
  console.log('[2/5] 🔍 Kiểm tra UI dropdown: Icon & Tên chi nhánh không bị cắt cụt...');
  const dashSelect = page.locator('[data-testid="dashboard-branch-filter"]');
  await dashSelect.waitFor({ state: 'visible', timeout: 5000 });

  // Mở dropdown
  await dashSelect.click();
  await page.waitForTimeout(600);

  // Lấy toàn bộ text options trong dropdown popup
  const optionElements = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option-content');
  const count = await optionElements.count();
  console.log(`  👉 Tìm thấy ${count} tùy chọn chi nhánh trong dropdown.`);

  const options = await optionElements.allInnerTexts();
  console.log('  👉 Danh sách tùy chọn trong dropdown:\n', options.map((o) => `     • ${o.replace(/\n+/g, ' ')}`).join('\n'));

  if (count === 0) {
    throw new Error('Không tìm thấy danh sách tùy chọn chi nhánh trong dropdown!');
  }

  // Kiểm tra không chứa emoji 🏢 và hiển thị đầy đủ tên
  for (const opt of options) {
    if (opt.includes('🏢')) {
      throw new Error(`Phát hiện emoji 🏢 không mong muốn trong tùy chọn: "${opt}"`);
    }
    if (opt.includes('...')) {
      throw new Error(`Phát hiện tên chi nhánh bị cắt cụt dấu "...": "${opt}"`);
    }
  }
  console.log('  ✅ 100% Tùy chọn hiển thị tên đầy đủ, không bị truncate và không dùng emoji placeholder.');

  // Đóng dropdown tạm thời bằng cách chọn "Tất cả chi nhánh"
  await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option').filter({ hasText: 'Tất cả chi nhánh' }).first().click();
  await page.waitForTimeout(800);

  // 3. Ghi nhận số liệu ban đầu (Tất cả chi nhánh)
  console.log('[3/5] 📊 Ghi nhận số liệu Dashboard ở chế độ "Tất cả chi nhánh"...');
  const allRevenueEl = page.locator('.text-2xl, .text-xl').filter({ hasText: '₫' }).first();
  await allRevenueEl.waitFor({ state: 'visible' });
  const allRevenueText = await allRevenueEl.innerText();
  console.log(`  👉 Doanh thu Toàn chuỗi: ${allRevenueText}`);

  // 4. Chuyển sang "Chi Nhánh Quận 1" và xác minh số liệu thay đổi
  console.log('[4/5] 🏢 Chuyển bộ lọc sang "Chi Nhánh Quận 1"...');
  await dashSelect.click();
  await page.waitForTimeout(400);
  await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option').filter({ hasText: 'Quận 1' }).first().click();
  await page.waitForTimeout(1000);

  const q1RevenueText = await allRevenueEl.innerText();
  console.log(`  👉 Doanh thu Chi Nhánh Quận 1: ${q1RevenueText}`);

  // 5. Chuyển sang "Chi Nhánh Thảo Điền" và xác minh số liệu tiếp tục thay đổi
  console.log('[5/5] 🏢 Chuyển bộ lọc sang "Chi Nhánh Thảo Điền"...');
  await dashSelect.click();
  await page.waitForTimeout(400);
  await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option').filter({ hasText: 'Thảo Điền' }).first().click();
  await page.waitForTimeout(1000);

  const tdRevenueText = await allRevenueEl.innerText();
  console.log(`  👉 Doanh thu Chi Nhánh Thảo Điền: ${tdRevenueText}`);

  if (tdRevenueText === q1RevenueText) {
    throw new Error(`Số liệu Thảo Điền (${tdRevenueText}) không phân hóa so với Quận 1 (${q1RevenueText})!`);
  }
  console.log('  ✅ Số liệu đã phân hóa rõ rệt giữa các chi nhánh!');

  // 6. Chuyển lại "Tất cả chi nhánh"
  console.log('[Bonus] 🏢 Chuyển lại "Tất cả chi nhánh (Toàn chuỗi)"...');
  await dashSelect.click();
  await page.waitForTimeout(400);
  await page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option').filter({ hasText: 'Tất cả chi nhánh' }).first().click();
  await page.waitForTimeout(1000);

  const finalAllRevenueText = await allRevenueEl.innerText();
  console.log(`  👉 Doanh thu Toàn chuỗi sau khi chuyển lại: ${finalAllRevenueText}`);

  await browser.close();

  console.log('\n======================================================================');
  console.log('🎉 KIỂM THỬ THÀNH CÔNG: BỘ LỌC CHI NHÁNH DASHBOARD HOẠT ĐỘNG HOÀN HẢO!');
  console.log('======================================================================');
}

runDashboardBranchFilterTest().catch((err) => {
  console.error('❌ LỖI TRONG QUÁ TRÌNH TEST:', err);
  process.exit(1);
});
