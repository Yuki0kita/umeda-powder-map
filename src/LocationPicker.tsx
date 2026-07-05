import L from 'leaflet'
import { useEffect, useRef } from 'react'

const UMEDA_CENTER: L.LatLngTuple = [34.7035, 135.4985]
const INITIAL_ZOOM = 15

export type LatLng = { lat: number; lng: number }

type Props = {
  value: LatLng | null
  onChange: (position: LatLng) => void
}

// ダイアログ内で新規施設の位置をクリック指定するためのミニマップ
export const LocationPicker = ({ value, onChange }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current).setView(UMEDA_CENTER, INITIAL_ZOOM)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)
    map.on('click', (event: L.LeafletMouseEvent) => {
      onChangeRef.current({ lat: event.latlng.lat, lng: event.latlng.lng })
    })
    mapRef.current = map
    // ダイアログ内はレイアウト確定が遅れるため、サイズを再計算する
    setTimeout(() => map.invalidateSize(), 100)
    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (!value) {
      markerRef.current?.remove()
      markerRef.current = null
      return
    }
    if (markerRef.current) {
      markerRef.current.setLatLng([value.lat, value.lng])
    } else {
      markerRef.current = L.marker([value.lat, value.lng]).addTo(map)
    }
  }, [value])

  return <div ref={containerRef} className="location-picker" aria-label="新規施設の位置を指定する地図" />
}
