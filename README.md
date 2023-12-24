# Toodo App

Toodo App is a task management application built with React and Firebase Realtime Database.

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Firebase Configuration](#firebase-configuration)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

- Add, edit, and delete tasks
- Mark tasks as done
- Set task priority
- Firebase integration for real-time updates

## Screenshots

| ![Screenshot 1](https://github.com/Jacks777/ToodoApp/blob/main/public/assets/mockup/mockup1.png) | ![Screenshot 2](https://github.com/Jacks777/ToodoApp/blob/main/public/assets/mockup/mockup2.png) | ![Screenshot 3](https://github.com/Jacks777/ToodoApp/blob/main/public/assets/mockup/mockup3.png) |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Firebase Account](https://firebase.google.com/)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/ToodoApp.git
   cd ToodoApp
   npm install
   ```

### Firebase Configuration

To connect your app to Firebase, follow these steps:

Create a new project on the Firebase Console.
Add a web app to your project:
Go to the project settings.
Under "Your apps," click on the web app icon (</>).
Copy the Firebase configuration.

#### Create a .env file in the project root and add your Firebase configuration:

REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_DATABASE_URL=your_database_url

#### Run the app:

npm start
The app will be available at http://localhost:3000.

### Usage

Open the app and start managing your tasks!

### Contributing

Contributions are welcome! Feel free to open issues and pull requests.

### License

This project is licensed under the MIT License - see the LICENSE file for details.
