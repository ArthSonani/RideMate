"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

/**
 * GoogleDirectionsMap
 * Renders a Google Map with a driving route between two addresses.
 *
 * Props:
 * - origin: string (required) - starting address text
 * - destination: string (required) - destination address text
 * - travelMode?: "DRIVING" | "WALKING" | "BICYCLING" | "TRANSIT" (default: DRIVING)
 * - className?: string - extra classes for the map container
 * - height?: number | string - container height (default: 200)
 * - onReady?: (map: google.maps.Map) => void - callback when map is ready
 */
export default function GoogleDirectionsMap({
  origin,
  destination,
  travelMode = "DRIVING",
  className = "",
  height = 200,
  onReady,
}) {
  const mapRef = useRef(null);
  const directionsRef = useRef({ service: null, renderer: null, map: null });
  const [gmapsLoaded, setGmapsLoaded] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const hasAddresses = Boolean(origin && destination);

  useEffect(() => {
    if (!gmapsLoaded || !hasAddresses || !mapRef.current) return;
    const g = window.google;
    if (!g?.maps) return;

    // Clean up existing renderer if any (avoid duplicates on re-renders)
    if (directionsRef.current.renderer) {
      try { directionsRef.current.renderer.setMap(null); } catch (_) {}
    }

    const map = new g.maps.Map(mapRef.current, {
      center: { lat: 21.1702, lng: 72.8311 },
      zoom: 7,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    const service = new g.maps.DirectionsService();
    const renderer = new g.maps.DirectionsRenderer();
    renderer.setMap(map);

    const mode = g.maps.TravelMode[travelMode] || g.maps.TravelMode.DRIVING;

    service.route(
      {
        origin,
        destination,
        travelMode: mode,
      },
      (result, status) => {
        if (status === "OK") {
          renderer.setDirections(result);
        } else {
          // fallback: try to place markers after geocoding
          const geocoder = new g.maps.Geocoder();
          Promise.all([
            new Promise((res) => geocoder.geocode({ address: origin }, (r) => res(r?.[0]?.geometry?.location || null))),
            new Promise((res) => geocoder.geocode({ address: destination }, (r) => res(r?.[0]?.geometry?.location || null))),
          ]).then(([o, d]) => {
            if (o) new g.maps.Marker({ position: o, map });
            if (d) new g.maps.Marker({ position: d, map });
            if (o && d) {
              const bounds = new g.maps.LatLngBounds();
              bounds.extend(o);
              bounds.extend(d);
              map.fitBounds(bounds);
            }
          });
        }
      }
    );

    directionsRef.current = { service, renderer, map };
    if (typeof onReady === "function") onReady(map);

    return () => {
      try { renderer.setMap(null); } catch (_) {}
    };
  }, [gmapsLoaded, hasAddresses, origin, destination, travelMode, onReady]);

  // Fallback content if no API key
  if (!apiKey) {
    return (
      <div
        className={className}
        style={{ height: typeof height === "number" ? `${height}px` : height }}
      >
        <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-600">
          Map unavailable: missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        ref={mapRef}
        className={className}
        style={{ height: typeof height === "number" ? `${height}px` : height }}
      />
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}`}
        strategy="lazyOnload"
        onLoad={() => setGmapsLoaded(true)}
      />
    </>
  );
}
