# -*- coding: utf-8 -*-
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, status, Response

from ..dependencies import get_requesting_user_id, trip_stop_service
from ..schemas.trip_stop_schemas import (
    TripStopCreateRequest,
    TripStopUpdateRequest,
    ReorderStopsRequest,
    TripStopResponse,
)

router = APIRouter(prefix="/trips/{trip_id}/stops", tags=["TripStops"])


@router.post("", status_code=status.HTTP_201_CREATED)
def add_stop(
    trip_id: int,
    req: TripStopCreateRequest,
    user_id: int = Depends(get_requesting_user_id)
) -> dict:
    """Adds a destination TripStop to a Trip."""
    start_d = date.fromisoformat(req.get_start_date()) if req.get_start_date() else None
    end_d = date.fromisoformat(req.get_end_date()) if req.get_end_date() else None

    stop = trip_stop_service.add_stop(
        trip_id=trip_id,
        city_id=req.city_id,
        requesting_user_id=user_id,
        start_date=start_d,
        end_date=end_d,
        notes=req.notes
    )
    return TripStopResponse.from_domain(stop).to_dict()


@router.get("", status_code=status.HTTP_200_OK)
def list_stops(
    trip_id: int,
    user_id: int = Depends(get_requesting_user_id)
) -> List[dict]:
    """Lists all stops for a trip."""
    stops = trip_stop_service.list_trip_stops(trip_id, user_id)
    return [TripStopResponse.from_domain(s).to_dict() for s in stops]


@router.put("/reorder", status_code=status.HTTP_200_OK)
def reorder_stops(
    trip_id: int,
    req: ReorderStopsRequest,
    user_id: int = Depends(get_requesting_user_id)
) -> List[dict]:
    """Reorders trip stops deterministically."""
    reordered = trip_stop_service.reorder_stops(trip_id, req.ordered_stop_ids, user_id)
    return [TripStopResponse.from_domain(s).to_dict() for s in reordered]


@router.put("/{stop_id}", status_code=status.HTTP_200_OK)
def update_stop(
    trip_id: int,
    stop_id: int,
    req: TripStopUpdateRequest,
    user_id: int = Depends(get_requesting_user_id)
) -> dict:
    """Updates a trip stop stay dates or notes."""
    start_d = date.fromisoformat(req.arrivalDate) if req.arrivalDate else None
    end_d = date.fromisoformat(req.departureDate) if req.departureDate else None

    updated = trip_stop_service.update_stop(
        trip_id=trip_id,
        stop_id=stop_id,
        requesting_user_id=user_id,
        start_date=start_d,
        end_date=end_d,
        notes=req.notes
    )
    return TripStopResponse.from_domain(updated).to_dict()


@router.delete("/{stop_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_stop(
    trip_id: int,
    stop_id: int,
    user_id: int = Depends(get_requesting_user_id)
):
    """Removes a stop from a trip."""
    trip_stop_service.remove_stop(trip_id, stop_id, user_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
