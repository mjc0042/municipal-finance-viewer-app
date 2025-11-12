// useFinanceCharts.ts - Composable to process financial data
import { computed } from 'vue'
import type { MunicipalityFinance } from '@/types/http/finance'

export function useFinanceCharts(finances: MunicipalityFinance[] | null) {
  const years = computed(() => {
    if (!finances || finances.length === 0) return []
    return [...finances].sort((a, b) => a.year - b.year).map(f => f.year)
  })

  const sortedFinances = computed(() => {
    if (!finances) return []
    return [...finances].sort((a, b) => a.year - b.year)
  })

  function addArrays(a: number[], b: number[]) {
    return a.map((v, i) => v + (b[i] ?? 0))
  }
  function subtractArrays(a: number[], b: number[]) {
    return a.map((v, i) => v - (b[i] ?? 0))
  }
  function divideArrays(numer: number[], denom: number[]) {
    if (numer.length !== denom.length) throw new Error('Arrays must be same length')
    return numer.map((v, i) => (denom[i] === 0 ? 0 : v / denom[i]))
  }

  const netPositionData = computed(() => {
    if (!finances) return []
    const currentAssets = sortedFinances.value.map(f => Number(f.current_assets) || 0)
    const liabilities = sortedFinances.value.map(f => Number(f.liabilities) || 0)
    const deferredInflows = sortedFinances.value.map(f => Number(f.deferred_inflows) || 0)
    const totalLiabilities = addArrays(liabilities, deferredInflows)
    return subtractArrays(currentAssets, totalLiabilities)
  })

  const financialAssetsLiabilitiesData = computed(() => {
    if (!finances) return []
    const currentAssets = sortedFinances.value.map(f => Number(f.current_assets) || 0)
    const liabilities = sortedFinances.value.map(f => Number(f.liabilities) || 0)
    const deferredInflows = sortedFinances.value.map(f => Number(f.deferred_inflows) || 0)
    const totalLiabilities = addArrays(liabilities, deferredInflows)
    return divideArrays(currentAssets, totalLiabilities)
  })

  const totalAssetsLiabilitiesData = computed(() => {
    if (!finances) return []
    const totalAssets = sortedFinances.value.map(f => (Number(f.total_assets) || 0) / 1e9)
    const deferredOutflows = sortedFinances.value.map(f => (Number(f.deferred_outflows) || 0) / 1e9)
    const totalLiabilities = addArrays(
      sortedFinances.value.map(f => Number(f.liabilities) || 0),
      sortedFinances.value.map(f => Number(f.deferred_inflows) || 0)
    )
    const totalAssetsPlusOutflows = addArrays(totalAssets, deferredOutflows)
    return divideArrays(totalAssetsPlusOutflows, totalLiabilities)
  })

  const debtRevenueData = computed(() => {
    if (!finances) return []
    const netPos = netPositionData.value
    const totalRevenues = sortedFinances.value.map(f => Number(f.total_revenues) || 0)
    return netPos.map((val, i) => (val < 0 && totalRevenues[i] !== 0 ? val / totalRevenues[i] : 0))
  })

  const interestRevenueData = computed(() => {
    if (!finances) return []
    const interestCharges = sortedFinances.value.map(f => Number(f.interest_charges) || 0)
    const totalRevenues = sortedFinances.value.map(f => Number(f.total_revenues) || 0)
    return divideArrays(interestCharges, totalRevenues)
  })
  
  const bookValueCapitalAssets = computed(() => {
    if (!finances) return []
    const govAssetsNotDep = sortedFinances.value.map(f => Number(f.government_assets_not_being_depreciated) || 0)
    const govAssetsDep = sortedFinances.value.map(f => Number(f.government_assets_being_depreciated) || 0)
    const govAssetsOther = sortedFinances.value.map(f => Number(f.government_assets_other) || 0)
    const busAssetsNotDep = sortedFinances.value.map(f => Number(f.business_type_assets_not_being_depreciated_total) || 0)
    const busAssetsDep = sortedFinances.value.map(f => Number(f.business_type_assets_being_depreciated_total) || 0)
    const totalCostCapitalAssets = addArrays(
      addArrays(addArrays(govAssetsNotDep, govAssetsDep), addArrays(govAssetsOther, busAssetsNotDep)),
      busAssetsDep
    )
    const capitalAssets = sortedFinances.value.map(f => Number(f.capital_assets) || 0)
    return divideArrays(capitalAssets, totalCostCapitalAssets)
  })

  const govTransfersRevData = computed(() => {
    if (!finances) return []
    const operatingGrants = sortedFinances.value.map(f => Number(f.operating_grants) || 0)
    const capitalGrants = sortedFinances.value.map(f => Number(f.capital_grants) || 0)
    const totalGovernmentTransfers = addArrays(operatingGrants, capitalGrants)
    const totalRevenues = sortedFinances.value.map(f => Number(f.total_revenues) || 0)
    return divideArrays(totalGovernmentTransfers, totalRevenues)
  })

  return {
    years,
    netPositionData,
    financialAssetsLiabilitiesData,
    totalAssetsLiabilitiesData,
    debtRevenueData,
    interestRevenueData,
    bookValueCapitalAssets,
    govTransfersRevData
  }
}
