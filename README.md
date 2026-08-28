# Medical Store System — Project Notes

## Current Status

Backend: FastAPI + PostgreSQL + SQLAlchemy + Alembic
Frontend: React + Vite
Authentication: Implemented
Medicine management: Implemented
Category management: Implemented
Git/GitHub: Configured

---

# Important Decisions

## 1. Medicine Category

### Decision

Medicine will have a `category_id` foreign key.

```text
Medicine
   |
   └── category_id
           |
           ↓
       Category
```

### Why?

Categories are business data and may change in the future.

Examples:

* Antibiotic
* Painkiller
* Antacid
* Vitamin & Supplement
* Diabetes
* Blood Pressure
* Cardiac
* Allergy
* Cold & Cough
* Skin Care
* Eye Care
* Other

### Important distinction

`MedicineType` is an enum because it represents the physical form:

* Tablet
* Capsule
* Syrup
* Injection
* Cream
* Ointment
* Drops
* Powder
* Inhaler
* Other

Category and MedicineType are **different concepts**.

---

## 2. Default Categories

Default categories are maintained in:

```text
app/db/seed.py
```

The database remains the source of truth.

The seed file provides the initial/default categories.

### TODO

Make category seeding automatic during application/database setup so that Windows installation does not require manually running the seed command.

---

# Medicine Inventory Decisions

## 3. Same Medicine Can Be Added Multiple Times

### Decision

Do NOT prevent adding a medicine simply because the medicine name already exists.

Example:

```text
Paracetamol
Batch A
Purchase date: January
Purchase price: ₹20
Expiry: 2027
```

Later:

```text
Paracetamol
Batch B
Purchase date: June
Purchase price: ₹22
Expiry: 2028
```

Both should be allowed.

### Reason

A real medical store can purchase the same medicine multiple times with:

* Different batches
* Different purchase prices
* Different expiry dates
* Different quantities
* Different purchase dates

### Important

Medicine uniqueness should eventually be considered around the **batch/inventory level**, not simply the medicine name.

---

# Medicine Pricing

## 4. Purchase Price vs MRP vs Selling Price

The medicine dashboard should clearly show:

```text
Purchase Price
MRP
Selling Price
```

### UI Priority

Selling Price and MRP should be visually more prominent than Purchase Price.

Reason:

* MRP = maximum retail price
* Selling Price = price charged to customer
* Purchase Price = internal business information

### Future consideration

The UI should make it easy for staff to understand:

```text
Bought at → ₹80
MRP → ₹100
Selling at → ₹95
```

without making the billing/selling interface confusing.

---

# Drawer / Storage

## 5. Drawer Management

### Decision

Keep drawer information in the system.

However, advanced automatic drawer management is **NOT a priority**.

### Reason

In a real medical store, staff can manually move medicines if a drawer becomes full and update the location.

### Future / Low Priority

Possible future improvements:

* Multiple storage locations
* Multiple drawers per medicine
* Storage capacity
* Automatic storage suggestions
* Location history

Do NOT prioritize this now.

---

# Categories

## Current Database

The original test category:

```text
Capsule
```

was created incorrectly as a category.

It is currently:

```text
Capsule → inactive
```

`Capsule` belongs to `MedicineType`, not Category.

### Current active categories

* Antibiotic
* Painkiller
* Antacid
* Vitamin & Supplement
* Diabetes
* Blood Pressure
* Cardiac
* Allergy
* Cold & Cough
* Skin Care
* Eye Care
* Other

---

# Future / Less Important Tasks

These are intentionally postponed.

## Inventory Improvements

* [ ] Multiple storage locations
* [ ] Advanced drawer management
* [ ] Storage capacity
* [ ] Automatic drawer suggestions
* [ ] Location history

## Medicine Improvements

* [ ] Better duplicate/batch handling
* [ ] Batch-level inventory management
* [ ] Purchase history
* [ ] Batch-wise expiry tracking
* [ ] Low-stock alerts
* [ ] Near-expiry alerts

## Pricing Improvements

* [ ] Better purchase-price visibility
* [ ] Discount calculation
* [ ] Profit margin display
* [ ] Staff-friendly selling interface
* [ ] Prevent accidental exposure of internal purchase price during billing

---

# Important Development Rule

## Do Not Over-Engineer Early

Before adding a feature, ask:

1. Is it required for the medical store to operate?
2. Will a human reasonably handle it manually?
3. Does adding it now make the system unnecessarily complicated?
4. Will it be difficult to add later?

If the feature can easily be added later and is not currently required, mark it as:

**Future / Low Priority**

and continue with the core system.

---

# Current Priority

Focus on making the core system reliable:

1. Authentication
2. Users/Roles
3. Categories
4. Medicines
5. Inventory
6. Purchases
7. Sales
8. Billing
9. Stock management
10. Frontend usability

Only after the core workflow works properly should we spend significant time on advanced features.

---

# Cross-Platform Goal

The application currently runs on:

```text
macOS
```

The final system should also run on:

```text
Windows
```

### Important

Avoid unnecessary Mac-specific dependencies or commands.

Prefer:

* Python
* FastAPI
* PostgreSQL
* SQLAlchemy
* Alembic
* React
* Vite
* Environment variables
* Standard Python tooling

---

# Git

Repository:

```text
medical-store-system-in-fast-api
```

Before committing:

```bash
git status
```

Make sure the following are NOT committed:

```text
.env
venv/
__pycache__/
*.pyc
.DS_Store
```

`.env.example` can contain placeholders such as:

```text
DATABASE_URL=...
SECRET_KEY=...
```

but never real credentials.

---

# Development Checklist

Before moving to the next major feature:

* [ ] Backend starts successfully
* [ ] Frontend starts successfully
* [ ] Database connection works
* [ ] Alembic migrations work
* [ ] API endpoints work in Swagger
* [ ] Frontend can communicate with backend
* [ ] Authentication works
* [ ] No secrets committed to Git
* [ ] `python -m compileall app` passes
* [ ] Git status checked

---

# Notes

Add important architectural decisions here as the project develops.

Do not delete old decisions unless they are genuinely no longer relevant.

When a decision changes, mark the old decision as changed rather than silently forgetting it.
