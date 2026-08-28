from sqlalchemy.orm import Session

from app.models.category import Category


DEFAULT_CATEGORIES = [
    {
        "name": "Antibiotic",
        "description": "Medicines used to treat bacterial infections",
    },
    {
        "name": "Painkiller",
        "description": "Medicines used to relieve pain",
    },
    {
        "name": "Antacid",
        "description": "Medicines used for acidity and stomach discomfort",
    },
    {
        "name": "Vitamin & Supplement",
        "description": "Vitamins, minerals and nutritional supplements",
    },
    {
        "name": "Diabetes",
        "description": "Medicines used for diabetes management",
    },
    {
        "name": "Blood Pressure",
        "description": "Medicines used for blood pressure management",
    },
    {
        "name": "Cardiac",
        "description": "Medicines related to heart and cardiovascular conditions",
    },
    {
        "name": "Allergy",
        "description": "Medicines used for allergies",
    },
    {
        "name": "Cold & Cough",
        "description": "Medicines used for cold, cough and related symptoms",
    },
    {
        "name": "Skin Care",
        "description": "Medicines and products for skin conditions",
    },
    {
        "name": "Eye Care",
        "description": "Medicines and products for eye conditions",
    },
    {
        "name": "Other",
        "description": "Other medicines that do not fit another category",
    },
]


def seed_default_categories(db: Session):
    for category_data in DEFAULT_CATEGORIES:

        existing_category = (
            db.query(Category)
            .filter(
                Category.name == category_data["name"],
            )
            .first()
        )

        if existing_category:
            # If category existed but was previously deactivated,
            # make it active again.
            if not existing_category.is_active:
                existing_category.is_active = True

            continue

        category = Category(
            name=category_data["name"],
            description=category_data["description"],
        )

        db.add(category)

    db.commit()