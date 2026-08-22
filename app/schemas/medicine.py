from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.core.enums import ScheduleType, MedicineType


class MedicineCreate(BaseModel):
    name: str
    generic_name: str
    brand_name: str | None = None

    category_id: int

    medicine_type: MedicineType

    drawer: str

    batch_number: str
    expiry_date: date

    mrp: Decimal
    purchase_price: Decimal
    selling_price: Decimal

    stock: int
    minimum_stock: int = 10

    schedule_type: ScheduleType = ScheduleType.OTC


class MedicineUpdate(BaseModel):
    name: str | None = None
    generic_name: str | None = None
    brand_name: str | None = None

    category_id: int | None = None

    medicine_type: MedicineType | None = None

    drawer: str | None = None

    batch_number: str | None = None
    expiry_date: date | None = None

    mrp: Decimal | None = None
    purchase_price: Decimal | None = None
    selling_price: Decimal | None = None

    stock: int | None = None
    minimum_stock: int | None = None

    schedule_type: ScheduleType | None = None


class StockReduceRequest(BaseModel):
    quantity: int


class MedicineResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int

    name: str
    generic_name: str
    brand_name: str | None

    category_id: int

    medicine_type: MedicineType
    drawer: str

    batch_number: str
    expiry_date: date

    mrp: Decimal
    purchase_price: Decimal
    selling_price: Decimal

    stock_quantity: int
    minimum_stock: int

    schedule_type: ScheduleType

    is_active: bool