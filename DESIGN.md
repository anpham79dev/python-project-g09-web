# Design System: Artisan Logic (Bakery Management SaaS)

> **Source:** Extracted from Google Stitch Project **Bakery Management SaaS Dashboard** (`projects/6452069880749017672`)  
> **Target Platform:** Desktop B2B Web Application / Point of Sale (POS) & Operational Dashboard  
> **Design Archetype:** Corporate Modern Minimalist / High-Utility B2B Operations  
> **Supported Locales:** English & Vietnamese (Full Vietnamese diacritics support)

---

## 1. Executive Summary & Brand Principles

The **Artisan Logic** design system is built specifically for bakery management SaaS and high-velocity point-of-sale operations. It prioritizes data legibility, fast input throughput, and absolute operational reliability.

### Core Tenets
1. **Precision & High Utility**: Optimized for busy counter staff and managers. Dense layouts, clear visual hierarchy, and instant feedback.
2. **Minimalist Surface Strategy**: Pure white content surfaces (`#FFFFFF`) layered over subtle cool-gray canvas backgrounds (`#F8F9FA` / `#F9F9FF`).
3. **No Decorative Noise**: Avoids heavy gradients, glow effects, or glassmorphism. Structural depth is communicated via subtle 1px borders (`#E5E7EB`) and tonal contrast.
4. **Purposeful Emerald Primary**: Emerald Green (`#10B981` / `#006C49`) is reserved for primary actions, active states, and positive status indications.
5. **Bilingual Typography Harmony**: Dual support for **Inter** (technical, compact metrics) and **Be Vietnam Pro** (elegant, readable Vietnamese typography).

---

## 2. Color Palette & Token Architecture

The color system uses functional semantic tokens aligned with Material 3 & Tailwind CSS conventions.

### 2.1 Brand & Primary Colors
| Token Name | Hex Code | Tailwind Class | Semantic Usage |
| :--- | :--- | :--- | :--- |
| `primary` | `#006C49` / `#005136` | `bg-primary`, `text-primary` | Brand accents, high-contrast text, dark primary |
| `primary-container` | `#10B981` | `bg-primary-container` | Primary action buttons, active navigation items |
| `on-primary` | `#FFFFFF` | `text-on-primary` | Text/icons on primary button backgrounds |
| `primary-fixed` | `#9DF4C8` / `#6FFBBE` | `bg-primary-fixed` | Light primary highlights, selection backgrounds |
| `inverse-primary` | `#4EDEA3` / `#81D8AD` | `text-inverse-primary` | Dark mode primary accent, active icon states |

### 2.2 Neutral & Surface Tonal Palette
| Token Name | Hex Code | Tailwind Class | Semantic Usage |
| :--- | :--- | :--- | :--- |
| `surface-container-lowest` | `#FFFFFF` | `bg-surface-container-lowest` | Cards, table containers, modal bodies, input fields |
| `surface` / `background` | `#F8F9FA` / `#F9F9FF` | `bg-surface`, `bg-background` | Application canvas background, page wrapper |
| `surface-container-low` | `#F3F4F5` / `#F1F3FF` | `bg-surface-container-low` | Secondary button backgrounds, search inputs, tags |
| `surface-variant` | `#E1E3E4` / `#DCE2F7` | `bg-surface-variant` | Active item hover backgrounds, dividers |
| `border` / `outline-variant` | `#E5E7EB` / `#BEC9C0` | `border-border`, `border-outline-variant` | 1px card borders, table row dividers, input borders |
| `outline` | `#6C7A71` / `#6F7A72` | `border-outline`, `text-outline` | Form control outlines, inactive indicators |

### 2.3 Typography & Text Contrast
| Token Name | Hex Code | Tailwind Class | Semantic Usage |
| :--- | :--- | :--- | :--- |
| `text-main` / `on-surface` | `#111827` / `#191C1D` | `text-text-main`, `text-on-surface` | Primary headings, table text, input values |
| `secondary` | `#585F6C` / `#6B7280` | `text-secondary` | Secondary labels, table headers, breadcrumbs, helper text |
| `on-surface-variant` | `#3C4A42` / `#3F4943` | `text-on-surface-variant` | Subtitles, empty state descriptions, subtle metadata |
| `inverse-surface` | `#2E3132` / `#293040` | `bg-inverse-surface` | Tooltips, dark snackbars, floating contextual chips |

