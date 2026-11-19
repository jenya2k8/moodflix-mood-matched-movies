# Moodflix Mood Matched Movies

Build a responsive, Netflix/Hotstar-style movie and series recommendation web app called "MoodFlix" using React, TypeScript, Tailwind CSS and shadcn/ui. Use a dark cinematic theme (near-black background, red/purple accent), smooth animations, and a mobile-friendly layout.

FLOW (multi-step wizard with a progress bar and Back/Next buttons):

1. Login / Sign Up page

 - Email + password, a "Continue as guest" option, and a clean hero background with posters.

 - After login, show a "Welcome back, [name]" screen.

2. Mood selection

 - Large clickable cards with emojis: Happy, Sad, Excited, Relaxed, Romantic, Thrilled, Curious, Nostalgic.

3. Content type

 - Movie / Series / Anime / Documentary.

4. Duration preference

 - Movie: Under 90 min, 90-120 min, 120+ min.

 - Series: episode length (under 30 min, 30-45 min, 45+ min) and number of episodes/seasons (short 1 season, medium 2-4, long 5+). Only show this step if Series is chosen.

5. Preferences

 - Age rating: U, UA 13+, UA 16+, A (18+).

 - Language (multi-select): Hindi, English, Tamil, Telugu, Kannada, Malayalam, Korean, Japanese etc.

 - Audio: Original or Dubbed.

 - Subtitles: On/Off, with language selection.

 - Minimum IMDb rating slider (5.0 to 9.0).

 - Genre multi-select, release era (old classics, 2000s, recent) and platform (Netflix, Prime, Hotstar, any).

6. Recommendation results page

 - Grid of cards with poster, title, IMDb rating, runtime, age rating, language and a "Why recommended" line such as "Matches your Happy mood and 90-120 min preference".

 - Sort by IMDb rating, relevance or newest. Add a "Surprise me" button.

7. Movie/Series detail page

 - Poster, synopsis, cast, genres, trailer placeholder, audio and subtitle options.

 - "Mark as Watched" button. After clicking, a modal asks for a 1-5 star rating, like/dislike and an optional note.

8. Profile & history page

 - Watch history, my ratings and watchlist.

 - "Because you liked [title]" rows and a simple recommendation algorithm: boost genres, languages and moods from highly rated titles and lower those from poorly rated ones.

TECHNICAL:

- Use a mock JSON dataset of at least 40 movies and series with fields: title, type, genres, moods, runtime, episodes, ageRating, language, dubbedLanguages, subtitles, imdbRating, year, platform, poster, description.

- Store users, preferences, history and ratings in localStorage (structured so Supabase can replace it later).

- Write the recommendation logic in a separate file (src/lib/recommend.ts) with clear comments, scoring each title by mood match, duration, age rating, language, IMDb rating and past user ratings.

- Use reusable components, React Router for pages and clean folder structure.

- Add loading skeletons, empty states ("No matches, try relaxing filters") and form validation.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://moodflix-mood-matched-movies.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b5fa094c-9d67-5e8b-b797-5076a3dfd654).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
