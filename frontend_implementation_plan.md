# Frontend Implementation Plan - Anime Recommendation System

## Mục tiêu

Xây dựng giao diện web cho hệ thống gợi ý phim Anime với:

-   Giao diện người dùng thân thiện
-   Trang Admin quản lý model và thống kê
-   Hiển thị gợi ý real-time
-   Trực quan hóa dữ liệu

---

## I. Cấu trúc thư mục Frontend

```
frontend/
├── static/
│   ├── css/
│   │   ├── main.css            # Styles chính
│   │   ├── components.css      # Styles cho components
│   │   ├── pages/
│   │   │   ├── home.css
│   │   │   ├── browse.css
│   │   │   ├── profile.css
│   │   │   └── admin.css
│   │   └── themes/
│   │       ├── light.css
│   │       └── dark.css
│   │
│   ├── js/
│   │   ├── main.js             # Entry point
│   │   ├── api.js              # API calls
│   │   ├── auth.js             # Authentication
│   │   ├── components/
│   │   │   ├── navbar.js
│   │   │   ├── sidebar.js
│   │   │   ├── anime-card.js
│   │   │   ├── rating-stars.js
│   │   │   ├── search-bar.js
│   │   │   └── charts.js
│   │   └── pages/
│   │       ├── home.js
│   │       ├── browse.js
│   │       ├── anime-detail.js
│   │       ├── profile.js
│   │       └── admin.js
│   │
│   └── images/
│       ├── logo.png
│       ├── placeholder.png
│       └── icons/
│
├── templates/
│   ├── base.html               # Base template
│   ├── components/
│   │   ├── navbar.html
│   │   ├── sidebar.html
│   │   ├── footer.html
│   │   ├── anime-card.html
│   │   └── pagination.html
│   │
│   ├── pages/
│   │   ├── home.html           # Trang chủ
│   │   ├── browse.html         # Tìm kiếm anime
│   │   ├── anime-detail.html   # Chi tiết anime
│   │   ├── profile.html        # Trang cá nhân
│   │   ├── login.html          # Đăng nhập
│   │   └── admin/
│   │       ├── dashboard.html
│   │       ├── statistics.html
│   │       └── models.html
│   │
│   └── errors/
│       ├── 404.html
│       └── 500.html
│
└── package.json                # (nếu dùng build tools)
```

---

## II. Chi tiết các trang

### 1. Trang Đăng nhập (`/login`)

**Thiết kế:**

-   Form đơn giản chỉ cần nhập `user_id`
-   Không yêu cầu mật khẩu
-   Nút "Đăng nhập" và link đến Admin

**Chức năng:**

```javascript
// Pseudocode
- Validate user_id (số nguyên hợp lệ)
- Gọi API /api/login
- Lưu session/token
- Redirect đến trang chủ
```

---

### 2. Trang chủ (`/` hoặc `/home`)

**Layout:**

```
┌──────────────────────────────────────────┐
│                 NAVBAR                    │
├──────────────────────────────────────────┤
│                                          │
│  🎯 GỢI Ý CHO BẠN                        │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐     │
│  │Card│ │Card│ │Card│ │Card│ │Card│     │
│  └────┘ └────┘ └────┘ └────┘ └────┘     │
│                                          │
│  🔥 TOP ANIME                            │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐     │
│  │Card│ │Card│ │Card│ │Card│ │Card│     │
│  └────┘ └────┘ └────┘ └────┘ └────┘     │
│                                          │
│  📺 THEO THỂ LOẠI                        │
│  [Action] [Romance] [Comedy] [Horror]    │
│                                          │
├──────────────────────────────────────────┤
│                 FOOTER                    │
└──────────────────────────────────────────┘
```

**Sections:**

1. **Hero Section**: Banner và search bar
2. **Gợi ý cho bạn**: Carousel anime recommendations (từ API `/api/recommendations`)
3. **Top Anime**: Anime có rating cao nhất
4. **Theo thể loại**: Quick links đến browse theo genre

---

### 3. Trang Browse/Tìm kiếm (`/browse` hoặc `/anime`)

**Layout:**

