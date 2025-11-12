export enum FrameType {
  MapUS = 'map-us',
  MapState = 'map-state',
  MapMunicipal = 'map-municipal',
  FinanceInfo = 'finance-info',
  FinanceCharts = 'finance-charts',
}

export interface Frame {
  id: string
  title: string
  type: FrameType
  minimized: boolean
  position: { x: number; y: number }
  size: { width: number; height: number }
  trayIndex: number | undefined
  zIndex: number
  props?: any
}