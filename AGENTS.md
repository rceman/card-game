## Agent workflow

When a task requires lengthy searching, capture the relevant findings in `AGENTS.md` to speed up future work.

## Debug UI
- Location: top-left settings button in `src/app/App.tsx`.
- Visibility: dev-only via `import.meta.env.DEV`; excluded from production builds.
- Purpose: debug panel for P2 damage/defeat/heal, animation toggles, and forced dice rolls.

## Language
- All code and comments must be English only.

## Shake Animation
- Location: `src/styles/theme.css` (`@keyframes shake`, `.animate-shake`) and `src/app/components/GameCard.tsx` (damage-based shake config).
- Behavior: horizontal swing intensity and repetitions scale with damage; lower damage reduces swing and repeats.
