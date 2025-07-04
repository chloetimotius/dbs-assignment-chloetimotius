Sure! Here's the full `README.md` content **with no emojis** and **formatted for clean copy-pasting**:

---

# DBS Online Shopping App (ST0525 CA1)

An online shopping web application developed as part of the ST0525 Database Systems module. The application supports review and comment management, along with an administrator dashboard for data analysis.

## Setup Instructions

### 1. Clone this repository

```
git clone <your-repo-url>
cd <your-repo-name>
```

### 2. Create .env file

Create a `.env` file in the root directory and configure your database settings:

```
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_DATABASE=your_db_name
DB_CONNECTION_LIMIT=1
PORT=3000
```

Ensure the database and tables are already created using the setup provided by your lecturer.

### 3. Install dependencies

```
npm install
```

### 4. Start the application

For normal start:

```
npm start
```

For hot reload (development mode):

```
npm run dev
```

You should see:

```
App listening on port 3000
```

## Usage

Visit the site in your browser:

```
http://localhost:3000
```

If you configured a different port in `.env`, replace `3000` with your port.

## Features Implemented

### Member Features

* Register and login
* Place and view orders

### Review Management

* Create, update, and delete personal reviews
* Validation ensures reviews can only be made for completed orders
* Endpoints include `/review/create` and `/review/retrieve/all`

### Comment Management

* Add comments to others' reviews
* Only authors can delete their own comments
* Comments appear on product review pages

### Admin Dashboard

Available at: `/saleOrders/admin/dashboard/salesOrderSummary`

Supports:

* Viewing summarized data from:

  * member
  * sale\_order
  * sale\_order\_item
  * product
* Filtering by:

  * Gender
  * Product type
  * Date range
  * Total spending
* Summarized spending by age group
* Sorting by total spending, total orders, average order value, and quantity

## Technologies Used

* Node.js + Express
* pgAdmin
* HTML, CSS, JavaScript
* dotenv
* JWT for authentication

## Submission Notes

This assignment includes:

* User-defined stored procedures and functions for:

  * Reviews: `create_review`, `update_review`, `delete_review`, `get_reviews`
  * Comments: `create_comment`, `get_comments`, `delete_comment`
  * Admin Dashboard: `get_sale_order_summary`
* Full backend logic implemented in SQL, not in application code
* Authentication checks for admin access

## Deliverables Summary

| Deliverable       | Description                                     |
| ----------------- | ----------------------------------------------- |
| GitHub Repo       | Code with regular commits and SQL scripts       |
| Individual Report | PDF report with function design and screenshots |
| Code Zip          | Application source code without node\_modules   |
| DB Backup         | PostgreSQL `.sql` backup of the database        |

## Author

Name: Chloe Timotius
Student ID: 2429902
Module: ST0525 Database Systems
Class: DIT/FT/2A/05

