# Campus Club Backend (SOA)

Backend implementation for a single-club Campus Club Management System using practical service-oriented architecture (SOA).

## Architecture

This repository was refactored from an incomplete monolithic scaffold into separate services with clear boundaries:

- `api-gateway`: single entry point for frontend clients
- `auth-service`: registration, login, JWT, admin approval, profile management, member listing
- `event-service`: event CRUD, event status/open state, capacity/seat operations
- `rsvp-service`: RSVP creation/cancellation, attendee listing, one-RSVP-per-user-per-event enforcement
- `announcement-service`: announcement CRUD
- `gallery-service`: gallery photo CRUD with URL + optional Cloudinary upload
- `shared`: reusable middleware, validation, auth helpers, db connector, utils, event bus

Why this structure is better:

- each service owns its own model/domain logic
- easier maintenance and testing by feature boundary
- gateway keeps frontend integration simple
- inter-service calls are explicit (REST + optional domain events)

## Folder Structure

```text
campus-club-backend/
  api-gateway/
    src/
      app.js
      server.js
  services/
    auth-service/src/
    event-service/src/
    rsvp-service/src/
    announcement-service/src/
    gallery-service/src/
  shared/
    config/
    constants/
    db/
    events/
    middlewares/
    utils/
    validation/
  scripts/
    start-all.js
  docker-compose.yml
  docker-compose.prod.yml
  .env.example
```

> Existing old `src/` monolith scaffold is still in the repo as legacy/unmigrated material and is not used by the new runtime.

## Tech Stack

- Node.js
- Express
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- `bcryptjs`
- `multer` (image upload handling)
- Cloudinary (optional)
- RabbitMQ integration hook via `amqplib` (optional)
- REST APIs + internal service REST calls

## Core Business Rules Implemented

- Registration creates `pending` users
- Email verification is tracked separately (`emailVerified`)
- `emailVerified` does not auto-approve accounts
- Pending/rejected users cannot log in as active members
- Admin can approve/reject users
- Only approved users can access member functionality
- Event RSVP:
  - one RSVP per user per event (unique compound index)
  - auto-deny when full
  - event automatically closes when capacity reached
- Admin-only controls:
  - user approval/rejection and member listing
  - member listing includes `emailVerified` and `emailVerifiedAt`
  - event CRUD
  - attendees per event
  - announcement CRUD
  - gallery CRUD

## Development Run (Docker Only)

Development is run only through Docker Compose in this project.

1. Create development env file:

```bash
cp .env.example .env.development
```

2. Start development stack:

```bash
docker compose up --build
```

Gateway base URL:

```text
http://localhost:4000/api/v1
```

By default, development Docker Compose starts these infrastructure containers:

- `mongo` (MongoDB): local database dependency for all services with isolated, repeatable data setup.
- `rabbitmq` (RabbitMQ + management UI): local async messaging backbone for domain events between services.
- `mailhog` (SMTP capture + web UI): catches outgoing emails safely during development, so no real mailbox/provider is needed.

MailHog details:

- SMTP host inside Docker network: `mailhog`
- SMTP port: `1025`
- Web inbox UI: `http://localhost:8025`

This development compose uses bind mounts + `nodemon`, so code changes in:
- `api-gateway/src`
- `services/*/src`
- `shared/*`

are auto-reloaded inside containers.

If containers were created before these dev settings, recreate them once:

```bash
docker compose down -v
docker compose up --build
```

## Production (Optional)

```bash
docker compose -f docker-compose.prod.yml up --build
```

## Environment Variables

Required:

- `MONGO_URI`
- `JWT_SECRET`

Recommended:

- `SERVICE_AUTH_KEY` (protects internal service endpoints)
- `DEFAULT_ADMIN_EMAIL`
- `DEFAULT_ADMIN_PASSWORD`
- `DEFAULT_ADMIN_NAME`
- `API_PUBLIC_BASE_URL`
- `FRONTEND_VERIFY_EMAIL_URL`
- `EMAIL_VERIFICATION_TOKEN_TTL_MINUTES`
- `FRONTEND_RESET_PASSWORD_URL`
- `PASSWORD_RESET_TOKEN_TTL_MINUTES`

Optional:

- `AMQP_URL`, `AMQP_EXCHANGE` for RabbitMQ domain events
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` for file uploads
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` for verification/password-reset email delivery
- `LOG_DIR` (default `./logs`)
- `ENABLE_FILE_LOGS` (default `true`)

In Docker development, SMTP is pre-wired to MailHog by `docker-compose.yml`, so outgoing verification emails can be viewed at `http://localhost:8025`.

## Logging

- Runtime errors are logged to `logs/errors.log`
- Security-related events are logged to `logs/security.log`
- Security events include:
  - missing/invalid JWT
  - forbidden role access attempts
  - invalid internal service key usage
  - unknown route probing

Ports and service URLs for development are configurable in `.env.development` (created from `.env.example`).

## API Routes (via Gateway)

### Auth Service

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/verify-email/request`
- `POST /auth/verify-email/confirm`
- `GET /auth/verify-email/confirm?token=...`
- `GET /users/me`
- `PUT /users/me`
- `PUT /users/me/password`
- `PUT /users/me/profile-image`
- `GET /admin/users`
- `PATCH /admin/users/:id/approve`
- `PATCH /admin/users/:id/reject`
- `POST /admin/users/import-csv` (multipart form-data file field: `file`)

### Event Service

- `POST /events`
- `GET /events`
- `GET /events/:id` (for admin, includes `attendees` list)
- `PUT /events/:id`
- `DELETE /events/:id`

### RSVP Service

- `POST /rsvps`
- `DELETE /rsvps/:eventId`
- `GET /rsvps/me`
- `GET /events/:eventId/attendees`

### Announcement Service

- `POST /announcements`
- `GET /announcements`
- `PUT /announcements/:id`
- `DELETE /announcements/:id`

### Gallery Service

- `POST /gallery`
- `GET /gallery`
- `PUT /gallery/:id`
- `DELETE /gallery/:id`

## Postman

Import this collection file:

- `docs/postman/Campus-Club-Backend-SOA.postman_collection.json`

Cloudinary file-upload requests are included in the collection as:

- `Update My Profile Image (File Upload - Cloudinary)`
- `Add Gallery Photo (File Upload - Cloudinary)`
- `Forgot Password`
- `Reset Password`
- `Request Email Verification`
- `Confirm Email Verification`

For file upload in Postman use `form-data`:

- Profile image endpoint `PUT /users/me/profile-image`: `image` (type `File`)
- Gallery endpoint `POST /gallery`: `title` (text), `description` (text), `date` (text ISO date), `image` (type `File`)
- Member import endpoint `POST /admin/users/import-csv`: `file` (type `File`, `.csv`)
- Sample CSV file: `docs/postman/sample-members-import.csv`

CSV import rules:

- Admin-only route.
- CSV headers must include `email` and one of: `displayName`, `display_name`, `name`, `full_name`.
- Imported members are created/updated as:
  - `role: user`
  - `status: approved`
  - `emailVerified: true`

## Assumptions

- Single club scope, so no multi-club entities included
- Only two roles (`admin`, `user`)
- Auth tokens are role/status claims from login time
- Profile/gallery image upload supports:
  - direct `imageUrl`, always
  - file upload when Cloudinary is configured

## Optional Future Work

- Add integration/unit tests per service
- Add rate limiting and request logging
- Add refresh token flow and token revocation
- Add centralized observability/tracing
- Add async consumers to react to RabbitMQ events
