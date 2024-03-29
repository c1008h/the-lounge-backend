# The Lounge - Server

This is the server side of The Lounge, a real-time chat application. It handles all backend logic, including user authentication, chat session management, and real-time communication.

## Table of Contents

- [The Lounge - Server](#the-lounge---server)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Running the Server](#running-the-server)
  - [Live Deployment](#live-deployment)
  - [Related Repositories](#related-repositories)
  - [License](#license)
  - [Contact](#contact)

## Getting Started

### Prerequisites

- Node.js
- npm or Yarn
- Firebase account (for Firebase Admin SDK)

### Installation

1. Fork and Clone the repository:```git clone git@github.com:c1008h/the-lounge-backend.git```
2. Navigate to the server directory: ```cd the-lounge-backend```
3. Install the dependencies: ```npm install``` or using Yarn: ```yarn install```

## Environment Setup

Before running the server, you need to set up the environment variables. Create a .env file in the root directory with the following variables:

FIREBASE_TYPE: Your Firebase type
FIREBASE_PROJECT_ID: Your Firebase project ID
FIREBASE_PRIVATE_KEY_ID: Your Firebase private key ID
FIREBASE_PRIVATE_KEY: Your Firebase private key (make sure to replace newline characters with \n)
FIREBASE_CLIENT_EMAIL: Your Firebase client email
FIREBASE_CLIENT_ID: Your Firebase client ID
FIREBASE_AUTH_URI: Your Firebase auth URI
FIREBASE_TOKEN_URI: Your Firebase token URI
FIREBASE_AUTH_PROVIDER: Your Firebase auth provider x509 cert URL
FIREBASE_CLIENT_CERT: Your Firebase client x509 cert URL
FIREBASE_UNIVERSE_DOMAIN: Custom domain for universe setup (if applicable)
DATABASE_URL: Your Firebase database URL
ANON_TOKEN: The anonymous token used for Firebase (ensure this matches the client setup)

## Running the Server

To start the server, run the following command in the terminal: ```npm start``` or using Yarn: ```yarn start```

## Live Deployment

You can access the live deployment of The Lounge at the following URL: <https://the-lounge-5a74a8547b78.herokuapp.com/>

## Related Repositories

Client Repository: For those interested in the client side of The Lounge, you can find it at <https://github.com/c1008h/The-Lounge>. Feel free to fork and clone as needed.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Feel free to reach out if you have any questions.

>Github: [c1008h](https://github.com/c1008h) <br>
>Email: [hongchris97@gmail.com](mailto:hongchris97@gmail.com)

Make sure to replace placeholder values (like `Your Firebase project ID`, `The anonymous token used for Firebase`, etc.) with the actual values from your Firebase and token setup. This README gives a comprehensive guide to setting up the server side of your application, including environmental variables and linking to the client setup instructions.
