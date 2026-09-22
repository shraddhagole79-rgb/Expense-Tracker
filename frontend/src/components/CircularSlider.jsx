import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Circular / Arc Slider for fast, interactive amount selection
 * - Draggable knob along 270-degree arc
 * - Center editable value with quick +/- step buttons
 * - Subtle off-white/gray track, crisp royal blue active arc, black accents
 */
export default function CircularSlider({
  value = 250,
  min = 10,
  max = 10000,
  step = 10,
  onChange,
}) {
  const svgRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Geometry constants
  const size = 200;
  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const center = size / 2;

  // 270 degree arc: start at 135 deg, end at 405 deg (or 45 deg)
  const startAngle = 135;
  const endAngle = 405;
  const totalAngle = endAngle - startAngle; // 270 deg

  // Convert value to angle
  const clampedValue = Math.min(Math.max(value, min), max);
  const valueRatio = (clampedValue - min) / (max - min);
  const currentAngle = startAngle + valueRatio * totalAngle;

  const polarToCartesian = useCallback((cx, cy, r, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians),
    };
  }, []);

  const describeArc = useCallback((cx, cy, r, startA, endA) => {
    const start = polarToCartesian(cx, cy, r, endA);
    const end = polarToCartesian(cx, cy, r, startA);
    const arcAngle = endA - startA;
    const largeArcFlag = arcAngle <= 180 ? '0' : '1';
    return [
      'M', start.x, start.y,
      'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
    ].join(' ');
  }, [polarToCartesian]);

  const updateFromPointer = useCallback((clientX, clientY) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = clientX - cx;
    const dy = clientY - cy;

    // Angle in degrees from top (0 deg at top, clockwise)
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;

    // Map 0-360 into our [135, 405] range
    let relativeDeg = deg;
    if (relativeDeg < 45) {
      relativeDeg += 360; // 0..45 -> 360..405
    }

    if (relativeDeg < 135) {
      // In deadzone between 45 and 135
      const distToStart = Math.abs(relativeDeg - 135);
      const distToEnd = Math.abs(relativeDeg - 45);
      relativeDeg = distToStart < distToEnd ? 135 : 405;
    }

    const ratio = Math.min(Math.max((relativeDeg - 135) / totalAngle, 0), 1);
    const rawVal = min + ratio * (max - min);
    const steppedVal = Math.round(rawVal / step) * step;
    onChange(Math.min(Math.max(steppedVal, min), max));
  }, [min, max, step, totalAngle, onChange]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    updateFromPointer(e.clientX, e.clientY);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      updateFromPointer(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        updateFromPointer(e.clientX, e.clientY);
      }
    };
    const handleMouseUp = () => setIsDragging(false);

    const handleTouchMove = (e) => {
      if (isDragging && e.touches.length === 1) {
        updateFromPointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchEnd = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, updateFromPointer]);

  // Handle knob position
  const knobPos = polarToCartesian(center, center, radius, currentAngle);
  const trackPath = describeArc(center, center, radius, startAngle, endAngle);
  const activePath = describeArc(center, center, radius, startAngle, Math.max(startAngle + 0.1, currentAngle));

  const adjustStep = (direction) => {
    const increment = direction * (value >= 1000 ? 100 : (value >= 200 ? 50 : 25));
    const next = Math.min(Math.max(value + increment, min), max);
    onChange(next);
  };

  return (
    <div className="circular-slider-container">
      <div className="circular-slider-wrapper">
        <svg
          ref={svgRef}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="circular-slider-svg"
        >
          {/* Background track */}
          <path
            d={trackPath}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Active progress arc */}
          <path
            d={activePath}
            fill="none"
            stroke="#2563eb"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Thumb Knob */}
          <circle
            cx={knobPos.x}
            cy={knobPos.y}
            r={11}
            fill="#ffffff"
            stroke="#2563eb"
            strokeWidth={4}
            className="circular-slider-knob"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(37, 99, 235, 0.35))',
              cursor: 'grab',
            }}
          />
        </svg>

        {/* Center amount display & fine adjust */}
        <div className="circular-slider-center">
          <span className="circular-slider-currency">₹</span>
          <input
            type="number"
            className="circular-slider-input"
            value={value || ''}
            onChange={(e) => {
              const parsed = parseFloat(e.target.value) || 0;
              onChange(Math.min(Math.max(parsed, 0), max));
            }}
          />
          <div className="circular-slider-stepper">
            <button
              type="button"
              className="stepper-btn"
              onClick={() => adjustStep(-1)}
              title="Decrease"
            >
              −
            </button>
            <span className="stepper-label">Dial</span>
            <button
              type="button"
              className="stepper-btn"
              onClick={() => adjustStep(1)}
              title="Increase"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
