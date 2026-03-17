export const WIDGET_TYPES = {
  bar:     { label: 'Bar Chart',    icon: '📊', group: 'Charts', defaultW: 5, defaultH: 5 },
  line:    { label: 'Line Chart',   icon: '📈', group: 'Charts', defaultW: 5, defaultH: 5 },
  pie:     { label: 'Pie Chart',    icon: '🥧', group: 'Charts', defaultW: 4, defaultH: 4 },
  area:    { label: 'Area Chart',   icon: '🏔️', group: 'Charts', defaultW: 5, defaultH: 5 },
  scatter: { label: 'Scatter Plot', icon: '⬤',  group: 'Charts', defaultW: 5, defaultH: 5 },
  table:   { label: 'Table',        icon: '📋', group: 'Tables', defaultW: 4, defaultH: 4 },
  kpi:     { label: 'KPI Value',    icon: '🎯', group: 'KPIs',   defaultW: 2, defaultH: 2 },
}

export const WIDGET_GROUPS = [
  { key: 'Charts', widgets: ['bar', 'line', 'pie', 'area', 'scatter'] },
  { key: 'Tables', widgets: ['table'] },
  { key: 'KPIs',   widgets: ['kpi'] },
]

// Spec-defined field lists
export const ORDER_FIELDS   = ['Product','Quantity','Unit price','Total amount','Status','Created by','Duration']
export const TABLE_COLUMNS  = ['Customer ID','Customer name','Email id','Phone number','Address','Order ID','Order date','Product','Quantity','Unit price','Total amount','Status','Created by']
export const KPI_METRICS    = ['Customer ID','Customer name','Email id','Address','Order date','Product','Created by','Status','Total amount','Unit price','Quantity']
export const NUMERIC_FIELDS = ['Total amount','Unit price','Quantity'] // only these support Sum/Average

// Spec-defined dropdown values
export const STATUSES = ['Pending','In progress','Completed']

export const PRODUCTS = [
  'Fiber Internet 300 Mbps',
  '5G Unlimited Mobile Plan',
  'Fiber Internet 1 Gbps',
  'Business Internet 500 Mbps',
  'VoIP Corporate Package',
]

export const COUNTRIES = [
  'United States','Canada','Australia','Singapore','Hong Kong',
]

export const CREATED_BY_OPTIONS = [
  'Mr. Michael Harris',
  'Mr. Ryan Cooper',
  'Ms. Olivia Carter',
  'Mr. Lucas Martin',
]

export const DATE_FILTERS = ['All time','Today','Last 7 Days','Last 30 Days','Last 90 Days']

export const COL_COUNT = 12
export const ROW_H     = 64

export function genId() { return Math.random().toString(36).slice(2, 9) }

// Spec says "By default no data exists" — start empty
export function makeSampleOrders() { return [] }
