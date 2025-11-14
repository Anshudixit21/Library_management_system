# Library Management System

A comprehensive Library Management System built with Node.js, Express.js, MongoDB, HTML, CSS, and JavaScript.

## Features

### User Roles
- **Admin**: Full access to Maintenance, Reports, and Transactions modules
- **User**: Access to Reports and Transactions modules (no Maintenance access)

### Modules

#### 1. Maintenance Module (Admin Only)
- **Add Book**: Add new books or movies to the library
- **Update Book**: Update existing book information
- **User Management**: Create new users or update existing users

#### 2. Transactions Module
- **Book Available**: Search for available books by name, author, type, or serial number
- **Book Issue**: Issue books to members with automatic return date calculation (15 days)
- **Return Book**: Process book returns with fine calculation
- **Fine Pay**: Pay fines for late returns

#### 3. Reports Module
- **Transactions Report**: View all book transactions
- **Books Report**: View all books with availability status
- **Memberships Report**: View all memberships with status
- **Fines Report**: View fine details and payment status

#### 4. Membership Module (Admin Only)
- **Add Membership**: Create new memberships (6 months, 1 year, or 2 years)
- **Update Membership**: Extend or cancel existing memberships

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. Clone or download the project
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory (optional, defaults are provided):
```
MONGODB_URI=mongodb://localhost:27017/library_management
JWT_SECRET=your_secret_key_change_in_production
PORT=3000
```

4. Start MongoDB service (if using local MongoDB)

5. Run the application:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

6. Open your browser and navigate to:
```
http://localhost:3000
```

## Initial Setup

### Create Default Users

You can create default admin and user accounts using the registration API or by using a MongoDB client:

**Using API (after server starts):**
```bash
# Create Admin
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "role": "admin",
    "name": "Administrator",
    "email": "admin@library.com"
  }'

# Create User
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user",
    "password": "user123",
    "role": "user",
    "name": "Test User",
    "email": "user@library.com"
  }'
```

**Or use MongoDB Compass/Shell:**
```javascript
use library_management
db.users.insertOne({
  username: "admin",
  password: "$2a$10$...", // bcrypt hash of "admin123"
  role: "admin",
  name: "Administrator",
  email: "admin@library.com"
})
```

## Usage

### Login
1. Navigate to the login page
2. Enter username and password
3. Select user type (Admin or User)
4. Click Login

### Admin Features
- Access Maintenance module to manage books and users
- Access Transactions module for book operations
- Access Reports module for system analytics
- Access Membership module to manage memberships

### User Features
- Access Transactions module for book operations
- Access Reports module to view reports

## Form Validations

### Book Available
- At least one search field must be filled

### Book Issue
- Book name is required
- Author is auto-populated and non-editable
- Issue date cannot be less than today
- Return date is auto-populated (15 days from issue date) and can be edited but not more than 15 days

### Return Book
- Book name and serial number are required
- Author, issue date, and return date are auto-populated
- Return date can be edited

### Fine Pay
- If fine exists, fine must be paid before completing return
- All fields except fine paid and remarks are auto-populated

### Add/Update Book
- All fields are mandatory
- Type (book/movie) must be selected (default: book)

### Add/Update Membership
- All fields are mandatory
- Membership type must be selected (default: 6 months)

### User Management
- Name is mandatory
- For new users, all fields are mandatory
- For existing users, select user first

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (for setup)

### Books
- `GET /api/books` - Get all books (with optional search params)
- `GET /api/books/available` - Get available books
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Add book (Admin only)
- `PUT /api/books/:id` - Update book (Admin only)

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get transaction by ID
- `POST /api/transactions/issue` - Issue a book
- `POST /api/transactions/return` - Return a book
- `POST /api/transactions/pay-fine/:id` - Pay fine

### Memberships
- `GET /api/memberships` - Get all memberships
- `GET /api/memberships/:membershipNumber` - Get membership by number
- `POST /api/memberships` - Add membership (Admin only)
- `PUT /api/memberships/:membershipNumber` - Update membership (Admin only)

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)

### Reports
- `GET /api/reports?type=transactions` - Get transactions report
- `GET /api/reports?type=books` - Get books report
- `GET /api/reports?type=memberships` - Get memberships report
- `GET /api/reports?type=fines` - Get fines report

## Project Structure

```
library-management-system/
├── models/              # MongoDB models
│   ├── User.js
│   ├── Book.js
│   ├── Membership.js
│   └── Transaction.js
├── routes/              # API routes
│   ├── auth.js
│   ├── books.js
│   ├── memberships.js
│   ├── transactions.js
│   ├── users.js
│   └── reports.js
├── middleware/          # Middleware functions
│   └── auth.js
├── public/              # Frontend files
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── auth.js
│   │   ├── common.js
│   │   ├── maintenance.js
│   │   ├── transactions.js
│   │   ├── membership.js
│   │   └── reports.js
│   ├── index.html
│   ├── admin-home.html
│   ├── user-home.html
│   ├── maintenance.html
│   ├── transactions.html
│   ├── membership.html
│   └── reports.html
├── server.js            # Main server file
├── package.json
└── README.md
```

## Notes

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Fine calculation: ₹10 per day after return date
- Default membership duration: 6 months
- Book return period: 15 days from issue date

## Assumptions Made

1. **Fine Calculation**: ₹10 per day for late returns (this can be configured)
2. **Return Period**: 15 days from issue date (as specified)
3. **Membership Types**: 6 months, 1 year, 2 years (as specified)
4. **Book Types**: Book and Movie (as specified)
5. **Password Hashing**: Using bcryptjs with 10 salt rounds
6. **Token Expiry**: JWT tokens expire after 24 hours

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check the connection string in `.env` file
- For MongoDB Atlas, ensure your IP is whitelisted

### Port Already in Use
- Change the PORT in `.env` file
- Or stop the process using port 3000

### CORS Issues
- CORS is enabled for all origins in development
- For production, configure CORS properly

## License

This project is for educational purposes.

