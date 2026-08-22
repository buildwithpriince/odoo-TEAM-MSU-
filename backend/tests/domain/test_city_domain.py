# -*- coding: utf-8 -*-
import unittest

from backend.src.domain.models.city import City
from backend.src.domain.rules.city_rules import (
    InvalidCityNameError,
    InvalidCityCountryError,
    InvalidCostIndexError,
    InvalidPopularityError,
)
from backend.src.services.city_service import CityService


class TestCityDomainBehavior(unittest.TestCase):
    """Behavioral unit test suite for City domain model and rules."""

    def test_valid_city_creation(self):
        city = City(
            id=1,
            name="Jaipur",
            country="India",
            cost_index=2,
            popularity=4.8,
            image_url="https://example.com/jaipur.jpg"
        )
        self.assertEqual(city.name, "Jaipur")
        self.assertEqual(city.country, "India")
        self.assertEqual(city.cost_index, 2)
        self.assertEqual(city.popularity, 4.8)

    def test_empty_city_name_rejected(self):
        with self.assertRaises(InvalidCityNameError):
            City(name="", country="India")

        with self.assertRaises(InvalidCityNameError):
            City(name="   ", country="India")

    def test_empty_country_rejected(self):
        with self.assertRaises(InvalidCityCountryError):
            City(name="Tokyo", country="")

    def test_invalid_cost_index_bounds(self):
        with self.assertRaises(InvalidCostIndexError):
            City(name="Jaipur", country="India", cost_index=0)

        with self.assertRaises(InvalidCostIndexError):
            City(name="Jaipur", country="India", cost_index=5)

    def test_invalid_popularity_bounds(self):
        with self.assertRaises(InvalidPopularityError):
            City(name="Jaipur", country="India", popularity=-1.0)

        with self.assertRaises(InvalidPopularityError):
            City(name="Jaipur", country="India", popularity=5.5)


class TestCityServiceBehavior(unittest.TestCase):
    """Behavioral unit test suite for CityService catalog operations."""

    def setUp(self):
        self.service = CityService()

    def test_create_and_retrieve_city(self):
        city = self.service.create_city(
            name="Udaipur",
            country="India",
            cost_index=3,
            popularity=4.7
        )
        self.assertEqual(city.id, 1)

        fetched = self.service.get_city(1)
        self.assertEqual(fetched.name, "Udaipur")

    def test_search_cities(self):
        self.service.create_city(name="Jaipur", country="India")
        self.service.create_city(name="Jodhpur", country="India")
        self.service.create_city(name="Tokyo", country="Japan")

        results = self.service.search_cities("joi")
        self.assertEqual(len(results), 0)

        results_jaipur = self.service.search_cities("jaipur")
        self.assertEqual(len(results_jaipur), 1)
        self.assertEqual(results_jaipur[0].name, "Jaipur")

        results_india = self.service.search_cities("india")
        self.assertEqual(len(results_india), 2)


if __name__ == '__main__':
    unittest.main()
