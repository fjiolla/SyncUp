import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HiOutlineMapPin, HiOutlineArrowTopRightOnSquare } from 'react-icons/hi2';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function Recenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], 14);
  }, [lat, lng, map]);
  return null;
}

function ClickHandler({ onClick }) {
  useMapEvents({
    click: (e) => onClick?.(e.latlng),
  });
  return null;
}

async function reverseGeocode(lat, lng) {
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`, {
      headers: { 'Accept-Language': 'en' },
    });
    const data = await r.json();
    return {
      name: data?.display_name?.split(',').slice(0, 2).join(', ') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      displayName: data?.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    };
  } catch {
    return { name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, displayName: `${lat.toFixed(4)}, ${lng.toFixed(4)}` };
  }
}

export default function LocationPicker({ label, value, onChange, placeholder = 'Search venue, address, landmark', error, showDirections = true }) {
  const [query, setQuery] = useState(() => value?.name || value?.displayName || '');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const wrapRef = useRef(null);

  const selected = value && typeof value === 'object' && value.lat ? value : null;

  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const runSearch = (q) => {
    if (!q || q.trim().length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1`, {
      headers: { 'Accept-Language': 'en' },
    })
      .then((r) => r.json())
      .then((data) => {
        const mapped = data.map((d) => ({
          name: d.display_name.split(',').slice(0, 2).join(', '),
          displayName: d.display_name,
          lat: parseFloat(d.lat),
          lng: parseFloat(d.lon),
        }));
        setResults(mapped);
        setOpen(true);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  };

  const handleInput = (e) => {
    const v = e.target.value;
    setQuery(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(v), 400);
  };

  const select = (item) => {
    setQuery(item.name);
    setOpen(false);
    setResults([]);
    onChange?.(item);
  };

  const handleMapClick = async (latlng) => {
    setLoading(true);
    const meta = await reverseGeocode(latlng.lat, latlng.lng);
    setLoading(false);
    const item = { ...meta, lat: latlng.lat, lng: latlng.lng };
    setQuery(item.name);
    onChange?.(item);
  };

  const directionsUrl = selected ? `https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}` : null;
  const mapCenter = selected ? [selected.lat, selected.lng] : [20.5937, 78.9629];
  const mapZoom = selected ? 14 : 5;

  return (
    <div ref={wrapRef} className="space-y-2">
      {label && <label className="block text-sm font-medium text-surface-700">{label}</label>}
      <div className="relative">
        <HiOutlineMapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => results.length && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full pl-9 pr-3.5 py-2.5 bg-white border border-surface-200 rounded-lg text-sm text-surface-900 placeholder:text-surface-400 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 ${error ? 'border-red-300' : ''}`}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-3.5 h-3.5 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        )}
        {open && results.length > 0 && (
          <ul className="absolute z-[1500] top-full left-0 right-0 mt-1 bg-white border border-surface-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {results.map((r, i) => (
              <li key={`${r.displayName}-${i}`}>
                <button
                  type="button"
                  onClick={() => select(r)}
                  className="w-full text-left px-3.5 py-2.5 text-sm text-surface-700 hover:bg-primary-50 hover:text-primary-700 transition-colors flex items-start gap-2"
                >
                  <HiOutlineMapPin className="w-4 h-4 text-surface-400 flex-shrink-0 mt-0.5" />
                  <span className="flex flex-col">
                    <span className="font-medium truncate">{r.name}</span>
                    <span className="text-xs text-surface-400 truncate">{r.displayName}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-surface-500">Tip: search above or click anywhere on the map to drop a pin.</p>
      <div className="rounded-lg overflow-hidden border border-surface-200 h-56">
        <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {selected && <Marker position={[selected.lat, selected.lng]} icon={markerIcon} />}
          {selected && <Recenter lat={selected.lat} lng={selected.lng} />}
          <ClickHandler onClick={handleMapClick} />
        </MapContainer>
      </div>

      {selected && showDirections && directionsUrl && (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-700 hover:text-primary-800"
        >
          <HiOutlineArrowTopRightOnSquare className="w-3.5 h-3.5" /> Open in Google Maps
        </a>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function LocationDisplay({ coordinates, locationName, height = 'h-48' }) {
  if (!coordinates || !coordinates.lat) return null;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
  return (
    <div className="space-y-2">
      <div className={`rounded-lg overflow-hidden border border-surface-200 ${height}`}>
        <MapContainer center={[coordinates.lat, coordinates.lng]} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[coordinates.lat, coordinates.lng]} icon={markerIcon} />
        </MapContainer>
      </div>
      {locationName && <p className="text-xs text-surface-500">{locationName}</p>}
      <a
        href={directionsUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-700 hover:text-primary-800"
      >
        <HiOutlineArrowTopRightOnSquare className="w-3.5 h-3.5" /> Get directions
      </a>
    </div>
  );
}
