# Anime Recommendation System - Backend

API backend cho hệ thống gợi ý phim Anime sử dụng FastAPI và MongoDB.

## Tính năng

-   **Thu thập dữ liệu**: Download dataset từ Kaggle
-   **Xử lý dữ liệu**: Làm sạch, chuẩn hóa và vector hóa
-   **4 Mô hình Recommendation**:
    -   Content-Based Filtering (TF-IDF trên genres)
    -   Item-Based Collaborative Filtering
    -   User-Based Collaborative Filtering
    -   Hybrid Model
-   **Đánh giá mô hình**: RMSE, MAE, Precision@K, Recall@K, NDCG
-   **RESTful API**: Đầy đủ endpoints cho frontend

## Cài đặt

### Yêu cầu

-   Python 3.10+
-   MongoDB (local hoặc cloud)

### Bước 1: Cài đặt dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Bước 2: Cấu hình

Copy và chỉnh sửa file environment:

```bash
cp .env.example .env
```

### Bước 3: Khởi động MongoDB

Đảm bảo MongoDB đang chạy trên `localhost:27017` hoặc cập nhật `MONGODB_URL` trong `.env`.

### Bước 4: Download và load dữ liệu

**Phương pháp 1: Sử dụng kagglehub (khuyến nghị)**

```bash
# Cài kagglehub
pip install kagglehub

# Download dataset
python -m app.data.collector --method kagglehub
```

**Phương pháp 2: Sử dụng curl**

```bash
python -m app.data.collector --method curl
```

**Sau khi download, load vào MongoDB:**

```bash
python -m app.data.loader ./data/raw/anime.csv ./data/raw/rating.csv
```

### Bước 5: Chạy server

```bash
# Development
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Hoặc
python -m app.main
```

Server sẽ chạy tại: http://localhost:8000

## API Documentation

Sau khi chạy server, truy cập:

-   Swagger UI: http://localhost:8000/docs
-   ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication

-   `POST /api/login` - Login bằng user_id
-   `POST /api/logout` - Logout

### Anime

-   `GET /api/anime` - Danh sách anime (pagination, filters)
-   `GET /api/anime/search?q=` - Tìm kiếm anime
-   `GET /api/anime/top` - Top anime
-   `GET /api/anime/{anime_id}` - Chi tiết anime

### Recommendations

-   `GET /api/recommendations?user_id=` - Gợi ý cho user
-   `GET /api/recommendations/similar/{anime_id}` - Anime tương tự
-   `GET /api/recommendations/popular` - Anime phổ biến

### User

-   `GET /api/user/{user_id}/profile` - Profile user
-   `GET /api/user/{user_id}/ratings` - Lịch sử rating
-   `POST /api/user/{user_id}/rate` - Rate anime

### Admin

-   `GET /api/admin/stats` - Thống kê hệ thống
-   `GET /api/admin/models` - Danh sách models
-   `POST /api/admin/models/retrain` - Retrain models
-   `GET /api/admin/visualization` - Dữ liệu cho charts

## Cấu trúc thư mục

```
backend/
├── app/
│   ├── api/          # API endpoints
│   ├── data/         # Data processing
│   ├── database/     # MongoDB layer
│   ├── evaluation/   # Model metrics
│   ├── models/       # Recommendation models
│   ├── services/     # Business logic
│   ├── utils/        # Utilities
│   ├── config.py     # Configuration
│   └── main.py       # Entry point
├── data/             # Dataset files
├── trained_models/   # Saved models
└── requirements.txt
```

## License

MIT
