# -*- coding: utf-8 -*-
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Numeric,
    Date,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship

from .connection import Base


class TripModel(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True, default="")
    owner_id = Column(Integer, nullable=False, index=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    target_budget = Column(Numeric(12, 2), nullable=False, default=0.0)
    currency_code = Column(String(10), nullable=False, default="INR")
    state = Column(String(50), nullable=False, default="draft")
    cover_image = Column(Text, nullable=True)
    travel_vibe = Column(String(100), nullable=True)

    stops = relationship("TripStopModel", back_populates="trip", cascade="all, delete-orphan", order_by="TripStopModel.sequence")
    expenses = relationship("ExpenseModel", back_populates="trip", cascade="all, delete-orphan")


class CityModel(Base):
    __tablename__ = "cities"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False, index=True)
    country = Column(String(255), nullable=False, index=True)
    cost_index = Column(Integer, nullable=False, default=1)
    popularity = Column(Float, nullable=False, default=0.0)
    image_url = Column(Text, nullable=True)

    stops = relationship("TripStopModel", back_populates="city")
    activities = relationship("ActivityModel", back_populates="city")


class TripStopModel(Base):
    __tablename__ = "trip_stops"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    city_id = Column(Integer, ForeignKey("cities.id", ondelete="RESTRICT"), nullable=False, index=True)
    sequence = Column(Integer, nullable=False, default=1)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)

    trip = relationship("TripModel", back_populates="stops")
    city = relationship("CityModel", back_populates="stops")
    activities = relationship("TripActivityModel", back_populates="stop", cascade="all, delete-orphan")


class ActivityModel(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False, index=True)
    city_id = Column(Integer, ForeignKey("cities.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(50), nullable=False, default="sightseeing")
    cost = Column(Numeric(12, 2), nullable=False, default=0.0)
    duration_minutes = Column(Integer, nullable=False, default=60)
    description = Column(Text, nullable=True, default="")
    image_url = Column(Text, nullable=True)

    city = relationship("CityModel", back_populates="activities")
    trip_activities = relationship("TripActivityModel", back_populates="activity")


class TripActivityModel(Base):
    __tablename__ = "trip_activities"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    stop_id = Column(Integer, ForeignKey("trip_stops.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_id = Column(Integer, ForeignKey("activities.id", ondelete="RESTRICT"), nullable=False, index=True)
    scheduled_date = Column(Date, nullable=True)
    start_time = Column(String(20), nullable=True)
    end_time = Column(String(20), nullable=True)
    cost = Column(Numeric(12, 2), nullable=False, default=0.0)
    notes = Column(Text, nullable=True)

    stop = relationship("TripStopModel", back_populates="activities")
    activity = relationship("ActivityModel", back_populates="trip_activities")


class ExpenseModel(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(50), nullable=False, default="misc")
    description = Column(Text, nullable=False, default="")
    amount = Column(Numeric(12, 2), nullable=False, default=0.0)
    expense_date = Column(Date, nullable=True)

    trip = relationship("TripModel", back_populates="expenses")
