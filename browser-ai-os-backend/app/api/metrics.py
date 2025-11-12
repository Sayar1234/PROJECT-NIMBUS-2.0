# app/api/metrics.py
from fastapi import APIRouter, Depends
import psutil
import time
from datetime import datetime
from app.database import engine
from sqlalchemy import event
from app.api.terminal import ai_service  # adjust import if needed

router = APIRouter()

# Metrics storage
db_metrics = {
    "total_queries": 0,
    "slow_queries": 0,
    "last_query_time_ms": 0
}

ai_metrics = {
    "total_ai_calls": 0,
    "avg_response_time_ms": 0,
    "last_context_size": 0
}

# System metrics
def get_system_metrics():
    process = psutil.Process()
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "memory_mb": process.memory_info().rss / (1024 * 1024),
        "cpu_percent": psutil.cpu_percent(interval=0.5),
    }

# SQLAlchemy query timing
@event.listens_for(engine, "before_cursor_execute")
def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    context._query_start_time = time.time()

@event.listens_for(engine, "after_cursor_execute")
def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    total_ms = (time.time() - context._query_start_time) * 1000
    db_metrics["total_queries"] += 1
    db_metrics["last_query_time_ms"] = total_ms
    if total_ms > 100:  # slow query threshold in ms
        db_metrics["slow_queries"] += 1

# Wrap your AI execution function
async def track_ai_call(command, context):
    start = time.time()
    output = await ai_service.execute_terminal_command(command, context)
    duration_ms = (time.time() - start) * 1000

    ai_metrics["total_ai_calls"] += 1
    n = ai_metrics["total_ai_calls"]
    prev_avg = ai_metrics["avg_response_time_ms"]
    ai_metrics["avg_response_time_ms"] = (prev_avg*(n-1) + duration_ms)/n
    ai_metrics["last_context_size"] = len(context.get("recent_files", [])) + len(context.get("recent_notes", []))

    return output

# Metrics endpoint
@router.get("/")
async def get_metrics():
    system = get_system_metrics()
    return {
        "system": system,
        "database": db_metrics,
        "ai": ai_metrics
    }
