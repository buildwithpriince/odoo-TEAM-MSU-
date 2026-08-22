# -*- coding: utf-8 -*-
from datetime import date, timedelta
from typing import List, Dict

from .trip_service import TripService
from ..domain.enums.expense_category import ExpenseCategory
from ..api.schemas.budget_schemas import (
    BudgetBreakdownResponse,
    DailyCostResponse,
    BudgetSummaryResponse,
)


class BudgetService:
    """Domain service for authoritative, server-computed financial budget calculations."""

    def __init__(self, trip_service: TripService):
        self.trip_service = trip_service

    def get_budget_summary(self, trip_id: int, requesting_user_id: int) -> BudgetSummaryResponse:
        """Calculates derived financial metrics and category budget breakdown for a trip."""
        trip = self.trip_service.get_trip(trip_id, requesting_user_id)

        # 1. Total days & destination count
        total_days = trip.duration_days
        destination_count = len(trip.stops)

        # 2. Activity costs using trip-specific TripActivity.cost (supports price overrides!)
        activity_cost = sum(
            act.cost
            for stop in trip.stops
            for act in stop.activities
        )

        # 3. Category Breakdown (no double-counting: Activity costs come from TripActivity, expenses from Expense)
        transport_cost = sum(e.amount for e in trip.expenses if e.category == ExpenseCategory.TRANSPORT)
        lodging_cost = sum(e.amount for e in trip.expenses if e.category == ExpenseCategory.ACCOMMODATION)
        meals_cost = sum(e.amount for e in trip.expenses if e.category == ExpenseCategory.MEALS)
        misc_cost = sum(e.amount for e in trip.expenses if e.category == ExpenseCategory.MISC)

        breakdown = BudgetBreakdownResponse(
            transport=round(transport_cost, 2),
            accommodation=round(lodging_cost, 2),
            activities=round(activity_cost, 2),
            meals=round(meals_cost, 2),
            misc=round(misc_cost, 2),
        )

        # 4. Total estimated cost
        total_estimated_cost = round(
            transport_cost + lodging_cost + activity_cost + meals_cost + misc_cost, 2
        )

        # 5. Average per day
        average_per_day = round(total_estimated_cost / total_days, 2) if total_days > 0 else 0.0

        # 6. Remaining budget & over-budget status
        remaining_budget = round(trip.target_budget - total_estimated_cost, 2)
        is_over_budget = total_estimated_cost > trip.target_budget

        # 7. Daily cost breakdown
        dates: List[date] = []
        if trip.start_date and trip.end_date:
            curr = trip.start_date
            while curr <= trip.end_date:
                dates.append(curr)
                curr += timedelta(days=1)

        daily_costs: List[DailyCostResponse] = []
        for d in dates:
            d_act_cost = sum(
                act.cost
                for stop in trip.stops
                for act in stop.activities
                if act.scheduled_date == d
            )
            d_exp_cost = sum(
                e.amount
                for e in trip.expenses
                if e.expense_date == d
            )
            daily_costs.append(
                DailyCostResponse(
                    date=d.isoformat(),
                    activity_cost=round(d_act_cost, 2),
                    expense_cost=round(d_exp_cost, 2),
                    total=round(d_act_cost + d_exp_cost, 2),
                )
            )

        return BudgetSummaryResponse(
            trip_id=trip.id or trip_id,
            target_budget=trip.target_budget,
            total_estimated_cost=total_estimated_cost,
            remaining_budget=remaining_budget,
            average_per_day=average_per_day,
            is_over_budget=is_over_budget,
            total_days=total_days,
            destination_count=destination_count,
            breakdown=breakdown,
            daily_costs=daily_costs,
        )