### 2.4 Status & Feedback Palette (Tint-on-Tint)
| Status | Background Token | Text Token | Tailwind Example | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Success / In Stock** | `#D1FAE5` (Emerald-100) | `#065F46` (Emerald-800) | `bg-emerald-100 text-emerald-800` | In stock, completed orders, active staff |
| **Warning / Low Stock** | `#FEF3C7` (Amber-100) | `#92400E` (Amber-800) | `bg-amber-100 text-amber-800` | Low inventory, pending approval |
| **Error / Cancelled** | `#FFDAD6` / `#FEE2E2` | `#93000A` / `#991B1B` | `bg-error-container text-error` | Out of stock, deleted, cancelled orders |
| **Info / Processing** | `#DCE2F3` (Blue-100) | `#1E293B` (Slate-800) | `bg-secondary-container text-secondary` | Processing, draft orders, shifts |

```css
/* CSS Custom Properties Reference */
:root {
  --color-primary: #006c49;
  --color-primary-container: #10b981;
  --color-on-primary: #ffffff;
  --color-background: #f8f9fa;
  --color-surface: #ffffff;
  --color-surface-hover: #f9fafb;
  --color-border: #e5e7eb;
  --color-text-main: #111827;
  --color-text-secondary: #6b7280;
  --color-error: #ba1a1a;
  --color-error-container: #ffdad6;
}
```

---

## 3. Typography System

The application employs two font families:
- **`Be Vietnam Pro`** (Primary UI Font): Optimized for Vietnamese diacritics and warm, soft modern corporate interfaces.
- **`Inter`** (Alternative / Data-Dense Font): For numerical tables, POS keys, and technical metrics.

```html
<!-- Google Fonts CDN Links -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Type Scale & Hierarchy Specs

| Semantic Token | Size | Line Height | Weight | Letter Spacing | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `h1` / `headline-lg` | `28px` (1.75rem) | `36px` / `42px` | 700 / 600 | `-0.02em` | Page Titles, Login Welcome Header |
| `h2` / `headline-md` | `24px` (1.50rem) | `32px` / `36px` | 600 | `-0.01em` | Section Headers, Modal Titles |
| `h3` | `18px`–`20px` | `28px` / `30px` | 600 | `0` | Card Titles, POS Order Panel Header |
| `metric-lg` | `20px` (1.25rem) | `30px` | 600 | `0` | Primary KPI numbers (Revenue, Counts) |
| `metric-md` | `14px` (0.875rem)| `21px` | 500 | `0` | Sub-metrics, secondary counts |
| `table-header` | `14px` (0.875rem)| `20px`–`22px` | 600 | `0` | Table column headers |
| `table-data` / `body-md`| `14px` (0.875rem)| `20px`–`22px` | 400 | `0` | Table cells, form input text, paragraphs |
| `body-sm` | `12px` (0.75rem) | `18px` | 400 | `0` | Timestamps, secondary metadata, captions |
| `label-caps` / `label-sm`| `12px` (0.75rem) | `16px`–`18px` | 600 | `0.05em` | Form labels, category badges, uppercase tags |

---

## 4. Spacing, Grid & Layout System

### 4.1 Spacing Scale (4px Base Grid)
| Token | Pixels | Rem | Typical Application |
| :--- | :--- | :--- | :--- |
| `xs` / `base` | `4px` | `0.25rem` | Icon-to-text gap, badge internal padding |
| `sm` / `stack-sm` | `8px` | `0.5rem` | Button vertical padding, compact table cell padding |
| `md` / `stack-md` | `16px` | `1.0rem` | Form field spacing, card padding, standard gutters |
| `gutter` | `16px` | `1.0rem` | Grid gap between columns, action button spacing |
| `lg` / `stack-lg` | `24px` | `1.5rem` | Section spacing, metric card internal padding |
| `xl` | `32px` | `2.0rem` | Major module separation |
| `margin-page` | `32px` | `2.0rem` | Dashboard outer content container padding |

### 4.2 Layout Architecture
- **Top Navigation Bar**: Fixed at top, height `h-14` (56px) or `h-16` (64px), full-width, border-bottom `1px solid #E5E7EB`.
- **Page Container**: Max-width fluid container with `px-margin-page` (`px-8` / 32px) and `py-6`.
- **POS 2-Column Split Workspace**:
  - **Catalog Column (Left, ~65%)**: Search bar + category tab filter + 3 or 4-column responsive product card grid.
  - **Cart / Order Column (Right, ~35%, min 380px)**: Sticky sidebar containing live order items, customer select, totals summary, and checkout button.

