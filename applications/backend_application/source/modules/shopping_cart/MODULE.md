# Shopping Cart Module

## Module purpose
Manages temporary items selected by customers for potential purchase, calculating line subtotals and supporting item updates.

## Owned responsibilities
- Maintain cart items for each customer (linked to shoe ID and quantity).
- Add items, adjust quantities, and remove items from the customer's cart.
- Provide a summary of the customer's cart with aggregated items and pricing.
- Clear all items from a customer's cart.

## Responsibilities not owned
- Catalog item details (owned by `shoe_catalog` module).
- Final purchase checkout and order generation (owned by `order_management` module).

## Public operations
- `add_item_to_shopping_cart`: Adds a shoe to a user's cart.
- `update_shopping_cart_item_quantity`: Modifies the quantity of a cart item.
- `remove_item_from_shopping_cart`: Removes a single item.
- `retrieve_user_shopping_cart`: Fetches all cart items and details.
- `clear_user_shopping_cart`: Deletes all items in a user's cart.

## Internal responsibility map
- `cart_item_database_model.py`: Database table definition.
- `shopping_cart_repository.py`: Database query interface.
- `shopping_cart_workflows.py`: Business workflows.
- `shopping_cart_router.py`: REST routes.
