# Philippine Evacuation Centers - Example Scripts 📍

This directory contains example Python scripts demonstrating various use cases for the Philippine Evacuation Centers dataset.

## 🚀 Quick Start

### Installation

1. **Install Python dependencies**:
```bash
pip install -r requirements.txt
```

2. **Verify the data files exist**:
   - `../src/data/ph_evacs_cleaned.geojson` (cleaned dataset)
   - `../src/data/ph_evacs_raw.geojson` (raw dataset)

## 📁 Available Scripts

### 1. Find Nearest Evacuation Center
**File**: `01_find_nearest_center.py`

Find the nearest evacuation centers based on your GPS coordinates.

**Features**:
- Search for nearest centers from any location
- Filter by evacuation center type
- Calculate distances in kilometers
- Show multiple nearest options

**Usage**:
```bash
python 01_find_nearest_center.py
```

**Customize**:
Edit the `lat` and `lon` variables in the `main()` function to search from different coordinates.

```python
# Example: Search near your location
lat = 8.4823  # Your latitude
lon = 124.6478  # Your longitude

nearest = find_nearest_evacuation_center(lat, lon, max_results=5)
```

---

### 2. Search and Filter Centers
**File**: `02_search_and_filter.py`

Search and filter evacuation centers by various criteria.

**Features**:
- Search by province, city, or municipality
- Filter by evacuation center type
- Search by name (keyword search)
- Get dataset statistics
- Combine multiple filters

**Usage**:
```bash
python 02_search_and_filter.py
```

**Example functions**:
```python
# Search by province
centers = search_by_province(gdf, "Misamis Oriental")

# Search by type
shelters = search_by_type(gdf, "Shelter")

# Search by name keyword
schools = search_by_name(gdf, "School")

# Get statistics
stats = get_statistics(gdf)
```

---

### 3. Interactive Map Visualization
**File**: `03_interactive_map.py`

Create interactive HTML maps with evacuation center markers.

**Features**:
- Color-coded markers by center type
- Clickable markers with detailed info
- Marker clustering for better performance
- Filter by province or type
- Fullscreen map support
- Custom legends

**Usage**:
```bash
python 03_interactive_map.py
```

This will create three HTML maps in the `maps/` directory:
- `all_evacuation_centers.html` - All centers nationwide
- `misamis_oriental_centers.html` - Misamis Oriental only
- `shelters_only.html` - Dedicated shelters only

**Customize**:
```python
# Create a custom map
create_visualization(
    output_file='my_custom_map.html',
    province_filter='Cebu',
    center_lat=10.3157,
    center_lon=123.8854,
    zoom_start=10
)
```

---

### 4. Misamis Oriental Analysis
**File**: `04_misamis_oriental_analysis.py`

Comprehensive analysis of evacuation centers in Misamis Oriental province.

**Features**:
- Detailed statistics and summaries
- Multiple visualizations (bar charts, pie charts, maps)
- Excel export with multiple sheets
- Complete listing of all centers
- Municipality-level breakdown

**Usage**:
```bash
python 04_misamis_oriental_analysis.py
```

**Output**:
- `visualizations/centers_by_type.png`
- `visualizations/centers_by_municipality.png`
- `visualizations/geographic_distribution.png`
- `visualizations/type_distribution_pie.png`
- `misamis_oriental_evacuation_centers.xlsx`

---

## 🎨 Evacuation Center Types

The dataset classifies centers into the following types:

| Type | Icon | Description |
|------|------|-------------|
| **Barangay Hall** | 🏠 | Local government hall |
| **Campus** | 🎓 | Schools, colleges, universities |
| **Church** | ⛪ | Places of worship |
| **Field** | 🌳 | Open fields |
| **Hospital** | 🏥 | Medical facilities |
| **Shelter** | 🛡️ | Dedicated evacuation shelters |
| **Sports Center** | ⚽ | Sports complexes, covered courts |

## 🔧 Customization Guide

### Modify Search Radius

```python
# In 01_find_nearest_center.py
nearest = find_nearest_evacuation_center(
    lat=8.4823, 
    lon=124.6478, 
    max_results=10  # Change this number
)
```

### Change Map Style

```python
# In 03_interactive_map.py
m = folium.Map(
    location=[center_lat, center_lon],
    zoom_start=zoom_start,
    tiles='CartoDB positron'  # Try: 'CartoDB dark_matter', 'Stamen Terrain'
)
```

### Add Custom Analysis

```python
# Example: Find centers with capacity info
centers_with_capacity = gdf[gdf['capacity'].notna()]
print(f"Centers with capacity data: {len(centers_with_capacity)}")
print(f"Total capacity: {centers_with_capacity['capacity'].sum()}")
```

## 📊 Data Fields Reference

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `name` | string | Evacuation center name |
| `type` | string | Center type category |
| `city` | string | City name |
| `municipality` | string | Municipality name |
| `province` | string | Province name |
| `capacity` | number | Facility capacity (may be null) |
| `geometry` | GeoJSON | Geographic coordinates |

## 💡 Common Use Cases

### 1. Emergency Response App
```python
# Find nearest center for a disaster victim
user_location = (8.4823, 124.6478)
nearest_centers = find_nearest_evacuation_center(
    user_location[0], 
    user_location[1], 
    max_results=3
)
```

### 2. Government Planning
```python
# Analyze coverage by municipality
municipality_stats = gdf.groupby('municipality').agg({
    'id': 'count',
    'capacity': 'sum'
}).rename(columns={'id': 'num_centers'})
```

### 3. Public Information System
```python
# Create a map for public access
create_visualization(
    province_filter='Misamis Oriental',
    output_file='public_evacuation_map.html',
    use_clustering=False
)
```

## ⚠️ Important Notes

> [!WARNING]
> - The dataset may not include ALL evacuation centers in the Philippines
> - Some information might be outdated (sourced from OpenStreetMap)
> - Always verify capacity and availability with local authorities during emergencies
> - This is for informational purposes only

> [!TIP]
> - Use the interactive maps for visual exploration
> - Export to Excel for sharing with non-technical stakeholders
> - Combine scripts for custom workflows

## 🤝 Contributing

To add more examples or improvements:
1. Create a new script following the naming convention `0X_description.py`
2. Add documentation in this README
3. Include example usage and output
4. Submit a pull request

## 📝 License

See the main LICENSE file in the repository root.

## 🆘 Support

If you encounter issues:
1. Check that all dependencies are installed
2. Verify data files are in the correct location
3. Review error messages for missing modules
4. Open an issue on GitHub with details

---

**Made with ❤️ for disaster preparedness in the Philippines**
