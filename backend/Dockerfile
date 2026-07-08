FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

WORKDIR /app

RUN addgroup --system civitas && adduser --system --ingroup civitas civitas

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY alembic.ini .
COPY alembic ./alembic
COPY app ./app
COPY seed_data.py .
COPY scripts/start.sh ./scripts/start.sh

RUN mkdir -p /app/static/uploads && \
    chmod +x /app/scripts/start.sh && \
    chown -R civitas:civitas /app

USER civitas

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=5)"

CMD ["/app/scripts/start.sh"]
