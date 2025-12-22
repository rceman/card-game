import { useState } from 'react';
import { GameCard } from './components/GameCard';
import { Dice } from './components/Dice';
import cardImage1 from 'figma:asset/f5c14083b56fa4afc934de3d3b3ac3d062845790.png';
import cardImage2 from 'figma:asset/82cc283a0251028e37c4dd30a6134aadcf6643a0.png';

export default function App() {
  const [playerCard] = useState({
    id: 1,
    name: 'Fang',
    image: cardImage1,
    maxHp: 4300,
    currentHp: 4300,
    attack: 1360
  });

  const [enemyCards] = useState([
    {
      id: 2,
      name: 'Pearl',
      image: cardImage2,
      maxHp: 3900,
      currentHp: 1500,
      attack: 1560
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Player Card - Top Left */}
      <div className="absolute top-8 left-8">
        <GameCard card={playerCard} isPlayer={true} isActive={true} />
      </div>

      {/* Dice - Center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Dice />
      </div>

      {/* Enemy Cards - Bottom Right */}
      <div className="absolute bottom-8 right-8 flex gap-4">
        {enemyCards.map((card) => (
          <GameCard key={card.id} card={card} isPlayer={false} />
        ))}
      </div>
    </div>
  );
}