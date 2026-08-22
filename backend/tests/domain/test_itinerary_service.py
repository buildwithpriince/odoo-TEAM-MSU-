# -*- coding: utf-8 -*-
from datetime import date
import unittest

from backend.src.services.trip_service import TripService
from backend.src.services.city_service import CityService
from backend.src.services.trip_stop_service import TripStopService
from backend.src.services.activity_service import ActivityService
from backend.src.services.trip_activity_service import TripActivityService
from backend.src.services.itinerary_service import ItineraryService


class TestItineraryServiceBehavior(unittest.TestCase):
    """Behavioral unit test suite for day-wise itinerary projections."""

    def setUp(self):
        self.trip_service = TripService()
        self.city_service = CityService()
        self.stop_service = TripStopService(self.trip_service, self.city_service)
        self.activity_service = ActivityService(self.city_service)
        self.trip_act_service = TripActivityService(
            self.trip_service, self.city_service, self.stop_service, self.activity_service
        )
        self.itinerary_service = ItineraryService(self.trip_service)

        # Cities
        self.jaipur = self.city_service.create_city(name="Jaipur", country="India")
        self.jodhpur = self.city_service.create_city(name="Jodhpur", country="India")

        # Activities
        self.amber_fort = self.activity_service.create_activity("Amber Fort", self.jaipur.id, cost=500.0)
        self.hawa_mahal = self.activity_service.create_activity("Hawa Mahal", self.jaipur.id, cost=200.0)
        self.mehrangarh = self.activity_service.create_activity("Mehrangarh Fort", self.jodhpur.id, cost=600.0)

        # Trip (Sept 1 to Sept 5 = 5 days)
        self.trip = self.trip_service.create_trip(
            owner_id=1,
            name="Rajasthan Explorer",
            start_date=date(2026, 9, 1),
            end_date=date(2026, 9, 5)
        )

        # Stops
        self.stop_jaipur = self.stop_service.add_stop(
            self.trip.id, self.jaipur.id, 1, start_date=date(2026, 9, 1), end_date=date(2026, 9, 3)
        )
        self.stop_jodhpur = self.stop_service.add_stop(
            self.trip.id, self.jodhpur.id, 1, start_date=date(2026, 9, 4), end_date=date(2026, 9, 5)
        )

    def test_itinerary_day_grouping_and_cities(self):
        itinerary = self.itinerary_service.get_itinerary(self.trip.id, requesting_user_id=1)

        self.assertEqual(len(itinerary.days), 5)

        # Sept 1 to Sept 3 should have Jaipur as city
        self.assertEqual(itinerary.days[0].date, "2026-09-01")
        self.assertEqual(itinerary.days[0].city.name, "Jaipur")

        self.assertEqual(itinerary.days[2].date, "2026-09-03")
        self.assertEqual(itinerary.days[2].city.name, "Jaipur")

        # Sept 4 to Sept 5 should have Jodhpur as city
        self.assertEqual(itinerary.days[3].date, "2026-09-04")
        self.assertEqual(itinerary.days[3].city.name, "Jodhpur")

    def test_chronological_activity_ordering(self):
        # Add activities to Sept 2 in non-chronological order
        self.trip_act_service.add_activity_to_stop(
            self.trip.id, self.stop_jaipur.id, self.hawa_mahal.id, 1,
            scheduled_date=date(2026, 9, 2), start_time="14:00"
        )
        self.trip_act_service.add_activity_to_stop(
            self.trip.id, self.stop_jaipur.id, self.amber_fort.id, 1,
            scheduled_date=date(2026, 9, 2), start_time="09:00"
        )

        itinerary = self.itinerary_service.get_itinerary(self.trip.id, requesting_user_id=1)
        sept2 = next(d for d in itinerary.days if d.date == "2026-09-02")

        self.assertEqual(len(sept2.activities), 2)
        # Should be ordered chronologically: Amber Fort (09:00) before Hawa Mahal (14:00)
        self.assertEqual(sept2.activities[0].activity.name, "Amber Fort")
        self.assertEqual(sept2.activities[1].activity.name, "Hawa Mahal")

    def test_empty_days_represented(self):
        itinerary = self.itinerary_service.get_itinerary(self.trip.id, requesting_user_id=1)
        sept1 = next(d for d in itinerary.days if d.date == "2026-09-01")

        self.assertEqual(len(sept1.activities), 0)
        self.assertEqual(sept1.daily_total_cost, 0.0)
        self.assertIsNotNone(sept1.city)


if __name__ == '__main__':
    unittest.main()
