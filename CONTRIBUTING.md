# Contributing

Before making changes, install dependencies from the repository root:

```sh
npm install
```

Run the local Hugo server:

```sh
npm start
```

Build before publishing:

```sh
npm run build
```

Run Cypress smoke tests against a running local site when navigation or page structure changes:

```sh
npm run cypress:run
```

Keep generated build output out of commits unless the deployment setup explicitly requires it.
