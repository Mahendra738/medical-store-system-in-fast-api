# from app.db.base import Base

# from app.models.base_mixin import TimestampMixin, TimestampMixin
# from sqlalchemy import Column, Integer, String


# class Manufacturer(Base):
#     __tablename__ = "manufacturer"

#     id = Column(Integer, primary_key= True, index=True)
#     name = Column(String, unique=True, nullable=False, index=True,)
#     description = Column(String, nullable=True)
#     contact_person = Column(String, unique=False, nullable=False, index=True,)
#     phone = Column(String, unique=True, nullable=False, index=True,)
#     email
#     address
#     gst_number
#     license_number
#     is_active
#     created_at
#     updated_at  