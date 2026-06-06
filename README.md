# CoTee Frontend

React and Vite frontend for CoTee, an AI-assisted T-shirt design and ecommerce application.

## Live Deployment

- Frontend: https://exe101-cotee-fe.vercel.app/
- Backend API: https://exe201-cotee-be-production.up.railway.app/
- Backend Swagger: https://exe201-cotee-be-production.up.railway.app/swagger/index.html

## Features

- Browse products loaded from the backend API
- Product details and cart management
- Registration, login, and JWT authentication
- AI-assisted design studio

## Local Development

Install dependencies:

```bash
npm install
```

Create a local `.env` file if you need to override the deployed backend:

```env
VITE_API_BASE_URL=https://exe201-cotee-be-production.up.railway.app
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```
