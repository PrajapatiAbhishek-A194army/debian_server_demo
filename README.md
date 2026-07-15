# Containerized Shoe ERP System

A complete containerized Shoe ERP and Storefront system. Features a responsive, cyber-dark glassmorphism React storefront and an administration dashboard for inventory management.

## Key Features

- **JWT Authentication**: Full role-based authentication separating **Administrators** and **Customers**.
- **Shoe Catalog**: Fully searchable catalog filterable by brand, price, and shoe size.
- **Cart & Wishlist Systems**: Interactive customer cart with quantity controllers and wishlist favoriting.
- **Razorpay Payments**: Complete Razorpay integration with secure signature verification and automatic stock decrementing upon payment success.
- **Mock Payment Mode**: Built-in developer mock-payment bypass allows full checkout flow testing even without internet connectivity or live API keys.
- **Pre-populated Database**: Starts with sample shoe models and user profiles ready to use out-of-the-box.
- **Fully Dockerized**: Completely containerized database, backend api, and frontend client.

---

## Quickstart Guide

To boot up the entire system including the database, run:

```bash
docker-compose up --build
```

Once all containers are built and online:
- **Web Application Portal**: Access the frontend at [http://localhost:3000](http://localhost:3000)
- **Backend API Portal**: Access the API documentation at [http://localhost:8000/docs](http://localhost:8000/docs)
- **PostgreSQL Database**: Port `5432` internally.

---

## Default Seeded Credentials

When the system boots for the first time, the database is auto-populated with:

### 1. Store Customer Account
- **Email**: `customer@example.com`
- **Password**: `customerpassword`
- **Actions**: Add items to cart/wishlist, perform checkouts, view order history.

### 2. ERP Administrator Account
- **Email**: `admin@example.com`
- **Password**: `adminpassword`
- **Actions**: Full shoe catalog CRUD (create, edit, delete shoes), track system sales, view customer order transaction records.

---

## Architecture Layout

The codebase strictly aligns with the modular software architecture and descriptive naming standard:

```text
server_demo_project/
├── applications/
│   ├── web_application/                 # React Frontend
│   │   ├── source/
│   │   │   ├── application_startup/     # App entry, Routing,guards
│   │   │   ├── features/                # Business feature views & clients
│   │   │   └── shared_user_interface_infrastructure/ # CSS styling
│   └── backend_application/             # FastAPI Backend
│       ├── source/
│           ├── application_startup/     # API config, seeder
│           ├── modules/                 # Business modules (user_authentication, shoe_catalog, etc.)
│           └── shared_backend_infrastructure/ # Database, security utilities
├── docker-compose.yml                   # System containers configuration
├── .env.example                         # Template environments configuration
└── README.md
```
