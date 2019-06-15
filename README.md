# Chat It App
# Simple and fun chatting app built using the MEAN stack. 

## Implemented Features

- Chat rooms with ability to send text, images, GIFs, webms, and embedded YouTube videos
- Account creation, login, and authentication
- Room creation with option to secure with password
- Friend system
- Notification system for friend requests and room invites
- Unfinished profile section

## Todo Features

- Email verification on new accounts
- Add different room types such as game rooms (rock,paper,scissors) or data rooms (graphs & tables)
- Allow room organizers/creators to have ability to edit title, room type, and to kick/ban users
- Allow user to modify profile picture and password
- Add "User is typing" feature
- Create a chatbot for more user interaction
- Add more navigation buttons

## Angular Environment Settings

Modify the environment.ts file to match the the URL path used for the Node server API

## Node Server Environment Settings

Server files are found in "src/server"

Node server uses:

Mongoose(MongoDB) which can be hooked up to your MongoDB using the DB_CONN environment variable

Socket.io server which is integrated with the Express app so it uses the same port as the Express app/server

Redis server is used to keep track of socket.io connections, users, and rooms the users are in. Socket.io Redis adapter module is used to synchronize socket.io messages across different Node instances. 

The Redis client is initiated in ioSetup.js as localhost/127.0.0.1 and port 6379

The Redis adapter is initiated in create-express-app.js as localhost/127.0.0.1 and port 6379

## Must-add directories/files

Make sure to add this directory structure to the server folder:

    /server
      /uploads
        /rooms
        /profiles
          default-1.png  <-- Profile image   
      
     

## Node Environment Variables

Environment Variables include:

DB_CONN -MongoDB connection string

JWT_SECRET - JWT secret encryption key for the authentication token

REFRESH_SECRET - JWT secret encryption key for the refresh token

JWT_EXP - Set expiration limit on auth token (ex. 20m)

REFRESH_EXP - Set expiration limit on auth token (ex. 12h)


## For Development 

Use "npm run watch" to run both local Angular development server on port 4200, and nodemon on port 3000 (default)

Use "npm run watch:client" to run just the Angular server 
or 
use "npm run watch:server" to run just the Node server

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `src/server/public` directory. Use the `--prod` flag for a production build.
