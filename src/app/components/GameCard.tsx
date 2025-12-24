import { Sword } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { PLAYER_ACCENTS } from '../ui/playerAccents';

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
  diceRoll?: number | null;
  isDefeated?: boolean;
  debugMode?: boolean;
  debugAnimate?: boolean;
  debugFadeOut?: boolean;
}

type ShakeConfig = { distance: number; iterations: number; durationMs: number };

const SHAKE_BY_ROLL: Record<number, ShakeConfig> = {
  1: { distance: 30, iterations: 1.5, durationMs: 400 },
  2: { distance: 25, iterations: 1.5, durationMs: 500 },
  3: { distance: 20, iterations: 1, durationMs: 600 },
  4: { distance: 15, iterations: 1, durationMs: 600 },
  5: { distance: 10, iterations: 1, durationMs: 500 },
  6: { distance: 5, iterations: 1, durationMs: 400 },
};

export function getShakeConfig(diceRoll: unknown): ShakeConfig {
  const n = typeof diceRoll === 'number' ? diceRoll : Number(diceRoll);
  if (!isFinite(n)) return { distance: 0, iterations: 0, durationMs: 0 };

  const roll = Math.min(6, Math.max(1, Math.trunc(n)));
  return SHAKE_BY_ROLL[roll];
}

const DAMAGE_FADE_MS = 2000;
const DAMAGE_STAGGER_MS = 120;
const DAMAGE_STAGGER_MAX_MS = 360;

export function GameCard({ card, isPlayer, isActive = false, damageAmount, diceRoll = null, isDefeated = false, debugMode = false, debugAnimate = true, debugFadeOut = true }: GameCardProps) {
  const hpPercentage = (card.currentHp / card.maxHp) * 100;
  const accent = isPlayer ? PLAYER_ACCENTS.p1 : PLAYER_ACCENTS.p2;
  const activeBorder = `${accent.border} ${accent.glow}`;
  const [shake, setShake] = useState(false);
  const [redBlink, setRedBlink] = useState(false);
  const [showDefeatText, setShowDefeatText] = useState(false);
  const [damageInstances, setDamageInstances] = useState<Array<{ id: number; value: number; delayMs: number; fontSize: number; expiresAt: number }>>([]);
  const damageIdRef = useRef(0);
  const lastDamageExpireAtRef = useRef(0);

  // Calculate font size based on damage amount (5 steps, 5% reduction each)
  const calculateFontSize = (amount: number) => {
    if (!amount) return 96;
    
    const damagePercent = (amount / card.attack) * 100;
    const baseSize = 96;
    
    if (damagePercent >= 90) return baseSize; // 96px
    if (damagePercent >= 70) return baseSize * 0.95; // 91.2px
    if (damagePercent >= 50) return baseSize * 0.90; // 86.4px
    if (damagePercent >= 30) return baseSize * 0.85; // 81.6px
    if (damagePercent >= 10) return baseSize * 0.80; // 76.8px
    return baseSize * 0.75; // 72px for very low damage
  };

  const shakeConfig = getShakeConfig(diceRoll);
  const shakeTotalDurationMs = shakeConfig.durationMs * shakeConfig.iterations;
  const shouldShake = shakeConfig.iterations > 0 && shakeConfig.distance > 0;

  useEffect(() => {
    if (damageAmount && damageAmount > 0) {
      const timeouts: number[] = [];

      // Only animate and fade if not in debug mode or if animate is enabled
      if (!debugMode || debugAnimate) {
        setShake(shouldShake);
        setRedBlink(true);

        if (debugFadeOut) {
          const damageId = damageIdRef.current + 1;
          damageIdRef.current = damageId;
          const fontSize = calculateFontSize(damageAmount);
          let delayMs = 0;
          let expiresAt = 0;
          setDamageInstances(prev => {
            delayMs = Math.min(prev.length * DAMAGE_STAGGER_MS, DAMAGE_STAGGER_MAX_MS);
            expiresAt = Date.now() + DAMAGE_FADE_MS + delayMs;
            return [...prev, { id: damageId, value: damageAmount, delayMs, fontSize, expiresAt }];
          });
          lastDamageExpireAtRef.current = Math.max(lastDamageExpireAtRef.current, expiresAt);
          timeouts.push(
            window.setTimeout(() => {
              setDamageInstances(prev => prev.filter(instance => instance.id !== damageId));
            }, DAMAGE_FADE_MS + delayMs)
          );
        } else {
          setDamageInstances([{
            id: damageIdRef.current + 1,
            value: damageAmount,
            delayMs: 0,
            fontSize: calculateFontSize(damageAmount),
            expiresAt: Date.now()
          }]);
          damageIdRef.current += 1;
        }

        // Remove shake after animation
        if (shouldShake) {
          timeouts.push(window.setTimeout(() => setShake(false), shakeTotalDurationMs));
        }
        
        // Remove red blink
        timeouts.push(window.setTimeout(() => setRedBlink(false), 300));
      } else {
        setDamageInstances([{
          id: damageIdRef.current + 1,
          value: damageAmount,
          delayMs: 0,
          fontSize: calculateFontSize(damageAmount),
          expiresAt: Date.now()
        }]);
        damageIdRef.current += 1;
      }

      return () => {
        timeouts.forEach(timeoutId => window.clearTimeout(timeoutId));
      };
    } else if (!debugFadeOut) {
      setDamageInstances([]);
    }
  }, [damageAmount, debugMode, debugAnimate, debugFadeOut, shouldShake, shakeTotalDurationMs]);

  useEffect(() => {
    if (!isDefeated) {
      setShowDefeatText(false);
      return;
    }

    const delayMs = !debugFadeOut ? 0 : 1500;
    const timeoutId = window.setTimeout(() => setShowDefeatText(true), delayMs);

    return () => window.clearTimeout(timeoutId);
  }, [isDefeated, damageAmount, debugFadeOut, damageInstances]);

  return (
    <div className={`relative w-72 h-72 transform transition-transform ${isActive ? 'scale-[1.05]' : 'scale-100'}`}>
      {/* DEFEAT Text - Outside card frame so it stays red */}
      {showDefeatText && (
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
      {damageInstances.map((instance, index) => (
        <div
          key={instance.id}
          className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          style={{
            transform: `translateY(${(index % 2 === 0 ? -20 : 20)}px)`,
            opacity: !debugFadeOut ? 1 : undefined
          }}
        >
          <div
            className={debugFadeOut ? 'animate-fade-out' : ''}
            style={{
              animationDelay: debugFadeOut ? `${instance.delayMs}ms` : undefined
            }}
          >
            <div
              style={{
              fontSize: `${instance.fontSize}px`,
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
              -{instance.value}
            </div>
          </div>
        </div>
      ))}
      
      {/* Card Frame */}
      <div
        className={`w-full h-full bg-gradient-to-b from-amber-700 to-amber-800 rounded-2xl border-4 ${
        isActive 
          ? activeBorder
          : 'border-gray-600'
      } shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${shake ? 'animate-shake' : ''} ${redBlink ? 'animate-red-blink' : ''} ${isDefeated ? 'grayscale' : ''}`}
        style={{
          opacity: isActive ? 1 : 0.95,
          '--shake-distance': `${shakeConfig.distance}px`,
          '--shake-duration': `${shakeConfig.durationMs}ms`,
          '--shake-iterations': `${shakeConfig.iterations}`
        } as CSSProperties}
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
          ? activeBorder
          : 'border-gray-600'
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
