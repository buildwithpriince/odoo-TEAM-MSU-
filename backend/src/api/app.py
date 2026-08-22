# -*- coding: utf-8 -*-
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError

from .routes import (
    trips_router,
    stops_router,
    activities_router,
    trip_activities_router,
    itinerary_router,
    budget_router,
    expenses_router,
)
from .errors import (
    trip_ownership_exception_handler,
    domain_validation_exception_handler,
    key_error_exception_handler,
    fastapi_validation_exception_handler,
)
from ..domain.rules.trip_rules import TripOwnershipError, TripDomainError
from ..domain.rules.city_rules import CityDomainError
from ..domain.rules.trip_stop_rules import TripStopDomainError
from ..domain.rules.activity_rules import ActivityDomainError
from ..domain.rules.trip_activity_rules import TripActivityDomainError
from ..domain.rules.expense_rules import ExpenseDomainError


def create_app() -> FastAPI:
    """Factory function for GlobeTrotter Backend API application."""
    app = FastAPI(
        title="GlobeTrotter Backend API",
        description="Authoritative REST API for GlobeTrotter Travel Platform",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS configuration for development
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Main API router under /api
    api_router = APIRouter(prefix="/api")
    api_router.include_router(trips_router)
    api_router.include_router(stops_router)
    api_router.include_router(activities_router)
    api_router.include_router(trip_activities_router)
    api_router.include_router(itinerary_router)
    api_router.include_router(budget_router)
    api_router.include_router(expenses_router)

    app.include_router(api_router)

    # Register Exception Handlers
    app.add_exception_handler(TripOwnershipError, trip_ownership_exception_handler)
    app.add_exception_handler(TripDomainError, domain_validation_exception_handler)
    app.add_exception_handler(CityDomainError, domain_validation_exception_handler)
    app.add_exception_handler(TripStopDomainError, domain_validation_exception_handler)
    app.add_exception_handler(ActivityDomainError, domain_validation_exception_handler)
    app.add_exception_handler(TripActivityDomainError, domain_validation_exception_handler)
    app.add_exception_handler(ExpenseDomainError, domain_validation_exception_handler)
    app.add_exception_handler(ValueError, domain_validation_exception_handler)
    app.add_exception_handler(KeyError, key_error_exception_handler)
    app.add_exception_handler(RequestValidationError, fastapi_validation_exception_handler)

    return app


app = create_app()
