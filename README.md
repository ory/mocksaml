# Mock SAML from BoxyHQ

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)
[![Deploy with Vercel](https://vercel.com/button)](<https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fboxyhq%2Fmock-saml&env=APP_URL,ENTITY_ID,PUBLIC_KEY,PRIVATE_KEY,NEXT_PUBLIC_GTM_ID&envDescription=APP_URL%20(Usually%20https%3A%2F%2F%3Cproject-name%3E.vercel.app)%20can%20be%20set%20after%20deployment%20from%20the%20project%20dashboard.%20Set%20to%20''%20if%20not%20applicable.&envLink=https%3A%2F%2Fgithub.com%2Fboxyhq%2Fmock-saml%2Fblob%2Fmain%2F.env.example&project-name=mock-saml>)

Mock SAML is a free SAML 2.0 Identity Provider for testing SAML SSO integrations.

## Namespaces

Try [Mock SAML](https://mocksaml.com/), our free hosted service. Whilst we use the root domain for our own testing you can create your own unique namespace by navigating to [https://mocksaml.com/namespace/any_name_of_your_choice](https://mocksaml.com/namespace/any_name_of_your_choice).

## Install

### With Docker

The docker container can be found at [boxyhq/mock-saml](https://hub.docker.com/r/boxyhq/mock-saml).

```bash
docker run \
  -p 4000:4000 \
  -e APP_URL="http://localhost:4000" \
  -e ENTITY_ID="https://saml.example.com/entityid" \
  -e PUBLIC_KEY="<PUBLIC_KEY>" \
  -e PRIVATE_KEY="<PRIVATE_KEY>" \
  -d boxyhq/mock-saml
```

Refer to [env.example](https://github.com/boxyhq/mock-saml/blob/main/.env.example#L5C3-L5C97) for instructions on how to create the key pair.
Replace `<PUBLIC_KEY>` with Base64 encoded value of public key.
Replace `<PRIVATE_KEY>` with Base64 encoded value of private key.

### Without Docker

```
git clone https://github.com/boxyhq/mock-saml.git
```

```
cd mock-saml
```

Install dependencies

```
npm install
```

Update `.env` with your own keys.

```
cp .env.example .env
```

Build the Next.js app.

```
npm run build
```

Run the Mock SAML server.

```
npm run start
```

## Contributing

Thanks for taking the time to contribute! Contributions make the open-source community a fantastic place to learn, inspire, and create. Any contributions you make are greatly appreciated.

Please try to create bug reports that are:

- _Reproducible._ Include steps to reproduce the problem.
- _Specific._ Include as much detail as possible: which version, what environment, etc.
- _Unique._ Do not duplicate existing opened issues.
- _Scoped to a Single Bug._ One bug per report.

## Community

- [Discord](https://discord.gg/uyb7pYt4Pa) (For live discussion with the Open-Source Community and BoxyHQ team)
- [Twitter](https://twitter.com/BoxyHQ) (Follow us)
- [GitHub Issues](https://https://github.com/boxyhq/mock-saml/issues) (Contributions, report issues and product ideas)
