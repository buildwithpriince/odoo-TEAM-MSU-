# -*- coding: utf-8 -*-
from enum import Enum


class TripStatus(str, Enum):
    DRAFT = "draft"
    PLANNED = "planned"
    ONGOING = "ongoing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

    @classmethod
    def default(cls) -> "TripStatus":
        return cls.DRAFT
