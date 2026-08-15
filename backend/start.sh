#!/bin/sh

set -e

echo "Starting ChatWPdf..."

python -m app.queue.worker &
WORKER_PID=$!

uvicorn app.main:app \
    --host 0.0.0.0 \
    --port "${PORT:-8000}" &
API_PID=$!

echo "API PID: $API_PID"
echo "Worker PID: $WORKER_PID"

trap 'kill $WORKER_PID $API_PID 2>/dev/null || true' TERM INT

wait -n $WORKER_PID $API_PID

STATUS=$?

echo "One process exited. Shutting down..."
kill $WORKER_PID $API_PID 2>/dev/null || true

exit $STATUS
