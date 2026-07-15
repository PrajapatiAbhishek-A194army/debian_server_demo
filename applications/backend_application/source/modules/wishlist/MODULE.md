# Wishlist Module

## Module purpose
Allows customers to flag catalog products they have an interest in purchasing later, keeping them saved in a list.

## Owned responsibilities
- Maintain wishlist items for each customer (linked to shoe ID).
- Add shoe items to a customer's wishlist (ignoring duplicates).
- Remove shoe items from a customer's wishlist.
- Retrieve the full list of products in a customer's wishlist.

## Responsibilities not owned
- Cart operations (owned by `shopping_cart` module).
- Product details and catalog listings (owned by `shoe_catalog` module).

## Public operations
- `add_item_to_wishlist`: Saves a product to user's wishlist.
- `remove_item_from_wishlist`: Removes a product.
- `retrieve_user_wishlist`: Lists all wishlist products.

## Internal responsibility map
- `wishlist_item_database_model.py`: Database table definition.
- `wishlist_repository.py`: Database query interface.
- `wishlist_workflows.py`: Business workflows.
- `wishlist_router.py`: REST routes.
