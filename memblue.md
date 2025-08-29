---

## 🔑 Authentication & Usage

All authenticated endpoints require the following header:

    Authorization: Token <your_token>

Tokens are returned on registration and login. See the included `drf_token_auth_workflow.txt` for full details on token usage and best practices.

---

## 📋 Endpoints

---

### 1\. 🔐 Register a New User

**URL:** `/api/users/register/`  
**Method:** `POST`  
**Auth required:** ❌ No  
**Permissions required:** None

> **Note:** Ensure the value selected for primary trade is not included in the secondary trades. 
  
The `owner` field is set automatically for all resources you create (customers, inventory, etc.).

#### 📤 Request Body

``` json
{
  "username": "prouser",
  "email": "pro@example.com",
  "password": "securepassword123",
  "password2": "securepassword123",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "123-456-7890",
  "primary_trade": "hvac_pro",
  "secondary_trades": ["plumber_pro", "electrician_pro"],
  "business_type": "team_business"
}
 ```

#### 🔧 Trade Choices

- `hvac_pro` → HVAC Professional
    
- `electrician_pro` → Electrician
    
- `plumber_pro` → Plumber
    
- `locksmith_pro` → Locksmith
    
- `gc_pro` → General Contractor
    

#### 🏢 Business Type Choices

- `solo_operator`
    
- `team_business`
    

#### ✅ Successful Response

``` json
{
  "message": "Registration successful!",
  "user": {
    "id": 1,
    "user_code": "123456",
    "username": "prouser",
    "email": "pro@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "123-456-7890",
    "primary_trade": "hvac_pro",
    "secondary_trades": ["plumber_pro", "electrician_pro"],
    "business_type": "team_business"
  },
  "token": "abcdef123456..."
}
 ```

#### ❌ Example Error Responses

**Password Mismatch:**
```json
{
  "password": "Password fields didn't match."
}
```
**Duplicate Username:**
```json
{
  "username": "A user with that username already exists."
}
```
**Duplicate Email:**
```json
{
  "email": "A user with that email already exists."
}
```
**Invalid Trade:**
```json
{
  "secondary_trades": "Invalid trade codes: foo"
}
 ```

---

### 2\. 🔑 User Login

**URL:** `/api/users/login/`  
**Method:** `POST`  
**Auth required:** ❌ No

#### 📤 Request Body

``` json
{
  "username": "prouser",
  "password": "securepassword123"
}
 ```

#### ✅ Successful Response

**For Team Members/Admins:**
``` json
{
  "token": "abcdef123456...",
  "user_id": 1,
  "username": "johndoe",
  "role": "member",
  "business_type": "team_business",
  "can_create_jobs": false,
  "team_name": "John's Team"
}
```

**For Solo Operators:**
``` json
{
  "token": "abcdef123456...",
  "user_id": 1,
  "username": "johndoe",
  "role": "solo",
  "business_type": "solo_operator",
  "can_create_jobs": true,
  "team_name": null
}
```

#### 🔧 Role & Permission Guide

- `role`: `admin`, `member`, or `solo`
- `business_type`: `solo_operator` or `team_business`
- `can_create_jobs`: `true` or `false` (team members start with `false`)
- `team_name`: Team name if part of a team, `null` for solo operators

#### ❌ Example Error Response
```json
{
  "non_field_errors": ["Invalid username or password."]
}
```

---

### 3\. 👤 User Profile

**URL:** `/api/users/profile/`  
**Method:** `GET`  
**Auth required:** ✅ YES  
**Header:** `Authorization: Token`

#### ✅ Successful Response

``` json
{
  "id": 1,
  "user_code": "123456",
  "username": "johndoe",
  "email": "johndoe@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+1234567890",
  "primary_trade": "hvac_pro",
  "secondary_trades": ["plumber_pro", "electrician_pro"],
  "business_type": "solo_operator",
  "team_name": null,
  "role": "solo",
  "can_create_jobs": true
}
 ```

---

### 4\. 📦 Inventory Management

> **Note:**  
Each inventory item is associated with the user who created it. Users can only view and manage their own inventory items. The `owner` field is set automatically and does not need to be provided in requests. The `total_value` field is always calculated as `cost_per_unit * stock_level` and is read-only in responses. 
  

#### a. List & Create Inventory Items

**URL:** `/api/users/inventory/`  
**Methods:**

