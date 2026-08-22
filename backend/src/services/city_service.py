# -*- coding: utf-8 -*-
from typing import List, Optional

from ..domain.models.city import City
from ..infrastructure.repositories.interfaces import ICityRepository


class CityService:
    """Domain service managing destination cities catalog backed by repository persistence."""

    def __init__(self, city_repository: Optional[ICityRepository] = None):
        if city_repository is None:
            from ..infrastructure.repositories.sqlalchemy_repositories import SqlAlchemyCityRepository
            from ..infrastructure.database.connection import SessionLocal
            city_repository = SqlAlchemyCityRepository(SessionLocal)
        self.city_repository = city_repository

    def create_city(
        self,
        name: str,
        country: str,
        cost_index: int = 1,
        popularity: float = 0.0,
        image_url: Optional[str] = None,
    ) -> City:
        """Creates and persists a new destination City entity."""
        city = City(
            id=None,
            name=name,
            country=country,
            cost_index=cost_index,
            popularity=popularity,
            image_url=image_url,
        )
        return self.city_repository.save(city)

    def get_city(self, city_id: int) -> City:
        """Retrieves a City by ID."""
        city = self.city_repository.get_by_id(city_id)
        if not city:
            raise KeyError(f"City with ID {city_id} not found.")
        return city

    def list_cities(self) -> List[City]:
        """Lists all registered destination cities."""
        return self.city_repository.list_all()

    def search_cities(
        self,
        query: Optional[str] = None,
        max_cost_index: Optional[int] = None,
    ) -> List[City]:
        """Searches cities filtered by query string or cost index."""
        return self.city_repository.search(query=query, max_cost_index=max_cost_index)