---

## 5. Shape, Borders & Elevation

### 5.1 Border Radius Tokens
- `rounded-sm`: `2px` (0.125rem) — micro badges
- `rounded` / `rounded-DEFAULT`: `4px` (0.25rem) — table images, small inputs
- `rounded-lg`: `8px` (0.5rem) — standard buttons, form inputs, metric cards
- `rounded-xl`: `12px` (0.75rem) — modals, large content containers
- `rounded-full`: `9999px` — status badges, user avatars, pill category tabs

### 5.2 Elevation & Shadows
- **Flat Philosophy**: By default, panels and tables use `shadow-none` with a `1px solid #E5E7EB` border.
- **Floating Overlays (Modals / Dropdowns)**:
  - `shadow-[0_8px_30px_rgb(0,0,0,0.12)]` with backdrop blur/darkening overlay.

---

## 6. Iconography System

- **Icon Family**: Google Material Symbols Outlined
- **Class**: `material-symbols-outlined`
- **Standard Sizes**:
  - `18px` / `20px`: In-button icons, table action icons
  - `24px`: Top navigation, metric card headers
  - `32px`: Modal notification headers
  - `64px`: Empty state illustrations

```html
<!-- Example Material Symbols Usage -->
<span class="material-symbols-outlined text-[20px] text-secondary">payments</span>
```

---

## 7. Component Patterns & Reference Markup

### 7.1 Top Navigation Bar
A clean, minimal header providing global context, breadcrumbs/branding, and quick user actions.

```html
<header class="flex justify-between items-center px-margin-page h-16 w-full fixed top-0 z-50 bg-surface-container-lowest border-b border-surface-variant">
  <!-- Brand & Section -->
  <div class="flex items-center gap-6">
    <div class="flex items-center gap-2 font-semibold text-primary">
      <img src="/logo.svg" alt="Bakery Logo" class="w-8 h-8 object-contain"/>
      <span class="text-lg font-bold">Artisan Bakery</span>
    </div>
    <!-- Desktop Navigation Links -->
    <nav class="hidden md:flex items-center gap-6">
      <a href="/pos" class="text-primary font-medium border-b-2 border-primary-container pb-4 pt-4">Bán hàng (POS)</a>
      <a href="/products" class="text-secondary hover:text-text-main font-medium pb-4 pt-4">Sản phẩm</a>
      <a href="/orders" class="text-secondary hover:text-text-main font-medium pb-4 pt-4">Đơn hàng</a>
      <a href="/reports" class="text-secondary hover:text-text-main font-medium pb-4 pt-4">Báo cáo</a>
      <a href="/employees" class="text-secondary hover:text-text-main font-medium pb-4 pt-4">Nhân viên</a>
    </nav>
  </div>

  <!-- User Menu & Store Status -->
  <div class="flex items-center gap-4">
    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
      <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Ca sáng (07:00 - 15:00)
    </span>
    <div class="flex items-center gap-3 pl-4 border-l border-border">
      <img class="w-8 h-8 rounded-full object-cover border border-border" src="/avatar.jpg" alt="Thu Ngân"/>
      <span class="text-sm font-medium text-text-main hidden sm:inline">Nguyễn Văn A</span>
    </div>
  </div>
</header>
```

---

### 7.2 KPI Metric Stat Card
Used in reporting and dashboard views to highlight critical performance indicators.

```html
<div class="bg-surface-container-lowest border border-border p-6 rounded-lg flex flex-col gap-2">
  <div class="flex justify-between items-start">
    <span class="text-secondary font-medium text-xs uppercase tracking-wider">Doanh thu hôm nay</span>
    <span class="material-symbols-outlined text-secondary text-[20px]">payments</span>
  </div>
  <div class="flex items-baseline justify-between mt-1">
    <span class="text-2xl font-bold text-text-main">18.450.000 ₫</span>
    <span class="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
      ↑ +12.5%
    </span>
  </div>
  <p class="text-xs text-secondary mt-1">So với cùng kỳ hôm qua (16.400.000 ₫)</p>
</div>
```

---

### 7.3 Data Table
Optimized for inventory, staff, and order logs.

