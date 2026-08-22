# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends, status

from ..dependencies import get_requesting_user_id, budget_service

router = APIRouter(prefix="/trips/{trip_id}/budget", tags=["Budget"])


@router.get("", status_code=status.HTTP_200_OK)
def get_trip_budget_summary(
    trip_id: int,
    user_id: int = Depends(get_requesting_user_id)
) -> dict:
    """Returns derived server-computed financial budget summary for a trip."""
    summary = budget_service.get_budget_summary(trip_id, user_id)
    return summary.to_dict()
