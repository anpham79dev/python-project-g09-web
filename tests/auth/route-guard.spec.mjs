import { chromium } from 'playwright';

async function runRouteGuardTests() {
  console.log('=' .repeat(75));
  console.log('🛡️  KIỂM THỬ TỰ ĐỘNG BẢO VỆ ROUTE (ZERO-LEAKAGE HYBRID ROUTE GUARD)');
  console.log('=' .repeat(75));

  const browser = await chromium.launch({ headless: true });
  
  try {
    // -------------------------------------------------------------------------
    // KỊCH BẢN 1: CHƯA ĐĂNG NHẬP TRUY CẬP TRỰC TIẾP VÀO ROUTE BẢO VỆ
    // -------------------------------------------------------------------------
    console.log('\n[Kịch bản 1/3] 🚫 Kiểm thử Người dùng Chưa Đăng nhập truy cập các Route bảo vệ...');
    const guestContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const guestPage = await guestContext.newPage();

    // 1.1 Thử vào trực tiếp /pos
    console.log('  👉 1.1 Truy cập trực tiếp http://localhost:3000/pos...');
    await guestPage.goto('http://localhost:3000/pos', { waitUntil: 'domcontentloaded' });
    await guestPage.waitForTimeout(600);

    // Xác nhận URL bị điều hướng về /login
    const currentUrl1 = guestPage.url();
    console.log(`     URL hiện tại: ${currentUrl1}`);
    if (!currentUrl1.includes('/login')) {
      throw new Error(`Kỳ vọng redirect về /login nhưng URL hiện tại là: ${currentUrl1}`);
    }

    // Xác nhận KHÔNG có bất kỳ phần tử nào của trang POS bị lọt ra
    const posCheckoutBtn = await guestPage.locator('button:has-text("Thanh toán")').count();
    if (posCheckoutBtn > 0) {
      throw new Error('CẢNH BÁO RÒ RỈ: Nút thanh toán POS đã bị render trước khi chặn!');
    }
    console.log('     ✅ 0% nội dung trang POS bị render hoặc rò rỉ.');

    // Xác nhận Toast thông báo Ant Design xuất hiện
    const toastUnauth1 = await guestPage.locator('.ant-message-notice:has-text("Vui lòng đăng nhập để tiếp tục")').first();
    await toastUnauth1.waitFor({ state: 'visible', timeout: 5000 });
    console.log('     ✅ Toast Ant Design thông báo chuẩn: "Vui lòng đăng nhập để tiếp tục".');

    // 1.2 Thử vào trực tiếp /dashboard
    console.log('  👉 1.2 Truy cập trực tiếp http://localhost:3000/dashboard...');
    await guestPage.goto('http://localhost:3000/dashboard', { waitUntil: 'domcontentloaded' });
    await guestPage.waitForTimeout(600);
    const currentUrl2 = guestPage.url();
    if (!currentUrl2.includes('/login')) {
      throw new Error(`Kỳ vọng redirect về /login nhưng URL hiện tại là: ${currentUrl2}`);
    }
    const dashboardCards = await guestPage.locator('.ant-card-head-title').count();
    if (dashboardCards > 0) {
      throw new Error('CẢNH BÁO RÒ RỈ: Thẻ Dashboard đã bị render trước khi chặn!');
    }
    console.log('     ✅ 0% nội dung Dashboard bị render khi chưa đăng nhập.');

    // 1.3 Thử vào trực tiếp /products
    console.log('  👉 1.3 Truy cập trực tiếp http://localhost:3000/products...');
    await guestPage.goto('http://localhost:3000/products', { waitUntil: 'domcontentloaded' });
    await guestPage.waitForTimeout(600);
    const currentUrl3 = guestPage.url();
    if (!currentUrl3.includes('/login')) {
      throw new Error(`Kỳ vọng redirect về /login nhưng URL hiện tại là: ${currentUrl3}`);
    }
    console.log('     ✅ Chặn truy cập /products thành công và chuyển hướng về /login.');
    await guestContext.close();

    // -------------------------------------------------------------------------
    // KỊCH BẢN 2: TÀI KHOẢN STAFF (THU NGÂN) CỐ TRUY CẬP ROUTE DÀNH CHO ADMIN
    // -------------------------------------------------------------------------
    console.log('\n[Kịch bản 2/3] 🛑 Kiểm thử Tài khoản Staff cố truy cập các Route Admin...');
    const staffContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const staffPage = await staffContext.newPage();

    // Đăng nhập tài khoản Staff
    await staffPage.goto('http://localhost:3000/login');
    await staffPage.click('button:has-text("Staff (Thu ngân)")');
    await staffPage.click('button:has-text("Đăng nhập hệ thống")');
    await staffPage.waitForURL('**/pos');
    console.log('  ✅ Đăng nhập Staff thành công và vào trang POS.');

    // 2.1 Staff cố vào /dashboard
    console.log('  👉 2.1 Staff gõ trực tiếp URL /dashboard...');
    await staffPage.goto('http://localhost:3000/dashboard', { waitUntil: 'domcontentloaded' });
    await staffPage.waitForTimeout(600);

    const staffRedirectUrl1 = staffPage.url();
    console.log(`     URL hiện tại của Staff: ${staffRedirectUrl1}`);
    if (!staffRedirectUrl1.includes('/pos')) {
      throw new Error(`Staff truy cập /dashboard không bị đẩy về /pos! URL: ${staffRedirectUrl1}`);
    }

    // Xác nhận Toast thông báo "Bạn không có quyền truy cập trang này"
    const toastForbidden1 = await staffPage.locator('.ant-message-notice:has-text("Bạn không có quyền truy cập trang này")').first();
    await toastForbidden1.waitFor({ state: 'visible', timeout: 5000 });
    console.log('     ✅ Toast Ant Design thông báo chuẩn: "Bạn không có quyền truy cập trang này".');

    // 2.2 Staff cố vào /products
    console.log('  👉 2.2 Staff gõ trực tiếp URL /products...');
    await staffPage.goto('http://localhost:3000/products', { waitUntil: 'domcontentloaded' });
    await staffPage.waitForTimeout(600);
    if (!staffPage.url().includes('/pos')) {
      throw new Error(`Staff truy cập /products không bị đẩy về /pos! URL: ${staffPage.url()}`);
    }
    console.log('     ✅ Staff bị chặn khỏi /products và an toàn chuyển về /pos.');

    // 2.3 Staff cố vào /accounting
    console.log('  👉 2.3 Staff gõ trực tiếp URL /accounting...');
    await staffPage.goto('http://localhost:3000/accounting', { waitUntil: 'domcontentloaded' });
    await staffPage.waitForTimeout(600);
    if (!staffPage.url().includes('/pos')) {
      throw new Error(`Staff truy cập /accounting không bị đẩy về /pos! URL: ${staffPage.url()}`);
    }
    console.log('     ✅ Staff bị chặn khỏi /accounting và an toàn chuyển về /pos.');

    // 2.4 Staff cố vào /users
    console.log('  👉 2.4 Staff gõ trực tiếp URL /users...');
    await staffPage.goto('http://localhost:3000/users', { waitUntil: 'domcontentloaded' });
    await staffPage.waitForTimeout(600);
    if (!staffPage.url().includes('/pos')) {
      throw new Error(`Staff truy cập /users không bị đẩy về /pos! URL: ${staffPage.url()}`);
    }
    console.log('     ✅ Staff bị chặn khỏi /users và an toàn chuyển về /pos.');
    await staffContext.close();

    // -------------------------------------------------------------------------
    // KỊCH BẢN 3: TÀI KHOẢN ADMIN TRUY CẬP ĐẦY ĐỦ VÀ HỢP LỆ
    // -------------------------------------------------------------------------
    console.log('\n[Kịch bản 3/3] 👑 Kiểm thử Tài khoản Admin truy cập các phân hệ được cấp phép...');
    const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const adminPage = await adminContext.newPage();

    await adminPage.goto('http://localhost:3000/login');
    await adminPage.click('button:has-text("Admin (Quản lý)")');
    await adminPage.click('button:has-text("Đăng nhập hệ thống")');
    await adminPage.waitForURL('**/dashboard');
    console.log('  ✅ Admin đăng nhập và hiển thị Dashboard chuẩn.');

    await adminPage.goto('http://localhost:3000/products');
    await adminPage.waitForSelector('.ant-table');
    console.log('  ✅ Admin truy cập /products thành công với bảng danh mục sản phẩm.');

    await adminPage.goto('http://localhost:3000/pos');
    await adminPage.waitForSelector('button:has-text("Thanh toán")');
    console.log('  ✅ Admin truy cập /pos thành công.');
    await adminContext.close();

    console.log('\n' + '=' .repeat(75));
    console.log('🎉 TẤT CẢ KỊCH BẢN KIỂM THỬ BẢO VỆ ROUTE ĐỀU ĐẠT 100% (ZERO LEAKAGE)!');
    console.log('=' .repeat(75));
  } catch (err) {
    console.error('\n❌ KIỂM THỬ ROUTE GUARD THẤT BẠI:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runRouteGuardTests();
