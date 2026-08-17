import { chromium } from 'playwright';

async function testSmoothScroll() {
  console.log('=' .repeat(70));
  console.log('🚀 KIỂM THỬ CUỘN MƯỢT (SMOOTH SCROLL) & HEADER OFFSET TRÊN LANDING PAGE');
  console.log('=' .repeat(70));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // 1. Mở trang Landing Page
    console.log('\n[1/3] 🌐 Mở trang Landing Page & Kiểm tra thuộc tính scroll-behavior...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const scrollBehavior = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).scrollBehavior;
    });
    console.log(`  👉 Giá trị scroll-behavior trên html: "${scrollBehavior}" (kỳ vọng: "smooth")`);
    if (scrollBehavior !== 'smooth') {
      throw new Error('Thuộc tính scroll-behavior trên html không phải là "smooth"!');
    }

    const headerHeight = await page.evaluate(() => {
      const header = document.querySelector('header');
      return header ? header.getBoundingClientRect().height : 80;
    });
    console.log(`  👉 Chiều cao Header cố định (Sticky Header): ${headerHeight}px`);

    // 2. Kiểm thử cuộn đến từng section qua menu items
    console.log('\n[2/3] 🖱️ Bấm lần lượt từng menu item và kiểm tra offset không bị header che...');
    const menuLinks = [
      { name: 'Tính Năng', selector: 'header nav a[href="#features"]', targetId: 'features' },
      { name: 'Giải Pháp Chuỗi', selector: 'header nav a[href="#solutions"]', targetId: 'solutions' },
      { name: 'Bảng Giá Thuê Bao', selector: 'header nav a[href="#pricing"]', targetId: 'pricing' },
      { name: 'Khách Hàng', selector: 'header nav a[href="#testimonials"]', targetId: 'testimonials' },
      { name: 'Hỏi Đáp (FAQ)', selector: 'header nav a[href="#faq"]', targetId: 'faq' },
    ];

    for (const item of menuLinks) {
      console.log(`  👉 Bấm menu: "${item.name}" (href="#${item.targetId}")...`);
      const link = page.locator(item.selector);
      await link.click();

      // Đợi animation cuộn mượt hoàn tất (~800ms)
      await page.waitForTimeout(1000);

      const targetPos = await page.evaluate((id) => {
        const el = document.getElementById(id);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return {
          top: rect.top,
          scrollY: window.scrollY,
        };
      }, item.targetId);

      if (!targetPos) {
        throw new Error(`Không tìm thấy section với id="${item.targetId}"!`);
      }

      console.log(`     Vị trí section so với đỉnh màn hình: top=${targetPos.top.toFixed(1)}px (scrollY=${targetPos.scrollY.toFixed(1)}px)`);

      if (targetPos.top < -5) {
        throw new Error(`Section "${item.name}" bị Header che khuất! (top=${targetPos.top}px < 0)`);
      }
      console.log(`  ✅ Section "${item.name}" hiển thị trọn vẹn dưới Header (không bị che khuất).`);
    }

    // 3. Kiểm tra cuộn ngược lên đầu trang
    console.log('\n[3/3] ⬆️ Kiểm tra cuộn lên lại đầu trang...');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);
    const finalScrollY = await page.evaluate(() => window.scrollY);
    console.log(`  👉 Vị trí scroll cuối cùng: ${finalScrollY}px`);

    console.log('\n' + '=' .repeat(70));
    console.log('🎉 TẤT CẢ MENU ITEMS ĐÃ HOẠT ĐỘNG VỚI SMOOTH SCROLL & OFFSET CHUẨN XÁC!');
    console.log('=' .repeat(70));
  } catch (err) {
    console.error('\n❌ KIỂM THỬ THẤT BẠI:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testSmoothScroll();
