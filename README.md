# Client (client/)

This is a Vite + React frontend.

Setup:

1. cd client
2. npm install
3. npm run dev

The dev server runs on port 3500 by default (`vite --port 3500`).

Features:
- Type or paste a problem
- Upload an image or capture from the camera
- Select subject (Mathematics / Physics / Chemistry)
- Sends data to `http://localhost:8080/api/solve` and renders the LaTeX/solution
