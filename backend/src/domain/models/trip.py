# -*- coding: utf-8 -*-
from dataclasses import dataclass, field
from datetime import date
from typing import Optional, List

from .trip_stop import TripStop
from .expense import Expense
from ..enums.trip_status import TripStatus
from ..rules.trip_rules import (
    validate_trip_dates,
    validate_target_budget,
    calculate_trip_duration_days,
)
from ..rules.trip_stop_rules import validate_stop_within_trip_dates


@dataclass
class Trip:
    """Pure Python Domain Model for GlobeTrotter Trip entity with stops and expenses aggregate support.

    Field Classification:
    ---------------------
    Core Domain Fields:
        id: Unique domain identifier
        name: Trip title (required)
        description: Overview/notes
        owner_id: Canonical domain ownership identity (maps to persistence user_id)
        start_date: Trip start date
        end_date: Trip end date
        target_budget: Planned budget amount
        currency_code: ISO Currency code (default 'INR')
        state: Lifecycle status (TripStatus enum)
        stops: List of ordered TripStop domain models
        expenses: List of non-activity Expense domain models

    Frontend Compatibility Fields:
        cover_image: Optional cover photo URL expected by frontend PRD
        travel_vibe: Optional travel style tag expected by frontend PRD
    """
    id: Optional[int] = None
    name: str = ""
    description: str = ""
    owner_id: int = 0
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    target_budget: float = 0.0
    currency_code: str = "INR"
    state: TripStatus = field(default_factory=TripStatus.default)
    cover_image: Optional[str] = None
    travel_vibe: Optional[str] = None
    stops: List[TripStop] = field(default_factory=list)
    expenses: List[Expense] = field(default_factory=list)

    def __post_init__(self):
        self.validate()

    def validate(self) -> None:
        """Validates domain invariants for the Trip entity."""
        if not self.name or not self.name.strip():
            raise ValueError("Trip name cannot be empty.")
        validate_trip_dates(self.start_date, self.end_date)
        validate_target_budget(self.target_budget)

    @property
    def duration_days(self) -> int:
        """Calculates inclusive duration in days."""
        return calculate_trip_duration_days(self.start_date, self.end_date)

    def add_stop(self, stop: TripStop) -> None:
        """Adds a TripStop to the trip, enforcing date boundaries and sequence ordering."""
        validate_stop_within_trip_dates(
            stop_start=stop.start_date,
            stop_end=stop.end_date,
            trip_start=self.start_date,
            trip_end=self.end_date,
        )
        stop.trip_id = self.id or 0
        stop.sequence = len(self.stops) + 1
        self.stops.append(stop)

    def remove_stop(self, stop_id: int) -> bool:
        """Removes a stop by ID and preserves deterministic sequence numbering."""
        initial_count = len(self.stops)
        self.stops = [s for s in self.stops if s.id != stop_id]
        if len(self.stops) < initial_count:
            self._resequence_stops()
            return True
        return False

    def reorder_stops(self, ordered_stop_ids: List[int]) -> None:
        """Reorders stops deterministically according to the provided list of IDs."""
        stop_map = {s.id: s for s in self.stops if s.id is not None}
        if set(ordered_stop_ids) != set(stop_map.keys()):
            raise ValueError("Reorder stop IDs must match existing trip stop IDs exactly.")

        reordered = []
        for index, sid in enumerate(ordered_stop_ids, start=1):
            stop = stop_map[sid]
            stop.sequence = index
            reordered.append(stop)

        self.stops = reordered

    def _resequence_stops(self) -> None:
        """Internal helper to maintain 1-based contiguous sequence numbering."""
        for idx, stop in enumerate(self.stops, start=1):
            stop.sequence = idx

    def add_expense(self, expense: Expense) -> None:
        """Adds a non-activity expense to the trip."""
        expense.trip_id = self.id or 0
        self.expenses.append(expense)

    def remove_expense(self, expense_id: int) -> bool:
        """Removes a non-activity expense by ID."""
        initial_count = len(self.expenses)
        self.expenses = [e for e in self.expenses if e.id != expense_id]
        return len(self.expenses) < initial_count

    def update_dates(self, new_start: Optional[date], new_end: Optional[date]) -> None:
        """Updates dates and re-enforces domain date invariants across trip and child stops."""
        validate_trip_dates(new_start, new_end)
        for stop in self.stops:
            validate_stop_within_trip_dates(
                stop_start=stop.start_date,
                stop_end=stop.end_date,
                trip_start=new_start,
                trip_end=new_end,
            )
        self.start_date = new_start
        self.end_date = new_end

    def update_budget(self, new_budget: float) -> None:
        """Updates budget and re-enforces domain budget invariants."""
        validate_target_budget(new_budget)
        self.target_budget = new_budget
