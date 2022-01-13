# CircuitPython online IDE for classes

This project provides (almost) the same online IDE as the [Cpy online IDE](https://github.com/urfdvw/CircuitPython-online-IDE).
However, in this project, teaching functions are provided:
- students sign in the IDE by a unique 'nicknames'
- Instructors can monitor the students' editor code and console outputs according to their 'nicknames'
- Instructors can monitor multiple students

With these additional functions, instructors can provide timely feedback to the students.

# Techniques used
- Node.js on the server-side
- Vanilla JavaScript on the client-side
    - Ace Editor
    - Chrome file API
    - Chrome Serial API
    - Plotly for plot
- Pusher for real-time communication
- Goole app engine for hosting the service

# How to use

## `index.html` is the sign-in page for students.

Students can sign in by nicknames or a pre-given link containing their nicknames.

## `receiver.html` is the instructor's monitor page.

Instructors should First `Add students` by the left bottom corner,
and check students' code by clicking on their name on the top.
If `Auto refreshing` on the right bottom corner is selected,
the code will be updated in real-time.
If not selected, 
the instructor can click on the `Refresh` button or the student's name to refresh.

# How to install
This section explains the steps for testing the platform locally for evaluation and development reasons. 
You need to have `Node.js` installed to follow the instructions below.
About how to deploy the service onto the google app engine for actual usages,
please see [Google documents](https://cloud.google.com/appengine/docs/standard/nodejs/quickstart).

1. Download the repository to local and unzip it.
2. Create a Pusher.com account.
3. Create a `channel` in your Pusher account. 
    - which is free for small-scale usage.
4. Then create a `key.js` file in the local project directory (besides `index.html`) containing the keys:
```javascript
// key.js
var apikey= {
    appId: "YOUR INFO",
    key: "YOUR INFO",
    secret: "YOUR INFO",
    cluster: "YOUR INFO",
    useTLS: true
}
module.exports = { apikey };
```
5. `npm install` to install all required modules, 
6. and then `npm start` to start the project locally.
7. visit `http://localhost:5000/` in the browser to log in as a student.
8. visit `http://localhost:5000/receiver.html` in the browser to open instructor tools.

