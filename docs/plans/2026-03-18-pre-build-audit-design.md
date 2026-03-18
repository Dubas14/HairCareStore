# Pre-Build Audit — Design Document

**Date**: 2026-03-18
**Branch**: codex/new-design
**Scope**: 20 pages, 136 components

**Rule: No design changes, no new features. Only fixes, optimization, and polish.**

---

## Phase 1 — Code Cleanliness (build-blocking first)

### 1.1 Critical errors
- `components/shop/product-grid.tsx` — move `useRef`/`useEffect` before early return (rules-of-hooks)

### 1.2 Lint warnings
- 3 files: replace `<img>` with `<Image />` (next/image)
- 2 files: fix useEffect missing dependencies (useCallback)

### 1.3 TypeScript
- Run `npm run type-check`, fix real errors only

### 1.4 Dead code
- Find unused exports/imports/components, remove confirmed dead code

### 1.5 Validation
- `npm run build` — no errors, no warnings
- `npm run lint` — clean

---

## Phase 2 — Security

### 2.1 Environment variables
- Verify no secrets in `NEXT_PUBLIC_*`
- Verify `.gitignore` covers `.env.local`

### 2.2 XSS
- Audit unsafe HTML rendering usage
- Check user input escaping (URL params, search)
- Ensure HTML content is sanitized with DOMPurify or equivalent

### 2.3 Auth & access
- Verify `/account/*` route protection
- Check cookie flags (httpOnly, secure, sameSite)
- Verify Payload admin `/admin` is protected

### 2.4 Server Actions
- Verify Zod input validation on all actions

### 2.5 Payload queries
- Check user input not passed raw into `where` clauses
- Verify collection access control

### 2.6 Dependencies
- `npm audit` — fix critical/high with patch updates only

---

## Phase 3 — Performance

### 3.1 Bundle analysis
- Run `@next/bundle-analyzer`, find heaviest modules
- Verify tree-shaking (GSAP, Embla, Lucide)
- Verify server libs not in client bundle

### 3.2 Dynamic imports
- Chat widget — dynamic import with ssr: false
- GSAP animations — lazy load
- Other heavy below-fold components

### 3.3 Images
- All Image components have width/height or fill
- Verify sizes prop on responsive images
- Hero images have priority, rest lazy loading

### 3.4 SSR/CSR balance
- Remove unnecessary 'use client' directives
- Ensure product/blog lists render server-side

### 3.5 Validation
- Compare build size before/after
- Lighthouse scores on key pages

---

## Phase 4 — Mobile

### 4.1 Overflow & scroll
- Test every page at 375px and 390px
- Fix horizontal scroll issues
- Fix tables, long words, images breaking layout

### 4.2 Touch targets
- Minimum 44x44px on buttons, links, icons
- Especially checkout flow

### 4.3 Forms
- Correct input type attributes
- Font-size >= 16px on inputs (prevent zoom)
- Keyboard does not cover active field

### 4.4 Navigation
- Mobile menu works correctly
- Cart drawer does not break body scroll
- Modals close properly

### 4.5 Validation
- Playwright screenshots at 375px per page
- Fix only broken elements

---

## Phase 5 — UI Polish (no design changes)

### 5.1 Color consistency
- Replace hardcoded hex/rgb with CSS token variables

### 5.2 Spacing & typography
- Consistent Tailwind spacing scale
- Correct font family usage per system

### 5.3 Interactive states
- Hover/focus/active on all interactive elements
- Focus-visible for keyboard nav
- Disabled states where needed

### 5.4 Loading states
- Fix missing loading/skeleton on critical paths only
- Async button loading indicators

### 5.5 Validation
- Visual check desktop + mobile
- Clean build
