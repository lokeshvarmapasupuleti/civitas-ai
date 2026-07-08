from typing import List, Dict, Any

class GISRoutingService:
    def calculate_route_geojson(self, start_lat: float, start_lng: float, end_lat: float, end_lng: float) -> Dict[str, Any]:
        """
        Calculates a mock route (LineString) between a starting depot and a target location.
        Returns a GeoJSON Feature representing the route.
        """
        # Create a simple zig-zag street grid routing path (4 segments)
        mid_lat_1 = start_lat + (end_lat - start_lat) * 0.3
        mid_lng_1 = start_lng
        
        mid_lat_2 = mid_lat_1
        mid_lng_2 = start_lng + (end_lng - start_lng) * 0.7
        
        coordinates = [
            [start_lng, start_lat],
            [mid_lng_1, mid_lat_1],
            [mid_lng_2, mid_lat_2],
            [end_lng, end_lat]
        ]
        
        # Approximate distance in degrees
        import math
        dist_deg = math.sqrt((start_lat - end_lat)**2 + (start_lng - end_lng)**2)
        # Approximate distance in km (1 degree ~ 111 km)
        distance_km = round(dist_deg * 111.0, 2)
        # Target speed ~ 35 km/h
        duration_minutes = int((distance_km / 35.0) * 60)
        
        return {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": coordinates
            },
            "properties": {
                "start_coordinate": [start_lng, start_lat],
                "end_coordinate": [end_lng, end_lat],
                "distance_km": distance_km,
                "duration_minutes": max(5, duration_minutes),
                "navigation_steps": [
                    "Depart from Municipal Maintenance Depot.",
                    "Turn right at main street crossing.",
                    "Proceed along service lane corridor.",
                    "Arrive at target grievance coordinate."
                ]
            }
        }
