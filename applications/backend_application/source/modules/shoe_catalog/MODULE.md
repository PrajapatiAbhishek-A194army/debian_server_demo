# Shoe Catalog Module

## Module purpose
Manages the inventory catalog of shoes, supporting search, filtering (by brand, price, and size), and CRUD operations controlled by user roles.

## Owned responsibilities
- Maintain shoe listings (id, name, brand, description, price, size, stock quantity, and image URL).
- Retrieve and filter shoes based on customer search query, size, brand, and price limits.
- Creating, editing, and deleting shoe inventory records (restricted to administrators).

## Responsibilities not owned
- Cart storage (delegated to the `shopping_cart` module).
- Order verification and product stock decrementing (coordinated by the `order_management` module).

## Public operations
- `retrieve_filtered_shoes`: Fetches all shoes matching criteria.
- `retrieve_shoe_by_identifier`: Fetches detailed shoe item by ID.
- `create_new_shoe`: Adds a shoe (Admin only).
- `modify_existing_shoe`: Updates shoe details (Admin only).
- `delete_existing_shoe`: Removes a shoe (Admin only).

## Internal responsibility map
- `shoe_database_model.py`: Database table definition.
- `shoe_repository.py`: Database query interface.
- `shoe_catalog_workflows.py`: Business orchestration workflows.
- `shoe_catalog_router.py`: REST routes.
