
# 🍕 Food Delivery Backend API

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)

**A complete RESTful API for a Food Delivery Platform** 

[Features](#-features) •
[Installation](#-installation) •
[API Documentation](#-api-documentation) •
[Database Schema](#-database-schema)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
  - [Authentication](#authentication)
  - [Customer Endpoints](#customer-endpoints)
  - [Restaurant Endpoints](#restaurant-endpoints)
  - [Admin Endpoints](#admin-endpoints)
- [Database Schema](#-database-schema)
- [Security](#-security)
- [Contributing](#-contributing)

---

## 🌟 Overview

This is a comprehensive backend API for a **Food Delivery Platform** that connects customers with restaurants. The system supports:

- 👤 **Customers** - Browse restaurants, add dishes to cart, place orders, and make payments
- 🍽️ **Restaurants** - Manage menu, handle orders, view dashboard statistics
- 👨‍💼 **Admins** - Confirm payments and manage the platform

The API features **geospatial queries** for finding nearby restaurants based on delivery zones, **real-time order tracking**, and **secure payment processing** with proof uploads.

---

## ✨ Features

### For Customers
- 📝 **Account Management** - Sign up, login, profile management
- 🔍 **Restaurant Discovery** - Find nearby restaurants based on location (GIS/Polygon-based)
- 🛒 **Shopping Cart** - Add, update, remove dishes from cart
- 📦 **Order Placement** - Place orders with delivery or reservation
- 💳 **Payment System** - Upload payment proof (Vodafone Cash / InstaPay)
- 📍 **Location-based Delivery** - Smart delivery fee calculation based on distance

### For Restaurants
- 🏪 **Restaurant Profile** - Complete profile management with delivery zones
- 🍕 **Menu Management** - Add, edit, delete dishes with multiple images
- 📊 **Dashboard Analytics** - Real-time statistics (revenue, orders, top dishes)
- 📋 **Order Management** - View and update order statuses
- ⏰ **Working Hours** - Set open/close times
- 🚗 **Delivery Settings** - Configure delivery radius and fees

### For Admins
- ✅ **Payment Confirmation** - Review and confirm payment proofs
- 📈 **Platform Overview** - Monitor all activities

### Technical Features
- 🔐 **JWT Authentication** - Secure token-based authentication
- 🍪 **HTTP-Only Cookies** - Secure session management
- � **Safari/iOS Support** - Token fallback via Authorization header for mobile browsers
- 📸 **Image Upload** - Cloudinary integration for images
- 🗺️ **Geospatial Queries** - MySQL spatial functions for delivery zones
- 🔄 **Transaction Support** - Database transactions for data integrity
- 🛡️ **Role-Based Access** - Customer, Restaurant, Admin roles with middleware protection

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **MySQL** | Database with spatial support |
| **JWT** | Authentication |
| **bcryptjs** | Password hashing |
| **Cloudinary** | Image storage & CDN |
| **Multer** | File upload handling |
| **CORS** | Cross-origin resource sharing |
| **Cookie Parser** | Cookie handling |

---

## 📁 Project Structure

```
Food-back-nod/
├── 📄 start.js              # Application entry point
├── 📄 router.js             # Route definitions
├── 📄 package.json          # Dependencies
├── 📄 .env                  # Environment variables
│
├── 📂 Customers/            # Customer-related modules
│   ├── authForCustomers.js  # Auth (signup, login, profile)
│   ├── orders.js            # Cart & order management
│   └── payments.js          # Payment processing
│
├── 📂 restaurantServes/     # Restaurant-related modules
│   ├── authForRestaurant.js # Auth, profile, dashboard
│   └── Dishes.js            # Menu management
│
├── 📂 middleware/           # Middleware functions
│   ├── jwtmake.js           # JWT token creation
│   ├── vaildJwt.js          # Token validation & role verification
│   └── muilter.js           # File upload configuration
│
└── 📂 data/                 # Data layer
    ├── data.js              # Database connection (MySQL)
    └── cloudTheImg.js       # Cloudinary configuration
```

---

## 🚀 Installation

### Prerequisites

- Node.js (v18 or higher)
- MySQL Server
- Cloudinary Account

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/food-delivery-api.git
cd food-delivery-api
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up the database**
```sql
-- Create database
CREATE DATABASE food_delivery;

-- Run the schema (see Database Schema section)
```

5. **Start the server**
```bash
node start.js
```

The server will run at `http://localhost:3444`

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=food_delivery

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=24h

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server Configuration
PORT=3444
NODE_ENV=development
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:3444
```

### Response Format
All responses follow this format:
```json
{
  "message": "Success message",
  "data": { }
}
```

Error Response:
```json
{
  "error": "Error message"
}
```

---

## Authentication

### Customer Signup
```http
POST /customer/signup
```

**Request Body:**
```json
{
  "name": "Ahmed Mohamed",
  "email": "ahmed@example.com",
  "password": "securePassword123",
  "phone": "01012345678",
  "role": "customer"
}
```

**Response:** `201 Created`
```json
{
  "message": "User registered successfully"
}
```

---

### Customer Login
```http
POST /customer/login
```

**Request Body:**
```json
{
  "email": "ahmed@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "Ahmed Mohamed",
    "email": "ahmed@example.com",
    "role": "customer",
    "phone": "01012345678",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Restaurant Signup
```http
POST /restaurant/signup
```

**Request Body:**
```json
{
  "name": "Pizza House",
  "email": "pizza@restaurant.com",
  "password": "securePassword123",
  "phone": "01098765432",
  "description": "Best pizza in town",
  "location": "123 Main Street, Cairo",
  "allowed_radius_km": 15,
  "open_time": "10:00:00",
  "close_time": "23:00:00",
  "area_name": "Cairo Downtown",
  "can_deliver": true,
  "can_reserve": true,
  "delivery_area": [
    [31.2357, 30.0444],
    [31.2400, 30.0500],
    [31.2300, 30.0550],
    [31.2357, 30.0444]
  ]
}
```

> 📍 **Note:** `delivery_area` is an array of coordinates forming a polygon that defines the restaurant's delivery zone.

---

### Restaurant Login
```http
POST /restaurant/login
```

**Request Body:**
```json
{
  "email": "pizza@restaurant.com",
  "password": "securePassword123"
}
```

---

## Customer Endpoints

### 🔐 All customer endpoints require authentication
Add header: `Authorization: Bearer <token>`

---

### Get Profile
```http
GET /customer/profile
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": 1,
    "name": "Ahmed Mohamed",
    "email": "ahmed@example.com",
    "phone": "01012345678"
  }
}
```

---

### Update Profile
```http
PUT /customer/change-info
```

**Request Body:**
```json
{
  "name": "Ahmed Ali",
  "phone": "01111111111"
}
```

---

### Find Nearby Restaurants
```http
POST /customer/nearest-restaurants
```

**Request Body:**
```json
{
  "lat": 30.0444,
  "lng": 31.2357
}
```

**Response:** `200 OK`
```json
{
  "count": 3,
  "nearby_restaurants": [
    {
      "id": 1,
      "restaurant_id": 1,
      "area_id": 1,
      "description": "Best pizza in town",
      "location": "123 Main Street"
    }
  ]
}
```

---

### Get All Restaurants
```http
GET /restaurant/all
```

**Response:** `200 OK`
```json
{
  "restaurants": [
    {
      "id": 1,
      "description": "Best pizza in town",
      "location": "123 Main Street",
      "can_deliver": true,
      "can_reserve": true
    }
  ]
}
```

---

### Get Restaurant Dishes
```http
POST /restaurant/all-dishes-for-restaurantE
```

**Request Body:**
```json
{
  "restaurantId": 1
}
```

**Response:** `200 OK`
```json
{
  "dishes": [
    {
      "id": 1,
      "name": "Margherita Pizza",
      "description": "Classic Italian pizza",
      "price": 85.00,
      "image": "https://cloudinary.com/...",
      "category": "pizza",
      "is_available": true,
      "preparation_time": 20
    }
  ]
}
```

---

### Add Dish to Cart
```http
POST /customer/add-dish-to-cart
```

**Request Body:**
```json
{
  "dishId": 1,
  "quantity": 2
}
```

**Response:** `201 Created`
```json
{
  "message": "Dish added to cart successfully"
}
```

---

### View Cart
```http
GET /customer/view-cart
```

**Response:** `200 OK`
```json
{
  "cartItems": [
    {
      "dishId": 1,
      "quantity": 2,
      "name": "Margherita Pizza",
      "description": "Classic Italian pizza",
      "price": 85.00
    }
  ]
}
```

---

### Remove Dish from Cart
```http
DELETE /customer/remove-dish-from-cart
```

**Request Body:**
```json
{
  "dishId": 1
}
```

---

### Place Order
```http
POST /customer/place-order
```

**Request Body:**
```json
{
  "location": "456 Customer Street, Cairo",
  "lat": 30.0500,
  "lng": 31.2400,
  "is_reservation": false,
  "reservation_date": null
}
```

**Response:** `201 Created`
```json
{
  "message": "Order processing completed",
  "createdOrders": [
    {
      "orderId": 1,
      "restaurantId": 1,
      "totalAmount": 185.50,
      "deliveryFee": 15.50
    }
  ],
  "failedOrders": []
}
```

> 🚗 **Delivery Fee Calculation:** 
> - Calculates distance from restaurant to customer
> - Checks if within allowed radius
> - Applies per-km delivery fee

---

### Upload Payment Proof
```http
POST /customer/upload-payment-proof
Content-Type: multipart/form-data
```

**Form Data:**
- `orderId`: 1
- `payment_method`: "vodafone_cash" | "instapay"
- `images`: [payment screenshot file]

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Payment proof uploaded successfully. Waiting for confirmation.",
  "data": {
    "paymentId": 1,
    "order_id": 1,
    "amount": 185.50,
    "paymentMethod": "vodafone_cash",
    "payment_proof": "https://cloudinary.com/...",
    "status": "pending"
  }
}
```

---

### Check Payment Status
```http
POST /customer/payment-status
```

**Request Body:**
```json
{
  "orderId": 1
}
```

---

## Restaurant Endpoints

### 🔐 All restaurant endpoints require authentication
Add header: `Authorization: Bearer <token>`

---

### Get Restaurant Profile
```http
GET /restaurant/profile
```

**Response:** `200 OK`
```json
{
  "restaurantProfile": {
    "name": "Pizza House",
    "email": "pizza@restaurant.com",
    "phone": "01098765432",
    "description": "Best pizza in town",
    "location": "123 Main Street",
    "allowed_radius_km": 15,
    "open_time": "10:00:00",
    "close_time": "23:00:00",
    "delivery_fees": 5.00
  },
  "dishes": [...]
}
```

---

### Update Restaurant Info
```http
PUT /restaurant/change-info
```

**Request Body:**
```json
{
  "name": "Pizza House Premium",
  "email": "contact@pizzahouse.com",
  "phone": "01098765432",
  "description": "Updated description",
  "location": "New Address",
  "allowed_radius_km": 20,
  "open_time": "09:00:00",
  "close_time": "00:00:00",
  "delivery_fees": 7.00
}
```

---

### Toggle Restaurant Open/Closed
```http
GET /restaurant/is-open
```

**Response:** `200 OK`
```json
{
  "message": "Restaurant status updated successfully",
  "is_open": 1
}
```

---

### Add New Dish
```http
POST /restaurant/add-dish
Content-Type: multipart/form-data
```

**Form Data:**
- `name`: "Pepperoni Pizza"
- `description`: "Spicy pepperoni with cheese"
- `price`: 95
- `preparation_time`: 25
- `category`: "pizza"
- `images`: [up to 5 image files]

**Response:** `201 Created`
```json
{
  "message": "Dish added successfully"
}
```

---

### Update Dish
```http
PUT /restaurant/change-dish
```

**Request Body:**
```json
{
  "dishId": 1,
  "name": "Updated Pizza Name",
  "description": "Updated description",
  "price": 100,
  "preparation_time": 30,
  "category": "pizza"
}
```

---

### Change Dish Availability
```http
PUT /restaurant/change-dish-availability
```

**Request Body:**
```json
{
  "dishId": 1,
  "is_available": false
}
```

---

### Delete Dish
```http
DELETE /restaurant/delete-dish
```

**Request Body:**
```json
{
  "dishId": 1
}
```

---

### Get Dashboard Statistics
```http
GET /restaurant/dashboard
```

**Response:** `200 OK`
```json
{
  "restaurant": {
    "id": 1,
    "name": "Pizza House",
    "is_open": true,
    ...
  },
  "stats": {
    "dishes": {
      "total": 25,
      "available": 20
    },
    "orders": {
      "today": 45,
      "pending": 8,
      "total": 1250
    },
    "revenue": {
      "today": 3500.00,
      "total": 125000.00
    }
  },
  "recentOrders": [...],
  "topDishes": [...]
}
```

---

### Get Restaurant Orders
```http
GET /restaurant/orders?status=pending&limit=50&offset=0
```

**Query Parameters:**
- `status` (optional): Filter by status (pending, paid, cooking, delivering, completed, cancelled)
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:** `200 OK`
```json
{
  "orders": [
    {
      "id": 1,
      "total_amount": 185.50,
      "delivery_fee": 15.50,
      "status": "pending",
      "is_reservation": false,
      "location": "Customer address",
      "created_at": "2026-01-31T10:30:00Z",
      "customer_name": "Ahmed Mohamed",
      "customer_phone": "01012345678",
      "items": [
        {
          "dish_id": 1,
          "dish_name": "Margherita Pizza",
          "quantity": 2,
          "price": 85.00
        }
      ]
    }
  ]
}
```

---

### Update Order Status
```http
POST /restaurant/order-status
```

**Request Body:**
```json
{
  "orderId": 1,
  "status": "cooking"
}
```

**Valid Status Values:**
- `pending` - Order received
- `paid` - Payment confirmed
- `cooking` - Being prepared
- `delivering` - Out for delivery
- `completed` - Delivered
- `cancelled` - Order cancelled

---

## Admin Endpoints

### 🔐 Requires admin authentication

---

### Confirm Payment
```http
POST /admin/confirmPayment
```

**Request Body:**
```json
{
  "paymentId": 1,
  "status": "approved"
}
```

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    role ENUM('customer', 'restaurant', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Restaurant Profiles Table
```sql
CREATE TABLE restaurant_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    description TEXT,
    location VARCHAR(500),
    allowed_radius_km DECIMAL(5,2) DEFAULT 10,
    open_time TIME,
    close_time TIME,
    is_open BOOLEAN DEFAULT TRUE,
    delivery_fees DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Restaurant Delivery Areas Table
```sql
CREATE TABLE restaurant_delivery_areas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    restaurant_id INT NOT NULL,
    area_name VARCHAR(255),
    can_deliver BOOLEAN DEFAULT TRUE,
    can_reserve BOOLEAN DEFAULT FALSE,
    delivery_area POLYGON NOT NULL SRID 4326,
    FOREIGN KEY (restaurant_id) REFERENCES restaurant_profiles(id) ON DELETE CASCADE,
    SPATIAL INDEX (delivery_area)
);
```

### Dishes Table
```sql
CREATE TABLE dishes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    restaurant_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image TEXT,
    category VARCHAR(100),
    preparation_time INT DEFAULT 20,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurant_profiles(id) ON DELETE CASCADE
);
```

### Carts Table
```sql
CREATE TABLE carts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Cart Items Table
```sql
CREATE TABLE cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cart_id INT NOT NULL,
    dish_id INT NOT NULL,
    quantity INT DEFAULT 1,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE
);
```

### Orders Table
```sql
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    payment_id INT,
    total_amount DECIMAL(10,2) NOT NULL,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    status ENUM('pending', 'paid', 'cooking', 'delivering', 'completed', 'cancelled') DEFAULT 'pending',
    location VARCHAR(500),
    is_reservation BOOLEAN DEFAULT FALSE,
    reservation_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurant_profiles(id),
    FOREIGN KEY (payment_id) REFERENCES payments(id)
);
```

### Order Items Table
```sql
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    dish_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (dish_id) REFERENCES dishes(id)
);
```

### Payments Table
```sql
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('vodafone_cash', 'instapay') NOT NULL,
    payment_proof VARCHAR(500),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    confirmed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

---

## 🔐 Security

### Authentication
- **JWT Tokens** - Secure, stateless authentication
- **HTTP-Only Cookies** - Prevents XSS attacks
- **Authorization Header Fallback** - Supports `Bearer` token for Safari/iOS compatibility
- **Token Expiration** - 2-hour validity
- **Minimal JWT Payload** - Only essential data (id, name, email, role) for security

### Token Handling
The API supports dual authentication methods for maximum compatibility:

```javascript
// Backend automatically checks both:
const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];
```

**Why?** Safari on iOS has strict cookie policies (ITP) that may block cookies. The Authorization header works as a fallback.

**Frontend Implementation:**
```javascript
// Axios interceptor for automatic token handling
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('customerToken') || localStorage.getItem('vendorToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Password Security
- **bcryptjs** - Industry-standard password hashing
- **Salt Rounds: 11** - Strong hashing complexity

### API Security
- **CORS Configuration** - Controlled cross-origin access
- **Role-Based Access Control** - Separate middleware for each role
- **Input Validation** - Request body validation

### Role-Based Middleware

Protect routes based on user type:

```javascript
// Restaurant-only routes
router.get('/dashboard', sureToken, restaurantOnly, getDashboard);
router.post('/add-dish', sureToken, restaurantOnly, addDish);

// Customer-only routes  
router.post('/place-order', sureToken, customerOnly, placeOrder);
router.get('/view-cart', sureToken, customerOnly, viewCart);

// Admin-only routes
router.post('/confirmPayment', sureToken, adminOnly, confirmPayment);
```

**Available Middleware:**
| Middleware | Purpose |
|------------|----------|
| `sureToken` | Validates JWT token |
| `customerOnly` | Restricts to customers |
| `restaurantOnly` | Restricts to restaurants |
| `adminOnly` | Restricts to admins |
| `verifyRoleForRestaurant` | Validates restaurant profile exists |
| `verifyResturntAreActive` | Checks if restaurant is verified |

### Data Protection
- **Parameterized Queries** - SQL injection prevention
- **Transaction Support** - Data integrity for critical operations

---

## 🔧 Error Handling

| Status Code | Meaning |
|-------------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request - Invalid input |
| `401` | Unauthorized - Missing/invalid token |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource doesn't exist |
| `500` | Internal Server Error |

---

## 📊 Order Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Customer  │────▶│   pending   │────▶│    paid     │
│ Places Order│     │   (order)   │     │  (payment   │
└─────────────┘     └─────────────┘     │  confirmed) │
                                        └──────┬──────┘
                                               │
                    ┌─────────────┐     ┌──────▼──────┐
                    │  completed  │◀────│   cooking   │
                    │             │     │             │
                    └─────────────┘     └──────┬──────┘
                           ▲                   │
                           │            ┌──────▼──────┐
                           └────────────│  delivering │
                                        │             │
                                        └─────────────┘
```

---

## 🗺️ Geospatial Features

This API uses **MySQL Spatial Functions** for location-based features:

### How It Works

1. **Restaurant registers** with a polygon defining their delivery zone
2. **Customer searches** by sending their coordinates
3. **System checks** if customer location is within any restaurant's delivery polygon using `ST_Intersects()`
4. **Distance calculation** for delivery fee using `ST_Distance_Sphere()`

### Example Polygon
```json
{
  "delivery_area": [
    [31.2357, 30.0444],  // lng, lat
    [31.2400, 30.0500],
    [31.2300, 30.0550],
    [31.2357, 30.0444]   // Must close the polygon
  ]
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**Youssef** - *Full Stack Developer*

---

## 🙏 Acknowledgments

- Express.js community
- MySQL spatial documentation
- Cloudinary for image hosting

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ and ☕

</div>
