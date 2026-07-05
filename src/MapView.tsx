import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { useEffect, useRef } from 'react'
import { type Spot, spotDetailUrl } from './data'

// Leafletのデフォルトアイコン解決はバンドラ環境でパスが壊れるため、明示的に差し替える
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const UMEDA_CENTER: L.LatLngTuple = [34.7035, 135.4985]
const INITIAL_ZOOM = 15

type Props = {
  spots: Spot[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export const MapView = ({ spots, selectedId, onSelect }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current).setView(UMEDA_CENTER, INITIAL_ZOOM)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)
    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
      layerRef.current = null
    }
  }, [])

  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return
    layer.clearLayers()
    markersRef.current.clear()
    spots.forEach((spot) => {
      const marker = L.marker([spot.lat, spot.lng], { title: spot.name })
      const popup = document.createElement('div')
      const name = document.createElement('strong')
      name.textContent = spot.name
      const rating = document.createElement('div')
      rating.textContent = '★'.repeat(spot.rating) + '☆'.repeat(5 - spot.rating)
      const link = document.createElement('a')
      link.href = spotDetailUrl(spot)
      link.target = '_blank'
      link.rel = 'noreferrer'
      link.textContent = 'Google Mapsで開く'
      popup.append(name, rating, link)
      marker.bindPopup(popup)
      marker.on('click', () => onSelect(spot.id))
      marker.addTo(layer)
      markersRef.current.set(spot.id, marker)
    })
  }, [spots, onSelect])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedId) return
    const marker = markersRef.current.get(selectedId)
    if (marker) {
      map.panTo(marker.getLatLng())
      marker.openPopup()
    }
  }, [selectedId])

  return <div ref={containerRef} className="area-map" aria-label="梅田周辺の地図" />
}
