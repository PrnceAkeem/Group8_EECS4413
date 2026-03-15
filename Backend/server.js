//The Express package from node_modules
const express = require('express');

//Handles login sessions (like HttpSession from class)
const session = require('express-session');

//Lets the server read cookies sent by the browser
const cookieParser = require('cookie-parser');

//Pull in our auth routes (we will create this file later)
const authRoutes = require('./routes/authRoutes');

//Create the Express server app
const app = express();

//The port this server listens on
const PORT = 5000;

//Lets Express read JSON data sent from the browser
app.use(express.json());

//Lets Express read cookies from incoming requests
app.use(cookieParser());

/* Session setup — This is the JavaScript version of HttpSession from our labs
Instead of storing session data in the cookie itself, Express stores it on the SERVER and sends
only a session ID to the browser as a cookie
*/

app.use(session({
  secret: 'sixoutside_secret',   
  resave: false,                 //Don't re-save session if nothing in it changed
  saveUninitialized: false,      //Don't create a session until the user actually logs in
  
  cookie: {
    httpOnly: true,              //Browser JavaScript cannot read this cookie — security measure
    secure: false,               //localhost... we dont need it rn.
    maxAge: 1000 * 60 * 5        //How long the cookie lasts — 5 minutes (JS does time in milliseconds)
  }
}));


// ROUTES
// Hand off any request starting with /api/auth to our authRoutes file
app.use('/api/auth', authRoutes);

// START THE SERVER Tell it to listen on port 5000
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});