import { useEffect, useRef, useState } from 'react';
import Globe from 'globe.gl';

export default function GlobeVisualization({ routes = [], width = 600, height = 600, autoRotate = true, backgroundColor = '#0a1929', focusOnRoute = false }) {
  const globeEl = useRef();
  const globeInstance = useRef();
  const [time, setTime] = useState(0);

  // Initialize globe once
  useEffect(() => {
    if (!globeEl.current || globeInstance.current) return;

    // Initialize globe
    const globe = Globe()
      (globeEl.current)
      .width(width)
      .height(height)
      .backgroundColor(backgroundColor)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
      .arcsData([])
      .arcStartLat(d => d.source[1])
      .arcStartLng(d => d.source[0])
      .arcEndLat(d => d.destination[1])
      .arcEndLng(d => d.destination[0])
      .arcColor(() => {
        const opacity = Math.abs(Math.sin(time * 0.8)) * 0.5 + 0.5;
        return `rgba(255, 180, 50, ${opacity})`;
      })
      .arcStroke(1.2)
      .arcDashLength(0.4)
      .arcDashGap(0.2)
      .arcDashAnimateTime(3000)
      .arcAltitudeAutoScale(0.3)
      .atmosphereColor('#4a90e2')
      .atmosphereAltitude(0.15);

    // Set camera angle
    globe.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });

    // Auto-rotate
    if (autoRotate) {
      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.5;
    }

    globeInstance.current = globe;

    // Animation for color oscillation
    let animationFrame;
    function animate() {
      setTime(t => t + 0.016); // ~60fps
      animationFrame = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (globe) globe._destructor?.();
      globeInstance.current = null;
    };
  }, [width, height, backgroundColor]);

  // Update auto-rotate when it changes
  useEffect(() => {
    if (globeInstance.current) {
      globeInstance.current.controls().autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Update arcs and camera position when routes change
  useEffect(() => {
    if (globeInstance.current) {
      globeInstance.current.arcsData(routes);

      // Focus camera on route if requested and routes exist
      if (focusOnRoute && routes.length > 0) {
        const route = routes[0]; // Focus on first route (the hovered one)

        // Calculate midpoint between source and destination
        const sourceLat = route.source[1];
        const sourceLng = route.source[0];
        const destLat = route.destination[1];
        const destLng = route.destination[0];

        const midLat = (sourceLat + destLat) / 2;
        const midLng = (sourceLng + destLng) / 2;

        // Rotate camera to face the route
        globeInstance.current.pointOfView(
          { lat: midLat, lng: midLng, altitude: 2.0 },
          1000 // 1 second transition
        );
      }
    }
  }, [routes, focusOnRoute]);

  return (
    <div
      ref={globeEl}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative'
      }}
    />
  );
}
