#!/usr/bin/env python3
"""
GPKG to Kepler.gl Converter
===========================

A tool to convert GeoPackage (GPKG) files to interactive Kepler.gl
visualizations. Automatically handles coordinate system conversions
 nd provides a configurable web-based visualization output.

Authors:
    - Jim Mattson
    - Claude (Anthropic)

License: MIT

Requirements:
    - geopandas
    - keplergl
"""

import sys
import argparse
import logging
from pathlib import Path
from typing import Optional, Union

import geopandas as gpd
from keplergl import KeplerGl

# Configure logging
logging.basicConfig(
    format='%(asctime)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

class VisualizationError(Exception):
    """Custom exception for visualization-related errors."""
    pass

def create_kepler_config(bounds: list) -> dict:
    """
    Create the Kepler.gl configuration dictionary.

    Args:
        bounds: List of coordinate bounds [[min_lon, min_lat], [max_lon, max_lat]]

    Returns:
        dict: Kepler.gl configuration dictionary
    """
    return {
        "version": "v1",
        "config": {
            "mapState": {
                "latitude": (bounds[0][1] + bounds[1][1]) / 2,  # Center latitude
                "longitude": (bounds[0][0] + bounds[1][0]) / 2,  # Center longitude
                "zoom": 12,
                "dragRotate": False,
                "bounds": bounds
            },
            "mapStyle": {
                "styleType": "dark"
            },
            "interactionConfig": {
                "tooltip": {
                    "enabled": True
                },
                "brush": {
                    "enabled": True,
                    "size": 1.0
                },
                "coordinate": {
                    "enabled": True
                }
            },
            "visState": {
                "interactionConfig": {
                    "coordinate": {
                        "enabled": True
                    },
                    "tooltip": {
                        "enabled": True,
                        "config": {
                            "compareMode": False,
                            "compareType": "absolute",
                            "fieldsToShow": {
                                "road_network": ["_lng", "_lat"]
                            }
                        }
                    }
                },
                "layers": [{
                    "id": "road_network",
                    "type": "geojson",
                    "config": {
                        "dataId": "road_network",
                        "label": "Road Network",
                        "color": [0, 255, 255],
                        "columns": {
                            "geojson": "_geojson"
                        },
                        "isVisible": True,
                        "visConfig": {
                            "strokeWidth": 2,
                            "strokeColor": [0, 255, 255],
                            "opacity": 0.8
                        }
                    },
                    "visualChannels": {
                        "strokeWidth": {
                            "field": None,
                            "range": [2, 10]
                        }
                    }
                }]
            }
        }
    }

def create_visualization(
    input_file: Union[str, Path],
    output_file: Union[str, Path],
    height: int = 600,
    subset: Optional[int] = None
) -> bool:
    """
    Create a Kepler.gl visualization from a GeoPackage file.

    Args:
        input_file: Path to input GPKG file
        output_file: Path to output HTML file
        height: Height of the map in pixels
        subset: Number of features to include (None for all)

    Returns:
        bool: True if successful, False otherwise

    Raises:
        VisualizationError: If there's an error during visualization creation
    """
    try:
        logger.info(f"Reading {input_file}...")
        network = gpd.read_file(input_file)

        if subset:
            network = network.head(subset)
            logger.info(f"Using first {subset} features")

        if network.empty:
            raise VisualizationError("No features found in input file")

        if network.crs != 'EPSG:4326':
            logger.info(f"Converting from {network.crs} to EPSG:4326...")
            network = network.to_crs('EPSG:4326')

        # Calculate bounds
        total_bounds = network.total_bounds
        bounds = [
            [total_bounds[0], total_bounds[1]],  # [min_lon, min_lat]
            [total_bounds[2], total_bounds[3]]   # [max_lon, max_lat]
        ]

        # Initialize map with config
        map_1 = KeplerGl(height=height)
        map_1.add_data(data=network, name='road_network')
        map_1.config = create_kepler_config(bounds)

        logger.info(f"Saving to {output_file}...")
        map_1.save_to_html(file_name=output_file)
        logger.info("Done!")

        return True

    except Exception as e:
        error_msg = f"Failed to create visualization: {str(e)}"
        logger.error(error_msg)
        raise VisualizationError(error_msg) from e

def main():
    """Main entry point for the script."""
    parser = argparse.ArgumentParser(
        description='Convert GeoPackage (GPKG) files to Kepler.gl visualizations',
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    parser.add_argument('input', type=Path, help='Input GPKG file')
    parser.add_argument('output', type=Path, help='Output HTML file')
    parser.add_argument('--height', type=int, default=600,
                      help='Map height in pixels')
    parser.add_argument('--subset', type=int,
                      help='Only use first N features')

    args = parser.parse_args()

    try:
        success = create_visualization(
            args.input,
            args.output,
            height=args.height,
            subset=args.subset
        )
        sys.exit(0 if success else 1)
    except VisualizationError:
        sys.exit(1)

if __name__ == '__main__':
    main()
