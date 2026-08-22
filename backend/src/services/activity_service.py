# -*- coding: utf-8 -*-
from typing import List, Optional

from ..domain.models.activity import Activity
from ..domain.enums.activity_category import ActivityCategory
from .city_service import CityService
from ..infrastructure.repositories.interfaces import IActivityRepository


class ActivityService:
    """Domain service for managing reusable catalog activities backed by repository persistence."""

    def __init__(
        self,
        city_service: CityService,
        activity_repository: Optional[IActivityRepository] = None,
    ):
        if activity_repository is None:
            from ..infrastructure.repositories.sqlalchemy_repositories import SqlAlchemyActivityRepository
            from ..infrastructure.database.connection import SessionLocal
            activity_repository = SqlAlchemyActivityRepository(SessionLocal)
        self.city_service = city_service
        self.activity_repository = activity_repository

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
            id=None,
            name=name,
            city_id=city.id or city_id,
            category=category,
            cost=cost,
            duration_minutes=duration_minutes,
            description=description,
            image_url=image_url,
        )
        return self.activity_repository.save(activity)

    def get_activity(self, activity_id: int) -> Activity:
        """Retrieves a catalog Activity by ID."""
        act = self.activity_repository.get_by_id(activity_id)
        if not act:
            raise KeyError(f"Activity with ID {activity_id} not found.")
        return act

    def list_activities(self) -> List[Activity]:
        """Lists all registered catalog activities."""
        return self.activity_repository.search()

    def list_activities_by_city(self, city_id: int) -> List[Activity]:
        """Lists all catalog activities for a specific city."""
        return self.activity_repository.list_by_city(city_id)

    def search_activities(
        self,
        city_id: Optional[int] = None,
        category: Optional[ActivityCategory] = None,
        query: Optional[str] = None,
        max_cost: Optional[float] = None,
    ) -> List[Activity]:
        """Searches activities filtered by city, category, query string, and max cost."""
        return self.activity_repository.search(
            city_id=city_id,
            category=category,
            query=query,
            max_cost=max_cost
        )
