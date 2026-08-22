# -*- coding: utf-8 -*-
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from ..domain.rules.trip_rules import TripOwnershipError, TripDomainError
from ..domain.rules.city_rules import CityDomainError
from ..domain.rules.trip_stop_rules import TripStopDomainError
from ..domain.rules.activity_rules import ActivityDomainError
from ..domain.rules.trip_activity_rules import TripActivityDomainError
from ..domain.rules.expense_rules import ExpenseDomainError


def create_error_response(code: str, message: str, status_code: int) -> JSONResponse:
    """Helper to build standardized JSON error response."""
    return JSONResponse(
        status_code=status_code,
        content={
            "error": {
                "code": code,
                "message": message,
                "details": {}
            }
        }
    )


async def trip_ownership_exception_handler(request: Request, exc: TripOwnershipError):
    return create_error_response("FORBIDDEN", str(exc), status.HTTP_403_FORBIDDEN)


async def domain_validation_exception_handler(request: Request, exc: Exception):
    return create_error_response("VALIDATION_ERROR", str(exc), status.HTTP_400_BAD_REQUEST)


async def key_error_exception_handler(request: Request, exc: KeyError):
    clean_msg = str(exc).strip("'\"")
    return create_error_response("NOT_FOUND", clean_msg, status.HTTP_404_NOT_FOUND)


async def fastapi_validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    first_msg = errors[0].get("msg", "Validation error") if errors else "Invalid request body"
    return create_error_response("VALIDATION_ERROR", first_msg, status.HTTP_400_BAD_REQUEST)
