from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import socketio
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import numpy as np
import os
from dotenv import load_dotenv
import httpx

try:
    from sklearn.ensemble import RandomForestRegressor  # type: ignore
    SKLEARN_AVAILABLE = True
except Exception:
    RandomForestRegressor = None  # type: ignore
    SKLEARN_AVAILABLE = False

load_dotenv()

app = FastAPI(
    title="AI Traffic Prediction API",
    description="AI-powered traffic prediction and route planning system",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sio = socketio.AsyncServer(
    cors_allowed_origins="*",
    async_mode="asgi",
)
socket_app = socketio.ASGIApp(sio, app)

traffic_model: Any = None


class Location(BaseModel):
    lat: float
    lng: float
    name: Optional[str] = None


class RouteRequest(BaseModel):
    start: Location
    end: Location
    preferences: Optional[Dict[str, Any]] = None


class Alert(BaseModel):
    id: str
    type: str
    severity: str
    title: str
    description: str
    location: str
    coordinates: List[float]
    reported_at: datetime
    verified: bool


async def initialize_models() -> None:
    global traffic_model
    rng = np.random.default_rng(42)
    n_samples = 800
    X = rng.random((n_samples, 5))
    y = rng.random(n_samples)

    if SKLEARN_AVAILABLE and RandomForestRegressor is not None:
        model = RandomForestRegressor(n_estimators=80, random_state=42)
        model.fit(X, y)
        traffic_model = model
    else:
        class DummyModel:
            def predict(self, features: np.ndarray) -> np.ndarray:
                arr = np.asarray(features, dtype=float)
                return np.clip(arr.mean(axis=1), 0.0, 1.0)
        traffic_model = DummyModel()


@sio.event
async def connect(sid, environ):
    await sio.emit("connected", {"message": "Connected to traffic prediction server"}, room=sid)


@sio.event
async def disconnect(sid):
    return


@sio.event
async def get_traffic_data(sid, data):
    try:
        traffic = await generate_traffic_data()
        await sio.emit("traffic_update", traffic, room=sid)
    except Exception as exc:
        await sio.emit("error", {"message": str(exc)}, room=sid)


@sio.event
async def get_route_prediction(sid, data):
    try:
        start = data.get("start")
        end = data.get("end")
        if not start or not end:
            await sio.emit("error", {"message": "Start and end locations required"}, room=sid)
            return
        routes = await generate_route_predictions(start, end)
        await sio.emit("route_update", routes, room=sid)
    except Exception as exc:
        await sio.emit("error", {"message": str(exc)}, room=sid)


@sio.event
async def report_incident(sid, data):
    try:
        alert = Alert(
            id=f"alert_{datetime.now().timestamp()}",
            type=data.get("type", "hazard"),
            severity=data.get("severity", "medium"),
            title=data.get("title", "Road Incident"),
            description=data.get("description", ""),
            location=data.get("location", ""),
            coordinates=data.get("coordinates", [0.0, 0.0]),
            reported_at=datetime.now(),
            verified=False,
        )
        await sio.emit("new_alert", alert.dict())
    except Exception as exc:
        await sio.emit("error", {"message": str(exc)}, room=sid)


@app.get("/")
async def root() -> Dict[str, Any]:
    return {"message": "AI Traffic Prediction API", "status": "running"}


@app.get("/health")
async def health_check() -> Dict[str, Any]:
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.post("/api/routes")
async def get_routes(route_request: RouteRequest) -> Dict[str, Any]:
    """Route using public OSRM service for realistic road paths."""
    try:
        start = route_request.start
        end = route_request.end
        osrm_url = (
            f"https://router.project-osrm.org/route/v1/driving/"
            f"{start.lng},{start.lat};{end.lng},{end.lat}?overview=full&geometries=geojson&alternatives=true"
        )
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.get(osrm_url)
            resp.raise_for_status()
            data = resp.json()
        routes: List[Dict[str, Any]] = []
        palette = ["#10b981", "#f59e0b", "#ef4444"]
        for i, r in enumerate(data.get("routes", [])[:3]):
            coords = r.get("geometry", {}).get("coordinates", [])
            # OSRM returns [lng, lat]; convert to [lat, lng]
            latlng = [[float(lat), float(lng)] for lng, lat in coords]
            routes.append({
                "id": f"route_{i+1}",
                "name": ["Fastest Route", "Alternative Route", "Scenic Route"][i] if i < 3 else f"Route {i+1}",
                "distance": (r.get("distance", 0.0) / 1000.0),
                "duration": (r.get("duration", 0.0) / 60.0),
                "traffic_level": "medium",
                "color": palette[i % len(palette)],
                "coordinates": latlng,
            })
        if not routes:
            # Fallback to synthetic if OSRM fails silently
            routes = await generate_route_predictions(start.dict(), end.dict())
        return {"routes": routes}
    except httpx.HTTPError as exc:
        # Fallback gracefully when OSRM unreachable
        try:
            routes = await generate_route_predictions(route_request.start.dict(), route_request.end.dict())
            return {"routes": routes, "warning": str(exc)}
        except Exception as e2:
            raise HTTPException(status_code=500, detail=f"Routing failed: {exc} / {e2}")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/traffic")
async def get_traffic_endpoint() -> Dict[str, Any]:
    try:
        traffic = await generate_traffic_data()
        return {"traffic": traffic}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/alerts")
async def get_alerts() -> Dict[str, Any]:
    try:
        alerts = await generate_alerts()
        return {"alerts": alerts}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/carpool/matches")
async def get_carpool_matches(location: Dict[str, Any]) -> Dict[str, Any]:
    try:
        matches = await generate_carpool_matches(location)
        return {"matches": matches}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/predict")
async def predict_traffic(prediction_request: Dict[str, Any]) -> Dict[str, Any]:
    try:
        global traffic_model
        if traffic_model is None:
            await initialize_models()
        features = np.array([[
            prediction_request.get("hour", 12),
            prediction_request.get("weather", 0.5),
            prediction_request.get("day_of_week", 1),
            prediction_request.get("lat", 40.7128),
            prediction_request.get("lng", -74.0060),
        ]], dtype=float)
        pred_val = float(np.asarray(traffic_model.predict(features))[0])
        return {"prediction": pred_val, "confidence": 0.85, "timestamp": datetime.now().isoformat()}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


async def generate_traffic_data() -> List[Dict[str, Any]]:
    points: List[Dict[str, Any]] = []
    base_lat, base_lng = 40.7128, -74.0060
    rng = np.random.default_rng()
    for _ in range(20):
        lat = base_lat + float(rng.uniform(-0.1, 0.1))
        lng = base_lng + float(rng.uniform(-0.1, 0.1))
        level = str(np.random.choice(["low", "medium", "high"], p=[0.4, 0.4, 0.2]))
        speed = float(rng.uniform(20, 60) if level == "low" else rng.uniform(10, 30))
        points.append({
            "lat": lat,
            "lng": lng,
            "level": level,
            "speed": speed,
            "timestamp": datetime.now().isoformat(),
        })
    return points


async def generate_route_predictions(start: Dict[str, Any], end: Dict[str, Any]) -> List[Dict[str, Any]]:
    routes: List[Dict[str, Any]] = []
    names = ["Fastest Route", "Alternative Route", "Scenic Route"]
    colors = ["#10b981", "#f59e0b", "#ef4444"]

    start_lat, start_lng = float(start.get("lat", 40.7128)), float(start.get("lng", -74.0060))
    end_lat, end_lng = float(end.get("lat", 40.7589)), float(end.get("lng", -73.9851))

    rng = np.random.default_rng()
    for i in range(3):
        coordinates: List[List[float]] = []
        for j in range(11):
            t = j / 10.0
            lat = start_lat + (end_lat - start_lat) * t + float(rng.uniform(-0.01, 0.01))
            lng = start_lng + (end_lng - start_lng) * t + float(rng.uniform(-0.01, 0.01))
            coordinates.append([lat, lng])
        routes.append({
            "id": f"route_{i+1}",
            "name": names[i],
            "distance": float(rng.uniform(10, 25)),
            "duration": float(rng.uniform(15, 45)),
            "traffic_level": str(np.random.choice(["low", "medium", "high"])),
            "color": colors[i],
            "coordinates": coordinates,
        })
    return routes


async def generate_alerts() -> List[Dict[str, Any]]:
    return [
        {
            "id": "alert_1",
            "type": "accident",
            "severity": "high",
            "title": "Multi-vehicle collision on I-95",
            "description": "Three-car accident blocking two lanes. Emergency services on scene.",
            "location": "I-95 North, Mile Marker 42",
            "coordinates": [40.7128, -74.0060],
            "reported_at": (datetime.now() - timedelta(minutes=5)).isoformat(),
            "verified": True,
        },
        {
            "id": "alert_2",
            "type": "construction",
            "severity": "medium",
            "title": "Road construction on Main Street",
            "description": "Lane closure for utility work. Expect delays during rush hour.",
            "location": "Main Street between 5th and 7th Ave",
            "coordinates": [40.7589, -73.9851],
            "reported_at": (datetime.now() - timedelta(hours=1)).isoformat(),
            "verified": True,
        },
    ]


async def generate_carpool_matches(location: Dict[str, Any]) -> List[Dict[str, Any]]:
    return [
        {
            "id": "match_1",
            "driver": {"name": "Sarah Johnson", "rating": 4.8, "verified": True},
            "route": {"start": "Downtown Station", "end": "Airport Terminal 2", "distance": 18.5, "duration": 25},
            "timing": {"departure": "8:30 AM", "arrival": "8:55 AM", "flexibility": 10},
            "cost": {"per_person": 12, "total": 36, "currency": "USD"},
            "capacity": {"available": 2, "total": 4},
            "preferences": {"smoking": False, "music": True, "conversation": "moderate"},
            "match_score": 92,
        }
    ]


async def periodic_traffic_update() -> None:
    while True:
        try:
            traffic = await generate_traffic_data()
            await sio.emit("traffic_update", traffic)
        except Exception as exc:
            print(f"Periodic update error: {exc}")
        await asyncio.sleep(30)


@app.on_event("startup")
async def on_startup() -> None:
    await initialize_models()
    asyncio.create_task(periodic_traffic_update())


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(socket_app, host="0.0.0.0", port=8000)


