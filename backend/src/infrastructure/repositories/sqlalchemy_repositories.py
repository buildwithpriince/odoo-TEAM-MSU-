# -*- coding: utf-8 -*-
from typing import List, Optional
from sqlalchemy.orm import Session

from ...domain.models.trip import Trip
from ...domain.models.city import City
from ...domain.models.trip_stop import TripStop
from ...domain.models.activity import Activity
from ...domain.models.trip_activity import TripActivity
from ...domain.models.expense import Expense
from ...domain.enums.trip_status import TripStatus
from ...domain.enums.activity_category import ActivityCategory
from ...domain.enums.expense_category import ExpenseCategory

from ..database.models import (
    TripModel,
    CityModel,
    TripStopModel,
    ActivityModel,
    TripActivityModel,
    ExpenseModel,
)
from .interfaces import ITripRepository, ICityRepository, IActivityRepository


class SqlAlchemyCityRepository(ICityRepository):
    """SQLAlchemy implementation of City repository."""

    def __init__(self, session_factory):
        self.session_factory = session_factory

    def _to_domain(self, model: CityModel) -> City:
        return City(
            id=model.id,
            name=model.name,
            country=model.country,
            cost_index=model.cost_index,
            popularity=model.popularity,
            image_url=model.image_url,
        )

    def save(self, city: City) -> City:
        with self.session_factory() as session:
            if city.id:
                model = session.query(CityModel).filter_by(id=city.id).first()
                if not model:
                    model = CityModel(id=city.id)
            else:
                model = CityModel()

            model.name = city.name
            model.country = city.country
            model.cost_index = city.cost_index
            model.popularity = city.popularity
            model.image_url = city.image_url

            session.add(model)
            session.commit()
            session.refresh(model)
            city.id = model.id
            return city

    def get_by_id(self, city_id: int) -> Optional[City]:
        with self.session_factory() as session:
            model = session.query(CityModel).filter_by(id=city_id).first()
            return self._to_domain(model) if model else None

    def list_all(self) -> List[City]:
        with self.session_factory() as session:
            models = session.query(CityModel).all()
            return [self._to_domain(m) for m in models]

    def search(
        self,
        query: Optional[str] = None,
        max_cost_index: Optional[int] = None,
    ) -> List[City]:
        with self.session_factory() as session:
            q = session.query(CityModel)
            if max_cost_index is not None:
                q = q.filter(CityModel.cost_index <= max_cost_index)
            if query:
                s = f"%{query.lower()}%"
                q = q.filter(
                    (CityModel.name.ilike(s)) | (CityModel.country.ilike(s))
                )
            return [self._to_domain(m) for m in q.all()]


class SqlAlchemyActivityRepository(IActivityRepository):
    """SQLAlchemy implementation of Activity catalog repository."""

    def __init__(self, session_factory):
        self.session_factory = session_factory

    def _to_domain(self, model: ActivityModel) -> Activity:
        cat_enum = ActivityCategory(model.category) if model.category else ActivityCategory.SIGHTSEEING
        return Activity(
            id=model.id,
            name=model.name,
            city_id=model.city_id,
            category=cat_enum,
            cost=float(model.cost or 0.0),
            duration_minutes=model.duration_minutes,
            description=model.description or "",
            image_url=model.image_url,
        )

    def save(self, activity: Activity) -> Activity:
        with self.session_factory() as session:
            if activity.id:
                model = session.query(ActivityModel).filter_by(id=activity.id).first()
                if not model:
                    model = ActivityModel(id=activity.id)
            else:
                model = ActivityModel()

            model.name = activity.name
            model.city_id = activity.city_id
            model.category = activity.category.value if hasattr(activity.category, 'value') else str(activity.category)
            model.cost = activity.cost
            model.duration_minutes = activity.duration_minutes
            model.description = activity.description
            model.image_url = activity.image_url

            session.add(model)
            session.commit()
            session.refresh(model)
            activity.id = model.id
            return activity

    def get_by_id(self, activity_id: int) -> Optional[Activity]:
        with self.session_factory() as session:
            model = session.query(ActivityModel).filter_by(id=activity_id).first()
            return self._to_domain(model) if model else None

    def list_by_city(self, city_id: int) -> List[Activity]:
        with self.session_factory() as session:
            models = session.query(ActivityModel).filter_by(city_id=city_id).all()
            return [self._to_domain(m) for m in models]

    def search(
        self,
        city_id: Optional[int] = None,
        category: Optional[ActivityCategory] = None,
        query: Optional[str] = None,
        max_cost: Optional[float] = None,
    ) -> List[Activity]:
        with self.session_factory() as session:
            q = session.query(ActivityModel)
            if city_id is not None:
                q = q.filter(ActivityModel.city_id == city_id)
            if category is not None:
                cat_val = category.value if hasattr(category, 'value') else str(category)
                q = q.filter(ActivityModel.category == cat_val)
            if max_cost is not None:
                q = q.filter(ActivityModel.cost <= max_cost)
            if query:
                s = f"%{query.lower()}%"
                q = q.filter(
                    (ActivityModel.name.ilike(s)) | (ActivityModel.description.ilike(s))
                )
            return [self._to_domain(m) for m in q.all()]


