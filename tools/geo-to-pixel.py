#!/usr/bin/env python3
"""
Geographic to Pixel Coordinate Converter
======================================

A utility for converting geographic coordinates (WGS84) to pixel coordinates
for a specific bounded region and image size.

Copyright (c) 2024
Created in collaboration between Claude and Jim Mattson
Licensed under MIT License
"""

import sys
import json
import argparse
from typing import Dict, Tuple

def geo_to_pixel(lat: float, lon: float, bounds: Dict[str, float],
                 image_width: int, image_height: int) -> Tuple[int, int]:
    """
    Convert geographic coordinates to pixel coordinates within a bounded region.

    The conversion assumes a linear projection suitable for small geographic areas.
    For larger areas, consider using proper map projections.

    Args:
        lat: Latitude in WGS84 decimal degrees
        lon: Longitude in WGS84 decimal degrees
        bounds: Dictionary containing north, south, east, west bounds in decimal degrees
        image_width: Width of the target image in pixels
        image_height: Height of the target image in pixels

    Returns:
        tuple: (x, y) pixel coordinates where (0,0) is the top-left corner

    Example:
        >>> bounds = {'north': -1.374593, 'south': -1.482999,
                     'east': 149.686722, 'west': 149.578094}
        >>> x, y = geo_to_pixel(-1.42, 149.63, bounds, 2048, 2048)
    """
    # Calculate conversion factors
    lon_per_pixel = (bounds['east'] - bounds['west']) / image_width
    lat_per_pixel = (bounds['north'] - bounds['south']) / image_height

    # Convert to pixel coordinates
    x = round((lon - bounds['west']) / lon_per_pixel)
    y = round((bounds['north'] - lat) / lat_per_pixel)

    return x, y

def main():
    """
    Main function handling command-line interface and coordinate conversion.
    """
    # Define bounds for the region of interest
    bounds = {
        'north': -1.374593,
        'south': -1.482999,
        'east': 149.686722,
        'west': 149.578094
    }

    # Set up argument parser
    parser = argparse.ArgumentParser(
        description='Convert geographic coordinates (WGS84) to pixel coordinates for a 2048x2048 image.',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument('latitude', type=float, help='Latitude in WGS84')
    parser.add_argument('longitude', type=float, help='Longitude in WGS84')
    parser.add_argument('--format', choices=['plain', 'json', 'csv'], default='plain',
                      help='Output format (default: plain)')

    # Add usage examples to the help text
    parser.epilog = f"""
Examples:
    {sys.argv[0]} -1.42 149.63                 # Plain text output
    {sys.argv[0]} -1.42 149.63 --format json   # JSON output
    {sys.argv[0]} -1.42 149.63 --format csv    # CSV output

Bounds:
    North: {bounds['north']}
    South: {bounds['south']}
    East:  {bounds['east']}
    West:  {bounds['west']}
    """

    args = parser.parse_args()

    # Validate coordinates are within bounds
    if (args.latitude > bounds['north'] or args.latitude < bounds['south'] or
        args.longitude > bounds['east'] or args.longitude < bounds['west']):
        parser.error('Coordinates out of bounds')

    # Convert coordinates
    x, y = geo_to_pixel(
        args.latitude,
        args.longitude,
        bounds,
        image_width=2048,
        image_height=2048
    )

    # Output in requested format
    if args.format == 'json':
        print(json.dumps({'x': x, 'y': y}, indent=2))
    elif args.format == 'csv':
        print(f'x,y\n{x},{y}')
    else:  # plain
        print(f'{x} {y}')

if __name__ == '__main__':
    main()
