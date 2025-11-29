"""
Misamis Oriental Evacuation Centers Analysis
=============================================
Comprehensive analysis of evacuation centers in Misamis Oriental province.
"""

import geopandas as gpd
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from collections import Counter


def load_misamis_oriental_data(data_path='../src/data/ph_evacs_cleaned.geojson'):
    """Load evacuation centers data filtered for Misamis Oriental."""
    gdf = gpd.read_file(data_path)
    misamis = gdf[gdf['province'].str.contains('Misamis Oriental', case=False, na=False)]
    return misamis


def get_summary_statistics(gdf):
    """Get summary statistics for Misamis Oriental evacuation centers."""
    stats = {
        'total_centers': len(gdf),
        'centers_by_type': gdf['type'].value_counts().to_dict(),
        'centers_by_city': gdf['city'].value_counts().to_dict() if 'city' in gdf.columns else {},
        'centers_by_municipality': gdf['municipality'].value_counts().to_dict() if 'municipality' in gdf.columns else {},
        'centers_with_capacity': gdf['capacity'].notna().sum(),
        'total_capacity': gdf['capacity'].sum() if gdf['capacity'].notna().any() else 0,
    }
    return stats


def print_detailed_summary(stats):
    """Print detailed summary of statistics."""
    print("\n" + "=" * 80)
    print("MISAMIS ORIENTAL EVACUATION CENTERS - SUMMARY")
    print("=" * 80)
    
    print(f"\n📊 TOTAL EVACUATION CENTERS: {stats['total_centers']}")
    
    print("\n🏢 CENTERS BY TYPE:")
    for center_type, count in sorted(stats['centers_by_type'].items(), 
                                     key=lambda x: x[1], reverse=True):
        percentage = (count / stats['total_centers']) * 100
        print(f"  • {center_type:.<30} {count:>3} ({percentage:>5.1f}%)")
    
    if stats['centers_by_city']:
        print("\n🏙️  CENTERS BY CITY:")
        for city, count in sorted(stats['centers_by_city'].items(), 
                                 key=lambda x: x[1], reverse=True)[:10]:
            print(f"  • {city:.<30} {count:>3}")
    
    if stats['centers_by_municipality']:
        print("\n🏘️  CENTERS BY MUNICIPALITY (Top 10):")
        for municipality, count in sorted(stats['centers_by_municipality'].items(), 
                                         key=lambda x: x[1], reverse=True)[:10]:
            print(f"  • {municipality:.<30} {count:>3}")
    
    print(f"\n👥 CAPACITY INFORMATION:")
    print(f"  • Centers with capacity data: {stats['centers_with_capacity']}")
    if stats['total_capacity'] > 0:
        print(f"  • Total reported capacity: {stats['total_capacity']:,.0f}")


def create_visualizations(gdf, output_dir='visualizations'):
    """Create various visualizations for Misamis Oriental data."""
    import os
    os.makedirs(output_dir, exist_ok=True)
    
    # Set style
    sns.set_style("whitegrid")
    plt.rcParams['figure.figsize'] = (12, 6)
    
    # 1. Bar chart of centers by type
    fig, ax = plt.subplots(figsize=(10, 6))
    type_counts = gdf['type'].value_counts()
    colors = plt.cm.Set3(range(len(type_counts)))
    type_counts.plot(kind='bar', ax=ax, color=colors, edgecolor='black', linewidth=1.2)
    ax.set_title('Evacuation Centers in Misamis Oriental by Type', 
                 fontsize=16, fontweight='bold', pad=20)
    ax.set_xlabel('Type of Evacuation Center', fontsize=12, fontweight='bold')
    ax.set_ylabel('Number of Centers', fontsize=12, fontweight='bold')
    ax.tick_params(axis='x', rotation=45)
    plt.tight_layout()
    plt.savefig(f'{output_dir}/centers_by_type.png', dpi=300, bbox_inches='tight')
    print(f"✓ Saved: {output_dir}/centers_by_type.png")
    plt.close()
    
    # 2. Distribution by municipality (if available)
    if 'municipality' in gdf.columns and gdf['municipality'].notna().any():
        fig, ax = plt.subplots(figsize=(12, 8))
        municipality_counts = gdf['municipality'].value_counts().head(15)
        municipality_counts.plot(kind='barh', ax=ax, color='steelblue', 
                                edgecolor='black', linewidth=1.2)
        ax.set_title('Top 15 Municipalities by Number of Evacuation Centers', 
                     fontsize=16, fontweight='bold', pad=20)
        ax.set_xlabel('Number of Centers', fontsize=12, fontweight='bold')
        ax.set_ylabel('Municipality', fontsize=12, fontweight='bold')
        plt.tight_layout()
        plt.savefig(f'{output_dir}/centers_by_municipality.png', dpi=300, bbox_inches='tight')
        print(f"✓ Saved: {output_dir}/centers_by_municipality.png")
        plt.close()
    
    # 3. Geographic distribution map
    fig, ax = plt.subplots(figsize=(12, 10))
    gdf.plot(ax=ax, column='type', legend=True, 
             categorical=True, cmap='Set3',
             markersize=50, alpha=0.7, edgecolor='black', linewidth=0.5)
    ax.set_title('Geographic Distribution of Evacuation Centers in Misamis Oriental', 
                 fontsize=16, fontweight='bold', pad=20)
    ax.set_xlabel('Longitude', fontsize=12, fontweight='bold')
    ax.set_ylabel('Latitude', fontsize=12, fontweight='bold')
    ax.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(f'{output_dir}/geographic_distribution.png', dpi=300, bbox_inches='tight')
    print(f"✓ Saved: {output_dir}/geographic_distribution.png")
    plt.close()
    
    # 4. Pie chart of center types
    fig, ax = plt.subplots(figsize=(10, 8))
    type_counts = gdf['type'].value_counts()
    colors = plt.cm.Set3(range(len(type_counts)))
    ax.pie(type_counts.values, labels=type_counts.index, autopct='%1.1f%%',
           colors=colors, startangle=90, textprops={'fontsize': 11, 'fontweight': 'bold'})
    ax.set_title('Distribution of Evacuation Center Types in Misamis Oriental', 
                 fontsize=16, fontweight='bold', pad=20)
    plt.tight_layout()
    plt.savefig(f'{output_dir}/type_distribution_pie.png', dpi=300, bbox_inches='tight')
    print(f"✓ Saved: {output_dir}/type_distribution_pie.png")
    plt.close()


