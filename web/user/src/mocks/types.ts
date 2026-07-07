export type MockLocation = {
  id: string
  name: string
  latitude: number
  longitude: number
  cityDisplayName: string
  countryDisplayName: string
  address: string
  category: string
  description: string
  phone: string
  email: string
  website: string
  hours: string
  images: string[]
  source: 'GOOGLE_MAPS' | 'MANUAL'
}
