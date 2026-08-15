#!/bin/sh

set -u

echo "Starting ChatWPdf..."

uvicorn app.main:app \
  --host 0.0.0.0 \
  --port "${PORT:-8000}" &

API_PID=$!

python -m app.queue.worker &

WORKER_PID=$!

echo "API PID: $API_PID"
echo "Worker PID: $WORKER_PID"

while true
do
    kill -0 "$API_PID" 2>/dev/null
    API_RUNNING=$?

    kill -0 "$WORKER_PID" 2>/dev/null
    WORKER_RUNNING=$?

    if [ "$API_RUNNING" -ne 0 ]; then
        echo "API process stopped."
        kill "$WORKER_PID" 2>/dev/null || true
        exit 1
    fi

    if [ "$WORKER_RUNNING" -ne 0 ]; then
        echo "Worker process stopped."
        kill "$API_PID" 2>/dev/null || true
        exit 1
    fi

    sleep 2
done
