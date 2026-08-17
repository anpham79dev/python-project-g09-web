import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

async function testAccountingIconsAndHeader() {
  console.log('='.repeat(70));
  console.log('🔍 KIỂM THỬ TỰ ĐỘNG: ICON ĐƠN SẮC ANTD & PADDING HEADER ERP');
  console.log('='.repeat(70));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // 1. Đăng nhập Admin
    console.log('\n[1/5] 🔐 Đăng nhập tài khoản Admin...');
    await page.goto(`${BASE_URL}/login`);
    await page.click('button:has-text("Admin (Quản lý)")');
    await page.click('button:has-text("Đăng nhập hệ thống")');
    await page.waitForURL('**/dashboard');
    await page.waitForTimeout(600);
    console.log('  ✅ Đăng nhập Admin thành công.');

    // 2. Mở trang Kế toán (/accounting) và kiểm tra cột Phương Thức
    console.log('\n[2/5] 💰 Kiểm tra cột "Phương Thức" trang Kế toán (/accounting)...');
    await page.goto(`${BASE_URL}/accounting`);
    await page.waitForTimeout(800);

    const accountingTable = page.locator('.ant-table');
    await accountingTable.waitFor({ state: 'visible' });

    // Kiểm tra các tag phương thức có icon AntD
    const cashTags = page.locator('.ant-table .ant-tag:has-text("Tiền mặt")');
    const cashCount = await cashTags.count();
    console.log(`  👉 Số dòng có tag Tiền mặt: ${cashCount}`);
    if (cashCount > 0) {
      const hasDollarIcon = await cashTags.first().locator('.anticon-dollar').isVisible();
      console.log(`  👉 Tag "Tiền mặt" chứa icon DollarOutlined đơn sắc: ${hasDollarIcon ? '✅ Đúng' : '❌ Sai'}`);
      if (!hasDollarIcon) throw new Error('Tag Tiền mặt không có icon DollarOutlined!');
    }

    const transferTags = page.locator('.ant-table .ant-tag:has-text("Chuyển khoản QR")');
    const transferCount = await transferTags.count();
    console.log(`  👉 Số dòng có tag Chuyển khoản QR: ${transferCount}`);
    if (transferCount > 0) {
      const hasBankIcon = await transferTags.first().locator('.anticon-bank').isVisible();
      console.log(`  👉 Tag "Chuyển khoản QR" chứa icon BankOutlined đơn sắc: ${hasBankIcon ? '✅ Đúng' : '❌ Sai'}`);
      if (!hasBankIcon) throw new Error('Tag Chuyển khoản QR không có icon BankOutlined!');
    }

    // 3. Mở modal Lập Phiếu Thu / Chi và kiểm tra Select.Option
    console.log('\n[3/5] 📝 Mở Modal Lập Phiếu và kiểm tra Select Hình Thức...');
    await page.click('button:has-text("Lập Phiếu Chi")');
    await page.waitForTimeout(500);

    const modal = page.locator('.ant-modal');
    await modal.waitFor({ state: 'visible' });
    const modalText = await modal.innerText();
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    const hasModalEmoji = emojiRegex.test(modalText);
    console.log(`  👉 Modal Lập Phiếu hoàn toàn không chứa emoji: ${!hasModalEmoji ? '✅ Đúng' : '❌ Sai'}`);
    if (hasModalEmoji) throw new Error('Modal Lập Phiếu vẫn còn emoji!');

    await page.click('.ant-modal-close');
    await page.waitForTimeout(400);

    // 4. Kiểm tra Header ERP Padding & Alignment
    console.log('\n[4/5] 📐 Kiểm tra Header ERP Container & Padding phải...');
    const header = page.locator('header');
    const headerBox = await header.boundingBox();
    const avatar = header.locator('.ant-avatar');
    const avatarBox = await avatar.boundingBox();

    console.log(`  👉 Header: x=${headerBox.x.toFixed(1)}, width=${headerBox.width.toFixed(1)}px`);
    console.log(`  👉 Avatar: x=${avatarBox.x.toFixed(1)}, right=${(avatarBox.x + avatarBox.width).toFixed(1)}px`);

    // Khoảng cách từ Avatar tới mép phải header
    const rightMargin = (headerBox.x + headerBox.width) - (avatarBox.x + avatarBox.width);
    console.log(`  👉 Khoảng cách Avatar tới mép phải Viewport/Header: ${rightMargin.toFixed(1)}px (kỳ vọng >= 20px)`);
    if (rightMargin < 20) {
      throw new Error(`Avatar nằm quá sát mép phải (${rightMargin.toFixed(1)}px < 20px)!`);
    }
    console.log('  ✅ Header có khoảng cách đệm (padding) thoải mái và đồng bộ với Content.');

    // 5. Quét toàn bộ nội dung text trên các trang chính xác nhận 0 emoji
    console.log('\n[5/5] 🌐 Quét toàn diện các trang (/accounting, /dashboard, /pos, /users, /products)...');
    const testRoutes = ['/accounting', '/dashboard', '/products', '/users', '/pos'];
    for (const route of testRoutes) {
      await page.goto(`${BASE_URL}${route}`);
      await page.waitForTimeout(600);
      const pageText = await page.innerText('body');
      const hasPageEmoji = emojiRegex.test(pageText);
      console.log(`  👉 Trang ${route}: 0 Emoji -> ${!hasPageEmoji ? '✅ Hoàn toàn sạch' : '❌ Còn Emoji'}`);
      if (hasPageEmoji) {
        throw new Error(`Trang ${route} vẫn còn emoji!`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎉 TẤT CẢ KỊCH BẢN KIỂM THỬ ICON ĐƠN SẮC & HEADER PADDING ĐỀU ĐẠT 100%!');
    console.log('='.repeat(70));
  } catch (err) {
    console.error('\n❌ KIỂM THỬ THẤT BẠI:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testAccountingIconsAndHeader();