- `GET` (List all items, supports search and ordering)
    
- `POST` (Create a new item)
    

**Auth required:** ✅ YES

##### Example Request Body for `POST`:

``` json
{
  "name": "Air Filter - 16x25x1 MERV 8",
  "sku": "AF-16251-M8",
  "supplier": "Memphis HVAC Supply",
  "cost_per_unit": 8.50,
  "stock_level": 45,
  "reorder_at": 20,
  "category": "HVAC Pro Item",
  "ideal_stock": 40,
  "is_active": true
}
 ```

##### Example Successful Response:

``` json
{
  "id": 1,
  "name": "Air Filter - 16x25x1 MERV 8",
  "sku": "AF-16251-M8",
  "supplier": "Memphis HVAC Supply",
  "cost_per_unit": "8.50",
  "total_value": "382.50",
  "stock_level": 45,
  "reorder_at": 20,
  "category": "HVAC Pro Item",
  "ideal_stock": 40,
  "is_active": true,
  "last_updated": "2024-06-23T12:34:56Z",
  "owner_code": "123456"
}
 ```

---

#### b. Retrieve, Update, or Delete a Single Inventory Item

**URL:** `/api/users/inventory/<id>/`  
**Methods:**

- `GET` (Retrieve details)
    
- `PUT` (Update all fields)
    
- `PATCH` (Update some fields)
    
- `DELETE` (Delete item)
    

**Auth required:** ✅ YES

##### Example PATCH Request Body:

``` json
{
  "cost_per_unit": 9.99,
  "stock_level": 50
}
 ```

##### Example Successful Response (GET):

``` json
{
  "id": 1,
  "name": "Air Filter - 16x25x1 MERV 8",
  "sku": "AF-16251-M8",
  "supplier": "Memphis HVAC Supply",
  "cost_per_unit": "9.99",
  "total_value": "499.50",
  "stock_level": 50,
  "reorder_at": 20,
  "category": "HVAC Pro Item",
  "ideal_stock": 40,
  "is_active": true,
  "last_updated": "2024-06-23T13:00:00Z",
  "owner_code": "123456"
}
 ```

#### c. List Low Stock Inventory Items

**URL:** `/api/users/inventory/low-stock/`  
**Method:** `GET`  
**Auth required:** ✅ YES

Returns all inventory items where `stock_level <= reorder_at` for the authenticated user.

---

### 5\. 👥 Customer Management

> **Note:**  
> Each customer is associated with the user who created it. Users can only view and manage their own customers. The `owner` field is set automatically and does not need to be provided in requests.  
> **Each customer is assigned a unique 4-digit `customer_id` automatically. Use this code for display, searching, or as a public reference.**
> **All lookups, URLs, and relations use the primary key `id`.**
> 
> - Example: `/customers/1/` and `/customers/1/jobs/` use the primary key `id` (not `customer_id`).
> - To search for a customer by their 4-digit code, use a filter or search endpoint (not direct lookup).

#### a. List & Create Customers

**URL:** `/api/users/customers/`  
**Methods:**

- `GET` (List all customers, supports search and ordering)
    
- `POST` (Create a new customer)
    

**Auth required:** ✅ YES

##### Example Request Body for `POST`:

``` json
{
  "name": "Jennifer Davis",
  "email": "jennifer.davis@email.com",
  "phone": "(901) 555-0200",
  "address": "2456 Poplar Ave, Memphis, TN 38112",
  "property_type": "residential",
  "tags": ["residential", "repeat customer", "midtown"],
  "notes": "Prefers morning appointments. Has two HVAC units - main floor and upstairs.",
  "last_contact": "2024-01-15"
}
 ```

##### Example Successful Response:

``` json
{
  "id": 1,
  "customer_id": "1234",
  "name": "Jennifer Davis",
  "email": "jennifer.davis@email.com",
  "phone": "(901) 555-0200",
  "address": "2456 Poplar Ave, Memphis, TN 38112",
  "property_type": "residential",
  "tags": ["residential", "repeat customer", "midtown"],
  "notes": "Prefers morning appointments. Has two HVAC units - main floor and upstairs.",
  "last_contact": "2024-01-15",
  "created_at": "2024-06-26T13:28:00Z",
  "updated_at": "2024-06-26T13:28:00Z",
  "owner": 1,
  "jobs_count": 5,
  "total_revenue": "1250.00",
  "avg_job_value": "250.00"
}
 ```

