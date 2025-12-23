import { useState } from 'react';
import { GameCard } from './components/GameCard';
import { Dice } from './components/Dice';
import { Settings } from 'lucide-react';
import cardImage1 from 'figma:asset/f5c14083b56fa4afc934de3d3b3ac3d062845790.png';
import cardImage2 from 'figma:asset/82cc283a0251028e37c4dd30a6134aadcf6643a0.png';

interface Card {
  id: number;
  name: string;
  image: string;
  maxHp: number;
  currentHp: number;
  attack: number;
}

export default function App() {
  const [playerCard, setPlayerCard] = useState<Card>({
    id: 1,
    name: 'Fang',
    image: cardImage1,
    maxHp: 4300,
    currentHp: 4300,
    attack: 1360
  });

  const [enemyCards, setEnemyCards] = useState<Card[]>([
    {
      id: 2,
      name: 'Pearl',
      image: cardImage2,
      maxHp: 3900,
      currentHp: 3900,
      attack: 1560
    }
  ]);

  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [playerDamage, setPlayerDamage] = useState(0);
  const [enemyDamage, setEnemyDamage] = useState(0);
  const [isWaitingForNextTurn, setIsWaitingForNextTurn] = useState(false);
  const [turnProgress, setTurnProgress] = useState(0);
  const [debugMode, setDebugMode] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'player' | 'enemy' | null>(null);
  const [debugDamageP1, setDebugDamageP1] = useState(false);
  const [debugDamageP2, setDebugDamageP2] = useState(false);
  const [debugDefeatP1, setDebugDefeatP1] = useState(false);
  const [debugDefeatP2, setDebugDefeatP2] = useState(false);
  const [debugAnimate, setDebugAnimate] = useState(true);
  const [debugFadeOut, setDebugFadeOut] = useState(true);
  const [debugHealP2, setDebugHealP2] = useState(false);
  const [debugDiceRoll, setDebugDiceRoll] = useState<number | null>(null);

  const handleDiceRoll = (diceValue: number) => {
    setIsWaitingForNextTurn(true);
    setTurnProgress(0);
    
    // Use debug dice value if set, otherwise use rolled value
    const actualDiceValue = debugDiceRoll || diceValue;
    
    // Animate the progress bar
    const duration = 2500; // milliseconds
    const interval = 50; // update every 50ms
    const steps = duration / interval;
    let currentStep = 0;
    
    const progressInterval = setInterval(() => {
      currentStep++;
      setTurnProgress((currentStep / steps) * 100);
      
      if (currentStep >= steps) {
        clearInterval(progressInterval);
      }
    }, interval);
    
    if (isPlayerTurn) {
      // Player attacks enemy
      const damage = Math.floor(playerCard.attack / actualDiceValue);
      setEnemyDamage(damage);
      
      setTimeout(() => {
        setEnemyCards(prev => prev.map(card => {
          const newHp = Math.max(0, card.currentHp - damage);
          return { ...card, currentHp: newHp };
        }));
        
        // Check if enemy is defeated
        const newEnemyHp = Math.max(0, enemyCards[0].currentHp - damage);
        if (newEnemyHp <= 0) {
          setGameOver(true);
          setWinner('player');
        }
      }, 500);
    } else {
      // Enemy attacks player
      const damage = Math.floor(enemyCards[0].attack / actualDiceValue);
      setPlayerDamage(damage);
      
      setTimeout(() => {
        setPlayerCard(prev => {
          const newHp = Math.max(0, prev.currentHp - damage);
          if (newHp <= 0) {
            setGameOver(true);
            setWinner('enemy');
          }
          return { ...prev, currentHp: newHp };
        });
      }, 500);
    }
    
    // Switch turns after animations complete
    setTimeout(() => {
      setIsPlayerTurn(!isPlayerTurn);
      // Reset damage amounts after turn switch
      setPlayerDamage(0);
      setEnemyDamage(0);
      setIsWaitingForNextTurn(false);
    }, 2500);
  };

  const handlePlayAgain = () => {
    setPlayerCard({
      id: 1,
      name: 'Fang',
      image: cardImage1,
      maxHp: 4300,
      currentHp: 4300,
      attack: 1360
    });
    
    setEnemyCards([{
      id: 2,
      name: 'Pearl',
      image: cardImage2,
      maxHp: 3900,
      currentHp: 3900,
      attack: 1560
    }]);
    
    setIsPlayerTurn(true);
    setPlayerDamage(0);
    setEnemyDamage(0);
    setGameOver(false);
    setWinner(null);
    setIsWaitingForNextTurn(false);
    setTurnProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden flex items-center justify-center">
      {/* Debug Button */}
      <button 
        onClick={() => setDebugMode(!debugMode)}
        className={`absolute top-4 right-4 p-3 rounded-full transition-all z-50 ${
          debugMode 
            ? 'bg-blue-600 hover:bg-blue-700 shadow-[0_0_20px_rgba(59,130,246,0.8)]' 
            : 'bg-gray-700 hover:bg-gray-600'
        }`}
      >
        <Settings className="w-6 h-6 text-white" />
      </button>

      {/* Debug Menu */}
      {debugMode && (
        <div className="absolute top-20 right-4 bg-slate-800 rounded-lg p-4 shadow-2xl border-2 border-slate-600 text-white z-50 min-w-[240px]">
          <div className="space-y-3">
            {/* P2 Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => setDebugDamageP2(!debugDamageP2)}
                className={`w-full px-3 py-2 rounded text-sm transition-all ${
                  debugDamageP2 ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                Damage P2
              </button>
              
              <button
                onClick={() => setDebugDefeatP2(!debugDefeatP2)}
                className={`w-full px-3 py-2 rounded text-sm transition-all ${
                  debugDefeatP2 ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                Defeat P2
              </button>
              
              <button
                onClick={() => setDebugHealP2(!debugHealP2)}
                className={`w-full px-3 py-2 rounded text-sm transition-all ${
                  debugHealP2 ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                Heal P2
              </button>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-slate-600">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="animate"
                  checked={debugAnimate}
                  onChange={(e) => setDebugAnimate(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                <label htmlFor="animate" className="text-sm cursor-pointer">
                  Animate
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fadeOut"
                  checked={debugFadeOut}
                  onChange={(e) => setDebugFadeOut(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                <label htmlFor="fadeOut" className="text-sm cursor-pointer">
                  Fade Out
                </label>
              </div>
            </div>

            {/* Dice Roll Section */}
            <div className="pt-2 border-t border-slate-600">
              <div className="text-xs mb-2 text-gray-400">Dice Roll</div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <label key={num} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="diceRoll"
                      checked={debugDiceRoll === num}
                      onChange={() => setDebugDiceRoll(num)}
                      className="sr-only"
                    />
                    <div className={`w-8 h-8 flex items-center justify-center rounded border-2 text-sm transition-all ${
                      debugDiceRoll === num 
                        ? 'bg-blue-600 border-blue-400 text-white' 
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    }`}>
                      {num}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Player Card - Center Top */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2">
        <GameCard 
          card={playerCard} 
          isPlayer={true}
          isActive={isPlayerTurn && !gameOver}
          damageAmount={playerDamage}
          isDefeated={gameOver && winner === 'enemy'}
          debugMode={debugMode}
          debugAnimate={debugAnimate}
          debugFadeOut={debugFadeOut}
        />
      </div>

      {/* Enemy Card - Center Bottom */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
        <GameCard 
          card={enemyCards[0]} 
          isPlayer={false}
          isActive={!isPlayerTurn && !gameOver}
          damageAmount={debugDamageP2 && debugDiceRoll ? Math.floor(enemyCards[0].attack / debugDiceRoll) : enemyDamage}
          isDefeated={debugDefeatP2 || (gameOver && winner === 'player')}
          debugMode={debugMode}
          debugAnimate={debugAnimate}
          debugFadeOut={debugFadeOut}
        />
      </div>

      {/* Dice / Play Again Button - Center (slightly below center) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ marginTop: '8px' }}>
        {!gameOver ? (
          <Dice onRollComplete={handleDiceRoll} disabled={isWaitingForNextTurn} debugValue={debugDiceRoll} />
        ) : (
          <button
            onClick={handlePlayAgain}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl shadow-2xl transition-all transform hover:scale-105"
          >
            Play Again
          </button>
        )}
      </div>

      {/* Turn Progress Bar */}
      {isWaitingForNextTurn && (
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gray-800">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-50"
            style={{ width: `${turnProgress}%` }}
          />
        </div>
      )}
    </div>
  );
}