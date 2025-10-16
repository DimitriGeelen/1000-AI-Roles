module.exports = {
  launch: {
    headless: false,  // SHOW THE BROWSER!
    slowMo: 250,      // Slow down actions so you can see them
    devtools: true,   // Open DevTools automatically
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
  },
  server: {
    command: 'python3 -m http.server 8080',
    port: 8080,
    launchTimeout: 10000,
    debug: true
  }
};