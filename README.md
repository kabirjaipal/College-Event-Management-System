# College Event Website

## Overview

This is a professional and feature-rich College Event Website built using Node.js, Express, and MongoDB. The website facilitates event registration, user authentication, and administrative functionalities.

## Features

- **User Authentication:** Secure user registration and login with password hashing.
- **Role-Based Access Control:** Differentiates between regular users and administrators.
- **User Profile Management:** Allows users to update their profile information.
- **Admin Dashboard:** Provides administrators with a dashboard to manage user accounts and applications.
- **Email Notifications:** Sends confirmation emails upon successful registration and updates.
- **File Uploads:** Allows users to submit research papers and documents securely.
- **Session Management:** Utilizes secure session management for user authentication.

## Prerequisites

Before running the application, ensure you have the following installed:

- Node.js
- MongoDB
- NPM (Node Package Manager)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/kabirsingh2004/College-Event-Website.git
   ```

2. Change to the project directory:

   ```bash
   cd College-Event-Website
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file and set up the necessary environment variables. You can use the provided `.env.example` as a template.

   ```js
    PORT=3000
    SESSION_SECRET=mysecretkey
    DATABASE_URI=mongodb://localhost:27017/college_event_db
    EMAIL_USER=your.email@example.com
    EMAIL_PASS=your_email_password
    ORGANIZATION_NAME=Aishwarya College of Education Jodhpur
    EVENT_NAME=ACE Research Paper
   ```

5. Run the application:

   ```bash
   npm start
   ```

6. Open your browser and visit `http://localhost:your_port` to view the website.

## Usage

- Visit the home page at `/` to explore the event details.
- Register or log in to access the user dashboard.
- Administrators can log in and access the admin dashboard at `/adminDashboard`.
- Update your profile information, submit research papers, and manage your account.

## Contributing

If you want to contribute to the project, please follow the [Contribution Guidelines](CONTRIBUTING.md).

## License

This project is licensed under the [MIT License](LICENSE.md).

## Acknowledgments

Special thanks to contributors and mentors.

- [Sushil](https://github.com/sushil7774)
- [Gehlot Gaurav](https://github.com/GehlotGaurav)
