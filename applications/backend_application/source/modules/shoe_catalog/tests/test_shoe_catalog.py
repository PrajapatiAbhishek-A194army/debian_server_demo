import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from source.shared_backend_infrastructure.database.database_model_base import DatabaseModelBase
from source.modules.shoe_catalog.shoe_database_model import ShoeDatabaseModel
from source.modules.shoe_catalog.shoe_repository import ShoeRepository
from source.modules.shoe_catalog.shoe_catalog_contracts import (
    ShoeCreationRequest,
    ShoeModificationRequest
)
from source.modules.shoe_catalog.shoe_catalog_workflows import (
    retrieve_shoes_catalog_workflow,
    retrieve_shoe_by_id_workflow,
    create_new_shoe_workflow,
    modify_existing_shoe_workflow,
    delete_existing_shoe_workflow,
    ShoeNotFoundError
)

# Set up in-memory SQLite engine for fast testing
test_database_engine = create_engine("sqlite:///:memory:")
test_session_factory = sessionmaker(bind=test_database_engine)

@pytest.fixture(name="database_session")
def database_session_fixture():
    DatabaseModelBase.metadata.create_all(bind=test_database_engine)
    session = test_session_factory()
    try:
      yield session
    finally:
      session.close()
      DatabaseModelBase.metadata.drop_all(bind=test_database_engine)

def test_create_new_shoe_saves_product_successfully(database_session):
    # Arrange
    shoe_repository = ShoeRepository(database_session)
    creation_request = ShoeCreationRequest(
        name="Air Zoom",
        brand="Nike",
        description="Premium running shoe.",
        price=120.00,
        size=10.0,
        stock_quantity=5
    )

    # Act
    shoe_response = create_new_shoe_workflow(creation_request, shoe_repository)

    # Assert
    assert shoe_response.id is not None
    assert shoe_response.name == "Air Zoom"
    assert shoe_response.brand == "Nike"
    assert shoe_response.price == 120.00
    assert shoe_response.size == 10.0
    assert shoe_response.stock_quantity == 5

def test_retrieve_shoes_applies_brand_and_size_filters(database_session):
    # Arrange
    shoe_repository = ShoeRepository(database_session)
    
    # Save a Nike shoe size 9.5
    shoe_repository.save_new_shoe(
        ShoeDatabaseModel(name="Runner A", brand="Nike", price=100.0, size=9.5, stock_quantity=10)
    )
    # Save a Nike shoe size 10
    shoe_repository.save_new_shoe(
        ShoeDatabaseModel(name="Runner B", brand="Nike", price=120.0, size=10.0, stock_quantity=15)
    )
    # Save an Adidas shoe size 10
    shoe_repository.save_new_shoe(
        ShoeDatabaseModel(name="Runner C", brand="Adidas", price=130.0, size=10.0, stock_quantity=8)
    )

    # Act & Assert
    # 1. Filter by Nike only
    nike_shoes = retrieve_shoes_catalog_workflow(shoe_repository, brand="Nike")
    assert len(nike_shoes) == 2
    
    # 2. Filter by size 10 only
    size_10_shoes = retrieve_shoes_catalog_workflow(shoe_repository, size=10.0)
    assert len(size_10_shoes) == 2
    
    # 3. Filter by Adidas and size 10
    adidas_size_10 = retrieve_shoes_catalog_workflow(shoe_repository, brand="Adidas", size=10.0)
    assert len(adidas_size_10) == 1
    assert adidas_size_10[0].name == "Runner C"

def test_modify_shoe_updates_properties(database_session):
    # Arrange
    shoe_repository = ShoeRepository(database_session)
    saved_shoe = shoe_repository.save_new_shoe(
        ShoeDatabaseModel(name="Old Name", brand="Puma", price=60.00, size=8.0, stock_quantity=4)
    )

    modification_request = ShoeModificationRequest(
        name="New Name",
        price=65.50,
        stock_quantity=12
    )

    # Act
    updated_response = modify_existing_shoe_workflow(saved_shoe.id, modification_request, shoe_repository)

    # Assert
    assert updated_response.name == "New Name"
    assert updated_response.price == 65.50
    assert updated_response.stock_quantity == 12
    # Ensure untouched properties remain unchanged
    assert updated_response.brand == "Puma"
    assert updated_response.size == 8.0

def test_delete_shoe_removes_from_catalog(database_session):
    # Arrange
    shoe_repository = ShoeRepository(database_session)
    saved_shoe = shoe_repository.save_new_shoe(
        ShoeDatabaseModel(name="To Delete", brand="Jordan", price=200.0, size=11.0, stock_quantity=1)
    )

    # Act
    delete_existing_shoe_workflow(saved_shoe.id, shoe_repository)

    # Assert
    with pytest.raises(ShoeNotFoundError):
        retrieve_shoe_by_id_workflow(saved_shoe.id, shoe_repository)
