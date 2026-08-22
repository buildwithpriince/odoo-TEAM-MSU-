# -*- coding: utf-8 -*-
from dataclasses import dataclass, asdict
from typing import Dict, Any, List


@dataclass
class BudgetBreakdownResponse:
    transport: float = 0.0
    accommodation: float = 0.0
    activities: float = 0.0
    meals: float = 0.0
    misc: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class DailyCostResponse:
    date: str
    activity_cost: float
    expense_cost: float
    total: float

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class BudgetSummaryResponse:
    trip_id: int
    target_budget: float
    total_estimated_cost: float
    remaining_budget: float
    average_per_day: float
    is_over_budget: bool
    total_days: int
    destination_count: int
    breakdown: BudgetBreakdownResponse
    daily_costs: List[DailyCostResponse]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "trip_id": self.trip_id,
            "target_budget": self.target_budget,
            "total_estimated_cost": self.total_estimated_cost,
            "remaining_budget": self.remaining_budget,
            "average_per_day": self.average_per_day,
            "is_over_budget": self.is_over_budget,
            "total_days": self.total_days,
            "destination_count": self.destination_count,
            "breakdown": self.breakdown.to_dict(),
            "daily_costs": [d.to_dict() for d in self.daily_costs],
        }