---

#### b. Retrieve, Update, or Delete a Single Customer

**URL:** `/api/users/customers/<id>/`  
**Description:** Retrieve, update, or delete a customer by their primary key id.  
**Method:** `GET`, `PUT`, `PATCH`, `DELETE`  
**Auth required:** ✅ YES

##### Example PATCH Request Body:

``` json
{
  "notes": "Prefers afternoon appointments."
}
 ```

##### Example Successful Response (GET):

``` json
{
  "id": 1,
  "customer_id": "1234",
  "name": "Jennifer Davis",
  "email": "jennifer.davis@email.com",
  "phone": "(901) 555-0200",
  "address": "2456 Poplar Ave, Memphis, TN 38112",
  "property_type": "residential",
  "tags": ["residential", "repeat customer", "midtown"],
  "notes": "Prefers afternoon appointments.",
  "last_contact": "2024-01-15",
  "created_at": "2024-06-26T13:28:00Z",
  "updated_at": "2024-06-26T13:30:00Z",
  "owner": 1,
  "jobs_count": 5,
  "total_revenue": "1250.00",
  "avg_job_value": "250.00"
}
 ```

---

#### c. View Customer Job History

**URL:** `/api/users/customers/<id>/jobs/`  
**Description:** Returns a list of all work orders (jobs) for the specified customer, using the primary key id.  
**Method:** `GET`  
**Auth required:** ✅ YES

Returns a list of all work orders (jobs) for the specified customer.

##### Example Successful Response:

``` json
[
  {
    "id": 1,
    "job_number": "Job-#1",
    "job_type": "Maintenance",
    "description": "Quarterly system inspection and tune-up",
    "status": "completed",
    "priority": "low",
    "tags": ["System: 1yr old", "SEER: 20", "R-410A"],
    "customer": 1,
    "customer_name": "Downtown Office Complex",
    "created_at": "2025-06-08T10:00:00Z",
    "scheduled_for": "2025-06-09T11:30:00Z",
    "assigned_to": "",
    "progress_current": 4,
    "progress_total": 5,
    "primary_trade": "hvac_pro",
    "amount": "250.00",
    "owner": 1
  }
]
```

---

### 6\. 🛠️ Work Order Management

> **Note:**
> - Each work order is associated with the user who created it (`created_by`) and the user it is assigned to (`assigned_to`).
> - **Solo operators** can create jobs only for themselves and can update the status of any job they created.
> - **Team admins** can assign jobs to any team member (including themselves), view and update all jobs for their team, and grant/revoke job creation permission for team members.
> - **Team members** can only view and update jobs assigned to them or jobs they created (if permitted by the admin).
> - The `created_by_username` and `created_by_user_code` fields in job responses show who created the job.
> - The `job_type` field describes the type of job (e.g., Maintenance, Repair).
> - The `status` field can be one of: `pending`, `confirmed`, `in_progress`, `completed`, `cancelled`.
> - **To create a work order, you must provide the `customer` field, which is the primary key id of the customer.**
> - The `customer_id` (4-digit code) is for display/search only, not for work order creation.

#### a. List & Create Work Orders

**Status Choices:**
- `pending`
- `confirmed`
- `in_progress`
- `completed`
- `cancelled`

**URL:** `/api/users/work-orders/`  
**Methods:**

- `GET` (List all work orders, supports search and ordering)
    
- `POST` (Create a new work order)
    

**Auth required:** ✅ YES

##### Example Request Body for `POST`:

```json
{
  "customer": 1,           // The primary key id of the customer
  "job_type": "Maintenance",
  "description": "Quarterly system inspection and tune-up",
  "status": "completed",
  "priority": "low",
  "tags": ["System: 1yr old", "SEER: 20", "R-410A"],
  "scheduled_for": "2025-06-09T11:30:00Z",
  "assigned_to": 12,
  "progress_current": 4,
  "progress_total": 5,
  "amount": 250.00,
  "address": "2456 Poplar Ave, Memphis, TN 38112"
}
```

##### Example Successful Response:

