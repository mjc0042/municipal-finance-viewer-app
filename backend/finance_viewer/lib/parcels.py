""" Module for handling parcel file processing """

import zipfile

import geopandas as gpd

def handle_shapefile_upload(file, muni_boundary):
    """ Handle uploading parcel shapefile """

    file.seek(0)  # Reset file pointer
    if zipfile.is_zipfile(file):
        file.seek(0)  # Reset again
        gdf = gpd.read_file(file)
    else:
        raise ParcelException("Uploaded file is not a zip file.")
    try:
        # TODO:  Parcels may be for a larger area, clip parcels intersecting municipality boundary yet

        # Filter out invalid geometries
        gdf = gdf[gdf.geometry.notna()]

        raise ParcelException(" File uploaded")

        # Check and convert CRS to NAD83 (EPSG:4269)
        if gdf.crs != 'EPSG:4269':
            gdf = gdf.to_crs('EPSG:4269')

        # Compute shape area in a projected CRS to get correct values
        gdf_projected = gdf.to_crs('EPSG:3857')  # Web Mercator, meters
        gdf['shape_area'] = gdf_projected.geometry.area
        
        # Extract as GeoJSON FeatureCollection
        extracted = {'type': 'FeatureCollection', 'features': []}
        for _, row in gdf.iterrows():
            if row.geometry is None:
                continue
            feature = {
                'type': 'Feature',
                'geometry': row.geometry.__geo_interface__,
                'properties': {
                    'shape_area': row['shape_area']
                }
            }
            # Add consistent fields if available
            if 'OBJECTID' in gdf.columns:
                feature['properties']['objectid'] = row['OBJECTID']
            if 'TAXPIN' in gdf.columns:
                feature['properties']['taxpin'] = row['TAXPIN']
            if 'TOTAL_APPR' in gdf.columns:
                feature['properties']['assessed_value'] = row['TOTAL_APPR']
            if 'ADDR1' in gdf.columns:
                feature['properties']['address'] = row['ADDR1']
            extracted['features'].append(feature)

        return extracted
    except Exception as e:
        print(e)
        raise ParcelException("Error processing uploaded parcel shapefile.")

class ParcelException(Exception):
    """ Exception for parcel file error handling """
    pass
