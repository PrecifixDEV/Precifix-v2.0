# Handoff Documentation - Precifix v2.0
**Date:** 2025-12-22
**Status:** Active Development (Auth & Database Schema)

## 📌 Context
This project is an ERP SaaS for automotive aesthetics ("Precifix"). We are currently finalizing the **Authentication Flow** and verifying the **Database Schema**.

## ✅ Recently Completed Tasks

### 1. Authentication UI & Security
-   **Password Rules:** Enforced minimum 6 chars, 1 uppercase, 1 number.
-   **Password Tooltip:** Added a floating balloon in `UpdatePassword.tsx` that shows real-time validation feedback.
-   **Visibility Toggle:** Implemented the "Eye" icon to show/hide passwords in `Login`, `Register`, and `UpdatePassword`.
    -   Modified `Input.tsx` to accept `endIcon` and `onEndIconClick`.
-   **Localization:** Ensured error messages are translated via `translateAuthError`.

### 2. Project Identity
-   Updated `index.html` title to **"Precifix (teste)"**.
-   Restored favicon from backup to `public/favicon.ico`.

### 3. Database Schema (Supabase)
-   **Table:** `profiles`
    -   Added `subscription_status` (default: 'trial').
    -   Added `trial_ends_at` (timestamp).
    -   Added `kiwify_subscription_id` (text).
-   **Trigger:** `handle_new_user`
    -   Updated to set `trial_ends_at` = `now() + 7 days`.
    -   Updated to set `subscription_status` = 'trial'.
    -   Fixed missing `shop_name` insertion.

## 🚧 Pending / Next Steps
1.  **Verify Trial Logic:** Ensure the application correctly handles the 7-day trial logic (UI display, restrictions).
2.  **Kiwify Integration:** The field `kiwify_subscription_id` exists but is not yet populated or used. Future webhook integration needed.
3.  **Dashboard/protected routes:** Verify that redirection after login works and context (User/Session) is correctly managed.

## 🤖 Instructions for the Next Agent
-   **Project Stack:** React + Vite + TailwindCSS + Supabase.
-   **Auth Errors:** Always use `src/utils/authErrors.ts` for user-facing error strings.
-   **Components:** Reusable UI components are in `src/components/ui`.
-   **Database:** Accessing `apolepcifxsxvydfouop` (Precifix v2.0).

## 📝 Usage
When starting on the new machine:
1.  `git pull`
2.  `npm install`
3.  `npm run dev`
4.  Review this file to recall verify where we left off.
