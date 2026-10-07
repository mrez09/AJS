# Submission Checklist

## Source code and repository

- [ ] Review the final source tree and include the intended AJS files.
- [ ] Check `git status` and distinguish intended submission files from local/unrelated working-tree changes.
- [ ] Confirm no `.env`, database URL, JWT secret, access token, or personal credential is staged or shared.
- [ ] Keep local uploaded images and generated build output out of the source submission unless the assessment explicitly requires them.
- [ ] Do not include temporary logs, test database exports, or unrelated files.

## Verification

- [ ] From `backend`, run `go test ./...`.
- [ ] If PostgreSQL integration tests are required, set `AJS_TEST_DATABASE_URL` to an isolated test database/branch and run `go test ./...` again.
- [ ] From `backend`, run `go build -buildvcs=false ./...`.
- [ ] From `frontend`, run `npm run lint` and `npm run build`.
- [ ] Check all public, Buyer, and Admin routes in the demo environment.
- [ ] Verify at least one valid product image displays and the fallback works for products without an image.
- [ ] Verify order confirmation deducts the confirmed quantity and rejection does not deduct stock.
- [ ] Run `git diff --check` and inspect the final diff.

## Demo data and business claims

- [ ] Use a demo database, not production data.
- [ ] Confirm the seeded Buyer/Admin login works. Existing users with those email addresses are not reset by the seeder.
- [ ] Check actual stock, MOQ, and product statuses immediately before recording; do not assume seed values are still current.
- [ ] Verify company history, location, operation descriptions, and contact details against approved AJS material.
- [ ] Do not publish cold-storage capacity, daily sourcing, transaction volume, physical stock, or other metrics unless the source, period, and unit are confirmed.
- [ ] If showing transaction figures, state that selected transaction figures are not annual revenue.

## Screenshots

- [ ] Capture the Home page with a clear seafood image and company positioning.
- [ ] Capture the commodity catalog and one product detail page with specifications/status visible.
- [ ] Capture the Buyer cart or submitted Request Order.
- [ ] Capture Admin Order Requests and the resulting status.
- [ ] Capture stock before/after confirmation if required and ensure the values correspond to the demo action.
- [ ] Ensure screenshots contain no `.env`, passwords, tokens, personal data, or unrelated browser tabs.
- [ ] Use readable viewport sizes and consistent browser zoom; crop only if the assessment allows it.

## Video

- [ ] Follow `DEMO_SCRIPT.md` and keep the recording within 8 minutes.
- [ ] Confirm microphone/screen capture quality and remove notifications before recording.
- [ ] Show the complete buyer request and Admin review flow without exposing credentials on screen longer than necessary.
- [ ] Review the final video for accidental secrets, failed requests, confusing stale data, or unsupported business claims.
- [ ] Use a clear filename, for example `AJS_Assessment_Demo.mp4`.

## Documentation and Google Drive

- [ ] Include `README.md`, `AI_UTILIZATION.md`, `DEMO_SCRIPT.md`, and this checklist.
- [ ] Ensure the AI-utilization statement accurately reflects any Copilot use outside the Codex workflow; update it only with verified details.
- [ ] Upload source/deliverables, screenshots, and final video to the required Google Drive location.
- [ ] Set Drive access to the assessment reviewers' required permission level; verify the link in a private/incognito window or with a second account.
- [ ] Paste the final Google Drive link here before submission: **[Add Drive link]**.
- [ ] Confirm the link opens the intended folder/files and does not expose unrelated private files.
- [ ] Submit through the required assessment channel before its deadline.
