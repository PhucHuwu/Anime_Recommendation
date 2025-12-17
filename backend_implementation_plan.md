# Backend Implementation Plan - Anime Recommendation System

## Mục tiêu

Xây dựng phần backend cho hệ thống gợi ý phim Anime với khả năng:

-   Thu thập và xử lý dữ liệu từ Kaggle
-   Xây dựng và đánh giá các mô hình recommendation
-   Cung cấp API cho frontend
-   Lưu trữ dữ liệu trên MongoDB

---

## I. Cấu trúc thư mục Backend

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # Entry point Flask/FastAPI
│   ├── config.py               # Cấu hình database, settings
│   │
│   ├── data/                   # Module xử lý dữ liệu
│   │   ├── __init__.py
│   │   ├── collector.py        # Thu thập dữ liệu từ Kaggle
│   │   ├── cleaner.py          # Làm sạch dữ liệu
│   │   ├── vectorizer.py       # Vector hóa (TF-IDF, embeddings)
│   │   └── loader.py           # Load dữ liệu vào MongoDB
│   │
│   ├── models/                 # Các mô hình recommendation
│   │   ├── __init__.py
│   │   ├── base_model.py       # Base class cho các model
│   │   ├── content_based.py    # Content-based filtering
│   │   ├── item_based.py       # Item-based collaborative filtering
│   │   ├── user_based.py       # User-based collaborative filtering
│   │   └── hybrid.py           # Hybrid model
│   │
│   ├── evaluation/             # Đánh giá mô hình
│   │   ├── __init__.py
│   │   └── metrics.py          # RMSE, MAE, Precision@K, Recall@K
│   │
│   ├── api/                    # API endpoints
│   │   ├── __init__.py
│   │   ├── auth.py             # Xác thực user (login by user_id)
│   │   ├── recommendation.py   # API gợi ý
│   │   ├── anime.py            # API anime (search, detail)
│   │   ├── user.py             # API user profile
│   │   ├── admin.py            # API admin (retrain, statistics)
│   │   └── stats.py            # API thống kê
│   │
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   ├── recommendation_service.py
│   │   ├── user_service.py
│   │   └── model_service.py    # Quản lý model (train, compare)
│   │
│   ├── database/               # Database layer
│   │   ├── __init__.py
│   │   ├── mongodb.py          # MongoDB connection
│   │   └── schemas.py          # Document schemas
│   │
│   └── utils/                  # Tiện ích
│       ├── __init__.py
│       └── helpers.py
│
├── notebooks/                  # Jupyter notebooks cho phân tích
│   ├── data_exploration.ipynb
│   ├── data_visualization.ipynb
│   └── model_training.ipynb
│
├── data/                       # Raw và processed data
│   ├── raw/
│   │   ├── anime.csv
│   │   └── rating.csv
│   └── processed/
│
├── trained_models/             # Lưu các model đã train
│
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

---

## II. Chi tiết Implementation

### Giai đoạn 1: Thu thập và xử lý dữ liệu

#### 1.1 Thu thập dữ liệu (`data/collector.py`)

```python
# Chức năng:
- Download dataset từ Kaggle sử dụng kagglehub
- Hỗ trợ download bằng curl nếu không có API key
- Kiểm tra và verify file integrity
```

**Dependencies:**

-   kagglehub
-   requests

#### 1.2 Làm sạch dữ liệu (`data/cleaner.py`)

```python
# Chức năng:
- Xử lý missing values (fillna, dropna)
- Loại bỏ duplicate records
- Xử lý outliers (IQR method, z-score)
- Chuẩn hóa dữ liệu (normalize ratings to 0-1)
- Xử lý rating = -1 (watched but not rated)
```

**Dependencies:**

-   pandas
-   numpy
-   scipy

#### 1.3 Vector hóa (`data/vectorizer.py`)

```python
# Chức năng:
- TF-IDF vectorization cho genre
- Word embeddings cho anime name
- Feature engineering (type encoding, episode normalization)
```

**Dependencies:**

-   scikit-learn (TfidfVectorizer)
-   gensim (Word2Vec)

#### 1.4 Load vào MongoDB (`data/loader.py`)

```python
# Collections:
- animes: Thông tin anime
- ratings: Rating từ users
- users: Thông tin user
- user_history: Lịch sử xem/rating
```

---

### Giai đoạn 2: Xây dựng mô hình Recommendation

#### 2.1 Base Model (`models/base_model.py`)

```python
class BaseRecommender:
    def train(self, data): pass
    def predict(self, user_id, n_recommendations): pass
    def save(self, path): pass
    def load(self, path): pass
```

#### 2.2 Content-Based Filtering (`models/content_based.py`)

```python
# Thuật toán:
- Sử dụng TF-IDF vectors của genre
- Cosine similarity giữa các anime
- Gợi ý anime tương tự dựa trên anime user đã thích
```

#### 2.3 Item-Based Collaborative Filtering (`models/item_based.py`)

```python
# Thuật toán:
- Xây dựng item-item similarity matrix
- Sử dụng sparse matrix để tiết kiệm bộ nhớ
- Pearson correlation hoặc Cosine similarity
```

#### 2.4 User-Based Collaborative Filtering (`models/user_based.py`)

```python
# Thuật toán:
- Xây dựng user-user similarity matrix
- KNN để tìm k users tương tự
- Weighted average của ratings
```

#### 2.5 Hybrid Model (`models/hybrid.py`)

```python
# Thuật toán:
- Kết hợp Content-Based và Collaborative Filtering
- Weighted hybrid hoặc Switching hybrid
- Neural network (optional) để learn weights
```

