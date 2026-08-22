# -*- coding: utf-8 -*-
import unittest

from backend.src.domain.models.activity import Activity
from backend.src.domain.enums.activity_category import ActivityCategory
from backend.src.domain.rules.activity_rules import (
    InvalidActivityNameError,
    InvalidActivityCityError,
    InvalidActivityCostError,
    InvalidActivityDurationError,
)
from backend.src.services.city_service import CityService
from backend.src.services.activity_service import ActivityService


class TestActivityDomainBehavior(unittest.TestCase):
    """Behavioral unit test suite for Activity catalog domain model and rules."""

    def test_valid_activity_creation(self):
        activity = Activity(
            id=1,
            name="Amber Fort Guided Tour",
            city_id=10,
            category=ActivityCategory.SIGHTSEEING,
            cost=500.0,
            duration_minutes=180,
            description="Explore historical Amer fort",
            image_url="https://example.com/amberfort.jpg"
        )
        self.assertEqual(activity.name, "Amber Fort Guided Tour")
        self.assertEqual(activity.city_id, 10)
        self.assertEqual(activity.category, ActivityCategory.SIGHTSEEING)
        self.assertEqual(activity.cost, 500.0)
        self.assertEqual(activity.duration_minutes, 180)

    def test_empty_activity_name_fails(self):
        with self.assertRaises(InvalidActivityNameError):
            Activity(name="", city_id=1)

        with self.assertRaises(InvalidActivityNameError):
            Activity(name="   ", city_id=1)

    def test_invalid_city_id_fails(self):
        with self.assertRaises(InvalidActivityCityError):
            Activity(name="City Tour", city_id=0)

    def test_negative_cost_fails(self):
        with self.assertRaises(InvalidActivityCostError):
            Activity(name="Negative Cost", city_id=1, cost=-100.0)

    def test_negative_duration_fails(self):
        with self.assertRaises(InvalidActivityDurationError):
            Activity(name="Negative Duration", city_id=1, duration_minutes=-30)

    def test_activity_category_enum_values(self):
        self.assertEqual(ActivityCategory.SIGHTSEEING.value, "sightseeing")
        self.assertEqual(ActivityCategory.DINING.value, "dining")
        self.assertEqual(ActivityCategory.TRANSPORT.value, "transport")
        self.assertEqual(ActivityCategory.LODGING.value, "lodging")
        self.assertEqual(ActivityCategory.LEISURE.value, "leisure")


class TestActivityServiceBehavior(unittest.TestCase):
    """Behavioral unit test suite for ActivityService catalog operations."""

    def setUp(self):
        self.city_service = CityService()
        self.activity_service = ActivityService(self.city_service)
        self.jaipur = self.city_service.create_city(name="Jaipur", country="India")
        self.udaipur = self.city_service.create_city(name="Udaipur", country="India")

    def test_create_and_retrieve_activity(self):
        act = self.activity_service.create_activity(
            name="Hawa Mahal Visit",
            city_id=self.jaipur.id,
            category=ActivityCategory.SIGHTSEEING,
            cost=200.0,
            duration_minutes=60
        )
        self.assertEqual(act.id, 1)

        fetched = self.activity_service.get_activity(1)
        self.assertEqual(fetched.name, "Hawa Mahal Visit")

    def test_list_activities_by_city(self):
        self.activity_service.create_activity("Jaipur Fort", self.jaipur.id, cost=500.0)
        self.activity_service.create_activity("Jaipur Palace", self.jaipur.id, cost=300.0)
        self.activity_service.create_activity("Lake Pichola Boat", self.udaipur.id, cost=400.0)

        jaipur_acts = self.activity_service.list_activities_by_city(self.jaipur.id)
        udaipur_acts = self.activity_service.list_activities_by_city(self.udaipur.id)

        self.assertEqual(len(jaipur_acts), 2)
        self.assertEqual(len(udaipur_acts), 1)

    def test_search_activities_filters(self):
        self.activity_service.create_activity("Amer Fort", self.jaipur.id, category=ActivityCategory.SIGHTSEEING, cost=500.0)
        self.activity_service.create_activity("Chokhi Dhani Dinner", self.jaipur.id, category=ActivityCategory.DINING, cost=1000.0)

        dining = self.activity_service.search_activities(city_id=self.jaipur.id, category=ActivityCategory.DINING)
        self.assertEqual(len(dining), 1)
        self.assertEqual(dining[0].name, "Chokhi Dhani Dinner")

        cheap = self.activity_service.search_activities(city_id=self.jaipur.id, max_cost=600.0)
        self.assertEqual(len(cheap), 1)
        self.assertEqual(cheap[0].name, "Amer Fort")


if __name__ == '__main__':
    unittest.main()
