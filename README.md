1. Project Setup:
The server is made using Node.js and Express.js.

Data is saved using MongoDB and Mongoose.

Secret things like database URL and JWT secret key are saved in a .env file.

2. User Schema:
A user model is created with 10–11 fields like: name, email, password, gender, phone number, createdAt, etc.

Passwords are secured (hashed) using bcrypt before saving.

3. Authentication System:
Signup API: When a user registers, their details are saved in the database (password is hashed).

Signin API: When user logs in, email and password are checked. If correct, a JWT token is created.

JWT Middleware: Every request checks the token. If the token is not valid, it shows an Unauthorized error.

APIs are tested using Postman, and the token is added in the Authorization section as a Bearer Token.

4. Admin Functionality:
Admins also have their own Signup/Signin system with JWT tokens.

Admin routes are protected — only people with "Admin" role and token can use them.

5. Product Management APIs:
A product model is created with at least 15 fields like:

title, description, price, category, brand, stock, images, ratings, isAvailable, tags, createdBy, updatedBy, createdAt, updatedAt, sku, etc.

🛠️ Product APIs:
Create Product – Only Admins can do this.

Update Product – Only Admins can update.
Also saves admin name and time when updated.

Delete Product – Only Admins can delete.
Also saves admin name and time when deleted.

Get All Products – Only Users can see all products.

Get Product by ID – Only Users can see product details by ID.

6. Final Features Recap:
✅ Login system for both Users and Admins, with different roles
✅ JWT Token for secure login and protected routes
✅ Product module with create, read, update, delete (CRUD) features
✅ Every action (create/update/delete) tracks which admin did it and when
✅ All APIs tested using Postman
