from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from source.modules.shoe_catalog.shoe_database_model import ShoeDatabaseModel

class ShoeRepository:
    """
    Handles database operations for the shoe inventory catalog.
    """
    def __init__(self, database_session: Session):
        self.database_session = database_session

    def retrieve_shoe_by_id(self, shoe_identifier: int) -> Optional[ShoeDatabaseModel]:
        """
        Retrieves a shoe database record by its primary identifier.
        """
        return self.database_session.query(ShoeDatabaseModel).filter(
            ShoeDatabaseModel.id == shoe_identifier
        ).first()

    def retrieve_filtered_shoes(
        self,
        brand: Optional[str] = None,
        size: Optional[float] = None,
        minimum_price: Optional[float] = None,
        maximum_price: Optional[float] = None,
        search_query: Optional[str] = None
    ) -> List[ShoeDatabaseModel]:
        """
        Retrieves a list of shoes matching the search query, brand, size, and price filters.
        """
        database_query = self.database_session.query(ShoeDatabaseModel)

        if brand:
            database_query = database_query.filter(ShoeDatabaseModel.brand.ilike(brand))
        if size is not None:
            database_query = database_query.filter(ShoeDatabaseModel.size == size)
        if minimum_price is not None:
            database_query = database_query.filter(ShoeDatabaseModel.price >= minimum_price)
        if maximum_price is not None:
            database_query = database_query.filter(ShoeDatabaseModel.price <= maximum_price)
        if search_query:
            database_query = database_query.filter(
                or_(
                    ShoeDatabaseModel.name.ilike(f"%{search_query}%"),
                    ShoeDatabaseModel.brand.ilike(f"%{search_query}%"),
                    ShoeDatabaseModel.description.ilike(f"%{search_query}%")
                )
            )

        return database_query.all()

    def save_new_shoe(self, shoe_database_instance: ShoeDatabaseModel) -> ShoeDatabaseModel:
        """
        Saves a new shoe catalog record.
        """
        self.database_session.add(shoe_database_instance)
        self.database_session.flush()
        return shoe_database_instance

    def delete_shoe(self, shoe_database_instance: ShoeDatabaseModel) -> None:
        """
        Deletes an existing shoe catalog record.
        """
        self.database_session.delete(shoe_database_instance)
        self.database_session.flush()
