# Creating API Keys for External Integrations

## Prerequisites

- **PostgreSQL must be running** (local or via `docker-compose up`)
- Backend `.env` file configured with `POSTGRES_*` variables
- `cd backend/` before running the script

## Usage

```bash
node scripts/create-api-key.js "<Key Name>" "<email@domain>" "permission1,permission2,..."
```

## Permissions Available

- `student:read` — Read students list and details
- `course:read` — Read courses list and details  
- `professor:read` — Read professors list and details

## Examples

### Example 1: Mercado Pago integration (payments only)

```bash
node scripts/create-api-key.js "Mercado Pago Integration" mp_integration@maasyoga.local "student:read,course:read"
```

**Output:**
```
Creating service account mp_integration@maasyoga.local...
✓ Service account created: [UUID]
Creating API key: Mercado Pago Integration...
✓ API key created

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 API Key Secret (SAVE THIS, YOU CANNOT RECOVER IT):

   ak_1660ad6bda64ea7e7df8dbf1797c2d604ecbdaee115a3e3e5f5675db376bd2ab

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Key Details:
  Name:        Mercado Pago Integration
  Email:       mp_integration@maasyoga.local
  Permissions: student:read, course:read

Usage:
  curl -H "X-Api-Key: ak_1660ad6bda64ea7e7..." https://api.example.com/api/v1/students
```

### Example 2: Admin panel (full read access)

```bash
node scripts/create-api-key.js "Admin Panel" admin_panel@maasyoga.local "student:read,course:read,professor:read"
```

### Example 3: Reporting system (courses only)

```bash
node scripts/create-api-key.js "Reporting System" reports@maasyoga.local "course:read"
```

## How to Use the API Key

Save the secret immediately (printed only once). Use it in API requests:

```bash
API_KEY="ak_1660ad6bda64ea7e7df8dbf1797c2d604ecbdaee115a3e3e5f5675db376bd2ab"

# Get all students
curl -H "X-Api-Key: $API_KEY" https://yourapi.com/api/v1/students

# Get a specific student
curl -H "X-Api-Key: $API_KEY" https://yourapi.com/api/v1/students/123

# Get all courses
curl -H "X-Api-Key: $API_KEY" https://yourapi.com/api/v1/courses
```

## Troubleshooting

### Error: "Cannot find package 'env.js'"

Make sure you're running from the `backend/` directory:
```bash
cd backend
node scripts/create-api-key.js ...
```

### Error: "connect ECONNREFUSED"

PostgreSQL is not running. Start it:
```bash
# If using docker-compose from repo root:
docker-compose up db

# Or check if your local Postgres is running:
psql -U postgres -c "SELECT version();"
```

### Error: "email already exists"

The email is already in use. Use a different email for the service account.

## Disabling an API Key

To disable an API key, set the service account's status to `deleted`:

```bash
psql -h localhost -U $POSTGRES_USER -d $POSTGRES_DB << SQL
UPDATE users SET status='deleted' WHERE email='mp_integration@maasyoga.local';
SQL
```

The API key will stop working immediately (checked on every request).

## Notes

- Each API key is tied to a **service account** (cannot login via email/password)
- Keys **never expire** — rotation is manual (create a new service account + key)
- All operations via API key are tracked in the DB (associated with the service account user)
- Permissions are fixed at creation time — to change them, create a new key
