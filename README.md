# CircuitPython online IDE for class

This project provides (almost) the same online ide as the [Cpy online IDE](https://github.com/urfdvw/CircuitPython-online-IDE).
However, in this project, teaching functions are provided:
- students sign in the IDE by a unique 'nick name'
- teachers can monitor the students' editor code and console outputs according to their 'nick name'
- teachers can monitor multiple students

With these additional functions, teachers can provide timely feedback to the students.

# Techniques used
- Node.js on the server-side
- Vanilla JavaScript on the client-side
    - Chrome file API
    - Chrome Serial API
- Pusher for real-time communication
- Goole app engine for hosting the service

# How to use

## `index.html` is the sign-in page for students.

Students can sign in and use the IDE.

## `receiver.html` is the teacher's monitor page.

Teachers should First `Add students` by the left bottom corner,
and check students' code by click on their name on the top.
If `Auto refreshing` on the right bottom corner is selected,
the code will be updated in real-time.
If not selected, 
the teacher can click on the `Refresh` button or the student's name to refresh.

# How to install
You first need to download the repository to local.

Create a Pusher account, 
which is free for small-scale usage. 
Create a `channel` in your Pusher account. 
Then create a `key.js` file in the local directory containing the keys:
```javascript
var apikey= {
    appId: "YOUR INFO",
    key: "YOUR INFO",
    secret: "YOUR INFO",
    cluster: "YOUR INFO",
    useTLS: true
}
module.exports = { apikey };
```

`npm install` to install all required modules, 
and then `npm start` to start the project locally.

How to deploy the service onto the google app engine is beyond the scope of this document.
