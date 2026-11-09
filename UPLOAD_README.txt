SACHIN ENTERPRISES - MODERN ADMIN + STANDALONE DUTY SLIPS UPDATE

Included files:
- admin.html (modern dashboard styling + standalone Duty Slips section)
- admin.js (duty slip create, save, history, reopen, print/PDF)
- duty_slips_setup.sql (creates private duty_slips table and admin-only RLS policies)

IMPORTANT: Keep your existing config.js unchanged. Do not upload or replace it.
The existing index.html, style.css, logo.png, billing/event features and signature files are not replaced by this package.

STEP 1 - DATABASE
1. Open Supabase > SQL Editor > New query.
2. Open duty_slips_setup.sql, copy all its contents and paste into the query editor.
3. Click Run once. Confirm Success / no error.

STEP 2 - WEBSITE FILES
1. Extract this ZIP on your computer.
2. In your existing GitHub repository, replace ONLY admin.html and admin.js with the files from this ZIP.
3. Keep config.js and all other existing files unchanged.
4. Commit the upload to the main branch.
5. Wait for GitHub Pages deployment, then open the Admin page and refresh with Ctrl+F5.

FEATURES
- Duty Slips is independent of quotations and invoices.
- Auto-numbered duty slips, client/guest, vehicle/driver, destination, readings, KM/days/hours, toll, parking, cash advance, remarks and next requirement.
- Save to Supabase, view history, reopen and print/save PDF.
- Database access is restricted by RLS to the configured admin email.

TESTING
After deployment and SQL setup, sign in to the admin panel, open Duty Slips, create a test record and save it. Confirm it appears in Duty Slip History before using it for live business records.
