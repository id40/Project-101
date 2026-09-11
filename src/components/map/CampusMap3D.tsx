'use client';

import React, { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { GISBuildingProperties, GISPOIProperties, LayerVisibility } from '@/types/gis';

import lpuBuildingsData from '@/data/geojson/lpu_buildings.json';
import lpuRoadsData from '@/data/geojson/lpu_roads.json';
import lpuPoisData from '@/data/geojson/lpu_pois.json';
import lpuParksData from '@/data/geojson/lpu_parks.json';

// Set MapLibre worker URL for client-side bundlers
if (typeof window !== 'undefined') {
  maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');
}

// LPU Campus constants - centered on Academic Quad & UniMall Boulevard
const LPU_CENTER: [number, number] = [75.7032, 31.2545];
const DEFAULT_ZOOM = 16.0;
const DEFAULT_PITCH = 54;
const DEFAULT_BEARING = -25;

// Bulletproof self-contained basemap style with dark raster + satellite raster
const BASEMAP_STYLE: any = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    'dark-tiles': {
      type: 'raster',
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: '© OpenStreetMap contributors',
    },
    'satellite-tiles': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: '© Esri, Maxar, Earthstar Geographics',
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#0B0F19',
      },
    },
    {
      id: 'dark-basemap',
      type: 'raster',
      source: 'dark-tiles',
      layout: {
        visibility: 'none',
      },
      paint: {
        'raster-opacity': 0.65,
        'raster-saturation': -0.95,
        'raster-brightness-max': 0.45,
        'raster-contrast': 0.25,
      },
    },
    {
      id: 'satellite-basemap',
      type: 'raster',
      source: 'satellite-tiles',
      layout: {
        visibility: 'visible',
      },
      paint: {
        'raster-opacity': 0.95,
      },
    },
  ],
};

// Building category color mapping
const CATEGORY_COLORS: Record<string, string> = {
  academic: '#635BFF',
  hostel: '#0D9488',
  food: '#F59E0B',
  shopping: '#F97316',
  library: '#8B5CF6',
  medical: '#EF4444',
  sports: '#16A34A',
  parking: '#64748B',
  gate: '#F59E0B',
  auditorium: '#7C3AED',
  park: '#22C55E',
  administration: '#0F766E',
  residential: '#475569',
  other: '#94A3B8',
};

export interface CampusMap3DRef {
  flyTo: (lng: number, lat: number, zoom?: number) => void;
  highlightBuilding: (buildingId: string) => void;
  clearHighlight: () => void;
  setViewMode: (mode: '2d' | '3d') => void;
  setBasemapMode: (mode: 'dark' | 'satellite') => void;
  addRouteLayer: (coordinates: [number, number][]) => void;
  clearRoute: () => void;
  getMap: () => maplibregl.Map | null;
  resetView: () => void;
}

interface CampusMap3DProps {
  onBuildingClick?: (properties: GISBuildingProperties, coordinates: [number, number]) => void;
  onPOIClick?: (properties: GISPOIProperties, coordinates: [number, number]) => void;
  onMapClick?: (lng: number, lat: number) => void;
  layerVisibility?: Partial<LayerVisibility>;
  basemapMode?: 'dark' | 'satellite';
  className?: string;
}

