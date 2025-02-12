[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/HazemSarhan/05-social-media-api"></a>

<h3 align="center">[Social Media API]</h3>

  <p align="center">
    A scalable and feature-rich backend for a social media application, built with Node.js, Express, and Prisma ORM using PostgreSQL. This API supports user authentication, post creation, likes, dislikes, comments, following system, real-time chat, and more. Designed with a clean architecture and follows best practices for RESTful API development.
    <br />
    <a href="https://documenter.getpostman.com/view/36229537/2sAYXBGzhg">Postman Docs</a>
    ·
    <a href="https://github.com/HazemSarhan/05-social-media-api/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/HazemSarhan/05-social-media-api/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)

## Features

1- Sendgrid SMTP: for receiving register confirmation email and reset password.
2- Redis: for caching the data.
3- Winston: for logging info.
4- Docker: for scaling the application.
5- JWT: for authentication.
6- Fully customizable error handlers.
7- Cloudinary: for image processing and uploading.
8- Joi: for data validation
9- SocketIO: for real-time messages

Built with:

<div align="center">
  <img src="https://skillicons.dev/icons?i=html,css,bootstrap,js,nodejs,express,postgres,prisma" /><br>
</div>

## Getting Started

- Node.js: Version 18 or higher
- PostgreSQL: Ensure a PostgreSQL database is available
- Prisma: ORM for database interactions

## Installation :

1. Clone the repository:

```sh
git clone https://github.com/HazemSarhan/05-social-media-api.git
```

2. Navigate into the project directory:

```sh
cd 05-social-media-api
```

3. Install dependencies:

```sh
npm install
```

4. Set up environment variables:
   Check: [Environment Variables](#environment-variables)

5. Start the server:

```sh
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory and add the following environment variables:

```env
PORT = 3000
NODE_ENV = development
DATABASE_URL = your-db-connection-url
JWT_SECRET = your-jwt-secret-key
JWT_LIFETIME = 1d
SENDGRID_API_KEY = sendgrid-api
OWNER_EMAIL = your-email
REDIS_URL = redis-connection-url
CLOUD_NAME = your-cloudinary-api-cloud-name
CLOUD_API_KEY = your-cloudinary-api-cloud-key
CLOUD_API_SECRET = your-cloudinary-api-cloud-secret-key
```

## Routes

> [!NOTE]
> Check the docs for all routes & data [API Documentation](https://documenter.getpostman.com/view/36229537/2sAYXBGzhg).

## Usage

After creating .env with all [Environment Variables](#environment-variables) :

1. Run the server using:

```sh
npm run dev
```

2. Register a new user.

> [!TIP]
> First registered account role will automatically set to => ADMIN

[contributors-shield]: https://img.shields.io/github/contributors/HazemSarhan/05-social-media-api?style=for-the-badge
[contributors-url]: https://github.com/HazemSarhan/05-social-media-api/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/HazemSarhan/05-social-media-api.svg?style=for-the-badge
[forks-url]: https://github.com/HazemSarhan/05-social-media-api/network/members
[stars-shield]: https://img.shields.io/github/stars/HazemSarhan/05-social-media-api.svg?style=for-the-badge
[stars-url]: https://github.com/HazemSarhan/05-social-media-api/stargazers
[issues-shield]: https://img.shields.io/github/issues/HazemSarhan/05-social-media-api.svg?style=for-the-badge
[issues-url]: https://github.com/HazemSarhan/05-social-media-api/issues
[license-shield]: https://img.shields.io/github/license/HazemSarhan/05-social-media-api.svg?style=for-the-badge
[license-url]: https://github.com/HazemSarhan/05-social-media-api/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/hazemmegahed/
[product-screenshot]: images/screenshot.png
[node-js]: https://svgur.com/i/19bZ.svg
[express-js]: https://svgur.com/i/19a1.svg
[mongo-db]: https://svgur.com/i/19b4.svg
[jwt]: https://svgshare.com/i/19bi.svg
[db]: https://i.imgur.com/0CzwXXA.png
