import math
from typing import List, Dict, Any

class GISClusteringService:
    def cluster_points_geojson(self, points: List[Dict[str, Any]], eps: float = 0.02, min_samples: int = 2, distance_threshold: float = None) -> Dict[str, Any]:
        if distance_threshold is not None:
            eps = distance_threshold
        """
        Groups coordinates using DBSCAN clustering.
        Returns a GeoJSON FeatureCollection containing cluster center points, counts, and radius details.
        """
        if not points:
            return {"type": "FeatureCollection", "features": []}
            
        n = len(points)
        labels = [-1] * n
        visited = [False] * n
        
        def get_distance(p1, p2):
            lat1 = p1.get("lat") or 0.0
            lng1 = p1.get("lng") or 0.0
            lat2 = p2.get("lat") or 0.0
            lng2 = p2.get("lng") or 0.0
            return math.sqrt((lat1 - lat2)**2 + (lng1 - lng2)**2)
            
        def get_neighbors(idx):
            neighbors = []
            for j in range(n):
                if get_distance(points[idx], points[j]) <= eps:
                    neighbors.append(j)
            return neighbors
            
        cluster_id = 0
        for i in range(n):
            if visited[i]:
                continue
            visited[i] = True
            
            neighbors = get_neighbors(i)
            if len(neighbors) < min_samples:
                labels[i] = -1
            else:
                labels[i] = cluster_id
                queue = list(neighbors)
                if i in queue:
                    queue.remove(i)
                    
                idx_q = 0
                while idx_q < len(queue):
                    curr = queue[idx_q]
                    if not visited[curr]:
                        visited[curr] = True
                        curr_neighbors = get_neighbors(curr)
                        if len(curr_neighbors) >= min_samples:
                            for cn in curr_neighbors:
                                if cn not in queue:
                                    queue.append(cn)
                    if labels[curr] == -1:
                        labels[curr] = cluster_id
                    idx_q += 1
                cluster_id += 1
                
        clusters_map = {}
        for idx, label in enumerate(labels):
            # Treat noise/isolated points as single-point clusters to prevent data loss in visualization
            if label == -1:
                label = f"isolated_{idx}"
            if label not in clusters_map:
                clusters_map[label] = []
            clusters_map[label].append(points[idx])
            
        features = []
        for lid, cluster_pts in clusters_map.items():
            avg_lat = sum((p.get("lat") or 0.0) for p in cluster_pts) / len(cluster_pts)
            avg_lng = sum((p.get("lng") or 0.0) for p in cluster_pts) / len(cluster_pts)
            
            features.append({
                "type": "Feature",
                "id": len(features) + 1,
                "geometry": {
                    "type": "Point",
                    "coordinates": [round(avg_lng, 5), round(avg_lat, 5)]
                },
                "properties": {
                    "cluster_id": len(features) + 1,
                    "grievance_count": len(cluster_pts),
                    "radius_deg": eps
                }
            })
            
        return {
            "type": "FeatureCollection",
            "features": features
        }
