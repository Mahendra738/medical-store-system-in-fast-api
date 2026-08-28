from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class SaleItemCreate(BaseModel):
    medicine_id: int
    quantity: int = Field(gt=0)
    discount: Decimal = Field(default=Decimal("0.00"), ge=0)


class SaleCreate(BaseModel):
    customer_name: str | None = None
    discount: Decimal = Field(default=Decimal("0.00"), ge=0)
    items: list[SaleItemCreate] = Field(min_length=1)


class SaleItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    medicine_id: int
    quantity: int
    mrp: Decimal
    selling_price: Decimal
    discount: Decimal
    total_price: Decimal


class SaleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    invoice_number: str
    customer_name: str | None
    subtotal: Decimal
    discount: Decimal
    total_amount: Decimal
    items: list[SaleItemResponse]