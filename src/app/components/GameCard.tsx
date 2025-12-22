import { Sword } from 'lucide-react';

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
}

export function GameCard({ card, isPlayer, isActive = false }: GameCardProps) {
  const hpPercentage = (card.currentHp / card.maxHp) * 100;

  return (
    <div className="relative w-72 h-72">
      {/* Card Frame */}
      <div className={`w-full h-full bg-gradient-to-b from-amber-600 to-amber-800 rounded-2xl border-4 ${isActive ? 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.8)]' : 'border-amber-400'} shadow-2xl overflow-hidden flex flex-col transition-all duration-300`}>
        {/* Card Image */}
        <div className="h-52 overflow-hidden relative flex-shrink-0">
          <img 
            src={card.image} 
            alt={card.name}
            className="w-full h-full object-cover object-top"
          />
        </div>

        {/* Card Info Section */}
        <div className="flex-1 p-4 bg-gradient-to-b from-slate-800 to-slate-900 flex items-center">
          <div className="flex justify-between items-center text-white w-full text-lg">
            <div>{card.name}</div>
            <div className="flex items-center gap-2">
              <Sword className="w-4 h-4" />
              <div>{card.attack}</div>
            </div>
          </div>
        </div>
      </div>

      {/* HP Bar */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-60 h-8 bg-slate-700 rounded-full border-2 border-slate-600 overflow-hidden shadow-lg">
        <div 
          className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300"
          style={{ width: `${hpPercentage}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8)' }}>
          {card.currentHp} / {card.maxHp}
        </div>
      </div>
    </div>
  );
}