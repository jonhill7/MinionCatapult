# Minion Catapult

A projectile motion simulator for teaching algebra to middle school students. A minion gets launched from a catapult; physics, trajectory chart, and stats update in real time.

## Educational purpose

The primary use case is having students read the parabola equation displayed in the bottom panel, then use it to predict where the minion will land — before or instead of just watching the simulation. The target audience is middle schoolers, so clarity and engagement matter more than mathematical rigor.

Future educational uses are TBD.

## Running the project

No build step. Push to git and Vercel serves it. To test locally, open `index.html` directly in a browser or use any static file server (e.g. `npx live-server`).

## Architecture

Plain HTML/CSS/JS — no framework, no bundler, no npm.

| File | Responsibility |
|---|---|
| `index.html` | DOM structure |
| `style.css` | All styles |
| `planets.js` | Planet data array (name, gravity, theme) |
| `physics.js` | `createInitialState`, `updatePhysics` — no DOM |
| `renderer.js` | All canvas drawing — no DOM queries, takes `(ctx, canvas, state)` |
| `chart-manager.js` | Chart.js wrapper (`initChart`, `resetChart`, `updateChart`) |
| `app.js` | Wires everything together: event listeners, animation loop, state |

Chart.js is loaded via CDN in `index.html`.

## Key conventions

- **renderer.js is pure**: drawing functions take explicit arguments, never touch the DOM or global state.
- **physics.js is pure**: no rendering or DOM side effects.
- **app.js owns state**: `simState` is the single source of truth; all other modules read from it.
- The Newton minion (bottom panel) is drawn on a small fixed canvas (`#newton-canvas`, 80×90px) and redrawn on each animation frame with an expression derived from `simState`.
- The spacesuit (shown on non-Earth planets) is drawn as a transparent circular dome overlaid on the normal yellow minion — not a separate character.
