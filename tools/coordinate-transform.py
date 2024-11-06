#!/usr/bin/env python3
"""
coordinate_transform.py - Geographic Coordinate Transform Utility

This script performs linear transformation between image pixel coordinates and
geographic coordinates (longitude/latitude) using control points. It's
particularly useful for georeferencing historical maps or aerial imagery where
a simple linear transformation is sufficient.

The script expects control points in a CSV file with format:
    description,latitude,longitude,image_x,image_y

Authors:
    Jim Mattson
    Claude (Anthropic)

License: MIT
"""

import argparse
import csv
import sys
import numpy as np


def load_control_points(csv_path):
    """
    Load control points from a CSV file.

    Args:
        csv_path (str): Path to CSV file with control points

    Returns:
        list: List of tuples ((image_x, image_y), (longitude, latitude))

    Raises:
        ValueError: If CSV format is invalid or fewer than 2 control points
    """
    control_points = []
    with open(csv_path, 'r') as f:
        reader = csv.reader(f)
        header = next(reader)  # Skip header
        for row in reader:
            try:
                latitude = float(row[1])
                longitude = float(row[2])
                image_x = float(row[3])
                image_y = float(row[4])
                control_points.append(((image_x, image_y), (longitude, latitude)))
            except (ValueError, IndexError) as e:
                print(f"Error parsing row: {row}", file=sys.stderr)
                raise ValueError("CSV must contain values in format: description,latitude,longitude,image_x,image_y")

    if len(control_points) < 2:
        raise ValueError("At least 2 control points are required for linear transform")

    return control_points


def compute_linear_transform(control_points):
    """
    Compute linear transformation using linear regression for x and y separately.

    Args:
        control_points (list): List of ((image_x, image_y), (longitude, latitude)) tuples

    Returns:
        tuple: (transformation_matrix, control_point_bounds)
            - transformation_matrix: 2x3 numpy array for affine transform
            - control_point_bounds: (lon_min, lon_max, lat_min, lat_max)
    """
    # Extract coordinates
    src_points = np.float32([p[0] for p in control_points])  # image coords (x,y)
    dst_points = np.float32([(p[1][0], p[1][1]) for p in control_points])  # geo coords (lon,lat)

    # Get bounds of control points
    lon_min, lon_max = np.min(dst_points[:, 0]), np.max(dst_points[:, 0])
    lat_min, lat_max = np.min(dst_points[:, 1]), np.max(dst_points[:, 1])

    # Fit x coordinates (image x to longitude)
    A = np.vstack([src_points[:,0], np.ones(len(src_points))]).T
    scale_x, offset_x = np.linalg.lstsq(A, dst_points[:,0], rcond=None)[0]

    # Fit y coordinates (image y to latitude)
    A = np.vstack([src_points[:,1], np.ones(len(src_points))]).T
    scale_y, offset_y = np.linalg.lstsq(A, dst_points[:,1], rcond=None)[0]

    # Create transformation matrix
    matrix = np.array([
        [scale_x, 0, offset_x],
        [0, scale_y, offset_y]
    ], dtype=np.float32)

    print(f"Transform parameters:")
    print(f"  Scale factors: x={scale_x:.6f}, y={scale_y:.6f}")
    print(f"  Offsets: x={offset_x:.6f}, y={offset_y:.6f}")

    return matrix, (lon_min, lon_max, lat_min, lat_max)


def transform_points(matrix, points):
    """
    Transform points using affine transformation matrix.

    Args:
        matrix (np.ndarray): 2x3 transformation matrix
        points (np.ndarray): Nx1x2 array of points to transform

    Returns:
        np.ndarray: Transformed points in same shape as input
    """
    points = np.float32(points).reshape(-1, 1, 2)
    return np.float32([matrix[:, :2] @ pt.T + matrix[:, 2] for pt in points.reshape(-1, 2)]).reshape(points.shape)


def get_transformed_bounds(matrix, width, height):
    """
    Get geographic bounds by transforming image corners using provided dimensions.

    Args:
        matrix (np.ndarray): 2x3 transformation matrix
        width (int): Image width in pixels
        height (int): Image height in pixels

    Returns:
        tuple: (lon_min, lon_max, lat_min, lat_max)
    """
    # Create array of image corners
    corners = np.array([
        [0, 0],          # top-left
        [width, 0],      # top-right
        [width, height], # bottom-right
        [0, height]      # bottom-left
    ], dtype=np.float32).reshape(-1, 1, 2)

    # Transform corners to geographic coordinates
    geo_corners = transform_points(matrix, corners).reshape(-1, 2)

    print("\nTransformed corners (lon, lat):")
    corner_names = ["Top-left", "Top-right", "Bottom-right", "Bottom-left"]
    for name, (lon, lat) in zip(corner_names, geo_corners):
        print(f"  {name:11s}: ({lon:.6f}, {lat:.6f})")

    # Get bounds
    lons = geo_corners[:, 0]
    lats = geo_corners[:, 1]
    return np.min(lons), np.max(lons), np.min(lats), np.max(lats)


def main():
    parser = argparse.ArgumentParser(
        description='Transform coordinates between image space and geographic space',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument('control_points', 
                       help='CSV file containing control points (description,latitude,longitude,image_x,image_y)')
    parser.add_argument('--width', type=int, required=True,
                       help='Image width in pixels')
    parser.add_argument('--height', type=int, required=True,
                       help='Image height in pixels')

    args = parser.parse_args()

    try:
        # Load control points and compute transformation
        control_points = load_control_points(args.control_points)
        matrix, control_bounds = compute_linear_transform(control_points)

        print("\nControl point bounds:")
        print(f"  Longitude: {control_bounds[0]:.6f} to {control_bounds[1]:.6f}")
        print(f"  Latitude:  {control_bounds[2]:.6f} to {control_bounds[3]:.6f}")

        # Calculate transformed bounds based on image dimensions
        bounds = get_transformed_bounds(matrix, args.width, args.height)

        print("\nTransformed image bounds:")
        print(f"  Longitude: {bounds[0]:.6f} to {bounds[1]:.6f}")
        print(f"  Latitude:  {bounds[2]:.6f} to {bounds[3]:.6f}")

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
