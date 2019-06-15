# Chat It App


## Environment Settings

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
      
     

## Environment Variables

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

