# -*- coding: utf-8 -*-
from enum import Enum


class ExpenseCategory(str, Enum):
    TRANSPORT = "transport"
    ACCOMMODATION = "accommodation"
    ACTIVITIES = "activities"
    MEALS = "meals"
    MISC = "misc"

    @classmethod
    def default(cls) -> "ExpenseCategory":
        return cls.MISC
