# -*- coding: utf-8 -*-
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, status, Response

from ..dependencies import get_requesting_user_id, trip_activity_service, trip_service
from ..schemas.trip_activity_schemas import (
    TripActivityCreateRequest,
    TripActivityUpdateRequest,
    TripActivityResponse,
)

router = APIRouter(prefix="/trips/{trip_id}/stops/{stop_id}/activities", tags=["TripActivities"])


@router.post("", status_code=status.HTTP_201_CREATED)
def add_activity_to_stop(
    trip_id: int,
    stop_id: int,
    req: TripActivityCreateRequest,
    user_id: int = Depends(get_requesting_user_id)
) -> dict:
    """Schedules a catalog activity onto a trip stop."""
    sched_d = date.fromisoformat(req.scheduled_date) if req.scheduled_date else None

    ta = trip_activity_service.add_activity_to_stop(
        trip_id=trip_id,
        stop_id=stop_id,
        activity_id=req.activity_id,
        requesting_user_id=user_id,
        scheduled_date=sched_d,
        start_time=req.get_start_time(),
        end_time=req.end_time,
        cost_override=req.cost_override,
        notes=req.notes
    )
    return TripActivityResponse.from_domain(ta).to_dict()


@router.get("", status_code=status.HTTP_200_OK)
def list_stop_activities(
    trip_id: int,
    stop_id: int,
    user_id: int = Depends(get_requesting_user_id)
) -> List[dict]:
    """Lists activities scheduled for a stop."""
    trip = trip_service.get_trip(trip_id, user_id)
    stop = next((s for s in trip.stops if s.id == stop_id), None)
    if not stop:
        raise KeyError(f"TripStop with ID {stop_id} not found in Trip {trip_id}.")

    return [TripActivityResponse.from_domain(a).to_dict() for a in stop.activities]


@router.put("/{trip_activity_id}", status_code=status.HTTP_200_OK)
def update_trip_activity(
    trip_id: int,
    stop_id: int,
    trip_activity_id: int,
    req: TripActivityUpdateRequest,
    user_id: int = Depends(get_requesting_user_id)
) -> dict:
    """Updates a scheduled trip activity's time, cost, or notes."""
    sched_d = date.fromisoformat(req.scheduled_date) if req.scheduled_date else None

    updated = trip_activity_service.update_trip_activity(
        trip_id=trip_id,
        stop_id=stop_id,
        trip_activity_id=trip_activity_id,
        requesting_user_id=user_id,
        scheduled_date=sched_d,
        start_time=req.time or req.start_time,
        end_time=req.end_time,
        cost=req.cost,
        notes=req.notes
    )
    return TripActivityResponse.from_domain(updated).to_dict()


@router.delete("/{trip_activity_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_activity_from_stop(
    trip_id: int,
    stop_id: int,
    trip_activity_id: int,
    user_id: int = Depends(get_requesting_user_id)
):
    """Removes a scheduled activity from a stop."""
    trip_activity_service.remove_activity_from_stop(
        trip_id=trip_id,
        stop_id=stop_id,
        trip_activity_id=trip_activity_id,
        requesting_user_id=user_id
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)
