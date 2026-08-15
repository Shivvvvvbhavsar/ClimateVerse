FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV DEMO_MODE=true
ENV DATABASE_URL=sqlite:////app/data/climateverse.db
ENV PYTHONUNBUFFERED=1

RUN mkdir -p /app/data /app/generated_reports

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
