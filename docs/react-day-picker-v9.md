# React Day Picker v9: Migration & Styles Guide

This document defines the changes, patterns, and style overrides required for using `react-day-picker` v9, specifically within a Shadcn UI context.

## ⚠️ Key Breaking Changes (v8 -> v9)

### 1. Component Renaming & Removals
| Legacy Component | New Component / v9 Equivalent | Notes |
| :--- | :--- | :--- |
| `IconLeft` / `IconRight` | **`Chevron`** | Use `orientation="left" \| "right"` prop to distinguish. |
| `Caption` | **`MonthCaption`** | Handles the month/year label. |
| `Day` | **`DayButton`** | The interactive button element for a day. |
| `Cell` | **`Day`** | The grid cell containing the button. |
| `HeadRow` | **`Weekdays`** | The header row with weekday names. |
| `Row` | **`Week`** | A row of days. |
| `DayContent` | *Removed* | Use `components.Day` or children props. |
| `IconDropdown` | *Removed* | Dropdown icons are now internal or managed via CSS. |

### 2. Class Name Updates (`classNames` prop)
The `classNames` prop structure has changed significantly.

*   **`caption`**: Now refers to the **header container** of the month (containing label + navigation).
*   **`month_caption`**: The actual **text label** (e.g., "December 2025"). **IMPORTANT**: When using dropdowns, you might need to hide this if it duplicates.
*   **`dropdowns`**: The container for the Month/Year dropdowns (previously accessible via `caption_dropdowns` or similar in v8 forks).
*   **`nav`**: The container for navigation buttons.
*   **`button_previous`** / **`button_next`**: Navigation button classes.
*   **`month_grid`**: The table element (previously `table`).
*   **`weekdays`**: The table header row (previously `head_row`).
*   **`weekday`**: The table header cell (previously `head_cell`).
*   **`week`**: The table body row (previously `row`).
*   **`day`**: The table body cell (previously `cell`).
*   **`day_button`**: The button inside the cell (previously `day` class on the button).

## 🚑 Troubleshooting & Common Fixes

### Issue: Duplicate "Month Year" Text with Dropdowns
**Symptoms**: You see "December 2025" text appearing next to or above your Dropdowns.
**Cause**: `react-day-picker` v9 renders a `MonthCaption` component even when `captionLayout="dropdown"`.
**Fix**: Hide the text caption using CSS/Tailwind:

```tsx
classNames={{
  // ...
  caption_label: "hidden", // Hide legacy label if present
  month_caption: "hidden", // Hide v9 text caption
  // ...
}}
```

### Issue: Dropdowns Not Centered or Disappearing
**Cause**:
1.  **Disappearing**: You might have hidden the container holding them. In v9, `dropdowns` is the specific container class.
2.  **Not Centered**: The `caption` container needs flex properties, and `dropdowns` needs `justify-center`.

**Fix**:
```tsx
classNames={{
  caption: "flex justify-between items-center w-full", // Parent container
  dropdowns: "flex justify-center w-full gap-1",       // Dropdowns container
  nav: "contents",                                     // Allows arrows to be positioned via order in parent
  // ...
}}
```

### Issue: Navigation Icons (Chevron) Build Error
**Error**: `'IconLeft' does not exist in type...`
**Fix**: v9 uses a single `Chevron` component.

```tsx
components={{
  Chevron: ({ orientation, ...props }) => {
    return orientation === "left" 
      ? <ChevronLeft {...props} /> 
      : <ChevronRight {...props} />
  }
}}
```

## 🎨 Shadcn UI `calendar.tsx` Recipe (v9 Compatible)

Use the following `classNames` configuration to maintain Shadcn aesthetics with v9 structure:

```tsx
classNames={{
  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
  month: "space-y-4",
  
  // Header / Caption Layout
  caption: "flex justify-between pt-1 relative items-center w-full",
  caption_label: "text-sm font-medium hidden", // Hide to prevent dupe
  month_caption: "text-sm font-medium hidden", // Hide to prevent dupe
  dropdowns: "flex justify-center gap-1 w-full text-center", // Style Dropdowns
  
  // Navigation
  nav: "contents", // Use contents to layout buttons + dropdowns together
  button_previous: cn(
    buttonVariants({ variant: "outline" }),
    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 order-first" // Left arrow
  ),
  button_next: cn(
    buttonVariants({ variant: "outline" }),
    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 order-last" // Right arrow
  ),
  
  // Grid
  month_grid: "w-full border-collapse space-y-1",
  weekdays: "flex",
  weekday: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
  week: "flex w-full mt-2",
  day: "h-9 w-9 text-center text-sm p-0 relative ...",
  day_button: cn(
    buttonVariants({ variant: "ghost" }),
    "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-primary hover:text-white"
  ),
  // ... other modifiers (selected, today, disabled, etc.)
}}
```
