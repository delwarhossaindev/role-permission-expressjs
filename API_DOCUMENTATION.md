# Role Permission API Documentation

**Base URL:** `http://localhost:3000`

## Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Moderator | moderator@example.com | mod123 |
| User | user@example.com | user123 |

---

## 🔓 Public Routes (No Auth Required)

### 1. Register
```
POST /register
Content-Type: application/json

{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123"
}
```

### 2. Login
```
POST /login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "name": "Admin",
    "email": "admin@example.com",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🔐 Protected Routes (Token Required)

**Header:** `Authorization: Bearer <token>`

---

## Auth Routes

### 3. Logout
```
POST /logout
Authorization: Bearer <token>
```

### 4. Get Logged User
```
GET /loggeduser
Authorization: Bearer <token>
```

### 5. Change Password
```
POST /changepassword
Authorization: Bearer <token>
Content-Type: application/json

{
  "old_password": "admin123",
  "new_password": "newpassword123"
}
```

### 6. Get My Permissions
```
GET /my-permissions
Authorization: Bearer <token>
```

---

## User Routes

### 7. Get User List (Paginated)
```
GET /user_list?page=1&limit=10
Authorization: Bearer <token>
```
**Permission Required:** `read-user`

### 8. Get All Users
```
GET /all_user_list
Authorization: Bearer <token>
```
**Permission Required:** `read-user`

### 9. Show User
```
GET /user_show/:id
Authorization: Bearer <token>
```
**Permission Required:** `read-user`

### 10. Get User for Edit
```
GET /user_edit/:id
Authorization: Bearer <token>
```
**Permission Required:** `update-user`

### 11. Update User
```
PUT /user_update/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "updated@example.com",
  "roleId": 2,
  "isActive": true
}
```
**Permission Required:** `update-user`

### 12. Delete User
```
DELETE /user_delete/:id
Authorization: Bearer <token>
```
**Permission Required:** `delete-user`

### 13. Get Users by Role
```
GET /role_wise_user?role=admin
Authorization: Bearer <token>
```

### 14. Assign Permissions to User
```
PUT /assign_permission/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "permissions": [1, 2, 3, 4]
}
```
**Permission Required:** `assign-permission`

---

## Role Routes

### 15. Get All Roles
```
GET /roles
Authorization: Bearer <token>
```
**Permission Required:** `read-role`

### 16. Get Role List
```
GET /role_list
Authorization: Bearer <token>
```

### 17. Create Role
```
POST /roles
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "editor",
  "description": "Content Editor",
  "permissions": [1, 2, 5, 6]
}
```
**Permission Required:** `create-role`

### 18. Show Role
```
GET /roles/:id
Authorization: Bearer <token>
```
**Permission Required:** `read-role`

### 19. Update Role
```
PUT /roles/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "moderator",
  "description": "Updated Moderator Role",
  "permissions": [1, 2, 3, 5, 6, 7]
}
```
**Permission Required:** `update-role`

### 20. Delete Role
```
DELETE /roles/:id
Authorization: Bearer <token>
```
**Permission Required:** `delete-role`

---

## Permission Routes

### 21. Get All Permissions
```
GET /permissions
Authorization: Bearer <token>
```
**Permission Required:** `read-permission`

### 22. Get Permission List
```
GET /permission_list
Authorization: Bearer <token>
```

### 23. Create Permission
```
POST /permissions
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "view-dashboard",
  "description": "Can view dashboard"
}
```
**Permission Required:** `create-permission`

### 24. Show Permission
```
GET /permissions/:id
Authorization: Bearer <token>
```
**Permission Required:** `read-permission`

### 25. Update Permission
```
PUT /permissions/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "create-user",
  "description": "Updated: Can create new users"
}
```
**Permission Required:** `update-permission`

### 26. Delete Permission
```
DELETE /permissions/:id
Authorization: Bearer <token>
```
**Permission Required:** `delete-permission`

---

## Available Permissions

| ID | Name | Description |
|----|------|-------------|
| 1 | create-user | Create new user |
| 2 | read-user | View user details |
| 3 | update-user | Update user information |
| 4 | delete-user | Delete user |
| 5 | create-role | Create new role |
| 6 | read-role | View role details |
| 7 | update-role | Update role |
| 8 | delete-role | Delete role |
| 9 | create-permission | Create new permission |
| 10 | read-permission | View permission details |
| 11 | update-permission | Update permission |
| 12 | delete-permission | Delete permission |
| 13 | assign-permission | Assign permissions to users |
| 14 | assign-role | Assign roles to users |

---

## Quick Test with cURL

```bash
# 1. Login and get token
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# 2. Use token to get users
curl http://localhost:3000/user_list \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 3. Create new role
curl -X POST http://localhost:3000/roles \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"name":"editor","description":"Content Editor","permissions":[1,2]}'
```

---

## Postman Collection

Import `api-collection.json` file in Postman for complete API testing.
