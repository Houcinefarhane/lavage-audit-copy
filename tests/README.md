# Tests Playwright

Ce dossier contient les tests end-to-end (E2E) pour l'application Audit Lavage.

## Installation

```bash
npm install
npx playwright install
```

## Exécution des tests

### Tous les tests
```bash
npm test
```

### Interface utilisateur
```bash
npm run test:ui
```

### Mode headed (avec navigateur visible)
```bash
npm run test:headed
```

### Mode debug
```bash
npm run test:debug
```

## Structure des tests

- `landing-page.spec.ts` - Tests de la page d'accueil
- `login.spec.ts` - Tests de l'authentification
- `navigation.spec.ts` - Tests de navigation entre les pages
- `dashboard.spec.ts` - Tests du tableau de bord
- `audit-form.spec.ts` - Tests du formulaire d'audit
- `audit-list.spec.ts` - Tests de la liste des audits
- `sites.spec.ts` - Tests de la gestion des sites

## Configuration

La configuration Playwright se trouve dans `playwright.config.ts`. Par défaut, les tests s'exécutent sur :
- Chromium
- Firefox
- WebKit (Safari)

## Base URL

Par défaut, les tests utilisent `http://localhost:3000`. Vous pouvez changer cela en définissant la variable d'environnement `PLAYWRIGHT_BASE_URL`.

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 npm test
```
