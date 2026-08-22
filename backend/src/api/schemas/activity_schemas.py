# -*- coding: utf-8 -*-
from dataclasses import dataclass, asdict
from typing import Optional, Dict, Any

from ...domain.models.activity import Activity


@dataclass
class ActivityCreateRequest:
    title: str
    city_id: int
    category: str = "sightseeing"
    cost: float = 0.0
    duration_minutes: int = 60
    description: str = ""
    image_url: Optional[str] = None


@dataclass
class ActivityResponse:
    id: str
    title: str
    city_id: int
    category: str
    cost: float
    duration_minutes: int
    duration: str  # e.g., "180 mins"
    description: str
    image_url: Optional[str] = None

    @property
    def name(self) -> str:
        return self.title

    @classmethod
    def from_domain(cls, activity: Activity) -> "ActivityResponse":
        cat_val = activity.category.value if hasattr(activity.category, 'value') else str(activity.category)
        return cls(
            id=str(activity.id or 0),
            title=activity.name,
            city_id=activity.city_id,
            category=cat_val,
            cost=activity.cost,
            duration_minutes=activity.duration_minutes,
            duration=f"{activity.duration_minutes} mins",
            description=activity.description,
            image_url=activity.image_url,
        )

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["name"] = self.title
        return d