```html
<div class="bg-surface-container-lowest border border-border rounded-lg overflow-hidden">
  <table class="w-full text-left border-collapse">
    <thead>
      <tr class="bg-surface border-b border-border">
        <th class="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider w-16">Hình</th>
        <th class="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Tên sản phẩm</th>
        <th class="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Danh mục</th>
        <th class="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider text-right">Đơn giá</th>
        <th class="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider text-center">Tồn kho</th>
        <th class="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Trạng thái</th>
        <th class="px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider text-center w-24">Thao tác</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-border text-sm text-text-main">
      <tr class="hover:bg-surface transition-colors group">
        <td class="px-4 py-3">
          <img src="/croissant.jpg" alt="Bánh Croissant" class="w-10 h-10 rounded object-cover border border-border"/>
        </td>
        <td class="px-4 py-3 font-semibold text-text-main">Croissant Bơ Pháp</td>
        <td class="px-4 py-3 text-secondary">Bánh mì ngọt</td>
        <td class="px-4 py-3 text-right font-medium">35.000 ₫</td>
        <td class="px-4 py-3 text-center font-medium">48</td>
        <td class="px-4 py-3">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            Còn hàng
          </span>
        </td>
        <td class="px-4 py-3 text-center">
          <div class="flex items-center justify-center gap-1">
            <button class="p-1.5 text-secondary hover:text-primary rounded hover:bg-surface-variant transition-colors" title="Chỉnh sửa">
              <span class="material-symbols-outlined text-[18px]">edit</span>
            </button>
            <button class="p-1.5 text-secondary hover:text-error rounded hover:bg-error-container transition-colors" title="Xóa">
              <span class="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

---

### 7.4 Form Input & Select Controls

```html
<!-- Text Input Group -->
<div class="flex flex-col gap-1.5">
  <label for="product-name" class="text-xs font-semibold uppercase tracking-wider text-text-main">
    Tên sản phẩm <span class="text-error">*</span>
  </label>
  <input 
    type="text" 
    id="product-name" 
    placeholder="Ví dụ: Bánh Mì Baguette Truyền Thống"
    class="w-full px-3.5 py-2 text-sm bg-surface-container-lowest border border-border rounded-lg text-text-main placeholder-secondary focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors"
  />
  <span class="text-xs text-secondary">Tên sẽ hiển thị trên hóa đơn và màn hình POS.</span>
</div>

<!-- Select Dropdown -->
<div class="flex flex-col gap-1.5">
  <label for="category" class="text-xs font-semibold uppercase tracking-wider text-text-main">
    Danh mục
  </label>
  <select 
    id="category"
    class="w-full px-3.5 py-2 text-sm bg-surface-container-lowest border border-border rounded-lg text-text-main focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors"
  >
    <option value="artisan">Bánh Mì Nghệ Nhân (Artisan)</option>
    <option value="sweet">Bánh Mì Ngọt & Pastry</option>
    <option value="cake">Bánh Kem & Sinh Nhật</option>
    <option value="drinks">Cà Phê & Đồ Uống</option>
  </select>
</div>
```

---

### 7.5 Button Hierarchy

```html
<!-- Primary Button (Emerald) -->
<button class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary-container text-on-primary font-semibold text-sm hover:opacity-90 active:scale-[0.99] transition-all shadow-sm">
  <span class="material-symbols-outlined text-[18px]">add</span>
  Thêm sản phẩm mới
</button>

<!-- Secondary Button (Outline / White) -->
<button class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-surface-container-lowest border border-border text-text-main font-semibold text-sm hover:bg-surface transition-colors">
  <span class="material-symbols-outlined text-[18px]">tune</span>
  Bộ lọc nâng cao
</button>

<!-- Destructive / Danger Button -->
<button class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-error text-on-error font-semibold text-sm hover:opacity-90 transition-opacity">
  <span class="material-symbols-outlined text-[18px]">delete</span>
  Xác nhận xóa
</button>

<!-- Ghost Button -->
<button class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-primary hover:bg-emerald-50 rounded font-semibold text-sm transition-colors">
  <span class="material-symbols-outlined text-[18px]">add</span>
  Thêm ghi chú
</button>
```

---

### 7.6 POS (Point of Sale) Product Card

```html
<button class="flex flex-col text-left bg-surface-container-lowest border border-border rounded-lg overflow-hidden hover:border-primary-container hover:shadow-sm active:scale-[0.98] transition-all p-3 group">
  <img src="/sourdough.jpg" alt="Sourdough Loaf" class="w-full h-28 object-cover rounded mb-2.5"/>
  <span class="font-semibold text-sm text-text-main line-clamp-1 group-hover:text-primary">Sourdough Men Tự Nhiên</span>
  <span class="text-xs text-secondary mb-2">Loại 500g</span>
  <div class="flex items-center justify-between w-full mt-auto pt-2 border-t border-dashed border-border">
    <span class="text-sm font-bold text-primary">65.000 ₫</span>
    <span class="text-xs px-1.5 py-0.5 rounded bg-surface text-secondary font-medium">Kho: 14</span>
  </div>
