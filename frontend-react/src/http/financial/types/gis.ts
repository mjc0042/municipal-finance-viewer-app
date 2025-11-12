import type { GeoJSON } from "geojson";

export interface StateBoundary {
    id: number;
    statefp: string;
    statens: string;
    geoidfq: string;
    geoid: string;
    stusps: string;
    name: string;
    lsad: string;
    aland: string;
    awater: string;
    geometry: GeoJSON;
}

export interface MunicipalInfo {
    id: number;
    municipal_name: string;
    municipal_code: string;
    municipal_type: string;
    county_name: string;
    state: string;
    gnis_id: string;
    fips_code: string;
    fips_name: string;
    pop_1990: string;
    pop_2000: string;
    pop_2010: string;
    pop_2020: string;
    sq_mi: string;
    mid: string;
    geometry: GeoJSON;
}

export interface MunicipalFeature extends GeoJSON.Feature {
    id: number;
    properties: MunicipalInfo;
    geometry: GeoJSON.Geometry;
}

export interface MunicipalBoundaryCollection extends GeoJSON.FeatureCollection {
    type: 'FeatureCollection';
    features: MunicipalFeature[];
}