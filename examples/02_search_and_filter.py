"""
Search and Filter Evacuation Centers
=====================================
This script demonstrates various ways to search and filter
the evacuation centers dataset.
"""

import geopandas as gpd
import pandas as pd


def load_data(data_path='../src/data/ph_evacs_cleaned.geojson'):
    """Load the evacuation centers data."""
    return gpd.read_file(data_path)


def search_by_province(gdf, province_name):
    """Search evacuation centers by province."""
    return gdf[gdf['province'].str.contains(province_name, case=False, na=False)]


def search_by_city(gdf, city_name):
    """Search evacuation centers by city."""
    return gdf[gdf['city'].str.contains(city_name, case=False, na=False)]


def search_by_municipality(gdf, municipality_name):
    """Search evacuation centers by municipality."""
    return gdf[gdf['municipality'].str.contains(municipality_name, case=False, na=False)]


def search_by_type(gdf, center_type):
    """Search evacuation centers by type."""
    return gdf[gdf['type'] == center_type]


def search_by_name(gdf, name_keyword):
    """Search evacuation centers by name (keyword search)."""
    return gdf[gdf['name'].str.contains(name_keyword, case=False, na=False)]


def get_statistics(gdf):
    """Get statistics about the evacuation centers."""
    stats = {
        'total_centers': len(gdf),
        'centers_by_type': gdf['type'].value_counts().to_dict(),
        'centers_by_province': gdf['province'].value_counts().head(10).to_dict(),
        'centers_with_capacity': gdf['capacity'].notna().sum(),
    }
    return stats


def print_results(results, title="Results"):
    """Pretty print search results."""
    print(f"\n{'=' * 80}")
    print(f"{title}")
    print(f"{'=' * 80}")
    print(f"Found: {len(results)} evacuation center(s)\n")
    
    if len(results) == 0:
        print("No results found.")
        return
    
    for idx, row in results.iterrows():
        print(f"{idx + 1}. {row['name']}")
        print(f"   Type: {row['type']}")
        
        location_parts = []
        if pd.notna(row.get('city')):
            location_parts.append(row['city'])
        if pd.notna(row.get('municipality')):
            location_parts.append(row['municipality'])
        if pd.notna(row.get('province')):
            location_parts.append(row['province'])
        
        print(f"   Location: {', '.join(location_parts)}")
        
        if pd.notna(row.get('capacity')):
            print(f"   Capacity: {row['capacity']}")
        print()


def main():
    # Load data
    print("Loading evacuation centers data...")
    evac_centers = load_data()
    
    # Overall statistics
    print("\n" + "=" * 80)
    print("DATASET OVERVIEW")
    print("=" * 80)
    stats = get_statistics(evac_centers)
    print(f"\nTotal Evacuation Centers: {stats['total_centers']}")
    
    print("\nCenters by Type:")
    for center_type, count in stats['centers_by_type'].items():
        print(f"  - {center_type}: {count}")
    
    print(f"\nCenters with Capacity Info: {stats['centers_with_capacity']}")
    
    print("\nTop 10 Provinces by Number of Centers:")
    for province, count in stats['centers_by_province'].items():
        print(f"  - {province}: {count}")
    
    # Example searches
    
    # 1. Search by Province: Misamis Oriental
    results = search_by_province(evac_centers, "Misamis Oriental")
    print_results(results, "EVACUATION CENTERS IN MISAMIS ORIENTAL")
    
    # 2. Search by Type: Barangay Hall
    results = search_by_type(evac_centers, "Barangay Hall")
    print_results(results.head(10), "BARANGAY HALLS (First 10)")
    
    # 3. Search by City: Cagayan de Oro
    results = search_by_city(evac_centers, "Cagayan de Oro")
    print_results(results, "EVACUATION CENTERS IN CAGAYAN DE ORO")
    
    # 4. Search by Name: Schools
    results = search_by_name(evac_centers, "School")
    print_results(results.head(10), "SCHOOLS USED AS EVACUATION CENTERS (First 10)")
    
    # 5. Combined search: Sports Centers in Misamis Oriental
    misamis_centers = search_by_province(evac_centers, "Misamis Oriental")
    sports_centers = search_by_type(misamis_centers, "Sports Center")
    print_results(sports_centers, "SPORTS CENTERS IN MISAMIS ORIENTAL")


if __name__ == "__main__":
    main()
