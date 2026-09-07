from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

class PrescriptionCreate(BaseModel):
    customer_name: str
    customer_phone: str
    customer_address: str
    doctor_name: str
    doctor_address: str
    prescription_date: date
    prescription_number: str | None = None
    notes: str | None = None

class SaleItemCreate(BaseModel):
    medicine_id: int
    quantity: int = Field(gt=0)
    discount: Decimal = Field(default=Decimal("0.00"), ge=0)


class SaleCreate(BaseModel):
    customer_name: str | None = None
    customer_phone: str | None = None
    customer_address: str | None = None
    prescription: PrescriptionCreate | None = None
    discount: Decimal = Field(default=Decimal("0.00"), ge=0)
    items: list[SaleItemCreate] = Field(min_length=1)

class SaleItemMedicineResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    name: str
    batch_number: str

class SaleItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    medicine_id: int
    quantity: int
    mrp: Decimal
    selling_price: Decimal
    discount: Decimal
    total_price: Decimal

    medicine: SaleItemMedicineResponse

class PrescriptionResponse(BaseModel):
    model_config = ConfigDict(
    from_attributes=True,
    )


    id: int
    customer_name: str
    customer_phone: str
    customer_address: str
    doctor_name: str
    doctor_address: str
    prescription_date: date
    prescription_number: str | None
    notes: str | None



class SaleResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    invoice_number: str
    customer_name: str | None
    customer_phone: str | None
    customer_address: str | None

    subtotal: Decimal
    discount: Decimal
    total_amount: Decimal
    created_at: datetime
    items: list[SaleItemResponse]
    prescription: PrescriptionResponse | None = None

class SalesReportSummary(BaseModel):
    total_sales: Decimal
    total_bills: int
    total_items_sold: int
    total_discount: Decimal
    average_bill: Decimal


class SalesByDate(BaseModel):
    date: str
    sales: Decimal
    bills: int


class TopMedicineReport(BaseModel):
    medicine_id: int
    medicine_name: str
    quantity: int
    revenue: Decimal


class CategorySalesReport(BaseModel):
    category_name: str
    quantity: int
    revenue: Decimal


class SalesReportResponse(BaseModel):
    summary: SalesReportSummary
    sales_by_date: list[SalesByDate]
    top_medicines: list[TopMedicineReport]
    category_sales: list[CategorySalesReport]

