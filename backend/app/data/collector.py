"""
Data Collector Module.
Downloads anime dataset from Kaggle using kagglehub or curl.
Does NOT require Kaggle API credentials.
"""

import os
import subprocess
import zipfile
import shutil
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

DATASET_URL = "https://www.kaggle.com/api/v1/datasets/download/CooperUnion/anime-recommendations-database"
DATASET_NAME = "CooperUnion/anime-recommendations-database"


class DataCollector:
    """Handles downloading and extracting the anime dataset."""
    
    def __init__(self, data_dir: str = "./data/raw"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
    
    def download_with_kagglehub(self) -> bool:
        """
        Download dataset using kagglehub.
        No API key required - kagglehub handles authentication differently.
        
        Returns:
            True if successful, False otherwise
        """
        try:
            import kagglehub
            
            print("Downloading dataset using kagglehub...")
            path = kagglehub.dataset_download(DATASET_NAME)
            logger.info(f"Dataset downloaded to: {path}")
            print(f"Path to dataset files: {path}")
            
            # Copy files to our data directory
            source_path = Path(path)
            for file in source_path.glob("*.csv"):
                dest = self.data_dir / file.name
                shutil.copy(file, dest)
                logger.info(f"Copied {file.name} to {dest}")
                print(f"Copied {file.name} to {dest}")
            
            return True
        
        except ImportError:
            logger.warning("kagglehub not installed. Install with: pip install kagglehub")
            print("kagglehub not installed. Install with: pip install kagglehub")
            return False
        except Exception as e:
            logger.error(f"Failed to download with kagglehub: {e}")
            print(f"Failed to download with kagglehub: {e}")
            return False
    
    def download_with_curl(self, output_path: str = None) -> bool:
        """
        Download dataset using curl.
        
        Args:
            output_path: Optional path for the zip file
        
        Returns:
            True if successful, False otherwise
        """
        if output_path is None:
            output_path = str(self.data_dir / "anime-recommendations-database.zip")
        
        try:
            print(f"Downloading dataset using curl to {output_path}...")
            
            # Run curl command
            result = subprocess.run(
                ["curl", "-L", "-o", output_path, DATASET_URL],
                capture_output=True,
                text=True
            )
            
            if result.returncode != 0:
                logger.error(f"curl failed: {result.stderr}")
                print(f"curl failed: {result.stderr}")
                return False
            
            # Extract the zip file
            if self.extract_zip(output_path):
                print(f"Dataset extracted to {self.data_dir}")
                return True
            return False
            
        except FileNotFoundError:
            logger.error("curl not found. Please install curl or use kagglehub method.")
            print("curl not found. Please install curl or use kagglehub method.")
            return False
        except Exception as e:
            logger.error(f"Failed to download with curl: {e}")
            print(f"Failed to download with curl: {e}")
            return False
    
    def download(self, method: str = "kagglehub") -> bool:
        """
        Download dataset using specified method.
        
        Args:
            method: "kagglehub" or "curl"
        
        Returns:
            True if successful, False otherwise
        """
        if method == "kagglehub":
            return self.download_with_kagglehub()
        elif method == "curl":
            return self.download_with_curl()
        else:
            raise ValueError(f"Unknown method: {method}. Use 'kagglehub' or 'curl'")
    
    def extract_zip(self, zip_path: str) -> bool:
        """
        Extract a zip file containing the dataset.
        
        Args:
            zip_path: Path to the zip file
        
        Returns:
            True if successful, False otherwise
        """
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(self.data_dir)
            logger.info(f"Extracted {zip_path} to {self.data_dir}")
            
            # Remove zip file after extraction
            os.remove(zip_path)
            logger.info(f"Removed {zip_path}")
            
            return True
        except Exception as e:
            logger.error(f"Failed to extract zip: {e}")
            return False
    
    def get_anime_csv_path(self) -> Path:
        """Get path to anime.csv file."""
        return self.data_dir / "anime.csv"
    
    def get_rating_csv_path(self) -> Path:
        """Get path to rating.csv file."""
        return self.data_dir / "rating.csv"
    
    def check_data_exists(self) -> bool:
        """Check if dataset files exist."""
        anime_exists = self.get_anime_csv_path().exists()
        rating_exists = self.get_rating_csv_path().exists()
        return anime_exists and rating_exists


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Download anime dataset")
    parser.add_argument(
        "--method", 
        choices=["kagglehub", "curl"], 
        default="kagglehub",
        help="Download method (default: kagglehub)"
    )
    args = parser.parse_args()
    
    collector = DataCollector()
    
    if collector.check_data_exists():
        print("Dataset already exists!")
        print(f"  - anime.csv: {collector.get_anime_csv_path()}")
        print(f"  - rating.csv: {collector.get_rating_csv_path()}")
    else:
        print(f"Downloading dataset using {args.method}...")
        if collector.download(method=args.method):
            print("Download complete!")
        else:
            print("Download failed.")
            print("You can manually download from:")
            print("  https://www.kaggle.com/datasets/CooperUnion/anime-recommendations-database")
            print(f"Then extract to: {collector.data_dir}")
