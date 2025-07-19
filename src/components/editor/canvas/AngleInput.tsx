// src/components/editor/canvas/AngleInput.tsx

import React, { useState, useEffect } from 'react';

const ArrowButton = ({ children, onClick }: { children: React.ReactNode; onClick: () => void; }) => (
    <button
        className="w-4 h-4 flex items-center justify-center bg-gray-600 hover:bg-blue-500 rounded-sm text-white transition-colors"
        onClick={onClick}
        onPointerDown={(e) => e.stopPropagation()}
    >
        {children}
    </button>
);

export const AngleInput = ({ label, value, onChange }: {
    label?: string; // <-- NEW: Optional label prop
    value: number;
    onChange: (newValue: number) => void;
}) => {
    const [displayValue, setDisplayValue] = useState(value.toFixed(0));

    useEffect(() => {
        setDisplayValue(value.toFixed(0));
    }, [value]);

    const commitChange = (val: number) => {
        if (!isNaN(val)) {
            onChange(val);
        }
    };

    const handleIncrement = () => commitChange(Math.round(value) + 1);
    const handleDecrement = () => commitChange(Math.round(value) - 1);

    const handleBlur = () => {
        const numericValue = parseFloat(displayValue);
        commitChange(numericValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        e.stopPropagation();
        if (e.key === 'Enter') {
            const numericValue = parseFloat(displayValue);
            commitChange(numericValue);
            (e.target as HTMLInputElement).blur();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            handleIncrement();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            handleDecrement();
        } else if (e.key === 'Escape') {
            setDisplayValue(value.toFixed(0));
            (e.target as HTMLInputElement).blur();
        }
    };

    return (
        <div 
            className="flex items-center gap-2 bg-black/80 p-1 rounded text-xs font-mono backdrop-blur-sm w-full"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
        >
            {/* NEW: Display the label if it exists */}
            {label && <span className="font-bold text-blue-400 w-3 text-center">{label}</span>}
            <input
                type="text"
                className="w-10 p-0.5 text-center bg-transparent text-white focus:bg-gray-700 rounded-sm outline-none"
                value={displayValue}
                onChange={(e) => setDisplayValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
            />
            <span className="text-gray-400 select-none">°</span>
            <div className="flex flex-col gap-0.5">
                <ArrowButton onClick={handleIncrement}>▲</ArrowButton>
                <ArrowButton onClick={handleDecrement}>▼</ArrowButton>
            </div>
        </div>
    );
};