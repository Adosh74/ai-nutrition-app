# AI Nutrition Application

## Development Environment Setup

### PostgreSQL Database Configuration

To set up the PostgreSQL database using Docker:

```bash
docker run --name my-postgres \
    -e POSTGRES_PASSWORD=mysecretpassword \
    -p 5432:5432 \
    -d --rm \
    postgres:latest
```

### Prisma Migration

```bash
npx prisma migrate dev --name init
```
