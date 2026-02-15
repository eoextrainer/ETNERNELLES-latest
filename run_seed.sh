#!/bin/bash
# Run the database seeding script
cd /home/sos10/Documents/EOEX/kcd
python3 backend/seed_database.py "$@"
