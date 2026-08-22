# -*- coding: utf-8 -*-
from abc import ABC, abstractmethod
from typing import List, Optional

from ...domain.models.trip import Trip
from ...domain.models.city import City
from ...domain.models.activity import Activity
from ...domain.enums.activity_category import ActivityCategory


class ITripRepository(ABC):
    @abstractmethod
    def save(self, trip: Trip) -> Trip:
        """Persists or updates a Trip entity and its aggregates."""
        pass

    @abstractmethod
    def get_by_id(self, trip_id: int) -> Optional[Trip]:
        """Retrieves a Trip domain model by ID."""
        pass

    @abstractmethod
    def list_by_owner(self, owner_id: int) -> List[Trip]:
        """Lists all Trips belonging to owner_id."""
        pass

    @abstractmethod
    def delete(self, trip_id: int) -> bool:
        """Deletes a Trip entity by ID."""
        pass


class ICityRepository(ABC):
    @abstractmethod
    def save(self, city: City) -> City:
        """Persists a City catalog entity."""
        pass

    @abstractmethod
    def get_by_id(self, city_id: int) -> Optional[City]:
        """Retrieves a City by ID."""
        pass

    @abstractmethod
    def list_all(self) -> List[City]:
        """Lists all City catalog entities."""
        pass

    @abstractmethod
    def search(
        self,
        query: Optional[str] = None,
        max_cost_index: Optional[int] = None,
    ) -> List[City]:
        """Searches Cities by query string or cost index."""
        pass


class IActivityRepository(ABC):
    @abstractmethod
    def save(self, activity: Activity) -> Activity:
        """Persists a catalog Activity entity."""
        pass

    @abstractmethod
    def get_by_id(self, activity_id: int) -> Optional[Activity]:
        """Retrieves a catalog Activity by ID."""
        pass

    @abstractmethod
    def list_by_city(self, city_id: int) -> List[Activity]:
        """Lists catalog activities by destination city_id."""
        pass

    @abstractmethod
    def search(
        self,
        city_id: Optional[int] = None,
        category: Optional[ActivityCategory] = None,
        query: Optional[str] = None,
        max_cost: Optional[float] = None,
    ) -> List[Activity]:
        """Searches activities matching filters."""
        pass
