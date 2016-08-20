Setup Instructions

1. Clone and cd into repo
2. Run `npm install -g ionic`
4. Run `ionic state restore`
5. Run `npm install && gulp install`
6. Run `stamplay init`, add Stamplay app credentials
7. In the `www/index.html`, update the `Stamplay.init("YOUR APP ID")` to include your `APP ID`
8. Inside `www/js/app.js` change the `constant` for `socialProvider` to the lowercase string of the provider (default value:`facebook`).
9. Follow the instructions in the documentation to setup Stamplay to use the social provider login [here](https://stamplay.com/docs/platform/users/authentication).
10. Inside the Stamplay Editor, add a `task` object schema with:
  - **title** - *string*
  - **body** - *string*
  - **complete** - *boolean*
11. Ensure any development domains is enabled on the CORS section of your Stamplay App Dashboard.
12. Run `ionic serve --lab -p 8080`


#### Enjoy!
