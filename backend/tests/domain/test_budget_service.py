# -*- coding: utf-8 -*-
from datetime import date
import unittest

from backend.src.domain.models.expense import Expense
from backend.src.domain.enums.expense_category import ExpenseCategory
from backend.src.infrastructure.database.connection import init_db, Base, engine
from backend.src.services.trip_service import TripService
from backend.src.services.city_service import CityService
from backend.src.services.trip_stop_service import TripStopService
from backend.src.services.activity_service import ActivityService
from backend.src.services.trip_activity_service import TripActivityService
from backend.src.services.budget_service import BudgetService


class TestBudgetServiceBehavior(unittest.TestCase):
    """Behavioral unit test suite for server-computed budget calculations."""

    def setUp(self):
        init_db()
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

        self.trip_service = TripService()
        self.city_service = CityService()
        self.stop_service = TripStopService(self.trip_service, self.city_service)
        self.activity_service = ActivityService(self.city_service)
        self.trip_act_service = TripActivityService(
            self.trip_service, self.city_service, self.stop_service, self.activity_service
        )
        self.budget_service = BudgetService(self.trip_service)

        self.jaipur = self.city_service.create_city(name="Jaipur", country="India")
        self.udaipur = self.city_service.create_city(name="Udaipur", country="India")

        self.act_jaipur = self.activity_service.create_activity("Fort Tour", self.jaipur.id, cost=500.0)
        self.act_udaipur = self.activity_service.create_activity("Boat Tour", self.udaipur.id, cost=400.0)

        # Trip: Sept 1 to Sept 6 = 6 days, Target Budget = ₹25,000
        self.trip = self.trip_service.create_trip(
            owner_id=1,
            name="Rajasthan Holiday",
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 6),
            target_budget=25000.0
        )
        self.stop1 = self.stop_service.add_stop(self.trip.id, self.jaipur.id, 1, start_date=date(2026, 9, 1), end_date=date(2026, 9, 3))
        self.stop2 = self.stop_service.add_stop(self.trip.id, self.udaipur.id, 1, start_date=date(2026, 9, 4), end_date=date(2026, 9, 6))

    def test_total_days_and_destination_count(self):
        summary = self.budget_service.get_budget_summary(self.trip.id, requesting_user_id=1)
        self.assertEqual(summary.total_days, 6)
        self.assertEqual(summary.destination_count, 2)

    def test_activity_cost_with_price_override(self):
        self.trip_act_service.add_activity_to_stop(
            self.trip.id, self.stop1.id, self.act_jaipur.id, 1,
            cost_override=700.0
        )

        summary = self.budget_service.get_budget_summary(self.trip.id, requesting_user_id=1)
        self.assertEqual(summary.breakdown.activities, 700.0)
        self.assertEqual(summary.estimatedTotal, 700.0)

    def test_budget_breakdown_and_categories(self):
        self.trip_act_service.add_activity_to_stop(self.trip.id, self.stop1.id, self.act_jaipur.id, 1, cost_override=500.0)

        # Add non-activity expenses and save to repository
        trip = self.trip_service.get_trip(self.trip.id, 1)
        trip.add_expense(Expense(id=None, trip_id=self.trip.id, category=ExpenseCategory.TRANSPORT, amount=5000.0))
        trip.add_expense(Expense(id=None, trip_id=self.trip.id, category=ExpenseCategory.ACCOMMODATION, amount=8000.0))
        trip.add_expense(Expense(id=None, trip_id=self.trip.id, category=ExpenseCategory.MEALS, amount=2500.0))
        self.trip_service.trip_repository.save(trip)

        summary = self.budget_service.get_budget_summary(self.trip.id, requesting_user_id=1)

        self.assertEqual(summary.breakdown.transport, 5000.0)
        self.assertEqual(summary.breakdown.accommodation, 8000.0)
        self.assertEqual(summary.breakdown.activities, 500.0)
        self.assertEqual(summary.breakdown.meals, 2500.0)
        self.assertEqual(summary.breakdown.misc, 0.0)

        self.assertEqual(summary.estimatedTotal, 16000.0)
        self.assertEqual(summary.remaining, 9000.0)
        self.assertEqual(summary.averagePerDay, round(16000.0 / 6, 2))
        self.assertFalse(summary.isOverBudget)

    def test_over_budget_calculation(self):
        trip = self.trip_service.get_trip(self.trip.id, 1)
        trip.add_expense(Expense(id=None, trip_id=self.trip.id, category=ExpenseCategory.TRANSPORT, amount=30000.0))
        self.trip_service.trip_repository.save(trip)

        summary = self.budget_service.get_budget_summary(self.trip.id, requesting_user_id=1)

        self.assertTrue(summary.isOverBudget)
        self.assertEqual(summary.remaining, -5000.0)

    def test_budget_recalculation_on_state_change(self):
        ta = self.trip_act_service.add_activity_to_stop(self.trip.id, self.stop1.id, self.act_jaipur.id, 1, cost_override=1000.0)
        summary1 = self.budget_service.get_budget_summary(self.trip.id, requesting_user_id=1)
        self.assertEqual(summary1.estimatedTotal, 1000.0)

        # Remove activity -> recalculates instantly
        self.trip_act_service.remove_activity_from_stop(self.trip.id, self.stop1.id, ta.id, 1)
        summary2 = self.budget_service.get_budget_summary(self.trip.id, requesting_user_id=1)
        self.assertEqual(summary2.estimatedTotal, 0.0)

    def test_no_double_counting(self):
        self.trip_act_service.add_activity_to_stop(self.trip.id, self.stop1.id, self.act_jaipur.id, 1, cost_override=500.0)
        trip = self.trip_service.get_trip(self.trip.id, 1)
        trip.add_expense(Expense(id=None, trip_id=self.trip.id, category=ExpenseCategory.TRANSPORT, amount=1000.0))
        self.trip_service.trip_repository.save(trip)

        summary = self.budget_service.get_budget_summary(self.trip.id, requesting_user_id=1)
        self.assertEqual(summary.estimatedTotal, 1500.0)
        self.assertEqual(summary.breakdown.activities, 500.0)
        self.assertEqual(summary.breakdown.transport, 1000.0)


if __name__ == '__main__':
    unittest.main()
