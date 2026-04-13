# Mock SSO

Mock identity provider service for testing SSO integrations. Supports SAML 2.0 (Sydney/Anthem) and OAuth2/OIDC (Cigna Auth0).

Forked from [BoxyHQ/mock-saml](https://github.com/boxyhq/mock-saml).

## Mock Providers

| Provider    | Type        | Page                     | Description                                                                   |
| ----------- | ----------- | ------------------------ | ----------------------------------------------------------------------------- |
| Sydney SSO  | SAML 2.0    | `/saml/sydney`           | Anthem/Sydney SAML IdP with configurable user attributes and mock eligibility |
| Cigna Auth0 | OAuth2/OIDC | `/cigna-auth0/authorize` | Mock Cigna Auth0 with test users, token exchange, and mock API endpoints      |

## Quick Start

```bash
npm install
npm run serve    # Build and start on port 4123
```

Open http://localhost:4123 to see both providers.

## Scripts

| Command                | Description                                                       |
| ---------------------- | ----------------------------------------------------------------- |
| `npm run serve`        | Build and start the production server (recommended for local use) |
| `npm run dev`          | Start dev server with hot reload (clears `.next` cache first)     |
| `npm run build`        | Build for production                                              |
| `npm start`            | Start production server (requires `npm run build` first)          |
| `npm run lint`         | Run ESLint                                                        |
| `npm run format`       | Format with Prettier                                              |
| `npm run check-format` | Check formatting                                                  |

## Cigna Auth0 Mock

### Endpoints

| Path                                                    | Method | Description                                        |
| ------------------------------------------------------- | ------ | -------------------------------------------------- |
| `/cigna-auth0/authorize`                                | GET    | Login page with test user selection                |
| `/api/cigna-auth0/authorize/callback`                   | POST   | Validates credentials, generates auth code         |
| `/api/cigna-auth0/oauth/token`                          | POST   | Token exchange (authorization_code, refresh_token) |
| `/api/cigna-auth0/rtde/v1/userinfo`                     | GET    | User profile (requires Bearer token)               |
| `/api/cigna-auth0/rtde/v1/biometrics`                   | GET    | Biometric data (requires Bearer token)             |
| `/api/cigna-auth0/rtde/v1/surveyresponses`              | POST   | Create survey response (requires Bearer token)     |
| `/api/cigna-auth0/rtde/v1/surveyresponses/:id/complete` | GET    | Complete survey (requires Bearer token)            |
| `/api/cigna-auth0/rtde/v3/incentives`                   | GET    | Incentives/rewards (requires Bearer token)         |
| `/api/cigna-auth0/well-known/openid-configuration`      | GET    | OIDC discovery document                            |

### URL Rewrites (local dev)

These Next.js rewrites allow the app-gateway to call standard OAuth/API paths directly on `localhost:4123` without a path prefix:

- `/oauth/token` → `/api/cigna-auth0/oauth/token`
- `/rtde/*` → `/api/cigna-auth0/rtde/*`
- `/.well-known/openid-configuration` → `/api/cigna-auth0/well-known/openid-configuration`

### Test Users

| Username     | Password     | Employer | Products                   |
| ------------ | ------------ | -------- | -------------------------- |
| JoePlayer    | nflmycigna1  | Cigna    | None                       |
| testfujifilm | Fujifilm1    | Fujifilm | Healthy Pregnancies/Babies |
| Holt25       | Titans35     | MNPS     | Healthy Pregnancies/Babies |
| Testcitizens | Citizens2015 | Citizens | Healthy Pregnancies/Babies |

### Logging

All Cigna Auth0 endpoints log to the console with `[mock-cigna-auth0]` prefix, including request data, user info, and response bodies for survey/userinfo endpoints.

## Deployed

- **Mock SAML (Sydney)**: `sso-saml.wfh-test.net`
- **Mock Cigna Auth0**: `mock-cigna-auth0.dev.wildflowerhealth.net` (via nginx routing to this service)

## Environment Variables

See `.env.example` for SAML-specific configuration (keys, entity ID, etc.). The Cigna Auth0 mock requires no additional configuration.
