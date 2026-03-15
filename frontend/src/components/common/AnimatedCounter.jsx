import React, { useState, useEffect } from 'react';

const AnimatedCounter = ({ value, duration = 1500 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const endValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;
    
    if (isNaN(endValue)) {
      setCount(value);
      return;
    }

    let startTimestamp = null;
    
    // Spring physics-like easing (easeOutBack)
    const easeOutBack = (x) => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    };

    // Even more "bouncy" spring
    const spring = (t) => {
        if (t === 0) return 0;
        if (t === 1) return 1;
        const p = 0.3;
        return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
    };

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      
      const easedProgress = spring(progress);
      const currentCount = Math.floor(easedProgress * endValue);

      if (!isMounted) return;

      if (typeof value === 'string') {
        const isMoney = value.includes('₹');
        const isPercent = value.includes('%');
        const isMillion = value.endsWith('M');
        
        let formatted = Math.max(0, currentCount).toLocaleString();
        if (isMoney) formatted = `₹${formatted}`;
        if (isMillion) formatted = `${formatted}M`;
        if (isPercent) formatted = `${formatted}%`;
        
        setCount(formatted);
      } else {
        setCount(Math.max(0, currentCount));
      }

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
    return () => { isMounted = false; };
  }, [value, duration]);

  return <span>{count}</span>;
};

export default AnimatedCounter;
