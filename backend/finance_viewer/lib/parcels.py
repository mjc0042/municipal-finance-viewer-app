""" Module for handling parcel file processing """

import math
import zipfile

import geopandas as gpd

from shapely.geometry import shape

def handle_shapefile_upload(file, muni_boundary):
    """ Handle uploading parcel shapefile """

    file.seek(0)  # Reset file pointer
    if zipfile.is_zipfile(file):
        file.seek(0)  # Reset again
        gdf = gpd.read_file(file)
    else:
        raise ParcelException("Uploaded file is not a zip file.")
    try:

        # Filter out invalid geometries
        gdf = gdf[gdf.geometry.notna()]

        # Check and convert CRS to NAD83 (EPSG:4269)
        if gdf.crs != 'EPSG:4269':
            print("Converting CRS...")
            gdf = gdf.to_crs('EPSG:4269')

        # Clip parcels to municipality boundary if provided
        if muni_boundary:
            boundary_geom = shape(muni_boundary['features'][0]['geometry'])
            gdf = gdf[gdf.intersects(boundary_geom)]

        # Compute shape area in a projected CRS to get correct values
        gdf_projected = gdf.to_crs('EPSG:3857')  # Web Mercator, meters
        gdf['shape_area'] = gdf_projected.geometry.area

        # Extract as GeoJSON FeatureCollection
        extracted = {'type': 'FeatureCollection', 'features': []}
        for _, row in gdf.iterrows():
            if row.geometry is None:
                continue

            properties = {
                'objectid': str(row.get('OBJECTID', '')),
                'taxpin': str(row.get('TAXPIN', '')),
                'assessed_value': str(row.get('TOTAL_APPR', '')),
                'shape_area': float(row['shape_area']) if not math.isnan(row['shape_area']) else 0.0,
                'address': str(row.get('LOCATION1', ''))
            }

            feature = {
                'type': 'Feature',
                'geometry': row.geometry.__geo_interface__,
                'properties': properties
            }
            extracted['features'].append(feature)

        return extracted
    except Exception as e:
        print(e)
        raise ParcelException("Error processing uploaded parcel shapefile.")

class ParcelException(Exception):
    """ Exception for parcel file error handling """
