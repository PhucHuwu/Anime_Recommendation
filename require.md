I. MÔ TẢ BÀI TOÁN
Bạn được giao nhiệm vụ xây dựng một hệ thống recommendation cho một nền tảng Gợi ý phim Anime

Hệ thống cần có khả năng:
1. Thu thập dữ liệu
2. Làm sạch dữ liệu
3. Trực quan hóa dữ liệu
4. Xây dựng mô hình recommendation
5. Hiển thị gợi ý cho người dùng
6. Gợi ý theo thời gian thực
7. Lưu lịch sử người dùng

II. YÊU CẦU & NHIỆM VỤ CHI TIẾT

1. Thu thập dữ liệu

Tải bộ dataset bằng kagglehub hoặc curl:
```
import kagglehub

# Download latest version
path = kagglehub.dataset_download("CooperUnion/anime-recommendations-database")

print("Path to dataset files:", path)
```
```
#!/bin/bash
curl -L -o ~/Downloads/anime-recommendations-database.zip\
  https://www.kaggle.com/api/v1/datasets/download/CooperUnion/anime-recommendations-database
```
Bộ dataset gồm 2 file:

- Anime.csv

    - anime_id - myanimelist.net's unique id identifying an anime.
    - name - full name of anime.
    - genre - comma separated list of genres for this anime.
    - type - movie, TV, OVA, etc.
    - episodes - how many episodes in this show. (1 if movie).
    - rating - average rating out of 10 for this anime.
    - members - number of community members that are in this anime's
"group".

- Rating.csv

    - user_id - non identifiable randomly generated user id.
    - anime_id - the anime that this user has rated.
    - rating - rating out of 10 this user has assigned (-1 if the user watched it but didn't assign a rating).

2. Làm sạch và chuẩn bị dữ liệu
- Missing values
- Chuẩn hóa dữ liệu
- Loại bỏ duplicate
- Xử lý outlier
- Vector hóa (TF-IDF, BOW, embeddings)
- Sau khi xử lý thì lưu trữ trên mongodb localhost

3. Phân tích & trực quan hóa dữ liệu
- Phân bố rating
- Tần suất nhóm sản phẩm
- Top items
- Heatmap, bar chart, histogram

4. Xây dựng hệ gợi ý
- Xây dựng 4 model: content-based, item-based, user-based, hybrid
- Chia tập dữ liệu thành train, test (đảm bảo không bị cold start)
- Sử dụng embeddings nâng cao

5. Đánh giá mô hình
- RMSE, MAE, Precision@K, Recall@K
- Sử dụng ma trận thưa để tránh tràn bộ nhớ

6. Giao diện hiển thị
- Web interface Flask
- User:
    - Đăng nhập bằng user_id (không đăng kí, không cần mật khẩu)
    - Mọi user đều có thể truy cập trang Admin
- Admin:
    - Quản lý model (retrain, xem so sánh model)
    - Xem thống kê
- Các trang yêu cầu:
    - Trang chủ: Danh sách gợi ý, Top Anime
    - Trang Anime: Tìm kiếm phim, danh sách gợi ý đặt ở sidebar
    - Trang Profile: Thống kê cá nhân
    - Trang Admin: Tab thống kê (trực quan hóa dữ liệu database), tab quản lý model