#!/bin/bash
# automate_db_setup_and_test.sh
set -euo pipefail

SQL="""
CREATE TABLE IF NOT EXISTS inscription (
    id SERIAL PRIMARY KEY,
    prenom VARCHAR(100) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    ville VARCHAR(100) NOT NULL,
    pays VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL
);
"""

echo "[INFO] Creating 'inscription' table in Dockerized PostgreSQL..."
echo "$SQL" | docker compose exec -T db psql -U explorer -d eternelles

sleep 2

echo "[INFO] Retrying INSCRIPTION flow via backend API..."
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"prenom":"Test","nom":"User","email":"testuser@example.com","ville":"Paris","pays":"France","category":"spectateur"}' -i
