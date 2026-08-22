# -*- coding: utf-8 -*-
from enum import Enum


class ActivityCategory(str, Enum):
    SIGHTSEEING = "sightseeing"
    DINING = "dining"
    TRANSPORT = "transport"
    LODGING = "lodging"
    LEISURE = "leisure"

    @classmethod
    def default(cls) -> "ActivityCategory":
        return cls.SIGHTSEEING
