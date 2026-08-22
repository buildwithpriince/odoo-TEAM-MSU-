# -*- coding: utf-8 -*-
from typing import Optional


class CityDomainError(ValueError):
    """Base exception for City domain rule violations."""
    pass


class InvalidCityNameError(CityDomainError):
    """Raised when city name is empty or whitespace."""
    pass


class InvalidCityCountryError(CityDomainError):
    """Raised when city country is empty or whitespace."""
    pass


class InvalidCostIndexError(CityDomainError):
    """Raised when cost index is outside range [1, 4]."""
    pass


class InvalidPopularityError(CityDomainError):
    """Raised when popularity rating is outside range [0.0, 5.0]."""
    pass


def validate_city_name(name: str) -> None:
    """Enforces non-empty city name."""
    if not name or not name.strip():
        raise InvalidCityNameError("City name cannot be empty or whitespace.")


def validate_city_country(country: str) -> None:
    """Enforces non-empty country name."""
    if not country or not country.strip():
        raise InvalidCityCountryError("City country cannot be empty or whitespace.")


def validate_cost_index(cost_index: int) -> None:
    """Enforces cost_index between 1 ($) and 4 ($$$$)."""
    if cost_index < 1 or cost_index > 4:
        raise InvalidCostIndexError(
            f"Cost index must be between 1 and 4, got: {cost_index}"
        )


def validate_popularity(popularity: Optional[float]) -> None:
    """Enforces popularity rating between 0.0 and 5.0 if specified."""
    if popularity is not None:
        if popularity < 0.0 or popularity > 5.0:
            raise InvalidPopularityError(
                f"Popularity rating must be between 0.0 and 5.0, got: {popularity}"
            )
