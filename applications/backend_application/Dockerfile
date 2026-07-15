FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for compiling packages if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "source.application_startup.main:fastapi_application", "--host", "0.0.0.0", "--port", "8000", "--reload"]