```
┌──────────────────────────────────────────┐
│                 NAVBAR                    │
├────────────┬─────────────────────────────┤
│            │                             │
│  SIDEBAR   │    ANIME GRID               │
│            │    ┌────┐ ┌────┐ ┌────┐    │
│ [Search]   │    │    │ │    │ │    │    │
│            │    └────┘ └────┘ └────┘    │
│ Filters:   │    ┌────┐ ┌────┐ ┌────┐    │
│ - Genre    │    │    │ │    │ │    │    │
│ - Type     │    └────┘ └────┘ └────┘    │
│ - Rating   │                             │
│ - Year     │    [Pagination]             │
│            │                             │
│ ──────────│─────────────────────────────│
│            │                             │
│ GỢI Ý     │                             │
│ ┌────┐    │                             │
│ │Mini│    │                             │
│ └────┘    │                             │
│            │                             │
├────────────┴─────────────────────────────┤
│                 FOOTER                    │
└──────────────────────────────────────────┘
```

**Chức năng:**

-   Search bar với autocomplete
-   Filters: Genre, Type (TV, Movie, OVA), Rating range, Sort by
-   Anime grid với pagination
-   Sidebar hiển thị gợi ý liên quan

---

### 4. Trang Chi tiết Anime (`/anime/{id}`)

**Layout:**

```
┌──────────────────────────────────────────┐
│                 NAVBAR                    │
├──────────────────────────────────────────┤
│                                          │
│  ┌─────────┐  ANIME TITLE                │
│  │         │  ⭐ 8.5 | TV | 24 eps       │
│  │  IMAGE  │  Genre: Action, Adventure   │
│  │         │                             │
│  │         │  [★★★★☆] Rate this anime   │
│  └─────────┘                             │
│                                          │
│  SYNOPSIS                                │
│  Lorem ipsum dolor sit amet...           │
│                                          │
│  ──────────────────────────────────────  │
│                                          │
│  🎯 ANIME TƯƠNG TỰ                       │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐     │
│  │Card│ │Card│ │Card│ │Card│ │Card│     │
│  └────┘ └────┘ └────┘ └────┘ └────┘     │
│                                          │
├──────────────────────────────────────────┤
│                 FOOTER                    │
└──────────────────────────────────────────┘
```

**Chức năng:**

-   Hiển thị thông tin chi tiết anime
-   Rating stars để user đánh giá
-   Section "Anime tương tự" từ recommendation API
-   Nút thêm vào watchlist

---

### 5. Trang Profile (`/profile` hoặc `/user/{id}`)

**Layout:**

```
┌──────────────────────────────────────────┐
│                 NAVBAR                    │
├──────────────────────────────────────────┤
│                                          │
│  👤 USER #{user_id}                      │
│  Member since: 2024-01-01                │
│                                          │
│  ┌─────────────────────────────────────┐ │
│  │         THỐNG KÊ CÁ NHÂN            │ │
│  │  📊 Pie Chart: Genres watched       │ │
│  │  📈 Bar Chart: Monthly activity     │ │
│  │  Anime đã xem: 150                  │ │
│  │  Rating trung bình: 7.5             │ │
│  └─────────────────────────────────────┘ │
│                                          │
│  ──────────────────────────────────────  │
│                                          │
│  📝 LỊCH SỬ ĐÁNH GIÁ                     │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐            │
│  │Card│ │Card│ │Card│ │Card│ ...        │
│  │ ⭐9│ │ ⭐8│ │ ⭐7│ │ ⭐10│           │
│  └────┘ └────┘ └────┘ └────┘            │
│                                          │
├──────────────────────────────────────────┤
│                 FOOTER                    │
└──────────────────────────────────────────┘
```

**Chức năng:**

-   Thống kê cá nhân với charts (Chart.js hoặc D3.js)
-   Lịch sử rating với filter và sort
-   Phân tích genre preferences

---

### 6. Trang Admin (`/admin`)

#### 6.1 Dashboard Overview

```
┌──────────────────────────────────────────┐
│  NAVBAR  │  👤 Admin                     │
├──────────┼───────────────────────────────┤
│          │                               │
│ SIDEBAR  │  📊 DASHBOARD                 │
│          │                               │
│ Overview │  ┌──────┐ ┌──────┐ ┌──────┐  │
│ ────────│  │Users │ │Anime │ │Rating│  │
│ Stats    │  │69,600│ │12,294│ │7.7M  │  │
│ Models   │  └──────┘ └──────┘ └──────┘  │
│          │                               │
│          │  ┌─────────────────────────┐  │
│          │  │   Line Chart: Activity  │  │
│          │  └─────────────────────────┘  │
│          │                               │
│          │  ┌───────────┐ ┌───────────┐  │
│          │  │ Pie Chart │ │ Bar Chart │  │
│          │  │  Genres   │ │   Types   │  │
│          │  └───────────┘ └───────────┘  │
│          │                               │
└──────────┴───────────────────────────────┘
```

