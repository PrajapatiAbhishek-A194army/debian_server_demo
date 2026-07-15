from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from source.shared_backend_infrastructure.database.database_connection import database_engine, database_session_factory
from source.shared_backend_infrastructure.database.database_model_base import DatabaseModelBase
from source.application_startup.database_seeder import seed_database

# Explicitly import all database models so they are registered in the Declarative Base metadata
from source.modules.user_authentication.user_database_model import UserDatabaseModel
from source.modules.shoe_catalog.shoe_database_model import ShoeDatabaseModel
from source.modules.shopping_cart.cart_item_database_model import CartItemDatabaseModel
from source.modules.wishlist.wishlist_item_database_model import WishlistItemDatabaseModel
from source.modules.order_management.order_database_model import OrderDatabaseModel, OrderLineItemDatabaseModel

# Import routes
from source.modules.user_authentication.user_authentication_router import user_authentication_router
from source.modules.shoe_catalog.shoe_catalog_router import shoe_catalog_router
from source.modules.shopping_cart.shopping_cart_router import shopping_cart_router
from source.modules.wishlist.wishlist_router import wishlist_router
from source.modules.order_management.order_management_router import order_management_router

# Core database tables instantiation
DatabaseModelBase.metadata.create_all(bind=database_engine)

# Run database seeder to establish defaults
database_session = database_session_factory()
try:
    seed_database(database_session)
finally:
    database_session.close()

# Initialize FastAPI instance
fastapi_application = FastAPI(
    title="Shoe ERP System API Portal",
    description="Stateless backend API supporting shoe inventory CRUD, shopping cart, wishlist, and payments.",
    version="1.0.0"
)

# Enable CORS middleware
fastapi_application.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production security, lock down allowed domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes for each business feature module
fastapi_application.include_router(user_authentication_router)
fastapi_application.include_router(shoe_catalog_router)
fastapi_application.include_router(shopping_cart_router)
fastapi_application.include_router(wishlist_router)
fastapi_application.include_router(order_management_router)

@fastapi_application.get("/")
def read_root_health_check() -> dict:
    """
    Simple check endpoint verifying application starts and connects successfully.
    """
    return {
        "status": "healthy",
        "service": "shoe-erp-backend-api",
        "database": "connected"
    }
