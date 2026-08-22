# -*- coding: utf-8 -*-
from typing import List, Optional
from fastapi import APIRouter, status, Query

from ..dependencies import activity_service
from ..schemas.activity_schemas import ActivityCreateRequest, ActivityResponse
from ...domain.enums.activity_category import ActivityCategory

router = APIRouter(prefix="/activities", tags=["Activities"])


@router.post("", status_code=status.HTTP_201_CREATED)
def create_activity(req: ActivityCreateRequest) -> dict:
    """Creates a reusable catalog activity."""
    cat = ActivityCategory(req.category.lower()) if req.category else ActivityCategory.SIGHTSEEING
    activity = activity_service.create_activity(
        name=req.title,
        city_id=req.city_id,
        category=cat,
        cost=req.cost,
        duration_minutes=req.duration_minutes,
        description=req.description,
        image_url=req.image_url,
    )
    return ActivityResponse.from_domain(activity).to_dict()


@router.get("", status_code=status.HTTP_200_OK)
def list_activities(
    city_id: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    query: Optional[str] = Query(None),
    max_cost: Optional[float] = Query(None),
) -> List[dict]:
    """Lists and filters reusable catalog activities."""
    cat_enum = ActivityCategory(category.lower()) if category else None
    activities = activity_service.search_activities(
        city_id=city_id,
        category=cat_enum,
        query=query,
        max_cost=max_cost
    )
    return [ActivityResponse.from_domain(a).to_dict() for a in activities]


@router.get("/{activity_id}", status_code=status.HTTP_200_OK)
def get_activity(activity_id: int) -> dict:
    """Retrieves a single catalog activity by ID."""
    act = activity_service.get_activity(activity_id)
    return ActivityResponse.from_domain(act).to_dict()
