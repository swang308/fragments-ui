# CCP555 NSA course - fragments-ui

## Git Command
- Avoid using `git add .`, it will add files and folders you don't expect.
- `git status` to see which files changed
- `git add ..` to add which files changed
- `git commit -m "What_change"` to leave comment to which files changed

## Run Server
- To run server, use command: `npm start`
> NOTE:`npm run dev`: for developer, and `npm run debug`: for debug
- Access the application in a browser: `http://localhost:1234`

## Structure and Route Information
```bash
fragements/
├── .parcel-cache/  
├── dist/
├── node_modules/
├── src/
│   ├── api.js         # Get a user's fragments from the fragments microservice
│   ├── app.js         # Run web app
│   ├── auth.js        # Do the OAuth2 Authorization Code Grant
│   ├── index.html     # Web Page
│   ├── style.css      # Web Page style
├── .env               # Stroe credentails
├── .gitignore         # Ignore unnecessary files for git
├── .prettierignore    # Ignore unnecessary files for prettier
├── package-lock.json  # Package version lock file
├── package.json       # Project metadata and dependencies
└── README.md          # Project documentation
```
## Getting Started
### Prerequisites
Confirm version is up-to-date
- [Parcel](https://parceljs.org/getting-started/webapp/)
- [aws-amplify](https://www.npmjs.com/package/aws-amplify)

### Installing
#### Github repo
1. Create 
  - a PRIVATE Github repo named `fragments-ui` 
  - Description, 
  - README, 
  - .gitignore for node,
2. Invite your professor to this repo
3. Clone to local machine and put `fragments` and `fragments-ui` in same parents folder
```sh
git clone git@github.com:swang308/fragments-ui.git
```
4. Open a terminal and cd to your cloned repo
  - cd fragments
#### npm
##### package.json
1. Create a `package.json`
```sh
npm init -y
```
> `-y` will answer yes to all questions
2. Edit `package.json` file liek this
```json
{
  "name": "fragments-ui",
  "private": true,
  "version": "0.0.1",
  "description": "Fragments UI testing web app",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/swang308/fragments-ui.git"
  },
  "author": "Shan-Yun, Wang",
  "license": "UNLICENSED"
}
```
#### Set up Parcel
1. Use npm to install
```sh
npm install --save-dev parcel
```
2. Create a `src/` folder and `src/index.html`
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <title>My First Parcel App</title>
  </head>
  <body>
    <h1>Hello, World!</h1>
  </body>
</html>
```
3. Rubuild app as you change
```sh
npx parcel src/index.html
```
4. Create `src/styles.css` and `src/app.js`
  - src/styles.css
```css
h1 {
  color: hotpink;
  font-family: cursive;
}
```
  - src/app.js
```js
console.log('Hello world!');
```
5. alter `src/index.html`
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <title>My First Parcel App</title>
    <link rel="stylesheet" href="styles.css" />
    <script type="module" src="app.js"></script>
  </head>
  <body>
    <h1>Hello, World!</h1>
  </body>
</html>
```
6. alter `package.json`
```json
{
  "name": "fragments-ui",
  "source": "src/index.html",
  "scripts": {
    "start": "parcel src/index.html",
    "build": "parcel build src/index.html"
  },
  "devDependencies": {
    "parcel": "latest"
  }
}
```
> NOTE: if you are not using `Parcel`, change the port setting. go to **Amazon Cognito** > User Pools > fragments-users > App integration > choose your `fragments-ui` app client at the bottom, then click Edit beside the **Hosted UI** options. Make sure your Allowed callback URLs has correct URL for your local development environment.
#### Connect Web App to User Pool: Amazon's aws-amplify
1. To Simplify connecting our web app to our Cognito User Pool and Hosted UI, we'll use Amazon's [aws-amplify](https://www.npmjs.com/package/aws-amplify) **JavaScript SDK**, which includes an auth module.
> NOTE: We are also going to use the latest 5.x.y release vs. the current 6.x.y release, due to some breaking API changes.
2. In `fragments-ui` folder, install aws-amplify
```sh
npm install --save aws-amplify@^5.0.0
```
3. alter `src/index.html`
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Fragments UI</title>
    <link rel="stylesheet" href="https://unpkg.com/bamboo.css" />
    <script type="module" src="src/app.js"></script>
  </head>
  <body>
    <h1>Fragments UI</h1>
    <section>
      <nav><button id="login">Login</button><button id="logout">Logout</button></nav>
    </section>
    <section hidden id="user">
      <h2>Hello <span class="username"></span>!</h2>
    </section>
  </body>
</html>
```
4. Create an `.env` file in `fragments-ui` root folder to define some [environment variables](https://en.wikipedia.org/wiki/Environment_variable).
 - VARIABLE=VALUE (NOTE: no spaces, no quotes)
 - comment: `# This is a comment`
```ini
# .env

# fragments microservice API URL (make sure this is the right port for you)
API_URL=http://localhost:8080

# AWS Amazon Cognito User Pool ID (use your User Pool ID)
AWS_COGNITO_POOL_ID=us-east-1_xxxxxxxxx

# AWS Amazon Cognito Client App ID (use your Client App ID)
AWS_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# AWS Amazon Cognito Host UI domain (use your domain only, not the full URL)
AWS_COGNITO_HOSTED_UI_DOMAIN=xxxxxxxx.auth.us-east-1.amazoncognito.com

# OAuth Sign-In Redirect URL (use the port for your fragments-ui web app)
OAUTH_SIGN_IN_REDIRECT_URL=http://localhost:1234

# OAuth Sign-Out Redirect URL (use the port for your fragments-ui web app)
OAUTH_SIGN_OUT_REDIRECT_URL=http://localhost:1234
```
5. Ignore `.env` to github, confirm `.gitignore` includes `.env`
```ini
# Don't include .env, which might have sensitive information
.env
```
6. Create a `src/auth.js`, it will do [OAuth2 Authorization Code Grant](https://developer.okta.com/blog/2018/04/10/oauth-authorization-code-grant-type). Use the process.env global to access our environment variables:
> NOTE: We first need to configure the Auth client with our User Pool details, and provide a way to get the authenticated user's info.
```js
// src/auth.js

import { Amplify, Auth } from 'aws-amplify';

// Configure our Auth object to use our Cognito User Pool
Amplify.configure({
  Auth: {
    // Amazon Region. We can hard-code this (we always use the us-east-1 region)
    region: 'us-east-1',

    // Amazon Cognito User Pool ID
    userPoolId: process.env.AWS_COGNITO_POOL_ID,

    // Amazon Cognito App Client ID (26-char alphanumeric string)
    userPoolWebClientId: process.env.AWS_COGNITO_CLIENT_ID,

    // Hosted UI configuration
    oauth: {
      // Amazon Hosted UI Domain
      domain: process.env.AWS_COGNITO_HOSTED_UI_DOMAIN,

      // These scopes must match what you set in the User Pool for this App Client
      // The default based on what we did above is: email, phone, openid. To see
      // your app's OpenID Connect scopes, go to Amazon Cognito in the AWS Console
      // then: Amazon Cognito > User pools > {your user pool} > App client > {your client}
      // and look in the "Hosted UI" section under "OpenID Connect scopes".
      scope: ['email', 'phone', 'openid'],

      // NOTE: these must match what you have specified in the Hosted UI
      // app settings for Callback and Redirect URLs (e.g., no trailing slash).
      redirectSignIn: process.env.OAUTH_SIGN_IN_REDIRECT_URL,
      redirectSignOut: process.env.OAUTH_SIGN_OUT_REDIRECT_URL,

      // We're using the Access Code Grant flow (i.e., `code`)
      responseType: 'code',
    },
  },
});

/**
 * Get the authenticated user
 * @returns Promise<user>
 */
async function getUser() {
  try {
    // Get the user's info, see:
    // https://docs.amplify.aws/lib/auth/advanced/q/platform/js/#identity-pool-federation
    const currentAuthenticatedUser = await Auth.currentAuthenticatedUser();

    // Get the user's username
    const username = currentAuthenticatedUser.username;

    // If that didn't throw, we have a user object, and the user is authenticated
    console.log('The user is authenticated', username);

    // Get the user's Identity Token, which we'll use later with our
    // microservice. See discussion of various tokens:
    // https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html
    const idToken = currentAuthenticatedUser.signInUserSession.idToken.jwtToken;
    const accessToken = currentAuthenticatedUser.signInUserSession.accessToken.jwtToken;

    // Return a simplified "user" object
    return {
      username,
      idToken,
      accessToken,
      // Include a simple method to generate headers with our Authorization info
      authorizationHeaders: (type = 'application/json') => {
        const headers = { 'Content-Type': type };
        headers['Authorization'] = `Bearer ${idToken}`;
        return headers;
      },
    };
  } catch (err) {
    console.log(err);
    // Unable to get user, return `null` instead
    return null;
  }
}

export { Auth, getUser };
```
7. alter `src/app.js`, it should use `src/auth.js` to handle authentication, get `user` and update UI
```js
// src/app.js

import { Auth, getUser } from './auth';

async function init() {
  // Get our UI elements
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/advanced/q/platform/js/#identity-pool-federation
    Auth.federatedSignIn();
  };
  logoutBtn.onclick = () => {
    // Sign-out of the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js/#sign-out
    Auth.signOut();
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    // Disable the Logout button
    logoutBtn.disabled = true;
    return;
  }

  // Log the user info for debugging purposes
  console.log({ user });

  // Update the UI to welcome the user
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector('.username').innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);
```

## Test Authentication Flows
1. Start your web app locally `npm start` and open browser on http://localhost:1234
2. Click Login, You should be redirected to your Hosted UI domain
3. In the Hosted UI, create a new user by clicking the Sign up link. Enter your desired Username, Name, Email, and Password. Click the Sign up button, and you verify account, by entering a Verification Code from email.
4. Try Logout and Login flow, ensure your UI works as expect
5. After successfully logging in, inspect the `user` object in the Dev Tools console. Ensure the `username` is correct, and that you have an `idToken` and `accessToken` **JSON Web Tokens (JWT)**. One-by-one, copy these JWTs and paste them into the JWT Debugger at [jwt.io](https://jwt.io/). Make sure the tokens are valid and can be decoded, and that the claims you see make sense (i.e., match the user you logged in with).
6. Go back to AWS Console and the Cognito page, find the user you created.
7. We have created our first AWS service. See which files changed then `add` and `commit` to git.
```sh
git status

git add ...
git commit -m "Write_what_is_change"
```

## Student Information
- Student Name: Shanyun, Wang
- Student ID: 133159228

## Version History
- 2024-09-16 v01
  * version 01 initial

## Acknowledgement
- [DiscussionBorad](https://github.com/humphd/cloud-computing-for-programmers-fall-2024/discussions)
- [OAuth2 Authorization Code Grant](https://developer.okta.com/blog/2018/04/10/oauth-authorization-code-grant-type)
