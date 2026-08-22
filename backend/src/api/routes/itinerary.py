# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends, status

from ..dependencies import get_requesting_user_id, itinerary_service

router = APIRouter(prefix="/trips/{trip_id}/itinerary", tags=["Itinerary"])


@router.get("", status_code=status.HTTP_200_OK)
def get_trip_itinerary(
    trip_id: int,
    user_id: int = Depends(get_requesting_user_id)
) -> dict:
    """Returns derived day-wise itinerary projection for a trip."""
    itinerary = itinerary_service.get_itinerary(trip_id, user_id)
    return itinerary.to_dict()
