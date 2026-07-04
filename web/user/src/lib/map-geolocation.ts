import type { FeatureCollection, GeoJsonObject } from 'geojson'

export function normalizePolygonGeoJson(data: unknown): GeoJsonObject | null {
  let parsed: unknown = data

  if (typeof parsed === 'string') {
    parsed = JSON.parse(parsed)
    if (typeof parsed === 'string') {
      parsed = JSON.parse(parsed)
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    return null
  }

  const geoJson = parsed as GeoJsonObject

  if (geoJson.type === 'FeatureCollection') {
    const featureCollection = geoJson as FeatureCollection
    if (!featureCollection.features?.length) {
      return null
    }
  }

  return geoJson
}