const CampusMap3D = forwardRef<CampusMap3DRef, CampusMap3DProps>(({
  onBuildingClick,
  onPOIClick,
  onMapClick,
  layerVisibility,
  basemapMode = 'satellite',
  className = '',
}, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');
  const [currentBasemap, setCurrentBasemap] = useState<'dark' | 'satellite'>(basemapMode);
  const highlightedBuildingRef = useRef<string | null>(null);

  // Add GeoJSON sources
  const addMapSources = useCallback((mapInstance: maplibregl.Map) => {
    // Buildings source
    if (!mapInstance.getSource('lpu-buildings')) {
      mapInstance.addSource('lpu-buildings', {
        type: 'geojson',
        data: lpuBuildingsData as any,
      });
    }

    // Roads source
    if (!mapInstance.getSource('lpu-roads')) {
      mapInstance.addSource('lpu-roads', {
        type: 'geojson',
        data: lpuRoadsData as any,
      });
    }

    // Parks source
    if (!mapInstance.getSource('lpu-parks')) {
      mapInstance.addSource('lpu-parks', {
        type: 'geojson',
        data: lpuParksData as any,
      });
    }

    // POIs source
    if (!mapInstance.getSource('lpu-pois')) {
      mapInstance.addSource('lpu-pois', {
        type: 'geojson',
        data: lpuPoisData as any,
      });
    }

    // Route source
    if (!mapInstance.getSource('route')) {
      mapInstance.addSource('route', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
    }

    // Measurement source
    if (!mapInstance.getSource('measurement')) {
      mapInstance.addSource('measurement', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
    }

    // Building highlight source
    if (!mapInstance.getSource('building-highlight')) {
      mapInstance.addSource('building-highlight', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
    }
  }, []);

  // Add map layers
  const addMapLayers = useCallback((mapInstance: maplibregl.Map) => {
    // --- PARKS LAYER ---
    if (!mapInstance.getLayer('lpu-parks-fill')) {
      mapInstance.addLayer({
        id: 'lpu-parks-fill',
        type: 'fill',
        source: 'lpu-parks',
        paint: {
          'fill-color': '#22C55E',
          'fill-opacity': 0.2,
        },
      });
    }

    if (!mapInstance.getLayer('lpu-parks-outline')) {
      mapInstance.addLayer({
        id: 'lpu-parks-outline',
        type: 'line',
        source: 'lpu-parks',
        paint: {
          'line-color': '#22C55E',
          'line-width': 1.5,
          'line-opacity': 0.6,
          'line-dasharray': [3, 2],
        },
      });
    }

    // --- ROADS LAYERS ---
    if (!mapInstance.getLayer('lpu-roads-casing')) {
      mapInstance.addLayer({
        id: 'lpu-roads-casing',
        type: 'line',
        source: 'lpu-roads',
        paint: {
          'line-color': 'rgba(99, 91, 255, 0.35)',
          'line-width': [
            'match', ['get', 'highway_type'],
            'primary', 12,
            'secondary', 10,
            'tertiary', 8,
            'service', 7,
            'pedestrian', 5,
            'footway', 4,
            'cycleway', 4,
            6,
          ],
          'line-blur': 3,
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      });
    }

    if (!mapInstance.getLayer('lpu-roads-line')) {
      mapInstance.addLayer({
        id: 'lpu-roads-line',
        type: 'line',
        source: 'lpu-roads',
        paint: {
          'line-color': [
            'match', ['get', 'highway_type'],
            'primary', '#CBD5E1',
            'secondary', '#94A3B8',
            'tertiary', '#64748B',
            'service', '#475569',
            'pedestrian', '#635BFF',
            'footway', '#A5B4FC',
            'cycleway', '#10B981',
            '#64748B',
          ],
          'line-width': [
            'match', ['get', 'highway_type'],
            'primary', 6,
            'secondary', 5,
            'tertiary', 4,
            'service', 3,
            'pedestrian', 2.5,
            'footway', 2,
            'cycleway', 2,
            3,
          ],
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      });
    }

    // --- 3D BUILDINGS EXTRUSION LAYER ---
    if (!mapInstance.getLayer('lpu-3d-buildings')) {
      mapInstance.addLayer({
        id: 'lpu-3d-buildings',
        type: 'fill-extrusion',
        source: 'lpu-buildings',
        paint: {
          'fill-extrusion-color': [
            'match', ['get', 'category'],
            'academic', '#635BFF',
            'hostel', '#0D9488',
            'food', '#F59E0B',
            'shopping', '#F97316',
            'library', '#8B5CF6',
            'medical', '#EF4444',
            'sports', '#16A34A',
            'parking', '#64748B',
            'gate', '#F59E0B',
            'auditorium', '#7C3AED',
            'park', '#22C55E',
            'administration', '#0F766E',
            'residential', '#475569',
            '#635BFF',
          ],
          'fill-extrusion-height': [
            'interpolate', ['linear'], ['zoom'],
            14, 0,
            14.5, ['get', 'height'],
          ],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': currentBasemap === 'satellite' ? 0.78 : 0.9,
          'fill-extrusion-vertical-gradient': true,
        },
      });
    }

    // --- BUILDING HIGHLIGHT LAYER ---
    if (!mapInstance.getLayer('building-highlight-layer')) {
      mapInstance.addLayer({
        id: 'building-highlight-layer',
        type: 'fill-extrusion',
        source: 'building-highlight',
        paint: {
          'fill-extrusion-color': '#FFFFFF',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.4,
        },
      });
    }

    // --- PREMIER LABS & LANDMARKS PULSE RINGS ---
    if (!mapInstance.getLayer('lpu-poi-highlight-pulse')) {
      mapInstance.addLayer({
        id: 'lpu-poi-highlight-pulse',
        type: 'circle',
        source: 'lpu-pois',
        filter: ['==', ['get', 'is_highlight'], true],
        minzoom: 14,
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            14, 8,
            17, 14,
            19, 20,
          ],
          'circle-color': '#F59E0B',
          'circle-opacity': 0.35,
          'circle-stroke-color': '#F59E0B',
          'circle-stroke-width': 2,
          'circle-stroke-opacity': 0.9,
        },
      });
    }

    // --- POI DOT MARKERS ---
    if (!mapInstance.getLayer('lpu-poi-dots')) {
      mapInstance.addLayer({
        id: 'lpu-poi-dots',
        type: 'circle',
        source: 'lpu-pois',
        filter: ['!', ['in', 'Campus Facility', ['get', 'name']]],
        minzoom: 14.5,
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            14.5, 4,
            17, 6,
            19, 8,
          ],
          'circle-color': [
            'match', ['get', 'category'],
            'academic', '#818CF8',
            'hostel', '#2DD4BF',
            'food', '#FBBF24',
            'shopping', '#FB923C',
            'library', '#A78BFA',
            'medical', '#F87171',
            'sports', '#4ADE80',
            'gate', '#FBBF24',
            'auditorium', '#C084FC',
            'administration', '#2DD4BF',
            '#CBD5E1',
          ],
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 2,
          'circle-opacity': 1,
        },
      });
    }

    // --- POI LABELS ---
    if (!mapInstance.getLayer('lpu-poi-labels')) {
      mapInstance.addLayer({
        id: 'lpu-poi-labels',
        type: 'symbol',
        source: 'lpu-pois',
        filter: ['!', ['in', 'Campus Facility', ['get', 'name']]],
        minzoom: 15.5,
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Regular'],
          'text-offset': [0, 1.2],
          'text-anchor': 'top',
          'text-size': 11,
          'text-max-width': 12,
        },
        paint: {
          'text-color': '#F8FAFC',
          'text-halo-color': 'rgba(15, 23, 42, 0.95)',
          'text-halo-width': 2,
        },
      });
    }

    // --- ROUTE LAYERS ---
    if (!mapInstance.getLayer('route-glow')) {
      mapInstance.addLayer({
        id: 'route-glow',
        type: 'line',
        source: 'route',
        paint: {
          'line-color': '#635BFF',
          'line-width': 12,
          'line-blur': 6,
          'line-opacity': 0.5,
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      });
    }

    if (!mapInstance.getLayer('route-line')) {
      mapInstance.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        paint: {
          'line-color': '#818CF8',
          'line-width': 4,
          'line-opacity': 0.95,
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      });
    }

    if (!mapInstance.getLayer('route-inner')) {
      mapInstance.addLayer({
        id: 'route-inner',
        type: 'line',
        source: 'route',
        paint: {
          'line-color': '#FFFFFF',
          'line-width': 1.5,
          'line-dasharray': [2, 4],
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      });
    }

    // --- MEASUREMENT LAYERS ---
    if (!mapInstance.getLayer('measurement-line')) {
      mapInstance.addLayer({
        id: 'measurement-line',
        type: 'line',
        source: 'measurement',
        paint: {
          'line-color': '#F59E0B',
          'line-width': 2.5,
          'line-dasharray': [4, 3],
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      });
    }

    if (!mapInstance.getLayer('measurement-points')) {
      mapInstance.addLayer({
        id: 'measurement-points',
        type: 'circle',
        source: 'measurement',
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-radius': 5,
          'circle-color': '#F59E0B',
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 2,
        },
      });
    }
  }, [currentBasemap]);

  // Setup interactions
  const setupInteractions = useCallback((mapInstance: maplibregl.Map) => {
    // Building click
    mapInstance.on('click', 'lpu-3d-buildings', (e: any) => {
      if (!e.features?.length) return;
      const feature = e.features[0];
      const props = feature.properties as GISBuildingProperties;
      if (typeof props.facilities === 'string') {
        try { props.facilities = JSON.parse(props.facilities); } catch { /* noop */ }
      }
      onBuildingClick?.(props, [e.lngLat.lng, e.lngLat.lat]);
    });

    // POI click
    mapInstance.on('click', 'lpu-poi-dots', (e: any) => {
      if (!e.features?.length) return;
      const feature = e.features[0];
      const props = feature.properties as GISPOIProperties;
      const coords = (feature.geometry as GeoJSON.Point).coordinates as [number, number];
      onPOIClick?.(props, coords);
    });

    // Generic map click
    mapInstance.on('click', (e: any) => {
      const buildingFeatures = mapInstance.queryRenderedFeatures(e.point, { layers: ['lpu-3d-buildings'] });
      const poiFeatures = mapInstance.queryRenderedFeatures(e.point, { layers: ['lpu-poi-dots'] });
      if (buildingFeatures.length === 0 && poiFeatures.length === 0) {
        onMapClick?.(e.lngLat.lng, e.lngLat.lat);
      }
    });

    // Cursor changes
    mapInstance.on('mouseenter', 'lpu-3d-buildings', () => {
      mapInstance.getCanvas().style.cursor = 'pointer';
    });
    mapInstance.on('mouseleave', 'lpu-3d-buildings', () => {
      mapInstance.getCanvas().style.cursor = '';
    });

    mapInstance.on('mouseenter', 'lpu-poi-dots', () => {
      mapInstance.getCanvas().style.cursor = 'pointer';
    });
    mapInstance.on('mouseleave', 'lpu-poi-dots', () => {
      mapInstance.getCanvas().style.cursor = '';
    });

    // Popup
    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 15,
      className: 'campus-building-popup',
    });

    mapInstance.on('mousemove', 'lpu-3d-buildings', (e: any) => {
      if (!e.features?.length) return;
      const props = e.features[0].properties;
      popup
        .setLngLat(e.lngLat)
        .setHTML(`
          <div style="font-family: 'Inter', sans-serif; padding: 4px 0;">
            ${props?.badge ? `<div style="font-size: 10px; font-weight: 700; color: #F59E0B; margin-bottom: 2px; text-transform: uppercase;">⭐ ${props.badge}</div>` : ''}
            <div style="font-weight: 700; font-size: 13px; color: #F8FAFC; margin-bottom: 2px;">
              ${props?.name || 'Building'}
            </div>
            <div style="font-size: 11px; color: #94A3B8;">
              ${props?.block_code || ''} · ${props?.category || ''}
            </div>
          </div>
        `)
        .addTo(mapInstance);
    });

    mapInstance.on('mouseleave', 'lpu-3d-buildings', () => {
      popup.remove();
    });

    mapInstance.on('mousemove', 'lpu-poi-dots', (e: any) => {
      if (!e.features?.length) return;
      const props = e.features[0].properties;
      popup
        .setLngLat(e.lngLat)
        .setHTML(`
          <div style="font-family: 'Inter', sans-serif; padding: 4px 0;">
            ${props?.badge ? `<div style="font-size: 10px; font-weight: 700; color: #F59E0B; margin-bottom: 2px; text-transform: uppercase;">⭐ ${props.badge}</div>` : ''}
            <div style="font-weight: 700; font-size: 13px; color: #F8FAFC; margin-bottom: 2px;">
              ${props?.name || 'Spot'}
            </div>
            <div style="font-size: 11px; color: #94A3B8;">
              ${props?.block_code || ''} · ${props?.category || ''}
            </div>
          </div>
        `)
        .addTo(mapInstance);
    });

    mapInstance.on('mouseleave', 'lpu-poi-dots', () => {
      popup.remove();
    });
  }, [onBuildingClick, onPOIClick, onMapClick]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: BASEMAP_STYLE,
      center: LPU_CENTER,
      zoom: DEFAULT_ZOOM,
      pitch: DEFAULT_PITCH,
      bearing: DEFAULT_BEARING,
      maxZoom: 20,
      minZoom: 13,
      maxBounds: [
        [75.680, 31.240], // SW corner
        [75.725, 31.270], // NE corner
      ],
    });

    // Add navigation controls
    mapInstance.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true,
        showCompass: true,
        showZoom: true,
      }),
      'top-right'
    );

    // Add scale control
    mapInstance.addControl(
      new maplibregl.ScaleControl({ maxWidth: 150, unit: 'metric' }),
      'bottom-right'
    );

    // Add geolocate control
    mapInstance.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      'top-right'
    );

    let isInitialized = false;
    const initMapLayers = () => {
      if (isInitialized) return;
      isInitialized = true;
      try {
        mapInstance.resize();
        addMapSources(mapInstance);
        addMapLayers(mapInstance);
        setupInteractions(mapInstance);
      } catch (err: any) {
        console.warn('MapLibre layer initialization warning:', err?.message);
      }
      setMapLoaded(true);
    };

    mapInstance.on('load', initMapLayers);
    if (mapInstance.isStyleLoaded()) {
      initMapLayers();
    }

    const handleResize = () => mapInstance.resize();
    window.addEventListener('resize', handleResize);
    const resizeTimer = setTimeout(handleResize, 300);

    map.current = mapInstance;

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
      mapInstance.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle basemap mode changes (Dark vs Satellite)
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    const m = map.current;
    if (m.getLayer('satellite-basemap') && m.getLayer('dark-basemap')) {
      m.setLayoutProperty('satellite-basemap', 'visibility', currentBasemap === 'satellite' ? 'visible' : 'none');
      m.setLayoutProperty('dark-basemap', 'visibility', currentBasemap === 'satellite' ? 'none' : 'visible');
      if (m.getLayer('lpu-3d-buildings')) {
        m.setPaintProperty('lpu-3d-buildings', 'fill-extrusion-opacity', currentBasemap === 'satellite' ? 0.78 : 0.9);
      }
    }
  }, [currentBasemap, mapLoaded]);

  // Handle layer visibility changes
  useEffect(() => {
    if (!map.current || !mapLoaded || !layerVisibility) return;
    const m = map.current;

    const setVisibility = (layerId: string, visible: boolean) => {
      if (m.getLayer(layerId)) {
        m.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
      }
    };

    if (layerVisibility.buildings !== undefined) {
      setVisibility('lpu-3d-buildings', layerVisibility.buildings);
    }
    if (layerVisibility.roads !== undefined) {
      setVisibility('lpu-roads-casing', layerVisibility.roads);
      setVisibility('lpu-roads-line', layerVisibility.roads);
    }
    if (layerVisibility.parks !== undefined) {
      setVisibility('lpu-parks-fill', layerVisibility.parks);
      setVisibility('lpu-parks-outline', layerVisibility.parks);
    }
    if (layerVisibility.pois !== undefined) {
      setVisibility('lpu-poi-labels', layerVisibility.pois);
      setVisibility('lpu-poi-dots', layerVisibility.pois);
    }
  }, [layerVisibility, mapLoaded]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    flyTo: (lng: number, lat: number, zoom?: number) => {
      map.current?.flyTo({
        center: [lng, lat],
        zoom: zoom || 17.5,
        pitch: viewMode === '3d' ? 55 : 0,
        bearing: DEFAULT_BEARING,
        duration: 2000,
        essential: true,
      });
    },

    highlightBuilding: (buildingId: string) => {
      if (!map.current || !mapLoaded) return;
      const feature = (lpuBuildingsData as any).features?.find((f: any) => f.properties?.id === buildingId);
      const highlightSource = map.current.getSource('building-highlight') as maplibregl.GeoJSONSource;
      if (feature && highlightSource) {
        highlightSource.setData({
          type: 'FeatureCollection',
          features: [feature],
        });
        highlightedBuildingRef.current = buildingId;
      }
    },

    clearHighlight: () => {
      if (!map.current || !mapLoaded) return;
      const highlightSource = map.current.getSource('building-highlight') as maplibregl.GeoJSONSource;
      highlightSource?.setData({ type: 'FeatureCollection', features: [] });
      highlightedBuildingRef.current = null;
    },

    setViewMode: (mode: '2d' | '3d') => {
      setViewMode(mode);
      map.current?.easeTo({
        pitch: mode === '3d' ? DEFAULT_PITCH : 0,
        bearing: mode === '3d' ? DEFAULT_BEARING : 0,
        duration: 1500,
      });
    },

    setBasemapMode: (mode: 'dark' | 'satellite') => {
      setCurrentBasemap(mode);
      if (!map.current || !mapLoaded) return;
      const m = map.current;
      if (m.getLayer('satellite-basemap') && m.getLayer('dark-basemap')) {
        m.setLayoutProperty('satellite-basemap', 'visibility', mode === 'satellite' ? 'visible' : 'none');
        m.setLayoutProperty('dark-basemap', 'visibility', mode === 'satellite' ? 'none' : 'visible');
        if (m.getLayer('lpu-3d-buildings')) {
          m.setPaintProperty('lpu-3d-buildings', 'fill-extrusion-opacity', mode === 'satellite' ? 0.78 : 0.9);
        }
      }
    },

    addRouteLayer: (coordinates: [number, number][]) => {
      if (!map.current || !mapLoaded) return;
      const source = map.current.getSource('route') as maplibregl.GeoJSONSource;
      source?.setData({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates,
          },
        }],
      });
    },

    clearRoute: () => {
      if (!map.current || !mapLoaded) return;
      const source = map.current.getSource('route') as maplibregl.GeoJSONSource;
      source?.setData({ type: 'FeatureCollection', features: [] });
    },

    getMap: () => map.current,

    resetView: () => {
      map.current?.flyTo({
        center: LPU_CENTER,
        zoom: DEFAULT_ZOOM,
        pitch: DEFAULT_PITCH,
        bearing: DEFAULT_BEARING,
        duration: 2000,
        essential: true,
      });
    },
  }), [mapLoaded, viewMode]);

  return (
    <div className={`relative w-full h-full ${className}`} style={{ minHeight: '100%', minWidth: '100%' }}>
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" style={{ width: '100%', height: '100%' }} />

      {/* Loading state - non-blocking subtle indicator */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm z-20 pointer-events-none">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white/80 text-xs font-sans tracking-wide uppercase">Initializing 3D GIS Engine...</p>
          </div>
        </div>
      )}

      {/* Map attribution overlay */}
      <div className="absolute bottom-2 left-2 text-[10px] text-white/30 font-sans pointer-events-none z-10">
        LPU Digital Campus · MapLibre GL · © OpenStreetMap · © CARTO · © Esri
      </div>
    </div>
  );
});

CampusMap3D.displayName = 'CampusMap3D';

export default CampusMap3D;
export { LPU_CENTER, DEFAULT_ZOOM, DEFAULT_PITCH, DEFAULT_BEARING, CATEGORY_COLORS };
