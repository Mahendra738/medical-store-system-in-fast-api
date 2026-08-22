from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.categories import router as categories_router
from app.api.v1.medicines import router as medicines_router
from app.api.v1.users import router as users_router


app = FastAPI(
    title="Medical Store",
    version="1.0.0",
)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# API routes
app.include_router(
    users_router,
    prefix="/api/v1/users",
    tags=["Users"],
)

app.include_router(
    categories_router,
    prefix="/api/v1/categories",
    tags=["Categories"],
)

app.include_router(
    medicines_router,
    prefix="/api/v1/medicines",
    tags=["Medicines"],
)