# -*- coding: utf-8 -*-
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, status, Response

from ..dependencies import get_requesting_user_id, trip_service
from ..schemas.trip_schemas import TripCreateRequest, TripUpdateRequest, TripResponse

router = APIRouter(prefix="/trips", tags=["Trips"])


@router.post("", status_code=status.HTTP_201_CREATED)
def create_trip(
    req: TripCreateRequest,
    user_id: int = Depends(get_requesting_user_id)
) -> dict:
    """Creates a new Trip for the requesting user."""
    start_d: Optional[date] = date.fromisoformat(req.get_start_date()) if req.get_start_date() else None
    end_d: Optional[date] = date.fromisoformat(req.get_end_date()) if req.get_end_date() else None

    trip = trip_service.create_trip(
        owner_id=user_id,
        name=req.get_title(),
        description=req.description or "",
        start_date=start_d,
        end_date=end_d,
        target_budget=req.get_budget(),
        currency_code=req.currency or "INR",
        cover_image=req.get_cover_image(),
        travel_vibe=req.get_travel_vibe(),
    )
    return TripResponse.from_domain(trip).to_dict()


@router.get("", status_code=status.HTTP_200_OK)
def list_trips(user_id: int = Depends(get_requesting_user_id)) -> List[dict]:
    """Lists all trips belonging to the requesting user."""
    trips = trip_service.list_user_trips(user_id)
    return [TripResponse.from_domain(t).to_dict() for t in trips]


@router.get("/{trip_id}", status_code=status.HTTP_200_OK)
def get_trip(
    trip_id: int,
    user_id: int = Depends(get_requesting_user_id)
) -> dict:
    """Retrieves a specific trip if owned by requesting user."""
    trip = trip_service.get_trip(trip_id, user_id)
    return TripResponse.from_domain(trip).to_dict()


@router.put("/{trip_id}", status_code=status.HTTP_200_OK)
def update_trip(
    trip_id: int,
    req: TripUpdateRequest,
    user_id: int = Depends(get_requesting_user_id)
) -> dict:
    """Updates an existing trip for the requesting user."""
    start_d: Optional[date] = date.fromisoformat(req.startDate) if req.startDate else None
    end_d: Optional[date] = date.fromisoformat(req.endDate) if req.endDate else None

    updated = trip_service.update_trip(
        trip_id=trip_id,
        requesting_user_id=user_id,
        name=req.title,
        description=req.description,
        start_date=start_d,
        end_date=end_d,
        target_budget=req.totalBudget,
        cover_image=req.coverImage,
        travel_vibe=req.travelVibe,
    )
    return TripResponse.from_domain(updated).to_dict()


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(
    trip_id: int,
    user_id: int = Depends(get_requesting_user_id)
):
    """Deletes a trip owned by requesting user."""
    trip_service.delete_trip(trip_id, user_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
