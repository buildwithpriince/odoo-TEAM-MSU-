# -*- coding: utf-8 -*-
from typing import Dict, List, Optional

from ..domain.models.city import City


class CityService:
    """Domain service for managing reusable City destinations."""

    def __init__(self):
        self._store: Dict[int, City] = {}
        self._next_id: int = 1

    def create_city(
        self,
        name: str,
        country: str,
        cost_index: int = 1,
        popularity: float = 4.0,
        image_url: Optional[str] = None,
    ) -> City:
        """Creates and validates a new reusable City entity."""
        city = City(
            id=self._next_id,
            name=name,
            country=country,
            cost_index=cost_index,
            popularity=popularity,
            image_url=image_url,
        )
        self._store[self._next_id] = city
        self._next_id += 1
        return city

    def get_city(self, city_id: int) -> City:
        """Retrieves a City by ID."""
        if city_id not in self._store:
            raise KeyError(f"City with ID {city_id} not found.")
        return self._store[city_id]

    def list_cities(self) -> List[City]:
        """Lists all registered destination cities."""
        return list(self._store.values())

    def search_cities(self, query: str) -> List[City]:
        """Searches cities by name or country case-insensitively."""
        q = query.lower().strip()
        return [
            c for c in self._store.values()
            if q in c.name.lower() or q in c.country.lower()
        ]