#### 6.2 Tab Thống kê (`/admin/statistics`)

**Visualizations:**

1. **Phân bố Rating**: Histogram
2. **Top Anime by Rating**: Bar chart (horizontal)
3. **Top Anime by Members**: Bar chart
4. **Genre Distribution**: Pie chart / Treemap
5. **Type Distribution**: Donut chart
6. **Rating Heatmap**: User-Anime matrix (sample)
7. **Activity Timeline**: Line chart

#### 6.3 Tab Quản lý Model (`/admin/models`)

```
┌──────────────────────────────────────────┐
│  🤖 QUẢN LÝ MÔ HÌNH                      │
├──────────────────────────────────────────┤
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ Model          │ Status │ Metrics  │  │
│  ├────────────────┼────────┼──────────┤  │
│  │ Content-Based  │ Active │ RMSE:0.9 │  │
│  │ Item-Based CF  │ Active │ RMSE:0.85│  │
│  │ User-Based CF  │ Active │ RMSE:0.88│  │
│  │ Hybrid         │ Active │ RMSE:0.82│  │
│  └────────────────────────────────────┘  │
│                                          │
│  [Retrain All] [Compare Models]          │
│                                          │
│  ──────────────────────────────────────  │
│                                          │
│  📈 MODEL COMPARISON                     │
│  ┌─────────────────────────────────────┐ │
│  │  Radar Chart / Bar Chart            │ │
│  │  RMSE | MAE | Precision | Recall    │ │
│  └─────────────────────────────────────┘ │
│                                          │
└──────────────────────────────────────────┘
```

**Chức năng:**

-   Danh sách models với metrics
-   Nút Retrain từng model
-   So sánh performance visual
-   Training history

---

## III. Components

### 3.1 Navbar (`components/navbar.html`)

```html
<!-- Chức năng -->
- Logo + tên ứng dụng - Search bar (redirect to /browse) - Navigation links: Home, Browse, Profile, Admin - User info + Logout button
```

### 3.2 Anime Card (`components/anime-card.html`)

```html
<!-- Props -->
- anime_id - name - image_url - rating - genres - type

<!-- Features -->
- Hover effect với thông tin thêm - Click để xem chi tiết - Quick rating stars
```

### 3.3 Rating Stars (`components/rating-stars.js`)

```javascript
// Chức năng
- Interactive 1-10 stars
- Hiển thị rating hiện tại
- Submit rating qua API
- Loading state khi submit
```

### 3.4 Sidebar Recommendations (`components/sidebar.js`)

```javascript
// Chức năng
- Hiển thị 5-10 anime gợi ý
- Mini cards format
- Real-time update khi browse
```

### 3.5 Charts Component (`components/charts.js`)

```javascript
// Sử dụng Chart.js hoặc D3.js
// Types:
- Line Chart
- Bar Chart
- Pie / Donut Chart
- Radar Chart
- Histogram
- Heatmap
```

---

## IV. API Integration (`js/api.js`)

```javascript
const API = {
    // Auth
    login: (userId) => fetch("/api/login", { method: "POST", body: { user_id: userId } }),
    logout: () => fetch("/api/logout", { method: "POST" }),

    // Recommendations
    getRecommendations: (userId, n) => fetch(`/api/recommendations?user_id=${userId}&n=${n}`),
    getSimilarAnime: (animeId) => fetch(`/api/recommendations/similar/${animeId}`),

    // Anime
    getAnimeList: (page, filters) => fetch(`/api/anime?page=${page}&${new URLSearchParams(filters)}`),
    getAnimeDetail: (id) => fetch(`/api/anime/${id}`),
    searchAnime: (query) => fetch(`/api/anime/search?q=${query}`),
    getTopAnime: (n) => fetch(`/api/anime/top?n=${n}`),

    // User
    getUserProfile: (userId) => fetch(`/api/user/${userId}/profile`),
    getUserHistory: (userId) => fetch(`/api/user/${userId}/history`),
    rateAnime: (userId, animeId, rating) =>
        fetch("/api/user/rate", {
            method: "POST",
            body: { user_id: userId, anime_id: animeId, rating },
        }),

    // Admin
    getModelList: () => fetch("/api/admin/models"),
    retrainModel: (modelName) => fetch("/api/admin/models/retrain", { method: "POST", body: { model: modelName } }),
    compareModels: () => fetch("/api/admin/models/compare"),
    getStats: () => fetch("/api/admin/stats"),
    getVisualizationData: () => fetch("/api/admin/visualization"),
};
```

