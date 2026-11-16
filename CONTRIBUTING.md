# Ghid de contribuție (CONTRIBUTING.md)

Acest document descrie regulile de lucru cu Git și structura repository-ului pentru echipa proiectului.

## Structura monorepo

- `frontend/` — codul sursă pentru interfața web
- `backend/` — codul sursă pentru server / API
- `docs/` — documentație, specificații și wireframe-uri (`docs/design/wireframes/`)

## Strategie de branch-uri

- `main` — branch stabil (producție). **Nu se face push direct pe `main`.** Integrarea se face exclusiv prin Pull Request, cu **minimum 1 review** aprobat.
- `dev` — branch de integrare. Aici se îmbină funcționalitățile finalizate înainte de a fi promovate în `main`.
- `feature/SCRUM-XXX-descriere` — branch de lucru pentru fiecare tichet Jira (de exemplu: `feature/SCRUM-147-init-frontend`).

### Flux de lucru recomandat

1. Pornește de pe `dev` actualizat:
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/SCRUM-XXX-descriere
   ```
2. Fă commit-uri clare respectând convenția de mai jos.
3. Deschide un Pull Request către `dev` (sau `main` conform fluxului de release) și solicită review de la un coleg.

## Convenția de commit

Fiecare commit trebuie să înceapă cu cheia tichetului Jira urmată de două puncte și o descriere scurtă:

```text
SCRUM-XXX: descriere scurtă
```

Exemple:
- `SCRUM-122: initializare structura monorepo si reguli CONTRIBUTING`
- `SCRUM-147: configurare Vite, React, TypeScript si Tailwind`
- `SCRUM-149: implementare formular login si validare`

## Reguli de protecție pe `main`

- Merge permis doar prin Pull Request
- Minimum 1 review aprobat înainte de merge
- Fără push direct (`force push` dezactivat)
