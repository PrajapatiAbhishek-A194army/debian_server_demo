from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from source.shared_backend_infrastructure.database.database_connection import yield_database_session
from source.modules.user_authentication.user_authentication_router import get_current_administrator_user
from source.modules.shoe_catalog.shoe_catalog_contracts import (
    ShoeCreationRequest,
    ShoeModificationRequest,
    ShoeDetailsResponse
)
from source.modules.shoe_catalog.shoe_repository import ShoeRepository
from source.modules.shoe_catalog.shoe_catalog_workflows import (
    retrieve_shoes_catalog_workflow,
    retrieve_shoe_by_id_workflow,
    create_new_shoe_workflow,
    modify_existing_shoe_workflow,
    delete_existing_shoe_workflow,
    ShoeNotFoundError
)

shoe_catalog_router = APIRouter(
    prefix="/api/v1/shoe-catalog",
    tags=["Shoe Catalog"]
)

@shoe_catalog_router.get("", response_model=List[ShoeDetailsResponse])
def get_shoes_catalog_endpoint(
    brand: Optional[str] = None,
    size: Optional[float] = None,
    minimum_price: Optional[float] = None,
    maximum_price: Optional[float] = None,
    search_query: Optional[str] = None,
    database_session: Session = Depends(yield_database_session)
) -> List[ShoeDetailsResponse]:
    """
    Retrieves all shoes in the catalog, applying filters if provided. Public access.
    """
    shoe_repository = ShoeRepository(database_session)
    return retrieve_shoes_catalog_workflow(
        shoe_repository=shoe_repository,
        brand=brand,
        size=size,
        minimum_price=minimum_price,
        maximum_price=maximum_price,
        search_query=search_query
    )

@shoe_catalog_router.get("/{shoe_identifier}", response_model=ShoeDetailsResponse)
def get_shoe_by_id_endpoint(
    shoe_identifier: int,
    database_session: Session = Depends(yield_database_session)
) -> ShoeDetailsResponse:
    """
    Retrieves details of a single shoe item by its ID. Public access.
    """
    shoe_repository = ShoeRepository(database_session)
    try:
        return retrieve_shoe_by_id_workflow(shoe_identifier, shoe_repository)
    except ShoeNotFoundError as not_found_exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(not_found_exception)
        )

@shoe_catalog_router.post(
    "", 
    response_model=ShoeDetailsResponse, 
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_administrator_user)]
)
def create_shoe_endpoint(
    creation_request: ShoeCreationRequest,
    database_session: Session = Depends(yield_database_session)
) -> ShoeDetailsResponse:
    """
    Adds a new shoe to the catalog. Administrative access required.
    """
    shoe_repository = ShoeRepository(database_session)
    return create_new_shoe_workflow(creation_request, shoe_repository)

@shoe_catalog_router.put(
    "/{shoe_identifier}", 
    response_model=ShoeDetailsResponse,
    dependencies=[Depends(get_current_administrator_user)]
)
def modify_shoe_endpoint(
    shoe_identifier: int,
    modification_request: ShoeModificationRequest,
    database_session: Session = Depends(yield_database_session)
) -> ShoeDetailsResponse:
    """
    Modifies attributes of an existing shoe. Administrative access required.
    """
    shoe_repository = ShoeRepository(database_session)
    try:
        return modify_existing_shoe_workflow(
            shoe_identifier=shoe_identifier,
            modification_request=modification_request,
            shoe_repository=shoe_repository
        )
    except ShoeNotFoundError as not_found_exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(not_found_exception)
        )

@shoe_catalog_router.delete(
    "/{shoe_identifier}", 
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(get_current_administrator_user)]
)
def delete_shoe_endpoint(
    shoe_identifier: int,
    database_session: Session = Depends(yield_database_session)
) -> None:
    """
    Removes a shoe from the catalog. Administrative access required.
    """
    shoe_repository = ShoeRepository(database_session)
    try:
        delete_existing_shoe_workflow(shoe_identifier, shoe_repository)
    except ShoeNotFoundError as not_found_exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(not_found_exception)
        )
