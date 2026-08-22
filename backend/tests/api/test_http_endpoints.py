# -*- coding: utf-8 -*-
from datetime import date
import unittest
from fastapi.testclient import TestClient

from backend.src.api.app import app
from backend.src.infrastructure.database.connection import init_db, Base, engine
from backend.src.api.dependencies import city_service


class TestHttpEndpointsAndAuthorization(unittest.TestCase):
    """Integration test suite for FastAPI HTTP endpoints, authorization, and error handling."""

    def setUp(self):
        init_db()
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

        self.client = TestClient(app)
        # Seed Jaipur city (id = 1) for destination stop endpoints
        self.city_service = city_service
        self.jaipur = self.city_service.create_city(name="Jaipur", country="India")

    def test_full_p0_user_flow(self):
        headers_u1 = {"X-User-Id": "1"}

        # 1. Create Trip (POST /api/trips)
        r_create = self.client.post("/api/trips", json={
            "title": "Rajasthan Expedition",
            "description": "Jaipur & Udaipur",
            "startDate": "2026-09-01",
            "endDate": "2026-09-10",
            "totalBudget": 30000.0,
            "currency": "INR",
            "status": "planned"
        }, headers=headers_u1)
        self.assertEqual(r_create.status_code, 201)
        trip_data = r_create.json()
        trip_id = trip_data["id"]
        self.assertEqual(trip_data["title"], "Rajasthan Expedition")

        # 2. Add Stop (POST /api/trips/{id}/stops)
        r_stop = self.client.post(f"/api/trips/{trip_id}/stops", json={
            "city_id": self.jaipur.id,
            "start_date": "2026-09-01",
            "end_date": "2026-09-05",
            "notes": "Pink City stay"
        }, headers=headers_u1)
        self.assertEqual(r_stop.status_code, 201)
        stop_id = r_stop.json()["id"]

        # 3. Create Activity (POST /api/activities)
        r_act = self.client.post("/api/activities", json={
            "title": "Amber Fort Visit",
            "city_id": self.jaipur.id,
            "category": "sightseeing",
            "cost": 500.0,
            "duration_minutes": 180,
            "description": "Fort tour"
        })
        self.assertEqual(r_act.status_code, 201)
        act_id = r_act.json()["id"]

        # 4. Schedule Activity onto Stop (POST /api/trips/{id}/stops/{stop_id}/activities)
        r_sched = self.client.post(f"/api/trips/{trip_id}/stops/{stop_id}/activities", json={
            "activity_id": int(act_id),
            "scheduled_date": "2026-09-02",
            "start_time": "09:00",
            "cost_override": 600.0
        }, headers=headers_u1)
        self.assertEqual(r_sched.status_code, 201)
        trip_act_id = r_sched.json()["id"]

        # 5. Add Expense (POST /api/trips/{id}/expenses)
        r_exp = self.client.post(f"/api/trips/{trip_id}/expenses", json={
            "category": "transport",
            "description": "Taxi fare",
            "amount": 2500.0,
            "expense_date": "2026-09-01"
        }, headers=headers_u1)
        self.assertEqual(r_exp.status_code, 201)

        # 6. Retrieve Itinerary (GET /api/trips/{id}/itinerary)
        r_itin = self.client.get(f"/api/trips/{trip_id}/itinerary", headers=headers_u1)
        self.assertEqual(r_itin.status_code, 200)
        itin_json = r_itin.json()
        self.assertEqual(len(itin_json["days"]), 10)
        self.assertEqual(itin_json["days"][1]["activities"][0]["title"], "Amber Fort Visit")

        # 7. Retrieve Budget (GET /api/trips/{id}/budget)
        r_bud = self.client.get(f"/api/trips/{trip_id}/budget", headers=headers_u1)
        self.assertEqual(r_bud.status_code, 200)
        bud_json = r_bud.json()
        self.assertEqual(bud_json["estimatedTotal"], 3100.0)
        self.assertEqual(bud_json["breakdown"]["transport"], 2500.0)
        self.assertEqual(bud_json["breakdown"]["activities"], 600.0)

        # 8. Modify Activity Cost (PUT /api/trips/{id}/stops/{stop_id}/activities/{ta_id})
        r_update = self.client.put(f"/api/trips/{trip_id}/stops/{stop_id}/activities/{trip_act_id}", json={
            "cost": 1000.0
        }, headers=headers_u1)
        self.assertEqual(r_update.status_code, 200)

        # Recalculated Budget
        r_bud2 = self.client.get(f"/api/trips/{trip_id}/budget", headers=headers_u1)
        self.assertEqual(r_bud2.json()["estimatedTotal"], 3500.0)

        # 9. Delete Activity (DELETE /api/trips/{id}/stops/{stop_id}/activities/{ta_id})
        r_del = self.client.delete(f"/api/trips/{trip_id}/stops/{stop_id}/activities/{trip_act_id}", headers=headers_u1)
        self.assertEqual(r_del.status_code, 204)

        # Recalculated Budget after deletion
        r_bud3 = self.client.get(f"/api/trips/{trip_id}/budget", headers=headers_u1)
        self.assertEqual(r_bud3.json()["estimatedTotal"], 2500.0)

    def test_authorization_enforcement(self):
        headers_u1 = {"X-User-Id": "1"}
        headers_u2 = {"X-User-Id": "2"}

        # User 1 creates Trip
        r = self.client.post("/api/trips", json={"title": "User 1 Secret Trip"}, headers=headers_u1)
        trip_id = r.json()["id"]

        # User 2 attempts unauthorized operations -> HTTP 403 FORBIDDEN
        r_get = self.client.get(f"/api/trips/{trip_id}", headers=headers_u2)
        self.assertEqual(r_get.status_code, 403)
        self.assertEqual(r_get.json()["error"]["code"], "FORBIDDEN")

        r_put = self.client.put(f"/api/trips/{trip_id}", json={"title": "Hacked"}, headers=headers_u2)
        self.assertEqual(r_put.status_code, 403)

        r_del = self.client.delete(f"/api/trips/{trip_id}", headers=headers_u2)
        self.assertEqual(r_del.status_code, 403)

        r_stop = self.client.post(f"/api/trips/{trip_id}/stops", json={"city_id": self.jaipur.id}, headers=headers_u2)
        self.assertEqual(r_stop.status_code, 403)

        r_itin = self.client.get(f"/api/trips/{trip_id}/itinerary", headers=headers_u2)
        self.assertEqual(r_itin.status_code, 403)

        r_bud = self.client.get(f"/api/trips/{trip_id}/budget", headers=headers_u2)
        self.assertEqual(r_bud.status_code, 403)

    def test_http_validation_errors(self):
        headers_u1 = {"X-User-Id": "1"}

        # Invalid dates -> HTTP 400 Bad Request
        r = self.client.post("/api/trips", json={
            "title": "Invalid Trip",
            "startDate": "2026-09-10",
            "endDate": "2026-09-01"
        }, headers=headers_u1)
        self.assertEqual(r.status_code, 400)
        self.assertEqual(r.json()["error"]["code"], "VALIDATION_ERROR")


if __name__ == '__main__':
    unittest.main()
