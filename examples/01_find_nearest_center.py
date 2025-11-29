"""
Find Nearest Evacuation Center
================================
This script demonstrates how to find the nearest evacuation center
given a location (latitude, longitude).
"""

import geopandas as gpd
from shapely.geometry import Point
import pandas as pd


def find_nearest_evacuation_center(lat, lon, data_path='../src/data/ph_evacs_cleaned.geojson', 
                                   center_type=None, max_results=5):
    """
    Find the nearest evacuation centers to a given location.
    
    Parameters:
    -----------
    lat : float
        Latitude of your location
    lon : float
        Longitude of your location
    data_path : str
        Path to the GeoJSON file
    center_type : str, optional
        Filter by center type (e.g., 'Shelter', 'Barangay Hall', 'Campus')
    max_results : int
        Number of nearest centers to return
    
    Returns:
    --------
    GeoDataFrame with nearest evacuation centers and distances
    """
    # Load the evacuation centers data
    evac_centers = gpd.read_file(data_path)
    
    # Filter by type if specified
    if center_type:
        evac_centers = evac_centers[evac_centers['type'] == center_type]
    
    # Create a point for the user's location
    user_location = Point(lon, lat)
    user_gdf = gpd.GeoDataFrame(geometry=[user_location], crs=evac_centers.crs)
    
    # Calculate distances (in meters)
    # Convert to a projected CRS for accurate distance calculation
    evac_centers_proj = evac_centers.to_crs('EPSG:32651')  # WGS 84 / UTM zone 51N (Philippines)
    user_proj = user_gdf.to_crs('EPSG:32651')
    
    evac_centers_proj['distance_m'] = evac_centers_proj.geometry.distance(user_proj.geometry.iloc[0])
    evac_centers_proj['distance_km'] = evac_centers_proj['distance_m'] / 1000
    
    # Sort by distance and get the nearest ones
    nearest = evac_centers_proj.sort_values('distance_m').head(max_results)
    
    # Select useful columns
    result_cols = ['name', 'type', 'city', 'municipality', 'province', 
                   'capacity', 'distance_km', 'geometry']
    available_cols = [col for col in result_cols if col in nearest.columns]
    
    return nearest[available_cols].reset_index(drop=True)


def main():
    # Example: Find evacuation centers near Cagayan de Oro City, Misamis Oriental
    # Coordinates for CDO City Hall: approximately 8.4823° N, 124.6478° E
    lat = 8.4823
    lon = 124.6478
    
    print("=" * 80)
    print("FINDING NEAREST EVACUATION CENTERS")
    print("=" * 80)
    print(f"Location: {lat}°N, {lon}°E (Cagayan de Oro City)")
    print()
    
    # Find all types of centers
    print("\n📍 5 NEAREST EVACUATION CENTERS (All Types)")
    print("-" * 80)
    nearest_all = find_nearest_evacuation_center(lat, lon, max_results=5)
    
    for idx, row in nearest_all.iterrows():
        print(f"\n{idx + 1}. {row['name']}")
        print(f"   Type: {row['type']}")
        print(f"   Location: {row.get('city', row.get('municipality', 'N/A'))}, {row['province']}")
        print(f"   Distance: {row['distance_km']:.2f} km")
        if pd.notna(row.get('capacity')):
            print(f"   Capacity: {row['capacity']}")
    
    # Find only dedicated shelters
    print("\n\n🏠 5 NEAREST DEDICATED SHELTERS")
    print("-" * 80)
    nearest_shelters = find_nearest_evacuation_center(lat, lon, center_type='Shelter', max_results=5)
    
    if len(nearest_shelters) > 0:
        for idx, row in nearest_shelters.iterrows():
            print(f"\n{idx + 1}. {row['name']}")
            print(f"   Location: {row.get('city', row.get('municipality', 'N/A'))}, {row['province']}")
            print(f"   Distance: {row['distance_km']:.2f} km")
            if pd.notna(row.get('capacity')):
                print(f"   Capacity: {row['capacity']}")
    else:
        print("No dedicated shelters found in the dataset.")
    
    print("\n" + "=" * 80)
    print("SEARCH COMPLETE")
    print("=" * 80)


if __name__ == "__main__":
    main()
