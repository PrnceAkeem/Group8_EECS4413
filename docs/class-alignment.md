# EECS 4413 Class-to-Project Alignment

This document maps lecture/lab material to this project so implementation decisions stay consistent with what was taught in class.

## 1) Architecture and MVC (Lectures + Labs 3/5)

- **Presentation tier**: React pages/components in `Frontend/src`.
- **Logic tier**: Express controllers + routes in `Backend/controllers` and `Backend/routes`.
- **Data tier**: PostgreSQL via DAOs in `Backend/dao`.

Class equivalent:
- Servlet controllers -> Express controllers
- JSP/HTML views -> React pages
- Java Beans/DAO result mapping -> JS object mapping in DAO `map*()` functions

## 2) DAO Pattern and SQL (Lab 6)

- All SQL remains inside DAO files.
- Controllers must call DAO methods, not write SQL.
- Parameterized queries only (`$1`, `$2`, ...) to prevent SQL injection.
- Data shape normalization (snake_case -> camelCase) stays in DAO mapping helpers.

## 3) Session Tracking and Auth (Lab 4)

- `express-session` is used as the HttpSession equivalent.
- `requireAuth` and `requireAdmin` middleware enforce route protection.
- `AuthContext` in frontend mirrors session state for UI behavior.

## 4) GoF Patterns Used

- **Strategy**: `Frontend/src/utils/sortStrategies.js` + backend `SORT_MAP` for catalog sorting.
- **Observer**: `Frontend/src/context/AuthContext.js` updates all subscribed UI areas.
- **Singleton-style shared DB access**: exported PostgreSQL pool in `Backend/db.js`.

## 5) Phase 3 Coding Rules (Team)

- Keep each feature in three files minimum (service/page + controller/DAO/route) to preserve separation of concerns.
- Prefer small PRs by concern:
  - Cart flow
  - Checkout/order flow
  - Profile flow
  - Admin flow
- Avoid mixing schema changes with UI changes in the same PR unless required.
- Keep TODO scaffolds until fully wired to prevent partial/broken behavior.

## 6) Current Progress Snapshot

- Phase 2 catalog flow: complete and usable.
- Phase 3 backend APIs: implemented.
- Phase 3 frontend pages/services: scaffolded; implementation in progress.
