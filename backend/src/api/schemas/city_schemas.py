# -*- coding: utf-8 -*-
from dataclasses import dataclass, asdict
from typing import Optional, Dict, Any

from ...domain.models.city import City


@dataclass
class CityCreateRequest:
    name: str
    country: str
    cost_index: int = 1
    popularity: float = 4.0
    image_url: Optional[str] = None


@dataclass
class CityResponse:
    id: int
    name: str
    country: str
    cost_index: int
    popularity: float
    image_url: Optional[str] = None

    @classmethod
    def from_domain(cls, city: City) -> "CityResponse":
        return cls(
            id=city.id or 0,
            name=city.name,
            country=city.country,
            cost_index=city.cost_index,
            popularity=city.popularity,
            image_url=city.image_url,
        )

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
