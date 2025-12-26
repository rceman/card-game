import { useEffect, useRef, useState } from 'react';
import { GameCard } from './components/GameCard';
import { Dice } from './components/Dice';
import { CardSelection } from './components/CardSelection';
import { Settings } from 'lucide-react';
import { CARD_DATABASE, getCardByParam, getCardImageUrl } from './data/cards';
import type { CardDefinition } from './data/cards';

interface Card {
  id: number;
  name: string;
  image: string;
  maxHp: number;
  currentHp: number;
  attack: number;
  attacksPerTurn: number;
}

export default function App() {
  const isDev = import.meta.env.DEV;
  const fallbackCard = CARD_DATABASE[0] as CardDefinition;
  const defaultPlayer = CARD_DATABASE.find(card => card.name === 'Fang') ?? fallbackCard;
  const defaultEnemy = CARD_DATABASE.find(card => card.name === 'Pearl') ?? CARD_DATABASE[1] ?? defaultPlayer;

  const createCardState = (card: CardDefinition): Card => ({
    id: card.id,
    name: card.name,
    image: getCardImageUrl(card.image),
    maxHp: card.health,
    currentHp: card.health,
    attack: card.attack,
    attacksPerTurn: card.attacksPerTurn ?? 1
  });

  const [playerCard, setPlayerCard] = useState<Card>(createCardState(defaultPlayer));

  const [enemyCards, setEnemyCards] = useState<Card[]>([createCardState(defaultEnemy)]);

  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [playerDamage, setPlayerDamage] = useState(0);
  const [enemyDamage, setEnemyDamage] = useState(0);
  const [isWaitingForNextTurn, setIsWaitingForNextTurn] = useState(false);
  const [turnProgress, setTurnProgress] = useState(0);
  const [debugMode, setDebugMode] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'player' | 'enemy' | null>(null);
  const [debugDamageP2, setDebugDamageP2] = useState(false);
  const [debugDefeatP2, setDebugDefeatP2] = useState(false);
  const [debugAnimate, setDebugAnimate] = useState(true);
  const [debugFadeOut, setDebugFadeOut] = useState(true);
  const [debugHealP2, setDebugHealP2] = useState(false);
  const [debugDiceRoll, setDebugDiceRoll] = useState<number | null>(null);
  const [lastDiceRoll, setLastDiceRoll] = useState<number | null>(null);
  const globalDiceRoll = debugDiceRoll ?? lastDiceRoll;
  const gameOverRef = useRef(gameOver);
  const [selectionStep, setSelectionStep] = useState<'p1' | 'p2' | 'done'>('p1');
  const [selectedP1Id, setSelectedP1Id] = useState<number | null>(null);
  const [selectedP2Id, setSelectedP2Id] = useState<number | null>(null);

  const startGameWithCards = (player: CardDefinition, enemy: CardDefinition) => {
    setPlayerCard(createCardState(player));
    setEnemyCards([createCardState(enemy)]);
    setIsPlayerTurn(true);
    setPlayerDamage(0);
    setEnemyDamage(0);
    setGameOver(false);
    setWinner(null);
    setIsWaitingForNextTurn(false);
    setTurnProgress(0);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p1Param = params.get('p1');
    const p2Param = params.get('p2');
    const p1Card = getCardByParam(p1Param);
    const p2Card = getCardByParam(p2Param);

    if (p1Card && p2Card) {
      setSelectionStep('done');
      setSelectedP1Id(p1Card.id);
      setSelectedP2Id(p2Card.id);
      startGameWithCards(p1Card, p2Card);
      return;
    }

    if (p1Card) {
      setSelectedP1Id(p1Card.id);
      setPlayerCard(createCardState(p1Card));
    }

    if (p2Card) {
      setSelectedP2Id(p2Card.id);
      setEnemyCards([createCardState(p2Card)]);
    }
  }, []);

  useEffect(() => {
    if (debugDiceRoll !== null) {
      setLastDiceRoll(debugDiceRoll);
    }
  }, [debugDiceRoll]);

  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

  const triggerEnemyDamage = (damage: number) => {
    setEnemyDamage(0);
    window.requestAnimationFrame(() => setEnemyDamage(damage));
  };

  const triggerPlayerDamage = (damage: number) => {
    setPlayerDamage(0);
    window.requestAnimationFrame(() => setPlayerDamage(damage));
  };

  const handleDiceRoll = (diceValue: number) => {
    if (gameOver || playerCard.currentHp <= 0 || enemyCards[0].currentHp <= 0) return;
    setIsWaitingForNextTurn(true);
    setTurnProgress(0);
    
    // Use debug dice value if set, otherwise use rolled value
    const actualDiceValue = debugDiceRoll ?? diceValue;
    setLastDiceRoll(actualDiceValue);
    
    // Animate the progress bar
    const duration = 1500; // milliseconds
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
    
    const hitIntervalMs = 200;

    if (isPlayerTurn) {
      const damage = Math.floor(playerCard.attack / actualDiceValue);
      const hits = playerCard.attacksPerTurn;

      for (let hitIndex = 0; hitIndex < hits; hitIndex += 1) {
        setTimeout(() => {
          if (gameOverRef.current) return;
          triggerEnemyDamage(damage);

          setEnemyCards(prev => prev.map(card => {
            const newHp = Math.max(0, card.currentHp - damage);
            if (newHp <= 0 && !gameOverRef.current) {
              gameOverRef.current = true;
              setGameOver(true);
              setWinner('player');
            }
            return { ...card, currentHp: newHp };
          }));
        }, hitIndex * hitIntervalMs);
      }
    } else {
      const damage = Math.floor(enemyCards[0].attack / actualDiceValue);
      const hits = enemyCards[0].attacksPerTurn;

      for (let hitIndex = 0; hitIndex < hits; hitIndex += 1) {
        setTimeout(() => {
          if (gameOverRef.current) return;
          triggerPlayerDamage(damage);

          setPlayerCard(prev => {
            const newHp = Math.max(0, prev.currentHp - damage);
            if (newHp <= 0 && !gameOverRef.current) {
              gameOverRef.current = true;
              setGameOver(true);
              setWinner('enemy');
            }
            return { ...prev, currentHp: newHp };
          });
        }, hitIndex * hitIntervalMs);
      }
    }
    
    // Switch turns after animations complete
    setTimeout(() => {
      if (!gameOverRef.current) {
        setIsPlayerTurn(!isPlayerTurn);
      }
      // Reset damage amounts after turn switch
      setPlayerDamage(0);
      setEnemyDamage(0);
      setIsWaitingForNextTurn(false);
    }, 1500);
  };

  const handlePlayAgain = () => {
    setSelectionStep('p1');
    setSelectedP1Id(null);
    setSelectedP2Id(null);
    setIsPlayerTurn(true);
    setPlayerDamage(0);
    setEnemyDamage(0);
    setGameOver(false);
    setWinner(null);
    setIsWaitingForNextTurn(false);
    setTurnProgress(0);
  };

  const handleConfirmSelection = () => {
    if (selectionStep === 'p1') {
      const chosen = CARD_DATABASE.find(card => card.id === selectedP1Id) ?? null;
      if (!chosen) return;
      setPlayerCard(createCardState(chosen));
      setSelectionStep('p2');
      return;
    }

    if (selectionStep === 'p2') {
      const chosenPlayer = CARD_DATABASE.find(card => card.id === selectedP1Id) ?? defaultPlayer;
      const chosenEnemy = CARD_DATABASE.find(card => card.id === selectedP2Id) ?? null;
      if (!chosenEnemy) return;
      startGameWithCards(chosenPlayer, chosenEnemy);
      setSelectionStep('done');
    }
  };

  if (selectionStep !== 'done') {
    const isPickingP1 = selectionStep === 'p1';
    const activeSelectionId = isPickingP1 ? selectedP1Id : selectedP2Id;
    const setActiveSelectionId = isPickingP1 ? setSelectedP1Id : setSelectedP2Id;

    return (
      <CardSelection
        step={selectionStep}
        cards={CARD_DATABASE}
        selectedId={activeSelectionId}
        onSelect={setActiveSelectionId}
        onConfirm={handleConfirmSelection}
        onBack={() => setSelectionStep('p1')}
      />
    );
  }

  return (
    <div className="appSafeArea min-h-[100dvh] bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden flex items-center justify-center">
      {isDev && (
        <>
          {/* Debug Button */}
          <button 
            onClick={() => setDebugMode(!debugMode)}
            className={`absolute top-4 left-4 p-3 rounded-full transition-all z-50 ${
              debugMode 
                ? 'bg-blue-600 hover:bg-blue-700 shadow-[0_0_20px_rgba(59,130,246,0.8)]' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <Settings className="w-6 h-6 text-white" />
          </button>

          {/* Debug Menu */}
          {debugMode && (
            <div className="absolute top-20 left-4 bg-slate-800 rounded-lg p-4 shadow-2xl border-2 border-slate-600 text-white z-50 min-w-[240px]">
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
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-gray-400">Dice Roll</div>
                <button
                  onClick={() => setDebugDiceRoll(null)}
                  className="text-[11px] px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-200 transition-all"
                >
                  Reset
                </button>
              </div>
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
        </>
      )}

      {/* Player Card - Center Top */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2">
        <GameCard 
          card={playerCard} 
          isPlayer={true}
          isActive={isPlayerTurn && !gameOver}
          damageAmount={playerDamage}
          isDefeated={gameOver && winner === 'enemy'}
          diceRoll={globalDiceRoll}
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
          damageAmount={debugDamageP2 && globalDiceRoll ? Math.floor(enemyCards[0].attack / globalDiceRoll) : enemyDamage}
          isDefeated={debugDefeatP2 || (gameOver && winner === 'player')}
          diceRoll={globalDiceRoll}
          debugMode={debugMode}
          debugAnimate={debugAnimate}
          debugFadeOut={debugFadeOut}
        />
      </div>

      {/* Dice / Play Again Button - Center (slightly below center) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ marginTop: '8px' }}>
        {!gameOver ? (
          <Dice
            onRollComplete={handleDiceRoll}
            disabled={isWaitingForNextTurn || gameOver || playerCard.currentHp <= 0 || enemyCards[0].currentHp <= 0}
            debugValue={debugDiceRoll}
            playerSide={isPlayerTurn ? 'p1' : 'p2'}
          />
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
