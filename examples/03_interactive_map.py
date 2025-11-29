"""
Interactive Map Visualization
==============================
This script creates an interactive map of evacuation centers using Folium.
You can filter by province, type, and zoom to specific locations.
"""

import geopandas as gpd
import folium
from folium import plugins
import pandas as pd
import os


def create_base_map(center_lat=12.8797, center_lon=121.7740, zoom_start=6):
    """
    Create a base Folium map centered on the Philippines.
    
    Parameters:
    -----------
    center_lat : float
        Latitude for map center (default: center of Philippines)
    center_lon : float
        Longitude for map center
    zoom_start : int
        Initial zoom level
    
    Returns:
    --------
    Folium map object
    """
    m = folium.Map(
        location=[center_lat, center_lon],
        zoom_start=zoom_start,
        tiles='OpenStreetMap'
    )
    return m


def get_marker_color(center_type):
    """Get marker color based on evacuation center type."""
    color_map = {
        'Barangay Hall': 'blue',
        'Campus': 'green',
        'Church': 'purple',
        'Field': 'orange',
        'Hospital': 'red',
        'Shelter': 'darkblue',
        'Sports Center': 'lightgreen',
    }
    return color_map.get(center_type, 'gray')


def get_marker_icon(center_type):
    """Get marker icon based on evacuation center type."""
    icon_map = {
        'Barangay Hall': 'home',
        'Campus': 'graduation-cap',
        'Church': 'church',
        'Field': 'tree',
        'Hospital': 'plus-square',
        'Shelter': 'shield',
        'Sports Center': 'futbol-o',
    }
    return icon_map.get(center_type, 'map-marker')


def add_markers_to_map(m, gdf, cluster=True):
    """
    Add evacuation center markers to the map.
    
    Parameters:
    -----------
    m : folium.Map
        The map object
    gdf : GeoDataFrame
        The evacuation centers data
    cluster : bool
        Whether to use marker clustering
    """
    if cluster:
        marker_cluster = plugins.MarkerCluster().add_to(m)
        parent = marker_cluster
    else:
        parent = m
    
    for idx, row in gdf.iterrows():
        # Extract coordinates
        if row.geometry.geom_type == 'Point':
            lat, lon = row.geometry.y, row.geometry.x
        else:
            # For polygons, use centroid
            centroid = row.geometry.centroid
            lat, lon = centroid.y, centroid.x
        
        # Create popup content
        popup_html = f"""
        <div style="font-family: Arial; min-width: 200px;">
            <h4 style="margin: 0 0 10px 0; color: #2c3e50;">{row['name']}</h4>
            <table style="width: 100%; font-size: 12px;">
                <tr>
                    <td style="font-weight: bold; padding: 2px;">Type:</td>
                    <td style="padding: 2px;">{row['type']}</td>
                </tr>
        """
        
        if pd.notna(row.get('city')):
            popup_html += f"""
                <tr>
                    <td style="font-weight: bold; padding: 2px;">City:</td>
                    <td style="padding: 2px;">{row['city']}</td>
                </tr>
            """
        
        if pd.notna(row.get('municipality')):
            popup_html += f"""
                <tr>
                    <td style="font-weight: bold; padding: 2px;">Municipality:</td>
                    <td style="padding: 2px;">{row['municipality']}</td>
                </tr>
            """
        
        if pd.notna(row.get('province')):
            popup_html += f"""
                <tr>
                    <td style="font-weight: bold; padding: 2px;">Province:</td>
                    <td style="padding: 2px;">{row['province']}</td>
                </tr>
            """
        
        if pd.notna(row.get('capacity')):
            popup_html += f"""
                <tr>
                    <td style="font-weight: bold; padding: 2px;">Capacity:</td>
                    <td style="padding: 2px;">{row['capacity']}</td>
                </tr>
            """
        
        popup_html += """
            </table>
        </div>
        """
        
        # Create marker
        folium.Marker(
            location=[lat, lon],
            popup=folium.Popup(popup_html, max_width=300),
            tooltip=row['name'],
            icon=folium.Icon(
                color=get_marker_color(row['type']),
                icon=get_marker_icon(row['type']),
                prefix='fa'
            )
        ).add_to(parent)


