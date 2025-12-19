import { useState, useCallback, useMemo, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, OverlayView } from '@react-google-maps/api';
import { useApp } from '../../context/AppContext';
import { Battery, Navigation, Loader2, LocateFixed, Zap, X } from 'lucide-react';

const DEFAULT_CENTER = { lat: 18.5204, lng: 73.8567 };
const DEFAULT_ZOOM = 16;

// Uber dark map style
const uberMapStyles = [
    { elementType: "geometry", stylers: [{ color: "#212121" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
    { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
    { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
    { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
    { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
    { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] }
];

const mapContainerStyle = { width: '100%', height: '100%' };

// Generate bikes around user
function generateNearbyBikes(center, count = 6) {
    const models = ['Yolo E-Bike Pro', 'Yolo E-Bike Lite', 'Yolo Speed+'];
    return Array.from({ length: count }, (_, i) => ({
        id: `BIKE${String(i + 1).padStart(3, '0')}`,
        lat: center.lat + (Math.random() - 0.5) * 0.006,
        lng: center.lng + (Math.random() - 0.5) * 0.006,
        batteryLevel: Math.floor(Math.random() * 50) + 40,
        status: 'available',
        model: models[Math.floor(Math.random() * models.length)],
        distance: Math.floor(Math.random() * 400) + 50
    }));
}

function getBikeIcon(battery) {
    const color = battery > 50 ? '#05A357' : battery > 20 ? '#FFC043' : '#E54B4B';
    return {
        path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
        fillColor: color,
        fillOpacity: 1,
        strokeColor: '#000',
        strokeWeight: 2,
        scale: 1.3,
        anchor: { x: 12, y: 12 }
    };
}

export default function MapView() {
    const { openScanner, selectBike } = useApp();
    const [map, setMap] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [bikes, setBikes] = useState([]);
    const [selectedBike, setSelectedBike] = useState(null);
    const [locationStatus, setLocationStatus] = useState('requesting');

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    });

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationStatus('denied');
            setBikes(generateNearbyBikes(DEFAULT_CENTER));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setUserLocation(loc);
                setLocationStatus('granted');
                setBikes(generateNearbyBikes(loc));
                map?.panTo(loc);
            },
            () => {
                setLocationStatus('denied');
                setBikes(generateNearbyBikes(DEFAULT_CENTER));
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, [map]);

    const onLoad = useCallback((m) => setMap(m), []);
    const onUnmount = useCallback(() => setMap(null), []);

    const handleBikeClick = (bike) => {
        setSelectedBike(bike);
        selectBike(bike);
        map?.panTo({ lat: bike.lat, lng: bike.lng });
    };

    const handleRecenter = () => {
        if (userLocation && map) {
            map.panTo(userLocation);
            map.setZoom(16);
        }
    };

    const options = useMemo(() => ({
        styles: uberMapStyles,
        disableDefaultUI: true,
        zoomControl: false,
    }), []);

    if (loadError) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-[var(--color-red)]">Map failed to load</p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-text-muted)]" />
            </div>
        );
    }

    return (
        <div className="h-full w-full relative">
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={userLocation || DEFAULT_CENTER}
                zoom={DEFAULT_ZOOM}
                options={options}
                onLoad={onLoad}
                onUnmount={onUnmount}
            >
                {/* User dot */}
                {userLocation && (
                    <Marker
                        position={userLocation}
                        icon={{
                            path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
                            fillColor: '#276EF1',
                            fillOpacity: 1,
                            strokeColor: '#fff',
                            strokeWeight: 3,
                            scale: 0.8,
                            anchor: { x: 12, y: 12 }
                        }}
                    />
                )}

                {/* Bike markers */}
                {bikes.map((bike) => (
                    <Marker
                        key={bike.id}
                        position={{ lat: bike.lat, lng: bike.lng }}
                        icon={getBikeIcon(bike.batteryLevel)}
                        onClick={() => handleBikeClick(bike)}
                    />
                ))}
            </GoogleMap>

            {/* Top bar with logo */}
            <div className="absolute top-5 left-5 right-5 z-10 flex items-center justify-between">
                <div className="uber-card-elevated px-4 py-3">
                    <span className="font-bold text-lg">YOLO</span>
                </div>
                <div className="uber-card-elevated px-4 py-2 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${locationStatus === 'granted' ? 'bg-[var(--color-green)]' : 'bg-[var(--color-yellow)]'}`} />
                    <span className="text-small">{bikes.length} bikes nearby</span>
                </div>
            </div>

            {/* Recenter button */}
            <button
                onClick={handleRecenter}
                className="uber-floating-btn bottom-32 right-5"
            >
                <Navigation className="w-5 h-5" />
            </button>

            {/* Selected bike card - Uber style */}
            {selectedBike && (
                <div className="absolute bottom-24 left-5 right-5 z-20">
                    <div className="uber-card-elevated p-5">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-title">{selectedBike.model}</h3>
                                <p className="text-small">{selectedBike.distance}m away</p>
                            </div>
                            <button
                                onClick={() => setSelectedBike(null)}
                                className="w-8 h-8 rounded-full bg-[var(--color-dark-card)] flex items-center justify-center"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-center gap-4 mb-5">
                            <div className="flex items-center gap-2">
                                <Zap className={`w-5 h-5 ${selectedBike.batteryLevel > 50 ? 'text-[var(--color-green)]' :
                                        selectedBike.batteryLevel > 20 ? 'text-[var(--color-yellow)]' : 'text-[var(--color-red)]'
                                    }`} />
                                <span className="font-medium">{selectedBike.batteryLevel}%</span>
                            </div>
                            <span className="text-small">•</span>
                            <span className="text-caption">{selectedBike.id}</span>
                        </div>

                        <button
                            onClick={() => { openScanner(); setSelectedBike(null); }}
                            className="uber-btn uber-btn-primary w-full"
                        >
                            Scan to unlock
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
