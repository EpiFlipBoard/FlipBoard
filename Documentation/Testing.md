### Backend

cd BackAPI
npm ci
npm run lint
npm run test:coverage

### Frontend

cd FrontWeb
npm ci
npm run lint
npm run test:coverage

### Frontend Test Files

- App.test.jsx: Tests the main App component rendering.
- pages/Home.test.jsx: Tests Home page rendering and behavior.
- pages/Home.simple.test.jsx: Checks if main text is displayed on Home page.
- components/NavBar.test.jsx: Tests NavBar component rendering and navigation.
- components/NavBar.simple.test.jsx: Checks if NavBar displays the title.
- lib/auth.test.js: Tests authentication utility functions.
- lib/storage.test.js: Tests storage utility functions.
- setup.test.js: Sets up test environment for frontend.
- setup.js: Test setup utilities.

### Backend Test Files

- setup.js: Sets up test environment for backend.
- database.test.js: Tests database connection and basic operations.
- models/User.test.js: Tests User model logic and validation.
- models/User.simple.test.js: Checks simple User model creation.
- models/Post.test.js: Tests Post model logic and validation.
- middleware/auth.test.js: Tests authentication middleware.
- api/health.test.js: Tests health endpoint response.
- api/health.simple.test.js: Checks health endpoint returns status ok.
- api/endpoints.test.js: Tests main API endpoints.