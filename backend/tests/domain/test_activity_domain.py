# -*- coding: utf-8 -*-
import unittest

from backend.src.domain.models.activity import Activity
from backend.src.domain.enums.activity_category import ActivityCategory
from backend.src.domain.rules.activity_rules import (
    InvalidActivityNameError,
    InvalidActivityCostError,
    InvalidActivityDurationError,
)
from backend.src.infrastructure.database.connection import init_db, Base, engine
from backend.src.services.city_service import CityService
from backend.src.services.activity_service import ActivityService


class TestActivityDomainBehavior(unittest.TestCase):
    """Behavioral unit test suite for Activity catalog entity rules and invariants."""

    def test_valid_activity_creation(self):
        act = Activity(
            id=1,
            name="Amber Fort Guided Tour",
            city_id=10,
            category=ActivityCategory.SIGHTSEEING,
            cost=500.0,
            duration_minutes=180,
            description="Historical palace tour",
            image_url="https://example.com/amber.jpg"
        )
        self.assertEqual(act.name, "Amber Fort Guided Tour")
        self.assertEqual(act.city_id, 10)
        self.assertEqual(act.category, ActivityCategory.SIGHTSEEING)
        self.assertEqual(act.cost, 500.0)
        self.assertEqual(act.duration_minutes, 180)

    def test_empty_activity_name_fails(self):
        with self.assertRaises(InvalidActivityNameError):
            Activity(name="", city_id=1)

        with self.assertRaises(InvalidActivityNameError):
            Activity(name="   ", city_id=1)

    def test_negative_cost_fails(self):
        with self.assertRaises(InvalidActivityCostError):
            Activity(name="Free Tour", city_id=1, cost=-10.0)

    def test_zero_cost_valid(self):
        act = Activity(name="City Park Walk", city_id=1, cost=0.0)
        self.assertEqual(act.cost, 0.0)

    def test_invalid_duration_fails(self):
        with self.assertRaises(InvalidActivityDurationError):
            Activity(name="Instant Activity", city_id=1, duration_minutes=0)

        with self.assertRaises(InvalidActivityDurationError):
            Activity(name="Overnight Activity", city_id=1, duration_minutes=-60)


class TestActivityServiceBehavior(unittest.TestCase):
    """Behavioral unit test suite for ActivityService operations."""

    def setUp(self):
        init_db()
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

        self.city_service = CityService()
        self.activity_service = ActivityService(self.city_service)
        self.jaipur = self.city_service.create_city(name="Jaipur", country="India")

    def test_create_and_retrieve_activity(self):
        act = self.activity_service.create_activity(
            name="Hawa Mahal Visit",
            city_id=self.jaipur.id,
            category=ActivityCategory.SIGHTSEEING,
            cost=200.0,
            duration_minutes=90
        )
        self.assertIsNotNone(act.id)

        retrieved = self.activity_service.get_activity(act.id)
        self.assertEqual(retrieved.name, "Hawa Mahal Visit")
        self.assertEqual(retrieved.city_id, self.jaipur.id)

    def test_create_activity_for_nonexistent_city_fails(self):
        with self.assertRaises(KeyError):
            self.activity_service.create_activity(
                name="Ghost Tour",
                city_id=999
            )

    def test_search_activities(self):
        self.activity_service.create_activity("Fort Visit", self.jaipur.id, ActivityCategory.SIGHTSEEING, cost=500.0)
        self.activity_service.create_activity("Dinner Feast", self.jaipur.id, ActivityCategory.DINING, cost=1200.0)

        sightseeing = self.activity_service.search_activities(city_id=self.jaipur.id, category=ActivityCategory.SIGHTSEEING)
        self.assertEqual(len(sightseeing), 1)

        cheap = self.activity_service.search_activities(city_id=self.jaipur.id, max_cost=600.0)
        self.assertEqual(len(cheap), 1)


if __name__ == '__main__':
    unittest.main()