---

## V. Styling Guidelines

### Color Palette

```css
:root {
    /* Primary */
    --primary-color: #6c5ce7; /* Purple */
    --primary-light: #a29bfe;
    --primary-dark: #5b4bc7;

    /* Secondary */
    --secondary-color: #00cec9; /* Teal */

    /* Accent */
    --accent-color: #fd79a8; /* Pink */

    /* Neutrals */
    --bg-dark: #1a1a2e;
    --bg-card: #16213e;
    --text-primary: #ffffff;
    --text-secondary: #b2bec3;

    /* Status */
    --success: #00b894;
    --warning: #fdcb6e;
    --error: #d63031;
}
```

### Typography

```css
/* Fonts */
--font-primary: "Inter", sans-serif;
--font-display: "Poppins", sans-serif;

/* Sizes */
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 2rem;
```

### Design Principles

1. **Dark Theme**: Phù hợp với nội dung anime
2. **Card-based Layout**: Dễ scan và browse
3. **Micro-interactions**: Hover effects, transitions
4. **Responsive**: Mobile-first approach
5. **Accessibility**: Proper contrast, focus states

---

## VI. Dependencies

### CSS

-   **Normalize.css**: Reset styles
-   **Font Awesome** hoặc **Heroicons**: Icons

### JavaScript

-   **Chart.js**: Visualization
-   **Swiper.js**: Carousels (optional)
-   **Vanilla JS**: Core functionality (không framework)

### Fonts

-   **Google Fonts**: Inter, Poppins

---

## VII. Responsive Breakpoints

```css
/* Mobile first */
@media (min-width: 576px) {
    /* Small devices */
}
@media (min-width: 768px) {
    /* Tablets */
}
@media (min-width: 992px) {
    /* Desktops */
}
@media (min-width: 1200px) {
    /* Large desktops */
}
```

---

## VIII. Verification Plan

### Browser Testing

1. **Functionality:**

    - Login flow hoạt động
    - Search và filter đúng
    - Rating submit thành công
    - Charts render đúng dữ liệu

2. **Responsive:**

    - Test trên các kích thước màn hình
    - Menu mobile hoạt động

3. **Performance:**
    - Page load < 3s
    - Smooth animations (60fps)

### Manual Testing Checklist

-   [ ] Login với user_id hợp lệ
-   [ ] Trang chủ hiển thị recommendations
-   [ ] Search anime functioning
-   [ ] Filter by genre, type, rating
-   [ ] Rate anime và verify update
-   [ ] Admin: View statistics charts
-   [ ] Admin: Retrain model trigger
-   [ ] Admin: Compare models display

---

## IX. Timeline ước tính

| Component                       | Thời gian      |
| ------------------------------- | -------------- |
| Base template + Navbar + Footer | 1 ngày         |
| Trang Login                     | 0.5 ngày       |
| Trang Home                      | 2 ngày         |
| Trang Browse + Anime Detail     | 2-3 ngày       |
| Trang Profile                   | 1.5 ngày       |
| Trang Admin (Stats + Models)    | 3-4 ngày       |
| Charts Integration              | 2 ngày         |
| Responsive + Polish             | 2 ngày         |
| **Tổng cộng**                   | **14-16 ngày** |

---

## X. Notes

1. **Template Engine**: Sử dụng Jinja2 (Flask) cho server-side rendering
2. **Realtime**: Có thể dùng WebSocket cho real-time recommendations
3. **Image Handling**: Cần proxy hoặc cache anime images từ MyAnimeList
4. **SEO**: Meta tags, proper heading structure
5. **Error Handling**: Graceful degradation khi API fail
