import React, {useEffect, useRef, useState} from 'react';
import {loadMaps} from './maps';
import {locations} from './model';

export default function MapView({visible, selected, onSelect}) {
  const container = useRef(null);
  const map = useRef(null);
  const markers = useRef(new Map());
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const authError = () => setError('Google Maps could not authenticate. Check your API key, billing, and website restrictions.');
    window.addEventListener('maps-auth-error', authError);
    loadMaps(import.meta.env.VITE_GOOGLE_MAPS_API_KEY).then(maps => {
      if (!active) return;
      map.current = new maps.Map(container.current, {center:{lat:43.6603,lng:-70.2568}, zoom:14, mapId:import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID', streetViewControl:false, mapTypeControl:false});
      const bounds = new maps.LatLngBounds();
      locations.forEach((location, index) => {
        const pin = document.createElement('span');
        pin.className = 'map-pin';
        pin.textContent = String(index + 1);
        const marker = new maps.marker.AdvancedMarkerElement({map:map.current, position:{lat:location.lat,lng:location.lng}, title:location.name, content:pin});
        const listener = marker.addListener('click', () => selectRef.current(location.id));
        markers.current.set(location.id, {marker, pin, listener});
        bounds.extend(marker.position);
      });
      map.current.fitBounds(bounds, 60);
      setReady(true);
    }).catch(reason => { if (active) setError(reason.message); });
    return () => {
      active = false;
      window.removeEventListener('maps-auth-error', authError);
      markers.current.forEach(({marker, listener}) => {listener.remove(); marker.map = null;});
      markers.current.clear();
    };
  }, []);
  // Keep a single map instance; filtering changes marker visibility only.
  useEffect(() => {
    if (!ready) return;
    const ids = new Set(visible.map(location => location.id));
    markers.current.forEach(({marker, pin}, id) => {
      marker.map = ids.has(id) ? map.current : null;
      pin.classList.toggle('selected', id === selected);
      marker.zIndex = id === selected ? 100 : 1;
      if (id === selected && ids.has(id)) map.current.panTo(marker.position);
    });
  }, [visible, selected, ready]);
  return <section className="map-panel" aria-label="Interactive neighborhood map">
    <div className="map" ref={container} aria-label="Map of Portland landmarks" />
    {(!ready || error) && <div className="map-message" role="status">{error || 'Loading Google Maps…'}<p>You can explore every location using the list.</p></div>}
  </section>;
}
