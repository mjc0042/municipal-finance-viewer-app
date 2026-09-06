/**
 * Component tests for the state-level Map Frame Compare feature.
 *
 * Tests exercise the component seam: the financial API client is mocked at
 * its module boundary, Leaflet is mocked at its module boundary (no canvas
 * in happy-dom), and assertions target rendered UI and store state only.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { financialApi } from '~/composables/api/financialApi'



// Leaflet has no DOM/canvas in happy-dom; mock its module boundary.
// Click handlers registered via layer.on are captured so tests can drive
// state selection the same way a user click would.
const leafletHandlers: Record<string, Set<() => void>> = {}
vi.mock('leaflet', () => {
  const layerStub = () => ({
    on: vi.fn((event: string, handler: () => void) => {
      leafletHandlers[event] = leafletHandlers[event] ?? new Set()
      leafletHandlers[event].add(handler)
    }),
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn(),
    setStyle: vi.fn(),
    eachLayer: vi.fn(),
    getBounds: vi.fn().mockReturnValue({ isValid: () => false }),
    bindTooltip: vi.fn(),
    unbindTooltip: vi.fn(),
  })
  const geoJSON = vi.fn(() => layerStub())
  return {
    default: {
      map: vi.fn(() => ({
        setView: vi.fn().mockReturnThis(),
        remove: vi.fn(),
        invalidateSize: vi.fn(),
        fitBounds: vi.fn(),
      })),
      tileLayer: vi.fn(() => ({ addTo: vi.fn().mockReturnThis() })),
      geoJSON,
      featureGroup: vi.fn(() => layerStub()),
    },
    map: vi.fn(),
    geoJSON,
  }
})

vi.mock('chroma-js', () => {
  const scale = vi.fn(() => {
    const fn: any = vi.fn(() => ({ hex: () => '#123456' }))
    fn.domain = vi.fn().mockReturnThis()
    return fn
  })
  return {
    default: Object.assign(vi.fn(), {
      scale,
      limits: vi.fn(() => [0, 1]),
    }),
  }
})

// The financial API client is the module boundary for backend data
vi.mock('~/composables/api/financialApi', () => ({
  financialApi: {
    compareStateMunicipalities: vi.fn(),
    getMunicipalityFinances: vi.fn(),
    getMunicipalBoundaries: vi.fn(),
  },
}))

const MapFrame = () => import('~/components/finance/MapFrame.vue')

const frameFixture = {
  id: 'frame-1',
  title: 'US',
  type: 'map-us',
  minimized: false,
  position: { x: 0, y: 0 },
  size: { width: 600, height: 600 },
  trayIndex: undefined,
  zIndex: 100,
}

const stateBoundaryFixture = {
  type: 'Feature',
  id: 1,
  geometry: { type: 'Polygon', coordinates: [] },
  properties: { name: 'Massachusetts', stusps: 'MA', statefp: '25' },
}

const municipalFeatureFixture = (id: number, mid: string) => ({
  type: 'Feature',
  id,
  geometry: { type: 'Polygon', coordinates: [] },
  properties: {
    municipal_name: `Muni${id}`,
    mid,
    pop_2020: 1000 + id,
    sq_mi: 10,
  },
})

async function mountMapFrame() {
  const component = await MapFrame()
  const wrapper = mount(component.default, {
    props: {
      frame: { ...frameFixture },
      stateBoundaries: [stateBoundaryFixture],
    },
    global: {
      stubs: {
        FinanceBaseFrame: {
          template: '<div><slot :size="{ width: 600, height: 600 }" /></div>',
        },
        ClientOnly: { template: '<div><slot /></div>' },
        Icon: { template: '<span />' },
        NuxtIcon: { template: '<span />' },
        teleport: true,
      },
    },
    attachTo: document.body,
  })
  await flushPromises()
  return wrapper
}

describe('MapFrame compare', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    leafletHandlers['click'] = new Set()
  })

  async function selectState() {
    vi.mocked(financialApi.getMunicipalBoundaries).mockResolvedValue({
      type: 'FeatureCollection',
      features: [
        municipalFeatureFixture(0, 'mid-0'),
        municipalFeatureFixture(1, 'mid-1'),
        municipalFeatureFixture(2, null as any),
      ],
    } as any)
    // Drive the state-layer click handler as a user selecting a state would
    const clickHandlers = [...(leafletHandlers['click'] ?? [])]
    expect(clickHandlers.length).toBeGreaterThan(0)
    clickHandlers[0]()
    await flushPromises()
  }

  it('does not show the Compare button before a state is selected', async () => {
    const wrapper = await mountMapFrame()
    expect(wrapper.text()).not.toContain('Compare')
    wrapper.unmount()
  })

  it('shows the Compare button when a state is selected and boundaries are showing', async () => {
    const wrapper = await mountMapFrame()
    await selectState()

    expect(wrapper.text()).toContain('Compare')
    expect(wrapper.text()).not.toContain('Clear')
    wrapper.unmount()
  })

  it('derives finance fields from one municipality and opens the modal on Compare click', async () => {
    vi.mocked(financialApi.getMunicipalityFinances).mockResolvedValue([
      { mid: 'mid-0', year: 2022, debt: 100, population: 50 } as any,
    ])

    const wrapper = await mountMapFrame()
    await selectState()

    const compareButton = wrapper.findAll('button').find(b => b.text() === 'Compare')
    await compareButton!.trigger('click')
    await flushPromises()

    expect(financialApi.getMunicipalityFinances).toHaveBeenCalledWith('mid-0')
    expect(wrapper.findComponent({ name: 'FinanceCalculationsModal' }).exists()).toBe(true)
    wrapper.unmount()
  })

  it('applies a comparison: fetches results with the token string and year mode', async () => {
    vi.mocked(financialApi.getMunicipalityFinances).mockResolvedValue([
      { mid: 'mid-0', year: 2022, debt: 100, population: 50 } as any,
    ])
    vi.mocked(financialApi.compareStateMunicipalities).mockResolvedValue([
      { mid: 'mid-0', value: 2, year: 2022 },
 { mid: 'mid-1', value: 4, year: 2022 },
    ])

    const wrapper = await mountMapFrame()
    await selectState()

    const compareButton = wrapper.findAll('button').find(b => b.text() === 'Compare')
    await compareButton!.trigger('click')
    await flushPromises()

    // Modal open: submit a calculation
    const modal = wrapper.findComponent({ name: 'FinanceCalculationsModal' })
    modal.vm.$emit('close', [
      { source: 'finances', field: 'debt' },
      { source: 'operator', field: '/' },
      { source: 'municipality', field: 'pop_2020' },
    ])
    await flushPromises()

    expect(financialApi.compareStateMunicipalities).toHaveBeenCalledWith(
      'MA',
      'finances:debt,/,municipality:pop_2020',
      'latest'
    )
    // Clear button appears while a comparison is active
    expect(wrapper.findAll('button').some(b => b.text() === 'Clear')).toBe(true)
    wrapper.unmount()
  })

  it('clears the comparison on Clear click', async () => {
    vi.mocked(financialApi.getMunicipalityFinances).mockResolvedValue([
      { mid: 'mid-0', year: 2022, debt: 100, population: 50 } as any,
    ])
    vi.mocked(financialApi.compareStateMunicipalities).mockResolvedValue([
      { mid: 'mid-0', value: 2, year: 2022 },
    ])

    const wrapper = await mountMapFrame()
    await selectState()

    const compareButton = wrapper.findAll('button').find(b => b.text() === 'Compare')
    await compareButton!.trigger('click')
    await flushPromises()

    const modal = wrapper.findComponent({ name: 'FinanceCalculationsModal' })
    modal.vm.$emit('close', [{ source: 'finances', field: 'debt' }])
    await flushPromises()
    expect(wrapper.findAll('button').some(b => b.text() === 'Clear')).toBe(true)

    const clearButton = wrapper.findAll('button').find(b => b.text() === 'Clear')!
    await clearButton.trigger('click')
    await flushPromises()

    expect(wrapper.findAll('button').some(b => b.text() === 'Clear')).toBe(false)
    wrapper.unmount()
  })

  it('clears the comparison when an empty calculation is applied', async () => {
    vi.mocked(financialApi.getMunicipalityFinances).mockResolvedValue([
      { mid: 'mid-0', year: 2022, debt: 100, population: 50 } as any,
    ])
    vi.mocked(financialApi.compareStateMunicipalities).mockResolvedValue([
      { mid: 'mid-0', value: 2, year: 2022 },
    ])

    const wrapper = await mountMapFrame()
    await selectState()

    const compareButton = wrapper.findAll('button').find(b => b.text() === 'Compare')
    await compareButton!.trigger('click')
    await flushPromises()

    const modal = wrapper.findComponent({ name: 'FinanceCalculationsModal' })
    modal.vm.$emit('close', [{ source: 'finances', field: 'debt' }])
    await flushPromises()
    expect(wrapper.findAll('button').some(b => b.text() === 'Clear')).toBe(true)

    // Reopen and apply an empty calculation
    const compareAgain = wrapper.findAll('button').find(b => b.text() === 'Compare')!
    await compareAgain.trigger('click')
    await flushPromises()

    const modalAgain = wrapper.findComponent({ name: 'FinanceCalculationsModal' })
    modalAgain.vm.$emit('close', [])
    await flushPromises()

    expect(wrapper.findAll('button').some(b => b.text() === 'Clear')).toBe(false)
    wrapper.unmount()
  })

  it('shows an error message when the comparison request fails', async () => {
    vi.mocked(financialApi.getMunicipalityFinances).mockResolvedValue([
      { mid: 'mid-0', year: 2022, debt: 100, population: 50 } as any,
    ])
    vi.mocked(financialApi.compareStateMunicipalities).mockRejectedValue({
      response: { data: { error: 'Invalid calculation token' } },
    })

    const wrapper = await mountMapFrame()
    await selectState()

    const compareButton = wrapper.findAll('button').find(b => b.text() === 'Compare')!
    await compareButton.trigger('click')
    await flushPromises()

    const modal = wrapper.findComponent({ name: 'FinanceCalculationsModal' })
    modal.vm.$emit('close', [{ source: 'finances', field: 'debt' }])
    await flushPromises()

    expect(wrapper.text()).toContain('Invalid calculation token')
    wrapper.unmount()
  })

  it('cancelling the modal does not re-apply the active comparison', async () => {
    vi.mocked(financialApi.getMunicipalityFinances).mockResolvedValue([
      { mid: 'mid-0', year: 2022, debt: 100, population: 50 } as any,
    ])
    vi.mocked(financialApi.compareStateMunicipalities).mockResolvedValue([
      { mid: 'mid-0', value: 2, year: 2022 },
    ])

    const wrapper = await mountMapFrame()
    await selectState()

    const compareButton = wrapper.findAll('button').find(b => b.text() === 'Compare')!
    await compareButton.trigger('click')
    await flushPromises()

    const modal = wrapper.findComponent({ name: 'FinanceCalculationsModal' })
    modal.vm.$emit('close', [{ source: 'finances', field: 'debt' }])
    await flushPromises()
    expect(financialApi.compareStateMunicipalities).toHaveBeenCalledTimes(1)

    // Reopen and cancel: the modal emits the loaded calculation unchanged
    await wrapper.findAll('button').find(b => b.text() === 'Compare')!.trigger('click')
    await flushPromises()
    const modalAgain = wrapper.findComponent({ name: 'FinanceCalculationsModal' })
    modalAgain.vm.$emit('close', modalAgain.props('loadedCalc'))
    await flushPromises()

    // No second fetch: cancel is a no-op
    expect(financialApi.compareStateMunicipalities).toHaveBeenCalledTimes(1)
    expect(wrapper.findAll('button').some(b => b.text() === 'Clear')).toBe(true)
    wrapper.unmount()
  })

  it('applies the comparison with the selected year mode', async () => {
    vi.mocked(financialApi.getMunicipalityFinances).mockResolvedValue([
      { mid: 'mid-0', year: 2022, debt: 100, population: 50 } as any,
    ])
    vi.mocked(financialApi.compareStateMunicipalities).mockResolvedValue([
      { mid: 'mid-0', value: 2, year: 2022 },
    ])

    const wrapper = await mountMapFrame()
    await selectState()

    // Switch year mode BEFORE any comparison exists (shared must be choosable for a first apply)
    const yearButton = wrapper.findAll('button').find(b => b.text().startsWith('Year:'))!
    await yearButton.trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Year: shared')
    expect(financialApi.compareStateMunicipalities).not.toHaveBeenCalled()

    const compareButton = wrapper.findAll('button').find(b => b.text() === 'Compare')!
    await compareButton.trigger('click')
    await flushPromises()

    const modal = wrapper.findComponent({ name: 'FinanceCalculationsModal' })
    modal.vm.$emit('close', [{ source: 'finances', field: 'debt' }])
    await flushPromises()

    expect(financialApi.compareStateMunicipalities).toHaveBeenCalledWith('MA', 'finances:debt', 'shared')
    wrapper.unmount()
  })

  it('styles the choropleth and binds tooltips from the compare results', async () => {
    vi.mocked(financialApi.getMunicipalityFinances).mockResolvedValue([
      { mid: 'mid-0', year: 2022, debt: 100, population: 50 } as any,
    ])
    vi.mocked(financialApi.compareStateMunicipalities).mockResolvedValue([
      { mid: 'mid-0', value: 2.345, year: 2022 },
    ])

    const { default: L } = await import('leaflet')
    const wrapper = await mountMapFrame()
    await selectState()

    const compareButton = wrapper.findAll('button').find(b => b.text() === 'Compare')!
    await compareButton.trigger('click')
    await flushPromises()

    const modal = wrapper.findComponent({ name: 'FinanceCalculationsModal' })
    modal.vm.$emit('close', [{ source: 'finances', field: 'debt' }])
    await flushPromises()

    // The municipal layer's style function colors matched mids and leaves others default
    const geoJSONMock = vi.mocked(L.geoJSON)
    const municipalLayerStub = geoJSONMock.mock.results[geoJSONMock.mock.calls.length - 1]?.value
    const styleFn = (municipalLayerStub as any).setStyle.mock.calls.at(-1)?.[0] as ((f?: any) => any) | undefined
    expect(styleFn).toBeTruthy()
    expect(styleFn!({ properties: { mid: 'mid-0' } })).toMatchObject({ fillColor: '#123456', fillOpacity: 0.85 })
    expect(styleFn!({ properties: { mid: 'mid-1' } })).toMatchObject({ color: '#2c3e50', fillOpacity: 0.3 })

    // Tooltips: Value for a result mid, No data for an omitted mid
    const eachLayerCalls = (municipalLayerStub as any).eachLayer.mock.calls
    expect(eachLayerCalls.length).toBeGreaterThan(0)
    const layerFn = eachLayerCalls.at(-1)![0]
    const bound: string[] = []
    layerFn({ feature: { properties: { mid: 'mid-0' } }, bindTooltip: (t: string) => bound.push(t), unbindTooltip: () => {} })
    layerFn({ feature: { properties: { mid: 'mid-2' } }, bindTooltip: (t: string) => bound.push(t), unbindTooltip: () => {} })
    expect(bound).toEqual(['Value: 2.35', 'No data'])
    wrapper.unmount()
  })

  it('clears the comparison when the selected state changes', async () => {
    vi.mocked(financialApi.getMunicipalityFinances).mockResolvedValue([
      { mid: 'mid-0', year: 2022, debt: 100, population: 50 } as any,
    ])
    vi.mocked(financialApi.compareStateMunicipalities).mockResolvedValue([
      { mid: 'mid-0', value: 2, year: 2022 },
    ])

    const { useFinanceStore } = await import('~/stores/finance')
    const wrapper = await mountMapFrame()
    await selectState()

    const compareButton = wrapper.findAll('button').find(b => b.text() === 'Compare')!
    await compareButton.trigger('click')
    await flushPromises()

    const modal = wrapper.findComponent({ name: 'FinanceCalculationsModal' })
    modal.vm.$emit('close', [{ source: 'finances', field: 'debt' }])
    await flushPromises()
    expect(wrapper.text()).toContain('Clear')

    // Select a different state through the same leaflet click path
    vi.mocked(financialApi.getMunicipalBoundaries).mockResolvedValue({
      type: 'FeatureCollection',
      features: [municipalFeatureFixture(5, 'mid-5')],
    } as any)
    const financeStore = useFinanceStore()
    await financeStore.setSelectedState('frame-1', 'Ohio', 'OH', '39')
    await flushPromises()

    expect(wrapper.text()).not.toContain('Clear')
    expect(wrapper.text()).toContain('Year: latest')
    wrapper.unmount()
  })
})