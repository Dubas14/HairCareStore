// ─── Nova Poshta API types (safe for both server & client imports) ─────

/** Generic NP API response envelope */
export interface NpApiResponse<T> {
  success: boolean
  data: T[]
  errors: string[]
  warnings: string[]
  info: { totalCount: number }
}

/** Raw city from NP API */
export interface NpCity {
  Ref: string
  Description: string
  AreaDescription: string
  SettlementTypeDescription: string
}

/** Raw warehouse from NP API */
export interface NpWarehouse {
  Ref: string
  Description: string
  Number: string
  ShortAddress: string
  CategoryOfWarehouse: string
  PlaceMaxWeightAllowed: number
  PostalCodeUA: string
}

/** Raw tracking status from NP API */
export interface NpTrackingStatus {
  Number: string
  StatusCode: string
  Status: string
  DateCreated: string
  DateScan: string
  ScheduledDeliveryDate: string
  CitySender: string
  CityRecipient: string
  WarehouseSender: string
  WarehouseRecipient: string
  ActualDeliveryDate: string
}

// ─── Simplified frontend types ──────────────────────────────────────

export interface CityOption {
  ref: string
  name: string
  area: string
  settlementType: string
}

export interface WarehouseOption {
  ref: string
  description: string
  number: string
  shortAddress: string
  category: 'branch' | 'postomat'
  maxWeight: number
  postalCode: string
}

export interface ShippingRateResult {
  cost: number
  estimatedDeliveryDate: string
  codFee: number
}

export interface TrackingResult {
  ttn: string
  statusCode: string
  status: string
  senderCity: string
  recipientCity: string
  senderWarehouse: string
  recipientWarehouse: string
  dateCreated: string
  dateScan: string
  scheduledDeliveryDate: string
  actualDeliveryDate: string
  step: number
  stepLabel: string
}

// ─── Status code → UI mapping ───────────────────────────────────────

export const NP_STATUS_MAP: Record<string, { label: string; step: number }> = {
  '1': { label: 'Створено', step: 1 },
  '2': { label: 'Видалено', step: 0 },
  '3': { label: 'Не знайдено', step: 0 },
  '4': { label: 'В місті відправника', step: 1 },
  '5': { label: 'Прямує до міста отримувача', step: 2 },
  '6': { label: 'В місті отримувача', step: 3 },
  '7': { label: 'Прибула на відділення', step: 3 },
  '8': { label: 'Прибула на відділення', step: 3 },
  '9': { label: 'Отримана', step: 4 },
  '10': { label: 'Відмова від отримання', step: 0 },
  '11': { label: 'Повертається', step: 2 },
  '12': { label: 'Дата доставки перенесена', step: 3 },
  '14': { label: 'Отримана (без оплати)', step: 4 },
  '101': { label: 'Отримана', step: 4 },
  '102': { label: 'Повернення (сума)', step: 0 },
  '103': { label: 'Повернення (відмова)', step: 0 },
  '104': { label: 'Змінено адресу', step: 2 },
  '106': { label: 'Одержано і створено повторну', step: 4 },
}

/** Statuses that mean "delivered" */
export const NP_DELIVERED_STATUSES = ['9', '14', '101', '106']
