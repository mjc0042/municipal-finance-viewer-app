import type { StateInfo } from '@/types/store/finance'

export interface SelectMunicipalityEvent {
    municipalityName: string;
    stateInfo: StateInfo;
    featureId: number;
    mid: string;
}   