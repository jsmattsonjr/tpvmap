#!/usr/bin/env python3
"""
FIT to GeoPackage Converter
--------------------------

A simple command-line tool that extracts GPS tracks from Garmin FIT files
and saves them as routes in a GeoPackage file. Useful for visualizing
activities in GIS applications.

Authors:
    Jim Mattson
    Claude (Anthropic)

License: MIT
"""

import fitparse
import geopandas as gpd
from shapely.geometry import LineString
import argparse
import sys
from pathlib import Path
from typing import List, Dict, Optional
from tqdm import tqdm

def process_fit_file(fit_file: str) -> Optional[Dict]:
    """Extract GPS track from a FIT file."""
    try:
        fitfile = fitparse.FitFile(fit_file)
        coordinates = []
        
        # Extract just the GPS coordinates
        for record in fitfile.get_messages('record'):
            data = record.get_values()
            if 'position_lat' in data and 'position_long' in data:
                lat = data['position_lat'] / ((2**32) / 360)
                lon = data['position_long'] / ((2**32) / 360)
                coordinates.append((lon, lat))  # GeoJSON uses (lon, lat) order
        
        if coordinates:
            return {
                'filename': Path(fit_file).name,
                'geometry': LineString(coordinates)
            }
                    
    except Exception as e:
        print(f"Warning: Error processing {fit_file}: {e}", file=sys.stderr)
        return None

def convert_fit_files(fit_files: List[str], output_file: str) -> None:
    """Convert FIT files to a GeoPackage file containing routes."""
    routes_data = []
    
    # Process all files
    for fit_file in tqdm(fit_files, desc="Processing FIT files"):
        route_data = process_fit_file(fit_file)
        if route_data:
            routes_data.append(route_data)
    
    if not routes_data:
        raise ValueError("No valid routes found in FIT files")
    
    # Convert to GeoDataFrame and save
    gdf = gpd.GeoDataFrame(routes_data)
    gdf.set_crs(epsg=4326, inplace=True)
    
    # Create output directory if needed
    output_path = Path(output_file)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Save to GeoPackage
    gdf.to_file(output_file, driver='GPKG')

def main():
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    %(prog)s *.fit -o routes.gpkg
    %(prog)s route1.fit route2.fit -o routes.gpkg
    %(prog)s rides/*.fit -o routes.gpkg
        """)
    
    parser.add_argument('fit_files', nargs='+',
                        help='One or more FIT files')
    parser.add_argument('-o', '--output', required=True,
                        help='Output GeoPackage file (e.g., routes.gpkg)')
    
    args = parser.parse_args()
    
    try:
        convert_fit_files(args.fit_files, args.output)
        print(f"\nRoutes saved to {args.output}")
        
    except Exception as e:
        parser.error(str(e))

if __name__ == '__main__':
    main()
