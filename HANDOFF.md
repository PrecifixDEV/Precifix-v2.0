# Handoff Log - 2025-12-26

## Work Completed
1.  **Company & Profile UI Refactoring**:
    -   Implemented company logo upload with HEIC support and resizing.
    -   Cleaned up `OperationalHoursForm` (removed separators, standardized buttons).
    -   Removed `ImageCropper` dependency in favor of direct upload.
2.  **Dark Mode Standardization**:
    -   Updated `index.css` to use a consistent Slate Blue 900 (`hsl(222 47% 11%)`) for cards and UI elements in dark mode.
    -   Refactored `MyCompany.tsx`, `Profile.tsx`, and `Dashboard.tsx` to use `bg-card` instead of hardcoded background colors.
3.  **Manage Costs Page**:
    -   Refactored `ManageCosts.tsx` to wrap content in `<Card>` components.
    -   Updated `FixedCostsTable`, `VariableCostsTable`, and `CostAnalysisSummary` to use the standard Card design.
4. **UI Improvements & Refactoring**:
    -   **Theme Toggle**: Moved to Sidebar footer with a new segmented control design (Sun/Moon).
    -   **Date Picker**: Implemented `DatePickerWithInput` in `CostFormDialog`, allowing both manual text input and calendar selection.
    -   **Calendar Component**: Upgraded `calendar.tsx` to support `react-day-picker` v9, enabling month/year dropdowns and fixing grid layout issues.
    -   **Light Mode**: Experimented with and then reverted a yellow-tinted light mode theme as per user request.

## Next Steps
1.  **Accounts Receivable**: Implement the new page for managing incoming payments.
2.  **Database Migration**: Ensure any pending SQL migrations (if any new ones were planned for Accounts Receivable) are applied.
3.  **Testing**: Verify the dark mode consistency across any remaining pages (e.g., Auth pages if not already checked).

## Environment
-   Node.js/Vite environment.
-   Supabase project connected.
-   Run `npm run dev` to start.
