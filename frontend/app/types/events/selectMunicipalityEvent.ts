import type { StateInfo } from '@/types/store/finance'
import type { MunicipalityInfo } from '@/types/http/finance'

export interface SelectMunicipalityEvent {
    municipalityName: string;
    stateInfo: StateInfo;
    featureId: number;
    mid: string;
}

export interface SearchMunicipalityEvent {
    municipalityInfo:MunicipalityInfo
}