class SqlAlchemyTripRepository(ITripRepository):
    """SQLAlchemy implementation of Trip aggregate root repository."""

    def __init__(self, session_factory):
        self.session_factory = session_factory

    def _to_domain(self, model: TripModel) -> Trip:
        status_enum = TripStatus(model.state) if model.state else TripStatus.DRAFT

        # 1. Map child stops
        stops_domain: List[TripStop] = []
        for sm in model.stops:
            city_domain = (
                City(
                    id=sm.city.id,
                    name=sm.city.name,
                    country=sm.city.country,
                    cost_index=sm.city.cost_index,
                    popularity=sm.city.popularity,
                    image_url=sm.city.image_url,
                )
                if sm.city else None
            )

            # Map child activities
            acts_domain: List[TripActivity] = []
            for tam in sm.activities:
                act_catalog = (
                    Activity(
                        id=tam.activity.id,
                        name=tam.activity.name,
                        city_id=tam.activity.city_id,
                        category=ActivityCategory(tam.activity.category),
                        cost=float(tam.activity.cost),
                        duration_minutes=tam.activity.duration_minutes,
                        description=tam.activity.description or "",
                        image_url=tam.activity.image_url,
                    )
                    if tam.activity else None
                )

                acts_domain.append(
                    TripActivity(
                        id=tam.id,
                        trip_id=tam.trip_id,
                        stop_id=tam.stop_id,
                        activity_id=tam.activity_id,
                        scheduled_date=tam.scheduled_date,
                        start_time=tam.start_time,
                        end_time=tam.end_time,
                        cost=float(tam.cost or 0.0),
                        notes=tam.notes,
                        activity=act_catalog,
                    )
                )

            stops_domain.append(
                TripStop(
                    id=sm.id,
                    trip_id=sm.trip_id,
                    city_id=sm.city_id,
                    sequence=sm.sequence,
                    start_date=sm.start_date,
                    end_date=sm.end_date,
                    city=city_domain,
                    notes=sm.notes,
                    activities=acts_domain,
                )
            )

        # 2. Map child expenses
        expenses_domain: List[Expense] = []
        for em in model.expenses:
            cat_enum = ExpenseCategory(em.category) if em.category else ExpenseCategory.MISC
            expenses_domain.append(
                Expense(
                    id=em.id,
                    trip_id=em.trip_id,
                    category=cat_enum,
                    description=em.description,
                    amount=float(em.amount or 0.0),
                    expense_date=em.expense_date,
                )
            )

        return Trip(
            id=model.id,
            name=model.name,
            description=model.description or "",
            owner_id=model.owner_id,
            start_date=model.start_date,
            end_date=model.end_date,
            target_budget=float(model.target_budget or 0.0),
            currency_code=model.currency_code or "INR",
            state=status_enum,
            cover_image=model.cover_image,
            travel_vibe=model.travel_vibe,
            stops=stops_domain,
            expenses=expenses_domain,
        )

    def save(self, trip: Trip) -> Trip:
        with self.session_factory() as session:
            if trip.id:
                model = session.query(TripModel).filter_by(id=trip.id).first()
                if not model:
                    model = TripModel(id=trip.id)
            else:
                model = TripModel()

            model.name = trip.name
            model.description = trip.description
            model.owner_id = trip.owner_id
            model.start_date = trip.start_date
            model.end_date = trip.end_date
            model.target_budget = trip.target_budget
            model.currency_code = trip.currency_code
            model.state = trip.state.value if hasattr(trip.state, 'value') else str(trip.state)
            model.cover_image = trip.cover_image
            model.travel_vibe = trip.travel_vibe

            session.add(model)
            session.flush()

            # Synchronize TripStops
            existing_stop_ids = {s.id for s in model.stops if s.id}
            domain_stop_ids = {s.id for s in trip.stops if s.id}

            # Delete removed stops
            for sm in list(model.stops):
                if sm.id not in domain_stop_ids:
                    session.delete(sm)

            # Update or insert stops
            for stop in trip.stops:
                if stop.id and stop.id in existing_stop_ids:
                    stop_model = session.query(TripStopModel).filter_by(id=stop.id).first()
                else:
                    stop_model = TripStopModel()
                    session.add(stop_model)

                stop_model.trip_id = model.id
                stop_model.city_id = stop.city_id
                stop_model.sequence = stop.sequence
                stop_model.start_date = stop.start_date
                stop_model.end_date = stop.end_date
                stop_model.notes = stop.notes
                session.flush()
                stop.id = stop_model.id
                stop.trip_id = model.id

                # Synchronize TripActivities for this stop
                existing_act_ids = {a.id for a in stop_model.activities if a.id}
                domain_act_ids = {a.id for a in stop.activities if a.id}

                for tam in list(stop_model.activities):
                    if tam.id not in domain_act_ids:
                        session.delete(tam)

                for act in stop.activities:
                    if act.id and act.id in existing_act_ids:
                        act_model = session.query(TripActivityModel).filter_by(id=act.id).first()
                    else:
                        act_model = TripActivityModel()
                        session.add(act_model)

                    act_model.trip_id = model.id
                    act_model.stop_id = stop_model.id
                    act_model.activity_id = act.activity_id
                    act_model.scheduled_date = act.scheduled_date
                    act_model.start_time = act.start_time
                    act_model.end_time = act.end_time
                    act_model.cost = act.cost
                    act_model.notes = act.notes
                    session.flush()
                    act.id = act_model.id
                    act.trip_id = model.id
                    act.stop_id = stop_model.id

            # Synchronize Expenses
            existing_exp_ids = {e.id for e in model.expenses if e.id}
            domain_exp_ids = {e.id for e in trip.expenses if e.id}

            for em in list(model.expenses):
                if em.id not in domain_exp_ids:
                    session.delete(em)

            for exp in trip.expenses:
                if exp.id and exp.id in existing_exp_ids:
                    exp_model = session.query(ExpenseModel).filter_by(id=exp.id).first()
                else:
                    exp_model = ExpenseModel()
                    session.add(exp_model)

                exp_model.trip_id = model.id
                exp_model.category = exp.category.value if hasattr(exp.category, 'value') else str(exp.category)
                exp_model.description = exp.description
                exp_model.amount = exp.amount
                exp_model.expense_date = exp.expense_date
                session.flush()
                exp.id = exp_model.id
                exp.trip_id = model.id

            session.commit()
            session.refresh(model)
            trip.id = model.id
            return self._to_domain(model)

    def get_by_id(self, trip_id: int) -> Optional[Trip]:
        with self.session_factory() as session:
            model = session.query(TripModel).filter_by(id=trip_id).first()
            return self._to_domain(model) if model else None

    def list_by_owner(self, owner_id: int) -> List[Trip]:
        with self.session_factory() as session:
            models = session.query(TripModel).filter_by(owner_id=owner_id).all()
            return [self._to_domain(m) for m in models]

    def delete(self, trip_id: int) -> bool:
        with self.session_factory() as session:
            model = session.query(TripModel).filter_by(id=trip_id).first()
            if not model:
                return False
            session.delete(model)
            session.commit()
            return True
