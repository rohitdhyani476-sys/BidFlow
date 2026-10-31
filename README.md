# BidFlow – Procurement & Reverse Auction Platform

BidFlow is a web-based procurement and reverse auction platform built with Django REST Framework and React. It allows administrators to create procurement requests, invite suppliers, manage auctions, and identify the lowest bidder.

## Features

### Admin Features
- Admin authentication
- Dashboard with procurement, supplier, and bid statistics
- Create and manage procurement requests
- Set auction start and end times
- Invite suppliers and generate invitation links
- View bid history
- Track the lowest and highest bids
- View auction summaries
- Declare the winning supplier after an auction closes

### Supplier Features
- Access auctions through invitation links
- View procurement details and auction timing
- Submit bids during active auctions
- Receive validation when an auction is not open

### Auction Features
- Scheduled, Active, and Closed auction statuses
- Automatic status calculation when relevant API requests are made
- Bid validation
- Lowest and highest bid calculation
- Winner selection based on the lowest bid
- Admin bid list refreshes automatically every 5 seconds

## Technology Stack

**Backend**
- Python
- Django
- Django REST Framework
- SQLite

**Frontend**
- React
- JavaScript
- Bootstrap 5
- Axios
- React Router
- Vite

## Project Structure

```text
bigflow/
│
├── config/
│   ├── settings.py
│   ├── urls.py
│
├── auctions/
│   ├── migrations/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│
├── manage.py
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd bigflow
```

### 2. Create and activate a virtual environment

```bash
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

### 3. Install backend dependencies

```bash
pip install django djangorestframework
```

### 4. Apply migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Create an admin account

```bash
python manage.py createsuperuser
```

### 6. Start the Django server

```bash
python manage.py runserver
```

Backend URL: `http://127.0.0.1:8000/`

### 7. Start the React frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173/`

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET, POST | `/api/procurements/` | List and create procurements |
| GET, POST | `/api/invitations/` | List and create supplier invitations |
| GET | `/api/invitations/<id>/` | Get invitation details |
| GET, POST | `/api/bids/` | List and submit bids |
| GET | `/api/procurements/<id>/lowest-bid/` | Get lowest bid |
| GET | `/api/procurements/<id>/bids/` | Get procurement bid history |
| GET | `/api/procurements/<id>/summary/` | Get auction summary and winner |

## Auction Workflow

1. Admin logs in to the platform.
2. Admin creates a procurement request with a starting price and auction schedule.
3. Admin invites suppliers and shares their invitation links.
4. Suppliers open their invitation links.
5. Suppliers submit bids while the auction is active.
6. Admin monitors bids and auction statistics.
7. Once the auction closes, the lowest bidder is declared the winner if bids exist.

## Future Improvements

- WebSocket-based real-time bid updates
- Background task scheduler for auction status updates
- Secure, unique invitation tokens
- Improved bid concurrency and validation
- Deployment to a production server
- Automated testing

## Developer

**Rohit Dhyani**

Aspiring Backend Developer | Python | Django REST Framework | React

This project was developed as a practical full-stack application to demonstrate REST API development, database management, authentication, supplier workflows, and auction logic.