```json
{
  "id": 1,
  "job_number": "Job-#1",
  "job_type": "Maintenance",
  "description": "Quarterly system inspection and tune-up",
  "status": "completed",
  "priority": "low",
  "tags": ["System: 1yr old", "SEER: 20", "R-410A"],
  "customer": 1,
  "created_by": 10,
  "created_by_username": "adminuser",
  "created_by_user_code": "123456",
  "assigned_to": 12,
  "created_at": "2025-06-08T10:00:00Z",
  "scheduled_for": "2025-06-09T11:30:00Z",
  "progress_current": 4,
  "progress_total": 5,
  "primary_trade": "hvac_pro",
  "amount": "250.00",
  "address": "2456 Poplar Ave, Memphis, TN 38112",
  "owner": 1
}
```

##### Example Error Response (Invalid customer):
```json
{
  "customer": ["Invalid pk \"9999\" - object does not exist."]
}
```

---

#### b. Retrieve, Update, or Delete a Single Work Order

**URL:** `/api/users/work-orders/<id>/`  
**Methods:**

- `GET` (Retrieve details)
    
- `PUT` (Update all fields)
    
- `PATCH` (Update some fields)
    
- `DELETE` (Delete work order)
    

**Auth required:** ✅ YES

**Who can update status:**
- Solo operators: jobs they created.
- Team members: jobs assigned to or created by them.
- Team admins: any job for their team.

##### Example PATCH Request Body:

```json
{
  "status": "completed",
  "progress_current": 5,
  "amount": 300.00
}
```

##### Example Successful Response (GET):

```json
{
  "id": 1,
  "job_number": "Job-#1",
  "job_type": "Maintenance",
  "description": "Quarterly system inspection and tune-up",
  "status": "completed",
  "priority": "low",
  "tags": ["System: 1yr old", "SEER: 20", "R-410A"],
  "customer": 1,
  "customer_name": "Downtown Office Complex",
  "created_by": 10,
  "created_by_username": "adminuser",
  "created_by_user_code": "123456",
  "assigned_to": 12,
  "created_at": "2025-06-08T10:00:00Z",
  "scheduled_for": "2025-06-09T11:30:00Z",
  "progress_current": 5,
  "progress_total": 5,
  "primary_trade": "hvac_pro",
  "amount": "300.00",
  "owner": 1
}
```

---

### 7\. 📅 Schedule Management

> **Note:**
> The schedule endpoint returns all work orders with full details for calendar/schedule display.
> Supports filtering by date range, status, and assigned user.
> Perfect for calendar components and schedule views.

#### a. Get Schedule/Calendar View

**URL:** `/api/users/schedule/`  
**Method:** `GET`  
**Auth required:** ✅ YES

**Query Parameters:**
- `start_date` (optional): Filter jobs from this date onwards (YYYY-MM-DD)
- `end_date` (optional): Filter jobs up to this date (YYYY-MM-DD)
- `status` (optional): Filter by job status
- `assigned_to` (optional): Filter by assigned user ID

##### Example Requests:

**Get All Jobs:**
```bash
GET /api/users/schedule/
Authorization: Token <your_token>
```

**Get Jobs for Date Range:**
```bash
GET /api/users/schedule/?start_date=2025-08-24&end_date=2025-08-30
Authorization: Token <your_token>
```

**Get Only Confirmed Jobs:**
```bash
GET /api/users/schedule/?status=confirmed
Authorization: Token <your_token>
```

**Get Jobs Assigned to Specific User:**
```bash
GET /api/users/schedule/?assigned_to=12
Authorization: Token <your_token>
```

##### Example Successful Response:

```json
{
  "work_orders": [
    {
      "id": 1,
      "job_number": "Job-#1",
      "job_type": "Maintenance",
      "description": "Quarterly system inspection",
      "status": "confirmed",
      "priority": "medium",
      "customer": 1,
      "customer_name": "John Smith",
      "created_by": 10,
      "created_by_username": "adminuser",
      "created_by_user_code": "123456",
      "assigned_to": 12,
      "created_at": "2025-08-24T10:00:00Z",
      "scheduled_for": "2025-08-25T10:00:00Z",
      "progress_current": 0,
      "progress_total": 5,
      "primary_trade": "hvac_pro",
      "amount": "250.00",
      "address": "123 Main St, Memphis, TN",
      "owner": 1
    }
  ],
  "total_count": 15,
  "filters_applied": {
    "start_date": "2025-08-24",
    "end_date": "2025-08-30",
    "status": "confirmed",
    "assigned_to": "12"
  },
  "summary": {
    "pending": 3,
    "confirmed": 5,
    "in_progress": 4,
    "completed": 3,
    "cancelled": 0
  }
}
```

