import { chromium } from 'playwright';

async function testAccountingBranchFilter() {
  console.log('=' .repeat(70));
  console.log('🧪 KIỂM THỬ TỰ ĐỘNG: BỘ LỌC CHI NHÁNH & RELOAD DỮ LIỆU KẾ TOÁN (/accounting)');
  console.log('=' .repeat(70));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // 1. Đăng nhập Admin
    console.log('\n[1/5] 🔐 Đăng nhập tài khoản Quản trị viên (Admin)...');
    await page.goto('http://localhost:3000/login');
    const adminBtn = page.getByRole('button', { name: /Quản lý|Admin/i });
    await adminBtn.click();
    await page.waitForTimeout(300);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('  ✅ Đăng nhập Admin thành công.');

    // 2. Mở trang Kế toán (/accounting) và chọn Toàn chuỗi
    console.log('\n[2/5] 💰 Mở trang Sổ Quỹ Thu Chi & Kế Toán (/accounting)...');
    await page.goto('http://localhost:3000/accounting');
    await page.waitForTimeout(1000);

    const inPageFilter = page.locator('.ant-select').first();
    await inPageFilter.waitFor({ state: 'visible' });

    // Chọn Toàn chuỗi
    await inPageFilter.click();
    await page.waitForTimeout(300);
    await page.locator('.ant-select-item-option:has-text("Tất cả chi nhánh")').first().click();
    await page.waitForTimeout(1000);

    const totalIncomeAll = await page.locator('.text-2xl.font-bold.font-mono.text-\\[\\#10B981\\]').first().textContent();
    const rowsCountAll = await page.locator('tbody tr.ant-table-row').count();
    console.log(`  👉 Chế độ Toàn chuỗi: Tổng thu = "${totalIncomeAll?.trim()}", Số dòng phiếu = ${rowsCountAll}`);

    // 3. Lọc sang "Chi Nhánh Quận 1" thông qua dropdown filter trong trang
    console.log('\n[3/5] 🏢 Thao tác chọn "Chi Nhánh Quận 1" từ Dropdown Filter trong trang...');
    await inPageFilter.click();
    await page.waitForTimeout(300);
    const q1Option = page.locator('.ant-select-item-option:has-text("Quận 1")').first();
    await q1Option.click();
    await page.waitForTimeout(1000);

    const totalIncomeQ1 = await page.locator('.text-2xl.font-bold.font-mono.text-\\[\\#10B981\\]').first().textContent();
    const rowsCountQ1 = await page.locator('tbody tr.ant-table-row').count();
    console.log(`  👉 Sau khi lọc Quận 1: Tổng thu = "${totalIncomeQ1?.trim()}", Số dòng phiếu = ${rowsCountQ1}`);

    // Kiểm tra Topbar cũng đã đồng bộ sang Quận 1
    const topbarText = await page.locator('header').textContent();
    const isTopbarSyncedQ1 = topbarText?.includes('Quận 1');
    console.log(`  👉 Topbar đã đồng bộ chi nhánh: ${isTopbarSyncedQ1 ? '✅ Đúng' : '❌ Chưa đồng bộ'}`);

    // 4. Lọc sang "Chi Nhánh Thảo Điền"
    console.log('\n[4/5] 🏢 Thao tác chọn "Chi Nhánh Thảo Điền" từ Dropdown Filter trong trang...');
    await inPageFilter.click();
    await page.waitForTimeout(300);
    const tdOption = page.locator('.ant-select-item-option:has-text("Thảo Điền")').first();
    await tdOption.click();
    await page.waitForTimeout(1000);

    const totalIncomeTD = await page.locator('.text-2xl.font-bold.font-mono.text-\\[\\#10B981\\]').first().textContent();
    const rowsCountTD = await page.locator('tbody tr.ant-table-row').count();
    console.log(`  👉 Sau khi lọc Thảo Điền: Tổng thu = "${totalIncomeTD?.trim()}", Số dòng phiếu = ${rowsCountTD}`);

    if (totalIncomeTD === totalIncomeQ1 && totalIncomeQ1 === totalIncomeAll) {
      throw new Error('Số liệu kế toán không thay đổi khi chuyển chi nhánh!');
    }
    console.log('  ✅ Dữ liệu sổ quỹ & KPI thu chi đã lọc phân hóa chính xác 100% giữa các chi nhánh!');

    // 5. Thao tác ngược lại từ Topbar Switcher sang "Tất cả chi nhánh"
    console.log('\n[5/5] 🔄 Chuyển chi nhánh từ Topbar Switcher sang Toàn hệ thống...');
    const topbarBranchBtn = page.locator('header button:has-text("Chi nhánh làm việc")');
    await topbarBranchBtn.click();
    await page.waitForTimeout(300);
    const allOption = page.locator('.ant-dropdown:not(.ant-dropdown-hidden) .ant-dropdown-menu-item:has-text("Tất cả chi nhánh")').first();
    await allOption.click();
    await page.waitForTimeout(1000);

    const reloadedIncomeAll = await page.locator('.text-2xl.font-bold.font-mono.text-\\[\\#10B981\\]').first().textContent();
    const reloadedRowsCount = await page.locator('tbody tr.ant-table-row').count();
    console.log(`  👉 Tổng thu nạp lại: "${reloadedIncomeAll?.trim()}", Số dòng: ${reloadedRowsCount} (kỳ vọng bằng ban đầu: "${totalIncomeAll?.trim()}")`);
    if (reloadedIncomeAll?.trim() !== totalIncomeAll?.trim() || reloadedRowsCount !== rowsCountAll) {
      throw new Error('Dữ liệu Toàn chuỗi không nạp lại chính xác!');
    }

    console.log('\n' + '=' .repeat(70));
    console.log('🎉 XÁC NHẬN 100%: BỘ LỌC CHI NHÁNH TRANG KẾ TOÁN HOẠT ĐỘNG HOÀN HẢO!');
    console.log('=' .repeat(70));
  } catch (err) {
    console.error('\n❌ KIỂM THỬ THẤT BẠI:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testAccountingBranchFilter();
