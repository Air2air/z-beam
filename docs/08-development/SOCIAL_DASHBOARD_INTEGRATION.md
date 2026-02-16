# Social Dashboard Integration (LinkedIn, Facebook, Google Business, X)

The social dashboard supports direct publishing from `/social-dashboard`.

## Required Environment Variables

Add these in your local `.env` and deployment environment:

### Dashboard Access Control
- `SOCIAL_DASHBOARD_USERNAME`
- `SOCIAL_DASHBOARD_PASSWORD`

These credentials protect:
- `/social-dashboard`
- `/api/social/*`

### LinkedIn
- `LINKEDIN_ACCESS_TOKEN`
- `LINKEDIN_ORGANIZATION_ID` (preferred numeric org ID)
- OR `LINKEDIN_PAGE_URL` (for vanity resolution, e.g. `https://linkedin.com/company/z-beam/`)
- Optional fallback: `LINKEDIN_ORGANIZATION_VANITY`

### Facebook
- `FACEBOOK_PAGE_ID` (preferred)
- OR `FACEBOOK_PAGE_URL` (ID will be extracted if `?id=` exists)
- `FACEBOOK_PAGE_ACCESS_TOKEN`

### Google Business Profile
- `GOOGLE_BUSINESS_ACCESS_TOKEN`
- `GOOGLE_BUSINESS_ACCOUNT_ID`
- `GOOGLE_BUSINESS_LOCATION_ID`
- Optional reference: `GOOGLE_BUSINESS_PROFILE_URL`

### X (Twitter)
- `X_BEARER_TOKEN`
	- Must be user-context token with write permission (`tweet.write`)

## API Endpoints

- `GET /api/social/posts` — list posts
- `POST /api/social/posts` — create post
- `PUT /api/social/posts/:id` — update post
- `DELETE /api/social/posts/:id` — delete post
- `POST /api/social/upload` — upload social image
- `POST /api/social/upload-media` — upload photos/videos for cross-posting
- `POST /api/social/ai/enrich` — generate hashtags, keywords, platform variants via Grok/DeepSeek
- `POST /api/social/posts/:id/publish` — publish to selected platforms

## Notes

- Image uploads are stored in `public/images/social/`.
- Post data is stored in `data/social/posts.json`.
- Publish operation records per-platform results in `publicationResults`.
- If one platform fails, API returns partial-success (`207`) and preserves failure details.

## Advanced Composer Fields

Stored per post:
- `objective`
- `campaign`
- `cta`
- `tags[]`
- `keywords[]`
- `mediaAssets[]` (photos/videos)
- `aiMetadata` (provider, variants, notes)
