# -*- coding: utf-8 -*-
from dataclasses import dataclass, field
from typing import Optional

from ..enums.activity_category import ActivityCategory
from ..rules.activity_rules import (
    validate_activity_name,
    validate_activity_city,
    validate_activity_cost,
    validate_activity_duration,
)


@dataclass
class Activity:
    """Pure Python Domain Model for reusable catalog Activity entity.

    Fields:
        id: Unique activity catalog identifier
        name: Name of activity (e.g. 'Amber Fort Tour')
        city_id: Destination City ID this activity belongs to
        category: Activity category enum (sightseeing, dining, transport, lodging, leisure)
        cost: Default/base cost in trip currency (>= 0.0)
        duration_minutes: Base estimated duration in minutes (>= 0)
        description: Overview/details of activity
        image_url: Optional photo URL
    """
    id: Optional[int] = None
    name: str = ""
    city_id: int = 0
    category: ActivityCategory = field(default_factory=ActivityCategory.default)
    cost: float = 0.0
    duration_minutes: int = 60
    description: str = ""
    image_url: Optional[str] = None

    def __post_init__(self):
        self.validate()

    def validate(self) -> None:
        """Validates Activity catalog invariants."""
        validate_activity_name(self.name)
        validate_activity_city(self.city_id)
        validate_activity_cost(self.cost)
        validate_activity_duration(self.duration_minutes)
