from sqlalchemy.orm import Session
from source.modules.user_authentication.user_database_model import UserDatabaseModel
from source.modules.user_authentication.password_hasher import generate_encrypted_password_hash
from source.modules.shoe_catalog.shoe_database_model import ShoeDatabaseModel

def seed_database(database_session: Session) -> None:
    """
    Seeds the database with default accounts and shoe items if the database is empty.
    """
    # 1. Seed default users if table is empty
    user_count = database_session.query(UserDatabaseModel).count()
    if user_count == 0:
        # Create default administrator account
        admin_user = UserDatabaseModel(
            name="ERP Administrator",
            email="admin@example.com",
            password_hash=generate_encrypted_password_hash("adminpassword"),
            role="admin"
        )
        
        # Create default customer account
        customer_user = UserDatabaseModel(
            name="Sample Customer",
            email="customer@example.com",
            password_hash=generate_encrypted_password_hash("customerpassword"),
            role="customer"
        )
        
        database_session.add(admin_user)
        database_session.add(customer_user)
        database_session.commit()

    # 2. Seed default shoe catalog items if table is empty
    shoe_count = database_session.query(ShoeDatabaseModel).count()
    if shoe_count == 0:
        sample_shoes = [
            ShoeDatabaseModel(
                name="Air Max Runner",
                brand="Nike",
                description="Iconic Air cushioning provides maximum shock absorption for high-performance track sessions.",
                price=149.99,
                size=9.5,
                stock_quantity=20,
                image_url="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
            ),
            ShoeDatabaseModel(
                name="Ultraboost Swift",
                brand="Adidas",
                description="Responsive boost foam cushioning returns energy with every step, wrapped in breathable primeknit.",
                price=179.99,
                size=10.0,
                stock_quantity=15,
                image_url="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80"
            ),
            ShoeDatabaseModel(
                name="Classic Suede Street",
                brand="Puma",
                description="Retro casual aesthetics combined with durable rubber outsoles. A streetwear legend since 1968.",
                price=79.99,
                size=8.5,
                stock_quantity=10,
                image_url="https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80"
            ),
            ShoeDatabaseModel(
                name="Retro Basketball High",
                brand="Jordan",
                description="The ultimate heritage court high-top, styled in premium leather with the classic wing logo emblem.",
                price=219.99,
                size=10.5,
                stock_quantity=5,
                image_url="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80"
            )
        ]
        
        database_session.add_all(sample_shoes)
        database_session.commit()
