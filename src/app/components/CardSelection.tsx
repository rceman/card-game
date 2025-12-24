import { getCardImageUrl } from '../data/cards';
import { PLAYER_ACCENTS } from '../ui/playerAccents';
import type { CardDefinition } from '../data/cards';

type SelectionStep = 'p1' | 'p2';

type CardSelectionProps = {
  step: SelectionStep;
  cards: CardDefinition[];
  selectedId: number | null;
  onSelect: (cardId: number) => void;
  onConfirm: () => void;
  onBack: () => void;
};

export function CardSelection({ step, cards, selectedId, onSelect, onConfirm, onBack }: CardSelectionProps) {
  const isPickingP1 = step === 'p1';
  const accent = isPickingP1 ? PLAYER_ACCENTS.p1 : PLAYER_ACCENTS.p2;
  const accentBorder = `${accent.border} ${accent.glow}`;
  const accentBadge = accent.badge;
  const accentButton = `${accent.button} ${accent.buttonHover} shadow-xl`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden flex items-center justify-center">
      <div className="w-full max-w-5xl px-5 py-5">
        <div className="text-center text-white text-xl font-bold mb-5">
          {isPickingP1 ? 'Player 1 Picking Card...' : 'Player 2 Picking Card...'}
        </div>

        <div className="max-h-[80vh] overflow-y-auto rounded-md">
          <div className="grid grid-cols-2 gap-2">
            {cards.map(card => {
              const isSelected = card.id === selectedId;
              const imageUrl = getCardImageUrl(card.image);
              return (
                <button
                  key={card.id}
                  onClick={() => onSelect(card.id)}
                  className={`relative rounded-lg border-3 transition-all overflow-hidden bg-slate-900/70 ${
                    isSelected ? accentBorder : 'border-transparent hover:border-white/40'
                  }`}
                >
                  {isSelected && (
                    <div className={`absolute top-2 right-2 z-10 text-white text-[11px] font-semibold px-2 py-1 rounded-full shadow-lg ${accentBadge}`}>
                      Selected
                    </div>
                  )}
                  <img
                    src={imageUrl}
                    alt={card.name}
                    className="w-full h-full object-contain"
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {!isPickingP1 && (
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-xl text-white font-semibold transition-all bg-gray-700 hover:bg-gray-600"
            >
              Back
            </button>
          )}
          <button
            onClick={onConfirm}
            disabled={!selectedId}
            className={`px-6 py-3 rounded-xl text-white font-semibold transition-all ${
              selectedId ? accentButton : 'bg-gray-700 cursor-not-allowed'
            }`}
          >
            Confirm card selection
          </button>
        </div>
      </div>
    </div>
  );
}
