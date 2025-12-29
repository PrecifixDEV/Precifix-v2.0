# Tailwind CSS v4 Guide & Rules

## Overview
Tailwind CSS v4 introduces a new engine and configuration strategy, prioritizing CSS-first configuration and leveraging modern browser features.

## Key Changes from v3 -> v4

### 1. Imports
**Old (v3):**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
**New (v4):**
```css
@import "tailwindcss";
```
This single line imports all necessary styles.

### 2. Configuration (`@theme`)
Customization moves from `tailwind.config.js` to CSS `@theme` blocks.
```css
@theme {
  --color-primary: hsl(var(--primary));
  --font-sans: "Inter", sans-serif;
  --spacing-8xl: 96rem;
}
```

### 3. Custom Utilities (`@utility`)
To create custom utility classes that work with Tailwind modifiers (like `hover:`, `lg:`), use the `@utility` directive.
```css
@utility btn-primary {
  @apply bg-blue-500 text-white px-4 py-2;
}
```

### 4. Layers
Tailwind v4 uses native CSS `@layer`. It no longer "hijacks" them.
Use `@layer utilities` or `@layer components` to manage cascade order manually if needed.

### 5. Color Palette & Variables
Colors are often defined as CSS variables for easier referencing and theming (e.g., Dark Mode).
If standard colors (like `yellow-500`) are not appearing, ensure they are not overwritten or that the theme import is successful.
**Best Practice**: Use project-specific variables (e.g., `--primary`) mapped to the desired color values.

### 6. IDE Warnings
Note: Standard CSS validators in VS Code may flag `@theme`, `@utility`, or `@apply` as "Unknown at rules". This is expected until tooling updates are installed. These warnings are benign if the build compiles.

## Project Specifics
-   **Primary Color**: Defined in `:root` as `--primary` (Yellow/Orange hue).
-   **Dark Mode**: Handled via `.dark` class and CSS variables.
