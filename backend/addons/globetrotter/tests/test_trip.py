# -*- coding: utf-8 -*-
from datetime import date
from odoo.tests.common import TransactionCase
from odoo.exceptions import ValidationError


class TestGlobetrotterTripOdoo(TransactionCase):
    """Odoo ORM Integration Test Suite for globetrotter.trip model."""

    def setUp(self):
        super().setUp()
        self.trip_model = self.env['globetrotter.trip']

    def test_create_trip(self):
        trip = self.trip_model.create({
            'name': 'Jaipur Trip',
            'start_date': date(2026, 9, 1),
            'end_date': date(2026, 9, 5),
            'target_budget': 10000.0,
        })
        self.assertEqual(trip.name, 'Jaipur Trip')
        self.assertEqual(trip.state, 'draft')

    def test_date_constrains(self):
        with self.assertRaises(ValidationError):
            self.trip_model.create({
                'name': 'Invalid Date Trip',
                'start_date': date(2026, 9, 10),
                'end_date': date(2026, 9, 1),
            })

    def test_budget_constrains(self):
        with self.assertRaises(ValidationError):
            self.trip_model.create({
                'name': 'Invalid Budget Trip',
                'target_budget': -100.0,
            })
