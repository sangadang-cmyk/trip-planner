import L from 'leaflet'

function createPinMarkup(selected: boolean): string {
  const className = selected ? 'map-pin map-pin-selected' : 'map-pin'

  return `
    <div class="${className}" aria-hidden="true">
      <svg viewBox="0 0 28 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z"
          fill="currentColor"
        />
        <circle cx="14" cy="14" r="5" fill="white" fill-opacity="0.95" />
      </svg>
    </div>
  `
}

export function getLocationMarkerIcon(selected: boolean): L.DivIcon {
  const width = selected ? 34 : 28
  const height = selected ? 48 : 40

  return L.divIcon({
    className: '',
    html: createPinMarkup(selected),
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
  })
}
