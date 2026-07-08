from typing import List, Dict, Any

class GISHotspotService:
    def calculate_hotspot_scores(self, points: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculates a hotspot score (0.0 to 1.0) and generates ward risk indicators.
        Returns a GeoJSON FeatureCollection of hotspots and a general analytics dictionary.
        """
        # Group by ward
        ward_counts = {}
        for p in points:
            ward = p.get("ward", "General Ward")
            ward_counts[ward] = ward_counts.get(ward, 0) + 1
            
        features = []
        analytics = {}
        
        # Determine risk score and construct GeoJSON hotspots features (center coordinates based on mock)
        mock_centers = {
            "Ward 1 (Indiranagar)": (12.965, 77.635),
            "Ward 3 (Malleshwaram)": (12.992, 77.562),
            "Ward 7 (Jayanagar)": (12.925, 77.585),
            "Ward 12 (Whitefield)": (12.955, 77.738)
        }
        
        for ward, count in ward_counts.items():
            center = mock_centers.get(ward, (12.970, 77.594))
            
            # Hotspot score ranges from 0.0 to 1.0
            hotspot_score = min(1.0, round(count / 15.0, 2))
            # Ward risk score out of 100
            ward_risk_score = min(100, count * 7)
            
            analytics[ward] = {
                "grievance_count": count,
                "hotspot_score": hotspot_score,
                "risk_score": ward_risk_score,
                "status": "High Risk" if ward_risk_score > 70 else "Medium Risk" if ward_risk_score > 35 else "Low Risk"
            }
            
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [center[1], center[0]]
                },
                "properties": {
                    "ward": ward,
                    "hotspot_score": hotspot_score,
                    "risk_score": ward_risk_score,
                    "complaint_density": count
                }
            })
            
        return {
            "geojson": {
                "type": "FeatureCollection",
                "features": features
            },
            "analytics": analytics
        }
