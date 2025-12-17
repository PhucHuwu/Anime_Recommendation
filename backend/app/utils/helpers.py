"""
Utility functions and helpers.
"""

import hashlib
from datetime import datetime
from typing import Any, Dict, List, Optional
import logging

logger = logging.getLogger(__name__)


def generate_hash(data: str) -> str:
    """Generate MD5 hash of a string."""
    return hashlib.md5(data.encode()).hexdigest()


def paginate(items: List[Any], page: int, page_size: int) -> Dict[str, Any]:
    """
    Paginate a list of items.
    
    Args:
        items: List of items to paginate
        page: Page number (1-indexed)
        page_size: Number of items per page
    
    Returns:
        Dictionary with paginated items and metadata
    """
    total = len(items)
    total_pages = (total + page_size - 1) // page_size
    start = (page - 1) * page_size
    end = start + page_size
    
    return {
        "items": items[start:end],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }


def format_datetime(dt: Optional[datetime]) -> str:
    """Format datetime to ISO string."""
    if dt is None:
        return ""
    return dt.isoformat()


def safe_divide(numerator: float, denominator: float, default: float = 0.0) -> float:
    """Safe division that returns default on divide by zero."""
    if denominator == 0:
        return default
    return numerator / denominator


def chunk_list(lst: List[Any], chunk_size: int) -> List[List[Any]]:
    """Split a list into chunks of specified size."""
    return [lst[i:i + chunk_size] for i in range(0, len(lst), chunk_size)]


def merge_dicts(*dicts: Dict) -> Dict:
    """Merge multiple dictionaries."""
    result = {}
    for d in dicts:
        result.update(d)
    return result
