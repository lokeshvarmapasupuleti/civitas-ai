import pytest
from app.services.gis.ward_lookup import WardLookupService
from app.services.gis.heatmap import GISHeatmapService
from app.services.gis.clustering import GISClusteringService
from app.services.gis.hotspots import GISHotspotService
from app.services.gis.routing import GISRoutingService

def test_ward_lookup_indiranagar():
    service = WardLookupService()
    # Coordinates inside Ward 1 Indiranagar boundaries
    details = service.resolve_coordinates(12.965, 77.635)
    
    assert "Ward 1" in details.ward_name
    assert details.zone_name == "East Zone"
    assert len(details.nearby_schools) > 0
    assert len(details.nearby_hospitals) > 0
    assert len(details.nearby_roads) > 0

def test_ward_lookup_default():
    service = WardLookupService()
    # Coordinates outside all mock ranges
    details = service.resolve_coordinates(10.0, 20.0)
    
    assert "General Ward" in details.ward_name
    assert details.zone_name == "Central Zone"
    assert len(details.nearby_schools) == 0

def test_heatmap_geojson():
    service = GISHeatmapService()
    points = [
        {"lat": 12.96, "lng": 77.63, "weight": 0.9},
        {"lat": 12.97, "lng": 77.64, "weight": 0.3}
    ]
    geojson = service.generate_heatmap_geojson(points)
    
    assert geojson["type"] == "FeatureCollection"
    assert len(geojson["features"]) == 2
    
    feat = geojson["features"][0]
    assert feat["type"] == "Feature"
    assert feat["geometry"]["type"] == "Point"
    assert feat["geometry"]["coordinates"] == [77.63, 12.96]
    assert feat["properties"]["density_weight"] == 0.9

def test_clustering_geojson():
    service = GISClusteringService()
    points = [
        {"lat": 12.961, "lng": 77.631},
        {"lat": 12.962, "lng": 77.632}, # very close to point 1
        {"lat": 12.991, "lng": 77.561}  # far away
    ]
    # Threshold 0.02 should group the first two points and isolate the third
    geojson = service.cluster_points_geojson(points, distance_threshold=0.02)
    
    assert geojson["type"] == "FeatureCollection"
    # Expecting 2 cluster features
    assert len(geojson["features"]) == 2
    
    counts = [f["properties"]["grievance_count"] for f in geojson["features"]]
    assert 2 in counts
    assert 1 in counts

def test_hotspots_calculation():
    service = GISHotspotService()
    points = [
        {"ward": "Ward 1 (Indiranagar)"},
        {"ward": "Ward 1 (Indiranagar)"},
        {"ward": "Ward 7 (Jayanagar)"}
    ]
    res = service.calculate_hotspot_scores(points)
    
    assert "geojson" in res
    assert "analytics" in res
    assert res["geojson"]["type"] == "FeatureCollection"
    
    # Assert analytics
    analytics = res["analytics"]
    assert "Ward 1 (Indiranagar)" in analytics
    assert analytics["Ward 1 (Indiranagar)"]["grievance_count"] == 2
    assert analytics["Ward 1 (Indiranagar)"]["risk_score"] == 14
    assert analytics["Ward 1 (Indiranagar)"]["status"] == "Low Risk"

def test_routing_geojson():
    service = GISRoutingService()
    # Depot to Whitefield
    route = service.calculate_route_geojson(12.95, 77.72, 12.96, 77.73)
    
    assert route["type"] == "Feature"
    assert route["geometry"]["type"] == "LineString"
    
    # Coordinates array of LineString (should contain 4 coordinate points)
    coords = route["geometry"]["coordinates"]
    assert len(coords) == 4
    assert coords[0] == [77.72, 12.95]
    assert coords[-1] == [77.73, 12.96]
    
    # Assert properties
    assert route["properties"]["distance_km"] > 0
    assert route["properties"]["duration_minutes"] > 0
    assert len(route["properties"]["navigation_steps"]) > 0
