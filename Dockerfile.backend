FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

WORKDIR /app

RUN addgroup --system civitas && adduser --system --ingroup civitas civitas

COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY backend/alembic.ini ./alembic.ini
COPY backend/alembic ./alembic
COPY backend/app ./app
COPY backend/seed_data.py ./seed_data.py
COPY backend/scripts/start.sh ./scripts/start.sh

RUN mkdir -p /app/static/uploads && \
    chmod +x /app/scripts/start.sh && \
    chown -R civitas:civitas /app

USER civitas

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=5)"

CMD ["/app/scripts/start.sh"]
