import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { financialApi } from '@/http/financial/api';
import type { StateInfo } from '@/store/types';
import type { MunicipalityFinance } from '@/http/financial/types/types';
import type { MunicipalFeature, MunicipalBoundaryCollection  } from '@/http/financial/types/gis';

interface PersistedFinanceStore {
    selectedMunicipalityFinances: MunicipalityFinance[] | null;
    selectedMunicipalityFeature: MunicipalFeature | null;
    selectedState: StateInfo | null;
    searchQuery: string;
    //setColorBy: (colorBy: string) => void;
}

interface FinanceStore extends PersistedFinanceStore {
    municipalBoundaries: MunicipalBoundaryCollection | null;
    setSelectedState: (stateInfo: StateInfo) => Promise<void>;
    setSelectedMunicipality: (featureId: number, mid: string) => Promise<void>;
    setSearchQuery: (query: string) => void;
}

// Non-persisted store for boundaries
const useFinanceStoreBase = create<FinanceStore>((set, get) => ({
    // Persisted state
    selectedMunicipalityFinances: null,
    selectedMunicipalityFeature: null,
    selectedState: null,
    searchQuery: "",
    
    // Non-persisted state
    municipalBoundaries: null,

    setSelectedState: async (stateInfo: StateInfo) => {
        const responseData: MunicipalBoundaryCollection = await financialApi.getMunicipalBoundaries(
            stateInfo.name, 
            stateInfo.abbr, 
            stateInfo.code
        );
        set({ selectedState: stateInfo, municipalBoundaries: responseData });
        
        // Performance 12874ms for PA boundaries, 12722 ms for NY
    },
    getMunicipalBoundariesList: () : MunicipalFeature[] => {
        const boundaries = get().municipalBoundaries;
        return boundaries ? boundaries.features : [];
    },
    setSelectedMunicipality: async (featureId:number, mid:string) => {
        const mFinancialData = await financialApi.getMunicipalityFinances(mid);
        
        // Save GIS feature data
        const municipalBoundaries = get().municipalBoundaries;
        const selectedFeature = municipalBoundaries?.features.find((f) => 
            f.id === featureId
        ) || null;
        set({ selectedMunicipalityFinances: mFinancialData, selectedMunicipalityFeature: selectedFeature });
    },
    setSearchQuery: (query) => set({ searchQuery: query }),
    //setColorBy: (colorBy) => set({ colorBy })
    })
);

// Create the persisted wrapper
export const useFinanceStore = create(
    persist<PersistedFinanceStore>(
        (set) => ({
            selectedMunicipalityFinances: null,
            selectedMunicipalityFeature: null,
            selectedState: null,
            searchQuery: "",
        }),
        {
            name: 'finance-storage',
            partialize: (state) => ({
                selectedMunicipalityFinances: state.selectedMunicipalityFinances,
                selectedMunicipalityFeature: state.selectedMunicipalityFeature,
                selectedState: state.selectedState,
                searchQuery: state.searchQuery,
            }),
        }
    )
);

// Combined hook that merges both stores
export const useFullFinanceStore = () => {
    const persistedState = useFinanceStore();
    const baseState = useFinanceStoreBase();
    
    return {
        ...persistedState,
        ...baseState,
    };
};

/*export const useFinanceStore = create(
    persist<FinanceStore>(
        (set) => ({
        selectedMunicipalityData: null,
        municipalityName: "",
        selectedState: null,
        municipalBoundaries: [],
        searchQuery: "",
        //colorBy: "revenuePerAcre",
    
        //setSelectedState: (state) => set({ selectedState: state }),
        setSelectedState: async (stateInfo:StateInfo) => {
            const responseData = await financialApi.getMunicipalBoundaries(stateInfo.name, stateInfo.abbr, stateInfo.code);
            console.log("Municipal boundaries:", responseData);
            set({ selectedState: stateInfo, municipalBoundaries: responseData });
            //return responseData;
        },
        setSelectedMunicipality: async (name:string, state:string) => {

            const mFinancialData = await financialApi.getMunicipalityFinances({name, state});
            console.log("Selected municipality:", mFinancialData);

            set({ selectedMunicipalityData: mFinancialData, municipalityName: name });
            //return mFinancialData;
        },
        setSearchQuery: (query) => set({ searchQuery: query }),
        //setColorBy: (colorBy) => set({ colorBy })
        }),
        {
            name: 'finance-storage', // unique name for the storage
        }
    )
);*/