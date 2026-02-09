import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Initialize i18n for tests
i18n
  .use(initReactI18next)
  .init({
    lng: 'fr',
    fallbackLng: 'fr',
    ns: ['translation'],
    defaultNS: 'translation',
    resources: {
      fr: {
        translation: {
          nav: {
            home: 'Accueil',
            for_you: 'Pour vous',
            todays_edition: 'Édition du jour',
            search_placeholder: 'Rechercher sur EPI-Flipboard',
            create_article: 'Créer un article',
            following: 'Abonnements',
            account: 'Compte',
            settings: 'Paramètres',
            dark_mode: 'Mode sombre',
            logout: 'Déconnexion',
            newsletter: 'Newsletter',
            signup: 'S\'inscrire',
            login: 'Connexion',
          },
          home: {
            hero_title_1: 'RESTEZ INFORMÉS',
            hero_title_2: 'TROUVEZ DE L\'INSPIRATION',
          }
        }
      }
    },
    interpolation: {
      escapeValue: false,
    },
  });

// Mock localStorage with a proper implementation
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
global.localStorage = localStorageMock;

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
if (typeof window !== 'undefined') {
  window.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords() {
      return [];
    }
    unobserve() {}
  };
}
