// App version information
const APP_VERSION = {
  number: '1.0.0',
  buildDate: new Date().toISOString(),
  updateAvailable: false
};

// Check if a new version of the app is available
function checkForUpdates() {
  // Add a timestamp to prevent caching
  fetch('version.js?' + new Date().getTime())
    .then(response => {
      // Get the last modified date from the response headers
      const lastModified = response.headers.get('last-modified');
      
      if (lastModified) {
        const lastModifiedDate = new Date(lastModified);
        const cachedVersionDate = new Date(localStorage.getItem('appVersionDate'));
        
        // If the file has been modified since we last cached it, there's an update
        if (!cachedVersionDate || lastModifiedDate > cachedVersionDate) {
          APP_VERSION.updateAvailable = true;
          showUpdateNotification();
        }
      }
      
      // Store the current date as our cached version date
      localStorage.setItem('appVersionDate', new Date().toISOString());
    })
    .catch(error => {
      console.error('Error checking for updates:', error);
    });
}

// Show a notification to the user that an update is available
function showUpdateNotification() {
  const updateNotification = document.createElement('div');
  updateNotification.className = 'update-notification';
  updateNotification.innerHTML = `
    <div class="update-content">
      <p>A new version of QuranLingo is available!</p>
      <button id="update-now-btn">Update Now</button>
      <button id="update-later-btn">Later</button>
    </div>
  `;
  
  document.body.appendChild(updateNotification);
  
  // Add event listeners to the buttons
  document.getElementById('update-now-btn').addEventListener('click', () => {
    // Clear the cache and reload the page
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        window.location.reload(true);
      });
    } else {
      window.location.reload(true);
    }
  });
  
  document.getElementById('update-later-btn').addEventListener('click', () => {
    updateNotification.remove();
  });
}

// Check for updates when the page loads
window.addEventListener('load', () => {
  setTimeout(checkForUpdates, 2000); // Wait 2 seconds before checking
});
