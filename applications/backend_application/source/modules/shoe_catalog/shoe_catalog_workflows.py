from typing import List, Optional
from source.modules.shoe_catalog.shoe_catalog_contracts import (
    ShoeCreationRequest,
    ShoeModificationRequest,
    ShoeDetailsResponse
)
from source.modules.shoe_catalog.shoe_repository import ShoeRepository
from source.modules.shoe_catalog.shoe_database_model import ShoeDatabaseModel

class ShoeNotFoundError(Exception):
    """Raised when a requested shoe identifier is not found in the catalog."""
    pass

def retrieve_shoes_catalog_workflow(
    shoe_repository: ShoeRepository,
    brand: Optional[str] = None,
    size: Optional[float] = None,
    minimum_price: Optional[float] = None,
    maximum_price: Optional[float] = None,
    search_query: Optional[str] = None
) -> List[ShoeDetailsResponse]:
    """
    Retrieves all shoes matching the filters and formats them as details response models.
    """
    shoe_database_records = shoe_repository.retrieve_filtered_shoes(
        brand=brand,
        size=size,
        minimum_price=minimum_price,
        maximum_price=maximum_price,
        search_query=search_query
    )
    
    return [
        ShoeDetailsResponse(
            id=shoe.id,
            name=shoe.name,
            brand=shoe.brand,
            description=shoe.description,
            price=shoe.price,
            size=shoe.size,
            stock_quantity=shoe.stock_quantity,
            image_url=shoe.image_url
        )
        for shoe in shoe_database_records
    ]

def retrieve_shoe_by_id_workflow(
    shoe_identifier: int,
    shoe_repository: ShoeRepository
) -> ShoeDetailsResponse:
    """
    Retrieves a single shoe by ID, raising ShoeNotFoundError if it doesn't exist.
    """
    shoe = shoe_repository.retrieve_shoe_by_id(shoe_identifier)
    if shoe is None:
        raise ShoeNotFoundError(f"Shoe with identifier {shoe_identifier} was not found.")
        
    return ShoeDetailsResponse(
        id=shoe.id,
        name=shoe.name,
        brand=shoe.brand,
        description=shoe.description,
        price=shoe.price,
        size=shoe.size,
        stock_quantity=shoe.stock_quantity,
        image_url=shoe.image_url
    )

def create_new_shoe_workflow(
    creation_request: ShoeCreationRequest,
    shoe_repository: ShoeRepository
) -> ShoeDetailsResponse:
    """
    Orchestrates the addition of a new shoe to the catalog.
    """
    new_shoe_record = ShoeDatabaseModel(
        name=creation_request.name,
        brand=creation_request.brand,
        description=creation_request.description,
        price=creation_request.price,
        size=creation_request.size,
        stock_quantity=creation_request.stock_quantity,
        image_url=creation_request.image_url
    )
    
    saved_shoe = shoe_repository.save_new_shoe(new_shoe_record)
    
    return ShoeDetailsResponse(
        id=saved_shoe.id,
        name=saved_shoe.name,
        brand=saved_shoe.brand,
        description=saved_shoe.description,
        price=saved_shoe.price,
        size=saved_shoe.size,
        stock_quantity=saved_shoe.stock_quantity,
        image_url=saved_shoe.image_url
    )

def modify_existing_shoe_workflow(
    shoe_identifier: int,
    modification_request: ShoeModificationRequest,
    shoe_repository: ShoeRepository
) -> ShoeDetailsResponse:
    """
    Orchestrates updating attributes of a shoe.
    """
    shoe = shoe_repository.retrieve_shoe_by_id(shoe_identifier)
    if shoe is None:
        raise ShoeNotFoundError(f"Shoe with identifier {shoe_identifier} was not found.")
        
    if modification_request.name is not None:
        shoe.name = modification_request.name
    if modification_request.brand is not None:
        shoe.brand = modification_request.brand
    if modification_request.description is not None:
        shoe.description = modification_request.description
    if modification_request.price is not None:
        shoe.price = modification_request.price
    if modification_request.size is not None:
        shoe.size = modification_request.size
    if modification_request.stock_quantity is not None:
        shoe.stock_quantity = modification_request.stock_quantity
    if modification_request.image_url is not None:
        shoe.image_url = modification_request.image_url

    # Save is implicit via transaction commit when dependency session yields back,
    # but we can return the updated representation.
    return ShoeDetailsResponse(
        id=shoe.id,
        name=shoe.name,
        brand=shoe.brand,
        description=shoe.description,
        price=shoe.price,
        size=shoe.size,
        stock_quantity=shoe.stock_quantity,
        image_url=shoe.image_url
    )

def delete_existing_shoe_workflow(
    shoe_identifier: int,
    shoe_repository: ShoeRepository
) -> None:
    """
    Orchestrates deleting a shoe from catalog.
    """
    shoe = shoe_repository.retrieve_shoe_by_id(shoe_identifier)
    if shoe is None:
        raise ShoeNotFoundError(f"Shoe with identifier {shoe_identifier} was not found.")
    
    shoe_repository.delete_shoe(shoe)
