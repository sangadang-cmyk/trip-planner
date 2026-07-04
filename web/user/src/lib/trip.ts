import type { TripResponse } from '@/generated/api/types.gen'

export type TripStatus = 'Upcoming' | 'Ongoing' | 'Completed'

type DateInput =
  | string
  | Date
  | [number, number, number]
  | { year: number; month: number; day: number }

function unwrapVisitDateValue(visitDate: unknown): DateInput | null {
  if (visitDate == null) {
    return null
  }

  if (
    typeof visitDate === 'object' &&
    !(visitDate instanceof Date) &&
    !Array.isArray(visitDate) &&
    'present' in visitDate
  ) {
    const wrapped = visitDate as { present?: boolean; value?: unknown }
    if (!wrapped.present) {
      return null
    }

    return unwrapVisitDateValue(wrapped.value)
  }

  return visitDate as DateInput
}

export function isVisitDateUnset(visitDate: unknown): visitDate is null | undefined {
  return unwrapVisitDateValue(visitDate) == null
}

export function parseIsoDateLocal(isoDate: unknown) {
  const value = unwrapVisitDateValue(isoDate)

  if (value == null) {
    throw new TypeError('Invalid date value')
  }

  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate())
  }

  if (Array.isArray(value)) {
    const [year, month, day] = value
    return new Date(year, month - 1, day)
  }

  if (typeof value === 'object') {
    const { year, month, day } = value
    return new Date(year, month - 1, day)
  }

  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function getTripDayDates(startDate: string, endDate: string) {
  const dates: Date[] = []
  const current = parseIsoDateLocal(startDate)
  const end = parseIsoDateLocal(endDate)

  while (current <= end) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  return dates
}

export function toIsoDateString(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function formatDestinationDayLabel(visitDate?: unknown) {
  if (isVisitDateUnset(visitDate)) {
    return 'Unsorted'
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(parseIsoDateLocal(visitDate))
}

function toLocalDateString(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const TRIP_ACCENTS = [
  'from-sky-500/80 to-indigo-600/80',
  'from-orange-400/80 to-rose-500/80',
  'from-emerald-400/80 to-teal-600/80',
  'from-violet-500/80 to-fuchsia-600/80',
  'from-amber-400/80 to-orange-500/80',
  'from-cyan-400/80 to-blue-600/80',
] as const

export function getDefaultTripDates() {
  const start = new Date()
  const end = new Date()
  end.setDate(end.getDate() + 7)

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  }
}

export function formatTripDateRange(startDate: string, endDate: string) {
  const formatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return `${formatter.format(parseIsoDateLocal(startDate))} – ${formatter.format(parseIsoDateLocal(endDate))}`
}

export function getTripStatus(startDate: string, endDate: string): TripStatus {
  const today = toLocalDateString(new Date())

  if (endDate < today) {
    return 'Completed'
  }

  if (startDate <= today && today <= endDate) {
    return 'Ongoing'
  }

  return 'Upcoming'
}

export function getTripAccent(trip: TripResponse, index: number) {
  const hash = trip.id
    .split('')
    .reduce((accumulator, character) => accumulator + character.charCodeAt(0), 0)

  return TRIP_ACCENTS[(index + hash) % TRIP_ACCENTS.length]
}

export function tripStatusVariant(
  status: TripStatus,
): 'default' | 'secondary' | 'outline' {
  switch (status) {
    case 'Ongoing':
      return 'default'
    case 'Upcoming':
      return 'secondary'
    case 'Completed':
      return 'outline'
  }
}
