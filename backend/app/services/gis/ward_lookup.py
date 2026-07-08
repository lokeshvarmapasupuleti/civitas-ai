from typing import List, Dict, Any
from pydantic import BaseModel, Field

class LatLng(BaseModel):
    lat: float
    lng: float

class GISLocationDetails(BaseModel):
    ward_name: str
    zone_name: str
    nearby_schools: List[Dict[str, Any]]
    nearby_hospitals: List[Dict[str, Any]]
    nearby_roads: List[Dict[str, Any]]

# Simple deterministic spatial bounding boxes mapping for local municipal wards
WARD_BOUNDARIES = [
    {"name": "Ward 1 (Indiranagar)", "zone": "East Zone", "lat_range": (12.95, 12.98), "lng_range": (77.62, 77.65)},
    {"name": "Ward 3 (Malleshwaram)", "zone": "West Zone", "lat_range": (12.98, 13.01), "lng_range": (77.55, 77.58)},
    {"name": "Ward 7 (Jayanagar)", "zone": "South Zone", "lat_range": (12.91, 12.94), "lng_range": (77.57, 77.60)},
    {"name": "Ward 12 (Whitefield)", "zone": "Mahadevapura Zone", "lat_range": (12.94, 12.97), "lng_range": (77.72, 77.75)}
]

INFRASTRUCTURE_DATABASE = {
    "schools": [
        {"name": "KV Smart School", "lat": 12.965, "lng": 77.635},
        {"name": "NIC Public School", "lat": 12.992, "lng": 77.562},
        {"name": "Delhi Public School Jayanagar", "lat": 12.925, "lng": 77.585},
        {"name": "Whitefield Global School", "lat": 12.955, "lng": 77.738}
    ],
    "hospitals": [
        {"name": "Apollo Clinic", "lat": 12.958, "lng": 77.642},
        {"name": "Narayana Health West", "lat": 12.998, "lng": 77.568},
        {"name": "Fortis Hospital South", "lat": 12.921, "lng": 77.581},
        {"name": "Manipal Hospital Whitefield", "lat": 12.952, "lng": 77.745}
    ],
    "roads": [
        {"name": "Double Road", "lat": 12.962, "lng": 77.638},
        {"name": "Margosa Road", "lat": 12.995, "lng": 77.565},
        {"name": "Jayanagar 4th Block Ring Road", "lat": 12.923, "lng": 77.583},
        {"name": "ITPB Main Road", "lat": 12.953, "lng": 77.741}
    ]
}

class WardLookupService:
    def resolve_coordinates(self, lat: float, lng: float) -> GISLocationDetails:
        matched_ward = "General Ward (Municipal Area)"
        matched_zone = "Central Zone"
        
        # 1. Bounding box check
        for boundary in WARD_BOUNDARIES:
            lat_min, lat_max = boundary["lat_range"]
            lng_min, lng_max = boundary["lng_range"]
            if lat_min <= lat <= lat_max and lng_min <= lng <= lng_max:
                matched_ward = boundary["name"]
                matched_zone = boundary["zone"]
                break
                
        # 2. Distance-based nearby infrastructure resolution
        def get_distance(lat1, lng1, lat2, lng2):
            import math
            # Euclidean distance approximation for micro-coordinates
            return math.sqrt((lat1 - lat2)**2 + (lng1 - lng2)**2)

        schools = []
        for s in INFRASTRUCTURE_DATABASE["schools"]:
            dist = get_distance(lat, lng, s["lat"], s["lng"])
            if dist < 0.05: # Proximity radius threshold
                schools.append({"name": s["name"], "distance_deg": round(dist, 4)})
                
        hospitals = []
        for h in INFRASTRUCTURE_DATABASE["hospitals"]:
            dist = get_distance(lat, lng, h["lat"], h["lng"])
            if dist < 0.05:
                hospitals.append({"name": h["name"], "distance_deg": round(dist, 4)})
                
        roads = []
        for r in INFRASTRUCTURE_DATABASE["roads"]:
            dist = get_distance(lat, lng, r["lat"], r["lng"])
            if dist < 0.05:
                roads.append({"name": r["name"], "distance_deg": round(dist, 4)})
                
        return GISLocationDetails(
            ward_name=matched_ward,
            zone_name=matched_zone,
            nearby_schools=schools,
            nearby_hospitals=hospitals,
            nearby_roads=roads
        )

    def reverse_geocode(self, lat: float, lng: float) -> str:
        details = self.resolve_coordinates(lat, lng)
        ward = details.ward_name
        
        if "Ward 1" in ward:
            return "12th Main Rd, Indiranagar, Bengaluru, Karnataka 560038"
        elif "Ward 3" in ward:
            return "Margosa Rd, Malleshwaram, Bengaluru, Karnataka 560003"
        elif "Ward 7" in ward:
            return "9th Main Rd, 4th Block, Jayanagar, Bengaluru, Karnataka 560011"
        elif "Ward 12" in ward:
            return "ITPL Main Rd, Whitefield, Bengaluru, Karnataka 560066"
        else:
            return f"Coordinates: {lat}, {lng}, Municipal Area, Bengaluru, Karnataka, India"
