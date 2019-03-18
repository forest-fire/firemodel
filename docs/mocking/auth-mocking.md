# Mocking Authentication

It is often important to be able to mock authentication/authorization with Firebase's Identity system. This functionality is now available in a limited capacity.

## Accessing Auth

Just as you would in a non-mocked database in Firemodel, you can access the `FirebaseAuth` API through the following asynchronous call:

```typescript
const db = DB.connect({ mocking: true });
const auth = await db.auth();
```

Getting the auth module will incur a **networkDelay** similar to any other mock request to the database. This network penalty ensures appropriate asynchronous behavior but is only incurred the first time you make the call (it does remain an async based called but it returns immediately).

## Supported API Endpoints

Over time we may add more of the full API provided by google but currently there is only a limited subset. The following API endpoints off of `auth()` are available:

- `signInAnonymously()` - by default this type of authentication is enabled and will return an anonymous user when called; the anonymous user will have a **uid** of `123456`. If you wish to change this you can with:

    ```typescript
    const auth = await db.auth().
    auth.setAnonymousUser(uid);
    ```

- `signInWithEmailAndPassword()` - by default this login method is disabled, but it can be enabled easily by setting the **authConfig**. You can also state which email logins are already setup; both are achieved one of two ways:

    1. At instantiation:

        ```typescript
        const db = DB.connnect({ mocking: true, config: {
          allowEmailLogins: true,
          validEmailLogins: [{ email: "joe@somewhere.com", password: "foobar" }]
        }})
        ```

    2. Anytime afterward via the API:

        ```typescript
        const auth = await db.auth();
        auth.configureAuth({ allowEmailLogins: true, validEmailLogins: { ... } })
        ```

- `tete`