def export_to_excel(gdf, output_file='misamis_oriental_evacuation_centers.xlsx'):
    """Export data to Excel with multiple sheets."""
    with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
        # Sheet 1: All data
        df = pd.DataFrame(gdf.drop(columns='geometry'))
        df.to_excel(writer, sheet_name='All Centers', index=False)
        
        # Sheet 2: Summary by type
        type_summary = gdf['type'].value_counts().reset_index()
        type_summary.columns = ['Type', 'Count']
        type_summary.to_excel(writer, sheet_name='Summary by Type', index=False)
        
        # Sheet 3: Summary by municipality
        if 'municipality' in gdf.columns:
            muni_summary = gdf['municipality'].value_counts().reset_index()
            muni_summary.columns = ['Municipality', 'Count']
            muni_summary.to_excel(writer, sheet_name='Summary by Municipality', index=False)
    
    print(f"✓ Exported data to: {output_file}")


def list_all_centers(gdf):
    """Print a detailed list of all evacuation centers."""
    print("\n" + "=" * 80)
    print("COMPLETE LIST OF EVACUATION CENTERS IN MISAMIS ORIENTAL")
    print("=" * 80)
    
    # Group by type
    for center_type in sorted(gdf['type'].unique()):
        centers = gdf[gdf['type'] == center_type].sort_values('name')
        print(f"\n{center_type.upper()} ({len(centers)} centers)")
        print("-" * 80)
        
        for idx, row in centers.iterrows():
            print(f"\n  {row['name']}")
            
            location_parts = []
            if pd.notna(row.get('city')):
                location_parts.append(row['city'])
            if pd.notna(row.get('municipality')):
                location_parts.append(row['municipality'])
            
            if location_parts:
                print(f"  Location: {', '.join(location_parts)}")
            
            if pd.notna(row.get('capacity')):
                print(f"  Capacity: {row['capacity']}")
            
            # Show coordinates
            if row.geometry.geom_type == 'Point':
                print(f"  Coordinates: {row.geometry.y:.4f}°N, {row.geometry.x:.4f}°E")


def main():
    print("=" * 80)
    print("MISAMIS ORIENTAL EVACUATION CENTERS - COMPREHENSIVE ANALYSIS")
    print("=" * 80)
    
    # Load data
    print("\nLoading Misamis Oriental evacuation centers data...")
    misamis_gdf = load_misamis_oriental_data()
    
    if len(misamis_gdf) == 0:
        print("\n⚠️  WARNING: No evacuation centers found for Misamis Oriental!")
        print("This might be because:")
        print("  1. The dataset doesn't have centers for this province")
        print("  2. The province name in the data is different")
        print("\nTry checking the raw data or updating the filter.")
        return
    
    # Get and print statistics
    stats = get_summary_statistics(misamis_gdf)
    print_detailed_summary(stats)
    
    # Create visualizations
    print("\n" + "=" * 80)
    print("CREATING VISUALIZATIONS")
    print("=" * 80)
    create_visualizations(misamis_gdf)
    
    # Export to Excel
    print("\n" + "=" * 80)
    print("EXPORTING DATA")
    print("=" * 80)
    export_to_excel(misamis_gdf)
    
    # List all centers
    list_all_centers(misamis_gdf)
    
    print("\n" + "=" * 80)
    print("ANALYSIS COMPLETE!")
    print("=" * 80)
    print("\nGenerated files:")
    print("  • visualizations/centers_by_type.png")
    print("  • visualizations/centers_by_municipality.png")
    print("  • visualizations/geographic_distribution.png")
    print("  • visualizations/type_distribution_pie.png")
    print("  • misamis_oriental_evacuation_centers.xlsx")


if __name__ == "__main__":
    main()