---

### 8. 👥 Team Management

> **Note:**
> Team features are available for users registered as `team_business`. The registering user is the team admin. Team members can be invited, onboarded, and managed by the admin. Job creation permissions can be granted or revoked by the admin.

#### a. Send Team Member Invite (Admin Only)

**URL:** `/api/users/team/invite/`  
**Method:** `POST`  
**Auth required:** ✅ YES (admin only)

Returns a unique onboarding link with a UUID token for the invited member.

##### Example Successful Response:
```json
{
  "token": "550e8400-e29b-41d4-a716-446655440000",
  "invite_link": "/team/onboarding/550e8400-e29b-41d4-a716-446655440000/"
}
```

##### Example Error Response (Non-admin):
```json
{
  "error": "Only team admins can send invite links."
}
```

---

#### b. Team Member Onboarding (via Invite Link)

**URL:** `/api/users/team/onboarding/<uuid:invite_token>/`  
**Method:** `POST`  
**Auth required:** ❌ No (invite link required)

Onboards a new team member using the invite token. The member is created with `can_create_jobs=False` by default.

##### Example Request Body:
```json
{
  "name": "Jane Smith",
  "email": "jane.smith@email.com",
  "phone": "(555) 123-4567",
  "position": "Technician",
  "username": "janesmith",
  "password": "securepassword123"
}
```

##### Example Successful Response:
```json
{
  "message": "Team member onboarded successfully.",
  "user_id": 15
}
```

##### Example Error Responses:

**Duplicate Username:**
```json
{
  "username": ["A user with that username already exists."]
}
```

**Duplicate Email:**
```json
{
  "email": ["A user with that email already exists."]
}
```

**Invalid/Used Invite Token:**
```json
{
  "error": "Invalid or used invite token."
}
```

---

#### c. List Team Members (Admin Only)

**URL:** `/api/users/team/members/`  
**Method:** `GET`  
**Auth required:** ✅ YES (admin only)

##### Example Successful Response:
```json
[
  {
    "id": 12,
    "name": "Jane Smith",
    "email": "jane.smith@email.com",
    "phone": "(555) 123-4567",
    "position": "Technician",
    "username": "janesmith",
    "role": "member"
  }
]
```

---

#### d. Get Team Information

**URL:** `/api/users/team/info/`  
**Method:** `GET`  
**Auth required:** ✅ YES

Returns team information for the authenticated user.

##### Example Successful Response:
```json
{
  "id": 1,
  "name": "John's Team",
  "created_at": "2024-06-26T13:28:00Z",
  "updated_at": "2024-06-26T13:28:00Z"
}
```

---

#### e. Grant Job Creation Permission (Admin Only)

**URL:** `/api/users/team/grant-job-permission/`  
**Method:** `POST`  
**Auth required:** ✅ YES (admin only)

Grants job creation permission to a specific team member.

#### 📤 Request Body
```json
{
  "user_id": 2
}
```

##### ✅ Successful Response:
```json
{
  "message": "Job creation permission granted to johndoe"
}
```

##### ❌ Error Responses:

**Not Admin:**
```json
{
  "error": "Only team admins can grant job permissions."
}
```

**Missing user_id:**
```json
{
  "error": "user_id is required"
}
```

**User not found:**
```json
{
  "error": "User not found in your team"
}
```

---

#### f. Revoke Job Creation Permission (Admin Only)

**URL:** `/api/users/team/revoke-job-permission/`  
**Method:** `POST`  
**Auth required:** ✅ YES (admin only)

Revokes job creation permission from a specific team member.

#### 📤 Request Body
```json
{
  "user_id": 2
}
```

##### ✅ Successful Response:
```json
{
  "message": "Job creation permission revoked from johndoe"
}
```

##### ❌ Error Responses:

**Not Admin:**
```json
{
  "error": "Only team admins can revoke job permissions."
}
```

**Missing user_id:**
```json
{
  "error": "user_id is required"
}
```

**User not found:**
```json
{
  "error": "User not found in your team"
}
```

---

#### g. Logout

**URL:** `/api/users/logout/`  
**Method:** `