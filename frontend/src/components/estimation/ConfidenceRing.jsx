import React from 'react';

const ConfidenceRing = ({ confidence = 0, size = 100 }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const progress = (confidence / 100) * circumference;

    const getColor = (val) => {
        if (val >= 85) return '#22c55e';
        if (val >= 70) return 'var(--primary)';
        if (val >= 50) return '#f59e0b';
        return '#ef4444';
    };

    const getLabel = (val) => {
        if (val >= 85) return 'High';
        if (val >= 70) return 'Good';
        if (val >= 50) return 'Fair';
        return 'Low';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--border)" strokeWidth="8" />
                <circle
                    cx="50" cy="50" r={radius} fill="none"
                    stroke={getColor(confidence)}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${progress} ${circumference}`}
                    style={{ transition: 'stroke-dasharray 1s ease-out' }}
                />
                <text
                    x="50" y="50"
                    textAnchor="middle" dominantBaseline="central"
                    fill={getColor(confidence)}
                    fontSize="22" fontWeight="800"
                    style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}
                >
                    {Math.round(confidence)}
                </text>
            </svg>
            <span style={{ fontSize: '0.7rem', fontWeight: '600', color: getColor(confidence), textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {getLabel(confidence)} Confidence
            </span>
        </div>
    );
};

export default ConfidenceRing;