</button>
```

---

### 7.7 Confirmation / Destructive Modal

```html
<!-- Modal Backdrop -->
<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
  <div class="relative bg-surface-container-lowest rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-border w-full max-w-md flex flex-col overflow-hidden">
    <!-- Body Content -->
    <div class="p-6 flex flex-col items-center text-center">
      <div class="w-14 h-14 rounded-full bg-error-container flex items-center justify-center mb-4 shrink-0">
        <span class="material-symbols-outlined text-error text-[30px]">warning</span>
      </div>
      <h2 class="text-lg font-bold text-text-main mb-1.5">Xác nhận xóa sản phẩm?</h2>
      <p class="text-sm text-secondary">
        Hành động này không thể hoàn tác. Mọi lịch sử liên quan đến sản phẩm này sẽ bị lưu trữ vĩnh viễn.
      </p>
    </div>
    <!-- Actions Footer -->
    <div class="px-6 py-4 bg-surface border-t border-border flex justify-end gap-3 w-full">
      <button type="button" class="px-4 py-2 border border-border rounded-lg bg-surface-container-lowest text-text-main font-semibold text-sm hover:bg-surface-variant transition-colors">
        Hủy bỏ
      </button>
      <button type="button" class="px-4 py-2 rounded-lg bg-error text-on-error font-semibold text-sm hover:opacity-90 transition-opacity">
        Xóa sản phẩm
      </button>
    </div>
  </div>
</div>
```

---

### 7.8 Empty State Card

```html
<div class="bg-surface-container-lowest rounded-lg border border-border p-10 flex flex-col items-center justify-center min-h-[360px] text-center">
  <div class="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-4">
    <span class="material-symbols-outlined text-secondary text-[36px]">search_off</span>
  </div>
  <h3 class="text-base font-semibold text-text-main mb-1">Không tìm thấy sản phẩm phù hợp</h3>
  <p class="text-sm text-secondary max-w-sm mb-5">
    Thử điều chỉnh bộ lọc, kiểm tra lại lỗi chính tả hoặc tìm kiếm bằng mã SKU khác.
  </p>
  <button class="px-4 py-2 rounded-lg bg-surface border border-border text-sm font-semibold text-text-main hover:bg-surface-variant transition-colors">
    Đặt lại bộ lọc
  </button>
</div>
```

---

## 8. Tailwind CSS Configuration Preset

To integrate this design system into any Tailwind project, paste the following configuration into `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{html,js,ts,jsx,tsx,vue,svelte}',
    './public/**/*.html'
  ],
  theme: {
    extend: {
      colors: {
        // Brand & Primary
        primary: '#006c49',
        'primary-container': '#10b981',
        'on-primary': '#ffffff',
        'primary-fixed': '#9df4c8',
        'inverse-primary': '#4edea3',
        
        // Neutral Surfaces
        background: '#f8f9fa',
        surface: '#f8f9fa',
        'surface-bright': '#f9f9ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f3f4f5',
        'surface-container': '#edeeef',
        'surface-container-high': '#e7e8e9',
        'surface-variant': '#e1e3e4',
        
        // Typography & Outlines
        'text-main': '#111827',
        'on-surface': '#191c1d',
        'on-surface-variant': '#3c4a42',
        secondary: '#585f6c',
        'secondary-container': '#dce2f3',
        border: '#e5e7eb',
        outline: '#6c7a71',
        'outline-variant': '#bec9c0',
        
        // Semantic Feedback
        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a'
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'Inter', 'system-ui', 'sans-serif'],
        vietnam: ['"Be Vietnam Pro"', 'sans-serif'],
        inter: ['Inter', 'sans-serif']
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'gutter': '16px',
        'lg': '24px',
        'xl': '32px',
        'margin-page': '32px'
      },
      borderRadius: {
        DEFAULT: '0.25rem', // 4px
        lg: '0.5rem',       // 8px
        xl: '0.75rem',      // 12px
        full: '9999px'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms')
  ]
};
```
