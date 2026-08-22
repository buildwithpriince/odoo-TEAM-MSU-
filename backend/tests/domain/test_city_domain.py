# -*- coding: utf-8 -*-
import unittest

from backend.src.domain.models.city import City
from backend.src.domain.rules.city_rules import (
    InvalidCityNameError,
    InvalidCityCountryError,
    InvalidCostIndexError,
    InvalidPopularityError,
)
from backend.src.infrastructure.database.connection import init_db, Base, engine
from backend.src.services.city_service import CityService


class TestCityDomainBehavior(unittest.TestCase):
    """Behavioral unit test suite for City entity rules and invariants."""

    def test_valid_city_creation(self):
        city = City(
            id=1,
            name="Jaipur",
            country="India",
            cost_index=2,
            popularity=4.5,
            image_url="https://example.com/jaipur.jpg"
        )
        self.assertEqual(city.name, "Jaipur")
        self.assertEqual(city.country, "India")
        self.assertEqual(city.cost_index, 2)
        self.assertEqual(city.popularity, 4.5)

    def test_empty_city_name_fails(self):
        with self.assertRaises(InvalidCityNameError):
            City(name="", country="India")

        with self.assertRaises(InvalidCityNameError):
            City(name="   ", country="India")

    def test_empty_country_fails(self):
        with self.assertRaises(InvalidCityCountryError):
            City(name="Jaipur", country="")

    def test_invalid_cost_index_out_of_range_fails(self):
        with self.assertRaises(InvalidCostIndexError):
            City(name="Jaipur", country="India", cost_index=0)

        with self.assertRaises(InvalidCostIndexError):
            City(name="Jaipur", country="India", cost_index=5)

    def test_invalid_popularity_out_of_range_fails(self):
        with self.assertRaises(InvalidPopularityError):
            City(name="Jaipur", country="India", popularity=-0.1)

        with self.assertRaises(InvalidPopularityError):
            City(name="Jaipur", country="India", popularity=5.1)


class TestCityServiceBehavior(unittest.TestCase):
    """Behavioral unit test suite for CityService operations."""

    def setUp(self):
        init_db()
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        self.service = CityService()

    def test_create_and_retrieve_city(self):
        created = self.service.create_city(
            name="Jaipur",
            country="India",
            cost_index=2,
            popularity=4.5
        )
        self.assertIsNotNone(created.id)

        retrieved = self.service.get_city(created.id)
        self.assertEqual(retrieved.name, "Jaipur")
        self.assertEqual(retrieved.country, "India")

    def test_search_cities(self):
        self.service.create_city("Jaipur", "India", cost_index=2)
        self.service.create_city("Jodhpur", "India", cost_index=3)
        self.service.create_city("Paris", "France", cost_index=4)

        results_jaipur = self.service.search_cities(query="jaipur")
        self.assertEqual(len(results_jaipur), 1)

        cheap_cities = self.service.search_cities(max_cost_index=2)
        self.assertEqual(len(cheap_cities), 1)


if __name__ == '__main__':
    unittest.main()
