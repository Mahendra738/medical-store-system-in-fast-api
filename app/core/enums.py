from enum import Enum


class UserRole(str, Enum):
    admin = "admin"
    manager = "manager"
    staff = "staff"


class ScheduleType(str, Enum):
    OTC = "OTC"
    H = "H"
    H1 = "H1"
    X = "X"


class MedicineType(str, Enum):
    TABLET = "Tablet"
    CAPSULE = "Capsule"
    SYRUP = "Syrup"
    INJECTION = "Injection"
    CREAM = "Cream"
    OINTMENT = "Ointment"
    DROPS = "Drops"
    POWDER = "Powder"
    INHALER = "Inhaler"
    OTHER = "Other"