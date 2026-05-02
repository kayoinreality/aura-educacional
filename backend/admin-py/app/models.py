from datetime import datetime
from sqlalchemy import (
    Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
)
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "User"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    firstName = Column("firstName", String, nullable=False)
    lastName = Column("lastName", String, nullable=False)
    passwordHash = Column("passwordHash", String, nullable=True)
    role = Column(String, nullable=False, default="STUDENT")
    status = Column(String, nullable=False, default="ACTIVE")
    emailVerified = Column("emailVerified", DateTime, nullable=True)
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)
    updatedAt = Column("updatedAt", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    enrollments = relationship("Enrollment", back_populates="student")
    payments = relationship("Payment", back_populates="student")
    certificates = relationship("Certificate", back_populates="student")


class Category(Base):
    __tablename__ = "Category"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)
    updatedAt = Column("updatedAt", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    courses = relationship("Course", back_populates="category")


class Course(Base):
    __tablename__ = "Course"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False, default=0)
    status = Column(String, nullable=False, default="DRAFT")
    categoryId = Column("categoryId", String, ForeignKey("Category.id"), nullable=True)
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)
    updatedAt = Column("updatedAt", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship("Category", back_populates="courses")
    enrollments = relationship("Enrollment", back_populates="course")
    payments = relationship("Payment", back_populates="course")
    certificates = relationship("Certificate", back_populates="course")


class Enrollment(Base):
    __tablename__ = "Enrollment"

    id = Column(String, primary_key=True)
    studentId = Column("studentId", String, ForeignKey("User.id"), nullable=False)
    courseId = Column("courseId", String, ForeignKey("Course.id"), nullable=False)
    status = Column(String, nullable=False, default="ACTIVE")
    progress = Column(Float, nullable=False, default=0)
    completedAt = Column("completedAt", DateTime, nullable=True)
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)
    updatedAt = Column("updatedAt", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")


class Payment(Base):
    __tablename__ = "Payment"

    id = Column(String, primary_key=True)
    studentId = Column("studentId", String, ForeignKey("User.id"), nullable=False)
    courseId = Column("courseId", String, ForeignKey("Course.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, nullable=False, default="brl")
    status = Column(String, nullable=False, default="PENDING")
    method = Column(String, nullable=True)
    stripePaymentIntentId = Column("stripePaymentIntentId", String, nullable=True)
    createdAt = Column("createdAt", DateTime, default=datetime.utcnow)
    updatedAt = Column("updatedAt", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("User", back_populates="payments")
    course = relationship("Course", back_populates="payments")


class Certificate(Base):
    __tablename__ = "Certificate"

    id = Column(String, primary_key=True)
    studentId = Column("studentId", String, ForeignKey("User.id"), nullable=False)
    courseId = Column("courseId", String, ForeignKey("Course.id"), nullable=False)
    code = Column(String, unique=True, nullable=False)
    issuedAt = Column("issuedAt", DateTime, default=datetime.utcnow)

    student = relationship("User", back_populates="certificates")
    course = relationship("Course", back_populates="certificates")
