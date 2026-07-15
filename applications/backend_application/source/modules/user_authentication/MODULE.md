# User Authentication Module

## Module purpose
Handles user registration, identity verification, and token signing/verification, distinguishing between administrators and customer roles.

## Owned responsibilities
- User account creation (registration) with encrypted credentials.
- User identity verification (login) using email and password.
- Generating JWT access tokens for authenticated users.

## Responsibilities not owned
- Session storage (handled stateless via JWT tokens).
- Database connection lifecycle management (owned by `shared_backend_infrastructure/database`).

## Public operations
- `register_new_user`: Registers a new user.
- `authenticate_user_credentials`: Logins and retrieves an access token.

## Internal responsibility map
- `user_database_model.py`: Database table definition.
- `password_hasher.py`: Bcrypt password hashing.
- `user_repository.py`: Querying and saving user records.
- `user_authentication_workflows.py`: Registration and login business orchestrators.
- `user_authentication_router.py`: REST routes.

## Invariants
- User emails must be unique.
- Passwords must be hashed using bcrypt before database insertion.
- Only the roles `admin` and `customer` are valid.
