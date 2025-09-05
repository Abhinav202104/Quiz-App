# Quiz App

This is a simple React-based Quiz Application.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (LTS version recommended)
- **npm** (comes with Node.js) or **yarn**

## Installation

### 1. Create a New React Project

Open your terminal and run one of the following commands:

```bash
npx create-react-app quiz-app
# or
yarn create react-app quiz-app
```

### 2. Navigate into the Project Directory

```bash
cd quiz-app
```

### 3. Replace the App.js File

Delete the default `src/App.js` and `src/App.css` files. Place the `quiz.jsx` file (from our conversation) into the `src` directory and rename it to `App.jsx`.

If you are using a standard create-react-app setup, you will also need to update `src/index.js` to import `App.jsx` instead of `App.js`:

```js
// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Change from './App' to './App.jsx'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 4. Ensure `react-scripts` is Configured

Ensure your `package.json` file has `react-scripts` configured correctly (this is handled automatically by create-react-app).

## Running the App

Start the development server by running one of the following commands in the project directory:

```bash
npm start
# or
yarn start
```

This will open the application in your default web browser at [http://localhost:3000](http://localhost:3000).

---
