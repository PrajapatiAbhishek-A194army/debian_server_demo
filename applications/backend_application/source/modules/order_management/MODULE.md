# Order Management Module

## Module purpose
Orchestrates the order lifecycle: creating order transactions, integrating with Razorpay for online payments, verifying payment signatures, tracking order histories, and updating shoe stocks.

## Owned responsibilities
- Maintain order database tables and order line items.
- Interface with Razorpay REST API to initialize payment transactions.
- Verify payment authenticity using HMAC-SHA256 signature validation.
- Record payment status (`PENDING`, `PAID`, `FAILED`) and associate payments with user orders.
- Decrement shoe inventory quantities upon successful checkout.

## Responsibilities not owned
- Cart items retrieval (reads from `shopping_cart` module repository).
- Catalog details (retrieves shoe pricing and updates stock via `shoe_catalog` module repository).

## Public operations
- `create_order`: Initiates a pending transaction and registers a Razorpay order.
- `verify_order_payment`: Validates payment signature, marking orders paid and updating inventory.
- `retrieve_user_orders`: Lists order history for a customer.
- `retrieve_all_orders`: Lists all system orders (Admin only).

## Internal responsibility map
- `order_database_model.py`: Database tables (`orders` and `order_line_items`).
- `order_repository.py`: Database query interface.
- `razorpay_payment_gateway.py`: Client code for interacting with Razorpay.
- `order_management_workflows.py`: Core workflow orchestrations.
- `order_management_router.py`: REST routes.
