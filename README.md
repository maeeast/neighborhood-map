# Portland Arts Neighborhood Map

A React single-page guide to five Portland, Maine arts destinations: Portland Museum of Art, State Theatre, Portland Stage, Merrill Auditorium, and Maine College of Art & Design. Google Maps displays the neighborhood and interactive markers. The independent Wikipedia MediaWiki API supplies a unique plain-text article extract for each selection. No Wikipedia credentials are required.

## Setup and API key

1. Install Node.js 20.19+ (Node 22 LTS or newer recommended) and npm.
2. Extract this ZIP and open a terminal inside `neighborhood-map`, the folder containing `package.json`.
3. Run `npm ci` to install the locked dependencies.
4. Copy `.env.example` to `.env`. On Windows PowerShell: `Copy-Item .env.example .env`. On macOS/Linux: `cp .env.example .env`.
5. **Enter your Google Maps API key in `.env` here:**

   ```env
   VITE_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_GOOGLE_MAPS_API_KEY
   VITE_GOOGLE_MAPS_MAP_ID=DEMO_MAP_ID
   ```

   The code reads this key in `src/MapView.jsx` and passes it to `loadMaps` in `src/maps.js`. Do not place your key in React component markup. `DEMO_MAP_ID` supports local development with Advanced Markers; use your own Google map ID for deployment.
6. In Google Cloud, enable Maps JavaScript API and billing for the key's project. Restrict the key to Maps JavaScript API and your permitted HTTP referrers, including `http://localhost:5173/*` and `http://localhost:4173/*` for local testing. Add the deployed site's domain when publishing. Browser API keys are visible to visitors, so restrictions matter. `.env` is excluded from Git and this ZIP.
7. Run `npm start` and visit the local URL printed by Vite, normally `http://localhost:5173`.
8. Restart the server after editing `.env`. Rebuild for production after changing it.

This project uses Vite, not Create React App or `react-scripts`. Install dependencies before starting. Do not run commands from the parent folder.

## Production and offline use

Run `npm run build`, then `npm run preview`. Open `http://localhost:4173` while online and wait for the service worker to activate. The worker is enabled only in production, on localhost or HTTPS. Reload once before switching the browser offline. The app shell, styles, bundled JavaScript, and hard-coded locations remain usable offline. Previously fetched Wikipedia responses are cached. Google Maps and its tiles are not cached; offline users see a visible map error and can browse the list. Unvisited Wikipedia articles display an error with a retry action.

Host the contents of `dist` at the domain root on an HTTPS static host. The root-relative service worker paths assume root hosting. Opening `index.html` with `file://` is not supported. For an updated release change the `CACHE` version in `public/sw.js` to replace the previous app cache.

## Interaction and accessibility

- All five locations appear on load.
- The labeled filter matches names, categories, and addresses without case sensitivity. Both the list and markers use the same filtered array.
- Selecting a list button or marker highlights and animates the marker, pans the map, and opens a nonmodal details panel on the page.
- Details load asynchronously, show Wikipedia attribution, and provide a link to the source article.
- The details heading receives focus on selection; Close returns focus to the corresponding list button. Because the panel is nonmodal it does not trap focus. List buttons provide a complete keyboard alternative to map navigation.
- Visible focus styles, semantic headings, buttons, labels, a skip link, live status text, and reduced-motion support are included.
- There are no content images requiring alternate text. Marker titles identify destinations.
- On small screens the list, map, and details stack without hiding controls.

## Architecture and development plan

1. Define the independent location model and filtering function.
2. Build the controlled filter and location list.
3. Load Google Maps once, create Advanced Markers once, then synchronize their visibility and selection with React state.
4. Fetch Wikipedia extracts with cancellation and a 12-second timeout to avoid stale responses.
5. Add keyboard focus management and responsive styles.
6. Cache the production app shell and visited Wikipedia responses; test failures and offline browsing.

`App.jsx` owns filter and selected-location state. `LocationList` and `MapView` receive event callbacks as props. `LocationDetails` owns its request state. `model.js` defines the five locations and shared filter. `maps.js` uses a single shared loader Promise with script, timeout, and authentication error handling. `wiki.js` checks HTTP and response-shape failures and renders text rather than remote HTML. `public/sw.js` discovers Vite's generated assets during installation and removes outdated app caches during activation.

## Verification

Run `npm test` for model/filter tests and `npm run build` for the production compilation. Before submission, use your real restricted API key and check:

1. All five markers and names appear; filter `music` leaves State Theatre and Merrill Auditorium; filter `xyz` leaves no locations or markers; clearing restores all five.
2. Click each list item and each marker. Confirm animated selection, correct heading/address, and a unique Wikipedia extract. Close returns keyboard focus to its list button.
3. Use Tab, Enter, and the skip link; verify visible focus and readable live status. Test desktop, tablet, and phone widths.
4. Block `maps.googleapis.com`, then reload. Confirm an error appears and the list remains usable. Also test an invalid key and authentication feedback.
5. Block `en.wikipedia.org`, then select an unvisited location. Confirm the error and retry button; unblock and retry.
6. Run the production preview online, wait for service worker control, visit some location details, then go offline and reload. Confirm the app shell and list render and visited details are available.
7. Check the console with a valid API key and connection. Google can emit its own errors for invalid keys or billing problems; these cannot be suppressed by application code.

Package checks completed: five model/filter tests passed, production build passed, service worker syntax passed, and all five live Wikipedia requests returned nonempty article extracts. Browser interaction and offline behavior were not verified in this environment because a browser executable was unavailable. A real Google Maps API key is needed for final map integration checks. Use the checklist above before submission.

## Attribution and references

Original project code was written for this application. No student project code was copied. Documentation informed the API integration and platform behavior:

- Google Maps JavaScript API loading: https://developers.google.com/maps/documentation/javascript/load-maps-js-api
- Advanced Markers: https://developers.google.com/maps/documentation/javascript/advanced-markers/overview
- Authentication errors: https://developers.google.com/maps/documentation/javascript/events#auth-errors
- API key security: https://developers.google.com/maps/api-security-best-practices
- Wikipedia cross-origin requests: https://www.mediawiki.org/wiki/API:Cross-site_requests
- Wikipedia text extracts: https://www.mediawiki.org/wiki/Extension:TextExtracts#API
- Wikipedia contributors: https://en.wikipedia.org/ ; article links are generated from the API response. Text is subject to Wikipedia's attribution/licensing terms, including CC BY-SA: https://creativecommons.org/licenses/by-sa/4.0/
- Service worker concepts: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- Venue reference: https://meca.edu/about/discover-portland/
- MECA&D/ICA address: https://meca.edu/ica/visit-the-ica/
- Portland Stage address: https://mainearts.maine.gov/directory/arts/detail/4116

Coordinates are fixed approximate venue points, not live geocoding or directions. No current show schedules, ticket prices, or accessibility claims are inferred from Wikipedia. Review and understand the code and follow your course's rules on AI assistance before submitting.

## Submission ZIP

Submit source files, this README, `.env.example`, and `package-lock.json`. `node_modules`, `.env`, and `dist` are excluded. Install dependencies with `npm ci` after extracting.
