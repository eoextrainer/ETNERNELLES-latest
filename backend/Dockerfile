# Dockerfile for backend
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt ./

# Install uvicorn globally and in venv
RUN python -m venv /app/.venv && \
    /app/.venv/bin/pip install --upgrade pip && \
    /app/.venv/bin/pip install -r requirements.txt && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir uvicorn

COPY . .

ENV PATH="/app/.venv/bin:$PATH"

# Use venv uvicorn directly
CMD ["/app/.venv/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
