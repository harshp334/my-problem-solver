# Pokemon Type Analyzer

## Problem Statement
Many players want a quick way to know what types a Pokemon is weak to or resistant to, especially when building teams or planning battles. Manually checking multiple sources for type relations is slow and error-prone. This app provides a fast, single-page interface to analyze a Pokemon's types and show its weaknesses and resistances.

## Solution
This React app fetches a Pokemon's data and its type damage relations from the PokéAPI, computes aggregated effectiveness, and displays clear lists of what the selected Pokemon is weak against and resistant to. The UI is lightweight, searchable, and requires only a Pokemon name to produce useful results.

## API Used
- **API Name**: PokéAPI
- **API Documentation**: https://pokeapi.co/docs/v2
- **How it's used**: The app fetches Pokemon details from `https://pokeapi.co/api/v2/pokemon/{name}` to get the Pokemon's types and sprite. For each type, the app fetches the type details (damage relations) from the provided type URL to compute overall damage multipliers (double, half, immune) aggregated across the Pokemon's types.

## Features
- Search a Pokemon by name and display its sprite and types
- Compute aggregated type effectiveness (weaknesses and resistances)
- Clear, responsive UI for quick analysis
- Handles not-found and network errors gracefully

## Setup Instructions
1. Clone this repository
2. Run `npm install`
3. No API key required for PokéAPI
4. Run `npm start`
5. Open http://localhost:3000

## AI Assistance
I used Claude to help with:
- Project structuring: learned how to reorganize entry files into a `components/` folder while keeping CRA compatibility
- Troubleshooting Tailwind/PostCSS: converted Tailwind-based styling to a plain CSS approach when configuration location caused issues
- Automation tasks: scripted file moves, created symlink, and cleaned up repository tracking for large folders

## Screenshots
![App screenshot]()

## Future Improvements
- Add caching for type requests to reduce API calls and improve responsiveness
- Add fuzzy-search for Pokemon names and suggestions/autocomplete
- Add a shareable permalink for analysis results
- Add unit/integration tests and CI pipeline