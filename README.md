# Anime Recommendation System

### 1. Clone Repository

```bash
git clone https://github.com/your-username/Anime_Recommendation.git
cd Anime_Recommendation
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env

# Download dataset
python -m app.data.collector --method curl

# Load dataset to mongodb
python -m app.data.loader ./data/raw/anime.csv ./data/raw/rating.csv
```
### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Database Setup

1. Start MongoDB service
2. The database and collections will be created automatically on first run

### 5. Data Preparation

Ensure the following data files are present in `backend/data/raw/`:

-   `anime.csv` - Anime metadata
-   `rating.csv` - User ratings data

### 6. Train ML Models

```bash
cd backend
python train_models.py
```
Or you can train model by notebook `backend/notebooks/train_models.ipynb`
```bash
cd backend
jupyter notebook notebooks/train_models.ipynb
```

This will train and save all recommendation models to `backend/trained_models/`.

## Running the Application

### Start Backend Server

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Start Frontend Server

```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:3000`

## API Documentation

Once the backend is running, access the interactive API documentation at:

-   Swagger UI: `http://localhost:8000/docs`
-   ReDoc: `http://localhost:8000/redoc`

## Troubleshooting

### MongoDB Connection Error

-   Ensure MongoDB service is running
-   Verify the `MONGODB_URL` in `.env` file

### Module Not Found Error

-   Ensure virtual environment is activated
-   Run `pip install -r requirements.txt` again

### Port Already in Use

-   Change the `PORT` in `.env` file for backend
-   Use `npm run dev -- -p 3001` for frontend
