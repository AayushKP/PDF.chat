from rq import Queue
from rq.worker import Worker

from app.queue.client import (
    INGESTION_QUEUE_NAME,
    redis_connection,
)


def main():
    queue = Queue(
        name=INGESTION_QUEUE_NAME,
        connection=redis_connection,
    )

    worker = Worker(
        queues=[queue],
        connection=redis_connection,
    )

    print("ChatWPdf RQ Worker started")
    print(f"Listening on: {INGESTION_QUEUE_NAME}")

    worker.work()


if __name__ == "__main__":
    main()
