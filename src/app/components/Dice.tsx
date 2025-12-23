import { useState } from 'react';

interface DiceProps {
  onRollComplete?: (value: number) => void;
  disabled?: boolean;
  debugValue?: number | null;
}

export function Dice({ onRollComplete, disabled = false, debugValue = null }: DiceProps) {
  const [value, setValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);

  // Use debugValue if available, otherwise use regular value
  const displayValue = debugValue || value;

  const rollDice = () => {
    if (isRolling || disabled) return;
    
    setIsRolling(true);
    let rolls = 0;
    const maxRolls = 10;
    let finalValue = 1;
    
    const interval = setInterval(() => {
      finalValue = Math.floor(Math.random() * 6) + 1;
      setValue(finalValue);
      rolls++;
      
      if (rolls >= maxRolls) {
        clearInterval(interval);
        setIsRolling(false);
        if (onRollComplete) {
          onRollComplete(finalValue);
        }
      }
    }, 100);
  };

  const renderDots = () => {
    const dots = [];
    const positions: { [key: number]: string[] } = {
      1: ['center'],
      2: ['top-left', 'bottom-right'],
      3: ['top-left', 'center', 'bottom-right'],
      4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
      6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
    };

    const dotPositions = positions[displayValue];
    
    dotPositions.forEach((pos, index) => {
      const positionClass = {
        'top-left': 'top-2 left-2',
        'top-right': 'top-2 right-2',
        'middle-left': 'top-1/2 -translate-y-1/2 left-2',
        'middle-right': 'top-1/2 -translate-y-1/2 right-2',
        'bottom-left': 'bottom-2 left-2',
        'bottom-right': 'bottom-2 right-2',
        'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
      }[pos];

      dots.push(
        <div
          key={index}
          className={`absolute w-3 h-3 bg-slate-900 rounded-full ${positionClass}`}
        />
      );
    });

    return dots;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={rollDice}
        disabled={isRolling || disabled}
        className={`w-24 h-24 bg-white rounded-2xl shadow-2xl relative border-4 border-slate-200 transition-transform ${
          isRolling ? 'animate-bounce' : ''
        } ${
          disabled || isRolling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'
        }`}
      >
        {renderDots()}
      </button>
    </div>
  );
}