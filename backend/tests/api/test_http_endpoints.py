# -*- coding: utf-8 -*-
import unittest
from starlette.testclient import TestClient

from backend.src.api.app import app
from backend.src.api.dependencies import city_service


class TestHttpEndpointsAndAuthorization(unittest.TestCase):
    """Integration test suite executing real HTTP requests against FastAPI backend."""

    def setUp(self):
        self.client = TestClient(app)
        self.headers_user1 = {"X-User-Id": "1"}
        self.headers_user2 = {"X-User-Id": "2"}
        # Pre-seed city for activity catalog test
        if 1 not in city_service._store:
            city_service.create_city(name="Jaipur", country="India")

    def test_full_p0_user_flow(self):
        # 1. Create Trip (User 1)
        resp = self.client.post(
            "/api/trips",
            headers=self.headers_user1,
            json={
                "title": "Rajasthan Expedition",
                "description": "2-city tour",
                "startDate": "2026-09-01",
                "endDate": "2026-09-06",
                "totalBudget": 30000.0,
                "currency": "INR",
                "coverImage": "https://example.com/rajasthan.jpg",
                "travelVibe": "Cultural"
            }
        )
        self.assertEqual(resp.status_code, 201)
        trip_data = resp.json()
        trip_id = trip_data["id"]
        self.assertEqual(trip_data["title"], "Rajasthan Expedition")
        self.assertEqual(trip_data["startDate"], "2026-09-01")
        self.assertEqual(trip_data["totalBudget"], 30000.0)

        # 2. Create catalog activities
        act1_resp = self.client.post(
            "/api/activities",
            json={
                "title": "Amber Fort Tour",
                "city_id": 1,
                "category": "sightseeing",
                "cost": 500.0,
                "duration_minutes": 180
            }
        )
        self.assertEqual(act1_resp.status_code, 201)
        act1_id = act1_resp.json()["id"]

        act2_resp = self.client.post(
            "/api/activities",
            json={
                "title": "Chokhi Dhani Dinner",
                "city_id": 1,
                "category": "dining",
                "cost": 1000.0,
                "duration_minutes": 120
            }
        )
        self.assertEqual(act2_resp.status_code, 201)
        act2_id = act2_resp.json()["id"]

        # 3. Add Jaipur Stop
        stop_resp = self.client.post(
            f"/api/trips/{trip_id}/stops",
            headers=self.headers_user1,
            json={
                "city_id": 1,
                "arrivalDate": "2026-09-01",
                "departureDate": "2026-09-03",
                "notes": "Heritage hotel"
            }
        )
        self.assertEqual(stop_resp.status_code, 201)
        stop_data = stop_resp.json()
        stop_id = stop_data["id"]
        self.assertEqual(stop_data["arrivalDate"], "2026-09-01")

        # 4. Add Activities to Jaipur Stop
        ta1_resp = self.client.post(
            f"/api/trips/{trip_id}/stops/{stop_id}/activities",
            headers=self.headers_user1,
            json={
                "activity_id": int(act1_id),
                "scheduled_date": "2026-09-02",
                "time": "09:00",
                "cost_override": 600.0  # Overridden price
            }
        )
        self.assertEqual(ta1_resp.status_code, 201)
        ta1_id = ta1_resp.json()["id"]

        ta2_resp = self.client.post(
            f"/api/trips/{trip_id}/stops/{stop_id}/activities",
            headers=self.headers_user1,
            json={
                "activity_id": int(act2_id),
                "scheduled_date": "2026-09-02",
                "time": "19:00"
            }
        )
        self.assertEqual(ta2_resp.status_code, 201)

        # 5. Retrieve Day-wise Itinerary
        itin_resp = self.client.get(f"/api/trips/{trip_id}/itinerary", headers=self.headers_user1)
        self.assertEqual(itin_resp.status_code, 200)
        itin_data = itin_resp.json()
        self.assertEqual(len(itin_data["days"]), 6)
        sept2 = itin_data["days"][1]
        self.assertEqual(sept2["dayNumber"], 2)
        self.assertEqual(len(sept2["activities"]), 2)
        self.assertEqual(sept2["activities"][0]["time"], "09:00")
        self.assertEqual(sept2["activities"][1]["time"], "19:00")

        # 6. Retrieve Server-Computed Budget
        budget_resp = self.client.get(f"/api/trips/{trip_id}/budget", headers=self.headers_user1)
        self.assertEqual(budget_resp.status_code, 200)
        b1_data = budget_resp.json()
        # 600 (Amber Fort) + 1000 (Chokhi Dhani) = 1600
        self.assertEqual(b1_data["estimatedTotal"], 1600.0)
        self.assertEqual(b1_data["remaining"], 28400.0)
        self.assertFalse(b1_data["isOverBudget"])

        # 7. Update Activity Cost -> Verify Budget Recalculates
        up_resp = self.client.put(
            f"/api/trips/{trip_id}/stops/{stop_id}/activities/{ta1_id}",
            headers=self.headers_user1,
            json={"cost": 900.0}
        )
        self.assertEqual(up_resp.status_code, 200)

        b2_resp = self.client.get(f"/api/trips/{trip_id}/budget", headers=self.headers_user1)
        b2_data = b2_resp.json()
        # 900 + 1000 = 1900
        self.assertEqual(b2_data["estimatedTotal"], 1900.0)

        # 8. Delete Activity -> Verify Budget Recalculates
        del_resp = self.client.delete(
            f"/api/trips/{trip_id}/stops/{stop_id}/activities/{ta1_id}",
            headers=self.headers_user1
        )
        self.assertEqual(del_resp.status_code, 204)

        b3_resp = self.client.get(f"/api/trips/{trip_id}/budget", headers=self.headers_user1)
        b3_data = b3_resp.json()
        # 1000
        self.assertEqual(b3_data["estimatedTotal"], 1000.0)

    def test_authorization_enforcement(self):
        # User 1 creates trip
        create_resp = self.client.post(
            "/api/trips",
            headers=self.headers_user1,
            json={"title": "Private Trip", "startDate": "2026-10-01", "endDate": "2026-10-05"}
        )
        trip_id = create_resp.json()["id"]

        # User 2 attempts unauthorized operations -> HTTP 403 FORBIDDEN
        get_resp = self.client.get(f"/api/trips/{trip_id}", headers=self.headers_user2)
        self.assertEqual(get_resp.status_code, 403)
        self.assertEqual(get_resp.json()["error"]["code"], "FORBIDDEN")

        put_resp = self.client.put(f"/api/trips/{trip_id}", headers=self.headers_user2, json={"title": "Hacked"})
        self.assertEqual(put_resp.status_code, 403)

        del_resp = self.client.delete(f"/api/trips/{trip_id}", headers=self.headers_user2)
        self.assertEqual(del_resp.status_code, 403)

        stop_resp = self.client.post(f"/api/trips/{trip_id}/stops", headers=self.headers_user2, json={"city_id": 1})
        self.assertEqual(stop_resp.status_code, 403)

        itin_resp = self.client.get(f"/api/trips/{trip_id}/itinerary", headers=self.headers_user2)
        self.assertEqual(itin_resp.status_code, 403)

        budget_resp = self.client.get(f"/api/trips/{trip_id}/budget", headers=self.headers_user2)
        self.assertEqual(budget_resp.status_code, 403)

    def test_http_validation_errors(self):
        # Invalid dates: startDate > endDate
        inv_date = self.client.post(
            "/api/trips",
            headers=self.headers_user1,
            json={"title": "Invalid Trip", "startDate": "2026-10-10", "endDate": "2026-10-01"}
        )
        self.assertEqual(inv_date.status_code, 400)
        self.assertEqual(inv_date.json()["error"]["code"], "VALIDATION_ERROR")

        # Negative budget
        neg_budget = self.client.post(
            "/api/trips",
            headers=self.headers_user1,
            json={"title": "Invalid Trip", "totalBudget": -500.0}
        )
        self.assertEqual(neg_budget.status_code, 400)

        # Not found trip
        nf = self.client.get("/api/trips/99999", headers=self.headers_user1)
        self.assertEqual(nf.status_code, 404)
        self.assertEqual(nf.json()["error"]["code"], "NOT_FOUND")


if __name__ == '__main__':
    unittest.main()
