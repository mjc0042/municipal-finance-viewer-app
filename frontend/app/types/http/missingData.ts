export interface MissingData {
    gap_id: string;
    municipality_id: string;
    municipality_name: string | null;
    county_fips: string | null;
    state: string | null;
    year: number;
    table_name: string;
    data_point: string;
    section_name: string;
    priority: string;
    status: string;
    pdf_page_indices: number[];
    markdown_context: string;
    timestamp: string | null;
    retry_count: number;
    error_message: string | null;
}