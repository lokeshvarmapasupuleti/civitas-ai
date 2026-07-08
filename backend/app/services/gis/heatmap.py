import math
from typing import List, Dict, Any

class GISHeatmapService:
    def generate_heatmap_geojson(self, points: List[Dict[str, Any]], radius_deg: float = 0.05) -> Dict[str, Any]:
        """
        Takes a list of points and computes density weights based on nearby coordinates.
        Returns a GeoJSON FeatureCollection.
        """
        if not points:
            return {"type": "FeatureCollection", "features": []}
            
        features = []
        n = len(points)
        
        # Calculate dynamic density count for each point
        density_counts = [0] * n
        for i in range(n):
            lat_i = points[i].get("lat") or 0.0
            lng_i = points[i].get("lng") or 0.0
            
            for j in range(n):
                lat_j = points[j].get("lat") or 0.0
                lng_j = points[j].get("lng") or 0.0
                
                dist = math.sqrt((lat_i - lat_j)**2 + (lng_i - lng_j)**2)
                if dist <= radius_deg:
                    density_counts[i] += 1
                    
        max_density = max(1, max(density_counts))
        
        for i, p in enumerate(points):
            lat = p.get("lat")
            lng = p.get("lng")
            if lat is None or lng is None:
                continue
                
            weight = p.get("weight")
            if weight is None:
                weight = round(density_counts[i] / max_density, 2)
                
            features.append({
                "type": "Feature",
                "id": i,
                "geometry": {
                    "type": "Point",
                    "coordinates": [lng, lat]
                },
                "properties": {
                    "density_weight": weight,
                    "intensity": "High" if weight > 0.7 else "Medium" if weight > 0.3 else "Low"
                }
            })
            
        return {
            "type": "FeatureCollection",
            "features": features
        }
