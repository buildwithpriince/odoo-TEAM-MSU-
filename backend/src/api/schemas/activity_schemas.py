# -*- coding: utf-8 -*-
from dataclasses import dataclass, asdict
from typing import Optional, Dict, Any

from ...domain.models.activity import Activity


@dataclass
class ActivityCreateRequest:
    name: str
    city_id: int
    category: str = "sightseeing"
    cost: float = 0.0
    duration_minutes: int = 60
    description: str = ""
    image_url: Optional[str] = None


@dataclass
class ActivityResponse:
    id: int
    name: str
    city_id: int
    category: str
    cost: float
    duration_minutes: int
    description: str
    image_url: Optional[str] = None

    @classmethod
    def from_domain(cls, activity: Activity) -> "ActivityResponse":
        return cls(
            id=activity.id or 0,
            name=activity.name,
            city_id=activity.city_id,
            category=activity.category.value if hasattr(activity.category, 'value') else str(activity.category),
            cost=activity.cost,
            duration_minutes=activity.duration_minutes,
            description=activity.description,
            image_url=activity.image_url,
        )

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