---

### Giai đoạn 3: Đánh giá mô hình (`evaluation/metrics.py`)

```python
# Metrics:
- RMSE (Root Mean Square Error)
- MAE (Mean Absolute Error)
- Precision@K
- Recall@K
- F1@K
- NDCG (Normalized Discounted Cumulative Gain)
- Coverage (% items có thể recommend)
```

**Lưu ý:**

-   Sử dụng sparse matrix (scipy.sparse) để tránh tràn bộ nhớ
-   K-fold cross validation
-   Train/Test split đảm bảo không cold start

---

### Giai đoạn 4: API Endpoints

#### 4.1 Authentication (`api/auth.py`)

| Endpoint      | Method | Mô tả                                   |
| ------------- | ------ | --------------------------------------- |
| `/api/login`  | POST   | Login bằng user_id (không cần password) |
| `/api/logout` | POST   | Logout                                  |

#### 4.2 Recommendation (`api/recommendation.py`)

| Endpoint                                  | Method | Mô tả                        |
| ----------------------------------------- | ------ | ---------------------------- |
| `/api/recommendations`                    | GET    | Lấy danh sách gợi ý cho user |
| `/api/recommendations/similar/{anime_id}` | GET    | Anime tương tự               |
| `/api/recommendations/realtime`           | GET    | Gợi ý realtime               |

#### 4.3 Anime (`api/anime.py`)

| Endpoint            | Method | Mô tả                        |
| ------------------- | ------ | ---------------------------- |
| `/api/anime`        | GET    | Danh sách anime (pagination) |
| `/api/anime/{id}`   | GET    | Chi tiết anime               |
| `/api/anime/search` | GET    | Tìm kiếm anime               |
| `/api/anime/top`    | GET    | Top anime theo rating        |

#### 4.4 User (`api/user.py`)

| Endpoint                 | Method | Mô tả               |
| ------------------------ | ------ | ------------------- |
| `/api/user/{id}/profile` | GET    | Thông tin user      |
| `/api/user/{id}/history` | GET    | Lịch sử xem         |
| `/api/user/{id}/ratings` | GET    | Danh sách đã rating |
| `/api/user/{id}/rate`    | POST   | Rating anime        |

#### 4.5 Admin (`api/admin.py`)

| Endpoint                    | Method | Mô tả                 |
| --------------------------- | ------ | --------------------- |
| `/api/admin/models`         | GET    | Danh sách models      |
| `/api/admin/models/retrain` | POST   | Retrain model         |
| `/api/admin/models/compare` | GET    | So sánh performance   |
| `/api/admin/stats`          | GET    | Thống kê hệ thống     |
| `/api/admin/visualization`  | GET    | Dữ liệu trực quan hóa |

---

### Giai đoạn 5: Database Schema (MongoDB)

#### Collection: `animes`

```json
{
  "_id": ObjectId,
  "anime_id": int,
  "name": string,
  "genre": [string],
  "type": string,
  "episodes": int,
  "rating": float,
  "members": int,
  "genre_vector": [float],      // TF-IDF vector
  "embedding": [float]          // Semantic embedding
}
```

#### Collection: `ratings`

```json
{
  "_id": ObjectId,
  "user_id": int,
  "anime_id": int,
  "rating": int,
  "timestamp": datetime
}
```

#### Collection: `users`

```json
{
  "_id": ObjectId,
  "user_id": int,
  "created_at": datetime,
  "last_login": datetime,
  "preferences": object
}
```

#### Collection: `user_history`

```json
{
  "_id": ObjectId,
  "user_id": int,
  "anime_id": int,
  "action": string,           // "view", "rate", "search"
  "timestamp": datetime,
  "details": object
}
```

#### Collection: `model_metrics`

```json
{
  "_id": ObjectId,
  "model_name": string,
  "trained_at": datetime,
  "metrics": {
    "rmse": float,
    "mae": float,
    "precision_k": float,
    "recall_k": float
  },
  "config": object
}
```

---

## III. Dependencies (requirements.txt)

```
# Web Framework
flask==3.0.0
# hoặc fastapi==0.104.0
# uvicorn==0.24.0

# Database
pymongo==4.6.0

# Data Processing
pandas==2.1.0
numpy==1.26.0
scipy==1.11.0

# Machine Learning
scikit-learn==1.3.0
surprise==0.1      # Recommendation library

# NLP & Embeddings
gensim==4.3.0

# Visualization (cho notebooks)
matplotlib==3.8.0
seaborn==0.13.0
plotly==5.18.0

# Data Collection
kagglehub==0.2.0

# Utils
python-dotenv==1.0.0
```

---

## IV. Verification Plan

### Automated Tests

```bash
# Unit tests
pytest tests/unit/

# Integration tests
pytest tests/integration/

# Test API endpoints
pytest tests/api/
```

### Manual Testing

1. **Data Pipeline:**

    - Download dataset thành công
    - Dữ liệu được làm sạch đúng
    - Load vào MongoDB thành công

2. **Model Training:**

    - Các model train không bị lỗi
    - Metrics nằm trong khoảng hợp lý

3. **API Testing:**
    - Postman collection test tất cả endpoints
    - Response time < 500ms cho recommendation

---

## V. Timeline ước tính

| Giai đoạn                  | Thời gian      |
| -------------------------- | -------------- |
| Data Collection & Cleaning | 2-3 ngày       |
| Model Development          | 5-7 ngày       |
| API Development            | 3-4 ngày       |
| Testing & Optimization     | 2-3 ngày       |
| **Tổng cộng**              | **12-17 ngày** |
