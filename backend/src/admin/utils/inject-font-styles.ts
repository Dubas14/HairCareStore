/**
 * HAIR LAB Admin Font Size Override
 * Інжектує CSS для збільшення шрифтів в Medusa Admin
 */

const STYLE_ID = "hair-lab-font-override"

const CSS_CONTENT = `
/* ============================================
   HAIR LAB Admin Font Size Override
   Збільшення шрифтів для кращої читабельності
   ============================================ */

/* Base font size increase */
:root {
  font-size: 18px !important;
}

/* Body text */
body {
  font-size: 16px !important;
  line-height: 1.7 !important;
}

/* Compact text classes */
.txt-compact-xsmall {
  font-size: 14px !important;
}

.txt-compact-small {
  font-size: 16px !important;
}

.txt-compact-medium {
  font-size: 17px !important;
}

.txt-compact-large {
  font-size: 19px !important;
}

.txt-compact-xlarge {
  font-size: 24px !important;
}

/* Regular text classes */
.txt-xsmall {
  font-size: 14px !important;
}

.txt-small {
  font-size: 16px !important;
}

.txt-medium {
  font-size: 17px !important;
}

.txt-large {
  font-size: 19px !important;
}

.txt-xlarge {
  font-size: 24px !important;
}

/* Headings */
h1 {
  font-size: 32px !important;
}

h2 {
  font-size: 26px !important;
}

h3 {
  font-size: 22px !important;
}

h4 {
  font-size: 18px !important;
}

/* Table cells */
table {
  font-size: 14px !important;
}

td, th {
  font-size: 14px !important;
  padding: 12px 16px !important;
}

/* Form inputs */
input,
textarea,
select {
  font-size: 15px !important;
  padding: 10px 14px !important;
}

/* Buttons */
button {
  font-size: 14px !important;
}

/* Sidebar navigation */
nav a,
nav span,
nav button {
  font-size: 14px !important;
}

/* Labels */
label {
  font-size: 14px !important;
}

/* Badges and tags - make them slightly bigger */
[class*="bg-ui-tag"] {
  font-size: 12px !important;
  padding: 4px 8px !important;
}

/* Dropdown menus */
[role="menuitem"],
[role="option"] {
  font-size: 14px !important;
  padding: 10px 14px !important;
}

/* Modal and drawer content */
[role="dialog"] {
  font-size: 15px !important;
}

/* Code blocks */
code, pre {
  font-size: 13px !important;
}

/* Placeholder text */
::placeholder {
  font-size: 14px !important;
}

/* Improve overall spacing */
.p-4 {
  padding: 18px !important;
}

.p-6 {
  padding: 26px !important;
}

/* Container max-width for better readability */
.container {
  max-width: 1400px !important;
}
`

export function injectFontStyles(): void {
  // Check if already injected
  if (typeof document === "undefined") return
  if (document.getElementById(STYLE_ID)) return

  const style = document.createElement("style")
  style.id = STYLE_ID
  style.textContent = CSS_CONTENT
  document.head.appendChild(style)
}

export function removeFontStyles(): void {
  if (typeof document === "undefined") return
  const style = document.getElementById(STYLE_ID)
  if (style) {
    style.remove()
  }
}
