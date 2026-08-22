# -*- coding: utf-8 -*-
from typing import Dict, List, Optional

from ..domain.models.activity import Activity
from ..domain.enums.activity_category import ActivityCategory
from .city_service import CityService


class ActivityService:
    """Domain service for managing reusable catalog activities by destination city."""

    def __init__(self, city_service: CityService):
        self.city_service = city_service
        self._store: Dict[int, Activity] = {}
        self._next_id: int = 1

    def create_activity(
        self,
        name: str,
        city_id: int,
        category: ActivityCategory = ActivityCategory.SIGHTSEEING,
        cost: float = 0.0,
        duration_minutes: int = 60,
        description: str = "",
        image_url: Optional[str] = None,
    ) -> Activity:
        """Creates a reusable catalog activity after confirming destination city exists."""
        city = self.city_service.get_city(city_id)
        activity = Activity(
            id=self._next_id,
            name=name,
            city_id=city.id or city_id,
            category=category,
            cost=cost,
            duration_minutes=duration_minutes,
            description=description,
            image_url=image_url,
        )
        self._store[self._next_id] = activity
        self._next_id += 1
        return activity

    def get_activity(self, activity_id: int) -> Activity:
        """Retrieves a catalog Activity by ID."""
        if activity_id not in self._store:
            raise KeyError(f"Activity with ID {activity_id} not found.")
        return self._store[activity_id]

    def list_activities(self) -> List[Activity]:
        """Lists all registered catalog activities."""
        return list(self._store.values())

    def list_activities_by_city(self, city_id: int) -> List[Activity]:
        """Lists all catalog activities for a specific city."""
        return [a for a in self._store.values() if a.city_id == city_id]

    def search_activities(
        self,
        city_id: Optional[int] = None,
        category: Optional[ActivityCategory] = None,
        query: Optional[str] = None,
        max_cost: Optional[float] = None,
    ) -> List[Activity]:
        """Searches activities filtered by city, category, query string, and max cost."""
        results = list(self._store.values())

        if city_id is not None:
            results = [a for a in results if a.city_id == city_id]

        if category is not None:
            results = [a for a in results if a.category == category]

        if max_cost is not None:
            results = [a for a in results if a.cost <= max_cost]

        if query:
            q = query.lower().strip()
            results = [
                a for a in results
                if q in a.name.lower() or q in a.description.lower()
            ]

        return results
