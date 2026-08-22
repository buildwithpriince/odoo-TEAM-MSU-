# -*- coding: utf-8 -*-
from dataclasses import dataclass
from typing import Optional

from ..rules.city_rules import (
    validate_city_name,
    validate_city_country,
    validate_cost_index,
    validate_popularity,
)


@dataclass
class City:
    """Pure Python Domain Model for City/Destination entity.

    Fields:
        id: Unique identifier
        name: City name (e.g. 'Jaipur', 'Tokyo')
        country: Country name (e.g. 'India', 'Japan')
        cost_index: 1 to 4 cost indicator (1=$, 2=$$, 3=$$$, 4=$$$$)
        popularity: Rating / popularity score (0.0 to 5.0)
        image_url: Optional hero image URL for city cover
    """
    id: Optional[int] = None
    name: str = ""
    country: str = ""
    cost_index: int = 1
    popularity: float = 4.0
    image_url: Optional[str] = None

    def __post_init__(self):
        self.validate()

    def validate(self) -> None:
        """Validates City domain invariants."""
        validate_city_name(self.name)
        validate_city_country(self.country)
        validate_cost_index(self.cost_index)
        validate_popularity(self.popularity)
