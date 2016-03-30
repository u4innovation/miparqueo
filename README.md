# Stamplay Ionic Starter Social

<table>
  <tbody>
    <tr>
    <th>
    <img width="150" src="" />
    </td>
    <th>
    <img width="150" src="" />
    </td>
    <th>
    <img width="150" src="" />
    </td>
    </tr>
  </tbody>
</table>



The Stamplay Ionic Starter Social kit is a simple way to get a Stamplay Ionic project up off the ground.

The starter kit comes with a fully featured task list, based on user social accounts. If a user does not wish to create an account, they may use the shared guest Task list to manage their tasks by adding, updating, deleting and marking them complete or incomplete.

Social Account Providers:

- Facebook
- Google
- Twitter
- LinkedIn
- DropBox
- Instagram
- Github
- Angellist

Setup Instructions

1. Clone and cd into repo: `git clone https://github.com/Stamplay/stamplay-ionic-starter.git`
2. Run `npm install -g ionic`
4. Run `ionic state restore`
5. Run `npm install && gulp install`
6. Run `stamplay init`, add Stamplay app credentials
7. In the `www/index.html`, update the `Stamplay.init("YOUR APP ID")` to include your `APP ID`
8. Inside `www/js/app.js` change the `constant` for `socialProvider` to the lowercase string of the provider (default value:facebook).
9. Follow the instructions in the documentation to setup Stamplay to use the social provider login [here](https://stamplay.com/docs/platform/users/authentication).
10. Inside the Stamplay Editor, add a `task` object schema with:
  - **title** - *string*
  - **body** - *string*
  - **complete** - *boolean*
11. Run `ionic serve --lab -p 8080`
12. If you are new to Stamplay, or Ionic, we recommend following our [tutorial of this starter kit here](https://blog.stamplay.com/mobile-development-with-ionic-stamplay/).

#### Enjoy!
