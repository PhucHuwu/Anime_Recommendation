# Anime Recommendation System

A full-stack anime recommendation system using collaborative filtering and machine learning techniques.

## Tech Stack

-   **Frontend**: Next.js 16, React 19, TypeScript, TailwindCSS
-   **Backend**: FastAPI, Python 3.10+
-   **Database**: MongoDB
-   **ML Models**: User-Based CF, Item-Based CF, Neural CF, Hybrid

## Prerequisites

Before you begin, ensure you have the following installed:

-   [Node.js](https://nodejs.org/) (v18 or higher)
-   [Python](https://www.python.org/) (v3.10 or higher)
-   [MongoDB](https://www.mongodb.com/try/download/community) (v6.0 or higher)
-   [Git](https://git-scm.com/)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Anime_Recommendation.git
cd Anime_Recommendation
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file and configure
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
MONGODB_URL=mongodb://localhost:27017
MONGODB_DATABASE=anime_recommendation_db
HOST=0.0.0.0
PORT=8000
DEBUG=True
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

### 4. Database Setup

1. Start MongoDB service
2. The database and collections will be created automatically on first run

### 5. Data Preparation

Ensure the following data files are present in `backend/data/raw/`:

-   `anime.csv` - Anime metadata
-   `rating.csv` - User ratings data

### 6. Train ML Models (Optional)

If trained models are not available, run:

```bash
cd backend
python train_models.py
```

This will train and save all recommendation models to `backend/trained_models/`.

## Running the Application

### Start Backend Server

```bash
cd backend
python run.py
```

The API will be available at `http://localhost:8000`

### Start Frontend Server

```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
Anime_Recommendation/
├── backend/
│   ├── app/                 # FastAPI application
│   ├── data/
│   │   └── raw/             # Raw data files (anime.csv, rating.csv)
│   ├── trained_models/      # Saved ML models
│   ├── requirements.txt     # Python dependencies
│   ├── run.py               # Entry point
│   └── train_models.py      # Model training script
├── frontend/
│   ├── app/                 # Next.js pages and components
│   ├── components/          # Reusable UI components
│   └── package.json         # Node.js dependencies
└── README.md
```

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

## License

This project is for educational purposes.
