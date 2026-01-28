import os
import sys

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

from app.routes import patients, predict, vitals

app = FastAPI(
    title="Health Risk AI API",
    version="1.0.0",
    description="Real-time patient monitoring with AI risk prediction",
)

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Consistent error responses
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    if exc.status_code == 404:
        error = "not_found"
    elif exc.status_code == 400:
        error = "bad_request"
    else:
        error = "http_error"
    return JSONResponse(status_code=exc.status_code, content={"error": error, "detail": exc.detail})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    missing_field = any(err.get("type") == "missing" for err in exc.errors())
    status_code = 400 if missing_field else 422
    return JSONResponse(
        status_code=status_code,
        content={"error": "validation_error", "detail": exc.errors()},
    )

# Include routers
app.include_router(vitals.router)
app.include_router(patients.router)
app.include_router(predict.router)

@app.get("/")
def read_root():
    return {
        "message": "Health Risk AI Backend",
        "status": "online",
        "version": "1.0.0",
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
