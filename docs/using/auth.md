---
sidebarDepth: 3
---
# Authentication & Authorization

## Introduction

No system would be complete without the concepts of Authentication and Authorization and while most of what Firemodel is focused on is the Real Time Database component of Firebase it also extends -- to a degree -- to Firebase's identity system.

It is important to realize that how you approach Auth/Auth depends a lot on whether you are using the Firebase _client_ SDK or the _admin_ SDK. The _admin_ SDK gives you full permissions to operate as a super-adminstrative agent whereas permissioning as we're talking about here really pertains only to the client SDK based connections.

With that introduction, we suggest two primary modes of interacting with Firebase's Identity system. In both cases we are referring to the _client_ SDK unless other stated:

1. **Unopinonated, Firebase only.**

  If you want to simply gain access to the `auth()` features of the Firebase SDK the most basic way to do this is using `abstracted-client`'s `auth` property:

  ```typescript
  const { DB } from 'abstracted-client';
  const db = DB.connect(config);
  const authApi = await db.auth();
  // now you can make any Firebase auth call you like; such as ...
  authApi.createUserWithEmailAndPassword(email, password);
  ```

2. **Opinionated, FireModel aware.**

  The **FireModel** library brings forward the idea of "models" and -- should we choose to do so -- we can opt-in to a more FireModel way of doing Authentication and Authorization.

## The FireModel Way

For the rest of this section we will focus only on the opinionated **FireModel** way of doing authentication/authorization. Not because it's "better" but because the Firebase way is already documented on the Firebase site.

First off, let's cover a set of assumptions we are making:

### Assumptions

- You have some sort of **backend API** which can be used to handle secure operations
- While you may choose _any_ backend to service these endpoints, FireModel will provide **AWS Lambda** functions as exports which you can use for more of an "out of the box" experience.
- We will use Firebase's concept of [**Custom Claims**](https://firebase.google.com/docs/auth/admin/custom-claims) to provide a more robust authorization regime within our apps
- The `CustomClaim` and `CustomClaimRequest` models that FireModel defines will be used to help the front and backend's interact in a coordinated way.
- The `CustomClaimApp` model will serve to regulate which "applications" are able to be involved in the Authentication/Authorization handshaking. Applications will require client identification of the following attributes:
  - "http referrer" (where did the request come from),
  - "db config" (which database was the user connected to),
  - "api-key" (a mildly ),
  - "
- Frontend calls can "request" roles for the current user but if the requested role has `adminRequired` set to true it will be rejected unless the current user is either a _cross-app_ **admin** or an _app-specific_ **admin**. More on this in Admin section.
- Frontend calls can "request" roles for a different user only if they are some sort of **admin**.

### Creating a User

Creating a "known user" (versus an anonymous user) from the frontend will operate the following flow:

<process-flow>graph TD;subgraph Client; FE["Frontend Client"]-->CREATE("createEmailUser(email, password, url, [ claims ])"); FE-->Verify("verify email");end; subgraph Firebase; CREATE-->FB[".createUserWithEmailAndPassword()"]; end; subgraph server;CREATE-->SERVER["API Endpoint"]; SERVER-->CheckRoles; SERVER-->CheckApp; CheckApp-->Write["write CustomClaimRequest"]; CheckRoles-->Write; SERVER2["API Endpoint"]; SERVER2-->Claim["write CustomClaim"]; Verify-->SERVER2; end; </process-flow>

In the above example, the authentication process was email/password but other flows will follow a similar path. The detailed steps are:

1. The frontend client calls `createEmailUser()` and specifies not only the email/password pairing but includes a **url** to the backend endpoint. Optionally, requested "roles" are added.
2. **FireModel** will use a direct call to **Firebase** to start the process. This establishes the username/password and should quickly return with a User object that is neither verified nor associated with any "custom claims".
3. Once returning from the **Firebase** API call, `createEmailUser()` will pass the newly created UID, requested "custom claims", and the prior UID of the anonymous user (if the client had been logged in as an anonymous user).
4. The backend will evaluate:
   - Does the frontend have the right qualifications to be identified as originating from a known "App" (e.g., records of model `CustomClaimApp`); if not then disable user, if so then associate user to the app.
   - Do any of the claims requested by the user require "admin" priviledges and if so strip this claims out. Those which remain should be added as `CustomClaimRequest` records.
   - If the user had been connected as an anonymous user prior ( ... need to think through this ...)
5. Once the user gets around to verifying the email, it will bring them to the frontend app where the app will call `verifyEmailUser()` which will again call the backend.
6. The backend function will:
   - set the user's status to verified
   - convert the user's `CustomClaimRequest` records into `CustomClaim` records
