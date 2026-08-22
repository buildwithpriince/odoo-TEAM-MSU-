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
        d = asdict(self)
        d["Flights"] = self.transport
        d["Transit"] = 0.0
        d["Lodging"] = self.accommodation
        d["Food & Drinks"] = self.meals
        d["Activities"] = self.activities
        d["Misc"] = self.misc
        return d


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
    totalBudget: float
    estimatedTotal: float
    remaining: float
    averagePerDay: float
    isOverBudget: bool
    total_days: int
    destination_count: int
    breakdown: BudgetBreakdownResponse
    daily_costs: List[DailyCostResponse]

    @property
    def total_estimated_cost(self) -> float:
        return self.estimatedTotal

    @property
    def remaining_budget(self) -> float:
        return self.remaining

    @property
    def average_per_day(self) -> float:
        return self.averagePerDay

    @property
    def is_over_budget(self) -> bool:
        return self.isOverBudget

    @classmethod
    def from_domain(cls, b: Any) -> "BudgetSummaryResponse":
        bd = BudgetBreakdownResponse(
            transport=b.category_breakdown.get("transport", 0.0),
            accommodation=b.category_breakdown.get("accommodation", 0.0),
            activities=b.category_breakdown.get("activities", 0.0),
            meals=b.category_breakdown.get("meals", 0.0),
            misc=b.category_breakdown.get("misc", 0.0),
        )
        dcs = [
            DailyCostResponse(
                date=dc["date"],
                activity_cost=dc["activity_cost"],
                expense_cost=dc["expense_cost"],
                total=dc["total"],
            )
            for dc in b.daily_costs
        ]
        return cls(
            trip_id=b.trip_id,
            totalBudget=b.target_budget,
            estimatedTotal=b.total_estimated_cost,
            remaining=b.remaining_budget,
            averagePerDay=b.average_per_day,
            isOverBudget=b.is_over_budget,
            total_days=b.total_days,
            destination_count=b.destination_count,
            breakdown=bd,
            daily_costs=dcs,
        )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "trip_id": self.trip_id,
            "totalBudget": self.totalBudget,
            "target_budget": self.totalBudget,
            "estimatedTotal": self.estimatedTotal,
            "total_estimated_cost": self.estimatedTotal,
            "remaining": self.remaining,
            "remaining_budget": self.remaining,
            "averagePerDay": self.averagePerDay,
            "average_per_day": self.averagePerDay,
            "isOverBudget": self.isOverBudget,
            "is_over_budget": self.isOverBudget,
            "total_days": self.total_days,
            "destination_count": self.destination_count,
            "breakdown": self.breakdown.to_dict(),
            "daily_costs": [d.to_dict() for d in self.daily_costs],
        }