def create_legend(m):
    """Add a legend to the map."""
    legend_html = """
    <div style="position: fixed; 
                bottom: 50px; right: 50px; width: 220px; height: auto; 
                background-color: white; border:2px solid grey; z-index:9999; 
                font-size:14px; padding: 10px; border-radius: 5px;
                box-shadow: 2px 2px 6px rgba(0,0,0,0.3);">
        <h4 style="margin-top: 0;">Evacuation Center Types</h4>
        <p style="margin: 5px 0;"><i class="fa fa-map-marker" style="color:blue"></i> Barangay Hall</p>
        <p style="margin: 5px 0;"><i class="fa fa-map-marker" style="color:green"></i> Campus</p>
        <p style="margin: 5px 0;"><i class="fa fa-map-marker" style="color:purple"></i> Church</p>
        <p style="margin: 5px 0;"><i class="fa fa-map-marker" style="color:orange"></i> Field</p>
        <p style="margin: 5px 0;"><i class="fa fa-map-marker" style="color:red"></i> Hospital</p>
        <p style="margin: 5px 0;"><i class="fa fa-map-marker" style="color:darkblue"></i> Shelter</p>
        <p style="margin: 5px 0;"><i class="fa fa-map-marker" style="color:lightgreen"></i> Sports Center</p>
    </div>
    """
    m.get_root().html.add_child(folium.Element(legend_html))


def create_visualization(data_path='../src/data/ph_evacs_cleaned.geojson',
                        output_file='evacuation_centers_map.html',
                        province_filter=None,
                        type_filter=None,
                        center_lat=None,
                        center_lon=None,
                        zoom_start=6,
                        use_clustering=True):
    """
    Create an interactive map visualization of evacuation centers.
    
    Parameters:
    -----------
    data_path : str
        Path to the GeoJSON file
    output_file : str
        Output HTML file name
    province_filter : str, optional
        Filter by specific province
    type_filter : str, optional
        Filter by specific center type
    center_lat : float, optional
        Custom map center latitude
    center_lon : float, optional
        Custom map center longitude
    zoom_start : int
        Initial zoom level
    use_clustering : bool
        Whether to use marker clustering
    """
    print("Loading data...")
    gdf = gpd.read_file(data_path)
    
    # Apply filters
    if province_filter:
        gdf = gdf[gdf['province'].str.contains(province_filter, case=False, na=False)]
        print(f"Filtered to {province_filter}: {len(gdf)} centers")
    
    if type_filter:
        gdf = gdf[gdf['type'] == type_filter]
        print(f"Filtered to {type_filter}: {len(gdf)} centers")
    
    # Calculate center if not provided
    if center_lat is None or center_lon is None:
        bounds = gdf.total_bounds  # [minx, miny, maxx, maxy]
        center_lon = (bounds[0] + bounds[2]) / 2
        center_lat = (bounds[1] + bounds[3]) / 2
    
    print(f"Creating map centered at ({center_lat}, {center_lon})...")
    m = create_base_map(center_lat, center_lon, zoom_start)
    
    print(f"Adding {len(gdf)} markers...")
    add_markers_to_map(m, gdf, cluster=use_clustering)
    
    # Add legend
    create_legend(m)
    
    # Add fullscreen option
    plugins.Fullscreen().add_to(m)
    
    # Save map
    print(f"Saving map to {output_file}...")
    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    m.save(output_file)
    print(f"✓ Map saved successfully!")
    print(f"  Open '{output_file}' in your browser to view the interactive map.")
    
    return m


def main():
    print("=" * 80)
    print("INTERACTIVE MAP VISUALIZATION")
    print("=" * 80)
    
    # Example 1: All evacuation centers in the Philippines
    print("\n1. Creating map of ALL evacuation centers in the Philippines...")
    create_visualization(
        output_file='maps/all_evacuation_centers.html',
        use_clustering=True
    )
    
    # Example 2: Evacuation centers in Misamis Oriental
    print("\n2. Creating map of evacuation centers in MISAMIS ORIENTAL...")
    create_visualization(
        output_file='maps/misamis_oriental_centers.html',
        province_filter='Misamis Oriental',
        center_lat=8.4823,  # Cagayan de Oro City
        center_lon=124.6478,
        zoom_start=10,
        use_clustering=False  # Don't cluster for province view
    )
    
    # Example 3: Only dedicated shelters nationwide
    print("\n3. Creating map of DEDICATED SHELTERS nationwide...")
    create_visualization(
        output_file='maps/shelters_only.html',
        type_filter='Shelter',
        use_clustering=True
    )
    
    print("\n" + "=" * 80)
    print("ALL MAPS CREATED SUCCESSFULLY!")
    print("=" * 80)
    print("\nCreated files:")
    print("  - maps/all_evacuation_centers.html")
    print("  - maps/misamis_oriental_centers.html")
    print("  - maps/shelters_only.html")


if __name__ == "__main__":
    main()
