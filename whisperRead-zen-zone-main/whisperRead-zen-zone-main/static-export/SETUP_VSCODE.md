VS Code setup for static WhisperRead export

1) Recommended extensions
- Live Server (ritwickdey.liveserver) — serve files locally and auto-reload.
- Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss) — class name suggestions.
- Prettier - Code formatter (esbenp.prettier-vscode)
- ESLint (dbaeumer.vscode-eslint) — optional for JS linting.

2) Open project
- In VS Code, open the folder containing `static-export`.

3) Run Live Server
- Right-click `index.html` and choose "Open with Live Server" (or use the status-bar "Go Live").
- This opens http://127.0.0.1:5500/index.html by default. If the port differs, adjust accordingly.

4) Edit & reload
- Files under `static-export` update automatically in the browser when saved.

5) Tips for debugging
- Use the browser console (F12) to view errors from JS.
- If PDF previews do not allow text selection in your browser, use another browser or configure a local PDF.js viewer.

6) Optional: Install Node & serve
- To run a simple static server with Node:
  - npm install -g serve
  - serve static-export

7) Notes & limitations
- This export uses the Tailwind CDN for styling; it’s ideal for prototyping but not recommended for production.
- Complex dynamic features from the original React app (fine-grained PDF text extraction and advanced TTS controls) are only approximated here. For full parity, build the original project and run it.

If you want, I can also create a simple npm package.json and a dev script to run a local static server using "serve" or "http-server".
