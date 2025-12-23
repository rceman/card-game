import { Sword } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CardData {
  id: number;
  name: string;
  image: string;
  maxHp: number;
  currentHp: number;
  attack: number;
}

interface GameCardProps {
  card: CardData;
  isPlayer: boolean;
  isActive?: boolean;
  damageAmount?: number;
  isDefeated?: boolean;
  debugMode?: boolean;
  debugAnimate?: boolean;
  debugFadeOut?: boolean;
}

export function GameCard({ card, isPlayer, isActive = false, damageAmount, isDefeated = false, debugMode = false, debugAnimate = true, debugFadeOut = true }: GameCardProps) {
  const hpPercentage = (card.currentHp / card.maxHp) * 100;
  const [showDamage, setShowDamage] = useState(false);
  const [shake, setShake] = useState(false);
  const [redBlink, setRedBlink] = useState(false);

  // Calculate font size based on damage amount (5 steps, 5% reduction each)
  const calculateFontSize = () => {
    if (!damageAmount) return 96;
    
    const damagePercent = (damageAmount / card.attack) * 100;
    const baseSize = 96;
    
    if (damagePercent >= 90) return baseSize; // 96px
    if (damagePercent >= 70) return baseSize * 0.95; // 91.2px
    if (damagePercent >= 50) return baseSize * 0.90; // 86.4px
    if (damagePercent >= 30) return baseSize * 0.85; // 81.6px
    if (damagePercent >= 10) return baseSize * 0.80; // 76.8px
    return baseSize * 0.75; // 72px for very low damage
  };

  const fontSize = calculateFontSize();

  useEffect(() => {
    if (damageAmount && damageAmount > 0) {
      setShowDamage(true);
      
      // Only animate and fade if not in debug mode or if animate is enabled
      if (!debugMode || debugAnimate) {
        setShake(true);
        setRedBlink(true);

        // Remove shake after animation
        setTimeout(() => setShake(false), 500);
        
        // Remove red blink
        setTimeout(() => setRedBlink(false), 300);

        // Remove damage number after fade (only if not in debug mode)
        if (!debugMode || debugFadeOut) {
          setTimeout(() => setShowDamage(false), 2000);
        }
      }
    } else {
      setShowDamage(false);
    }
  }, [damageAmount, debugMode, debugAnimate, debugFadeOut]);

  return (
    <div className="relative w-72 h-72">
      {/* DEFEAT Text - Outside card frame so it stays red */}
      {isDefeated && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: '#ff0000',
              textShadow: `
                -4px -4px 0 #000,
                4px -4px 0 #000,
                -4px 4px 0 #000,
                4px 4px 0 #000,
                -4px 0 0 #000,
                4px 0 0 #000,
                0 -4px 0 #000,
                0 4px 0 #000,
                0 0 20px rgba(255, 0, 0, 0.9)
              `
            }}
          >
            DEFEAT
          </div>
        </div>
      )}
      
      {/* Damage Number - Centered on Card */}
      {showDamage && damageAmount && damageAmount > 0 && (
        <div 
          className={`absolute inset-0 flex items-center justify-center z-50 pointer-events-none ${debugFadeOut ? 'animate-fade-out' : ''}`}
          style={!debugFadeOut ? { opacity: 1 } : undefined}
        >
          <div
            style={{
              fontSize: `${fontSize}px`,
              fontWeight: 'bold',
              color: '#ff2222',
              textShadow: `
                -3px -3px 0 #000,
                3px -3px 0 #000,
                -3px 3px 0 #000,
                3px 3px 0 #000,
                -3px 0 0 #000,
                3px 0 0 #000,
                0 -3px 0 #000,
                0 3px 0 #000,
                0 0 10px rgba(255, 0, 0, 0.8)
              `
            }}
          >
            -{damageAmount}
          </div>
        </div>
      )}
      
      {/* Card Frame */}
      <div
        className={`w-full h-full bg-gradient-to-b from-amber-600 to-amber-800 rounded-2xl border-4 ${
        isActive 
          ? 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.8)]' 
          : 'border-gray-500'
      } shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${shake ? 'animate-shake' : ''} ${redBlink ? 'animate-red-blink' : ''} ${isDefeated ? 'grayscale' : ''}`}
        style={{ opacity: isActive ? 1 : 0.95 }}
      >
        
        {/* Card Image */}
        <div className="h-52 overflow-hidden relative flex-shrink-0">
          <img 
            src={card.image} 
            alt={card.name}
            className="w-full h-full object-cover object-top"
          />
        </div>

        {/* Card Info Section */}
        <div className="flex-1 p-4 py-3 pb-6 bg-gradient-to-b from-slate-800 to-slate-900 flex items-center">
          <div className="flex justify-between items-center text-white w-full text-lg">
            <div className="uppercase font-bold">{card.name}</div>
            <div className="flex items-center gap-2">
              <Sword className="w-4 h-4" />
              <div>{card.attack}</div>
            </div>
          </div>
        </div>
      </div>

      {/* HP Bar */}
      <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 w-60 h-10 bg-slate-700 rounded-full border-4 overflow-hidden shadow-lg transition-all duration-300 ${
        isActive 
          ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]' 
          : 'border-gray-500'
      }`}>
        <div 
          className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300"
          style={{ width: `${hpPercentage}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8)' }}>
          {card.currentHp} / {card.maxHp}
        </div>
      </div>
    </div>
  );
}
