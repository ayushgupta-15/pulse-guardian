from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
