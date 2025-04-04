// Installation prompt
let deferredPrompt;
const installButton = document.createElement('button');
installButton.style.display = 'none';
installButton.className = 'install-button';
installButton.textContent = 'Install QuranLingo';

// Add the install button to the DOM when the page loads
window.addEventListener('load', () => {
  document.body.appendChild(installButton);
  
  // Show installation instructions
  const showInstallInstructions = () => {
    const instructions = document.createElement('div');
    instructions.className = 'install-instructions';
    instructions.innerHTML = `
      <div class="install-modal">
        <h3>Install QuranLingo</h3>
        <p>Install this app on your device for offline use:</p>
        <ul>
          <li><strong>iOS:</strong> Tap the share icon <span>⎙</span> and select "Add to Home Screen"</li>
          <li><strong>Android:</strong> Look for "Add to Home Screen" or "Install" in your browser menu</li>
          <li><strong>Desktop:</strong> Look for the install icon in your address bar</li>
        </ul>
        <button class="close-instructions">Close</button>
      </div>
    `;
    document.body.appendChild(instructions);
    
    // Add event listener to close button
    instructions.querySelector('.close-instructions').addEventListener('click', () => {
      document.body.removeChild(instructions);
    });
  };
  
  // Add CSS for the install button and instructions
  const style = document.createElement('style');
  style.textContent = `
    .install-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: #4b9f46;
      color: white;
      border: none;
      border-radius: 50px;
      padding: 10px 20px;
      font-size: 16px;
      font-weight: bold;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      cursor: pointer;
    }
    
    .install-instructions {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2000;
    }
    
    .install-modal {
      background-color: white;
      padding: 20px;
      border-radius: 10px;
      max-width: 80%;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    
    .install-modal h3 {
      color: #4b9f46;
      margin-top: 0;
    }
    
    .install-modal ul {
      text-align: left;
      padding-left: 20px;
    }
    
    .close-instructions {
      background-color: #4b9f46;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 5px;
      margin-top: 10px;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);
  
  // Show the install button when the app is installable
  installButton.addEventListener('click', (e) => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
          // Show manual installation instructions
          showInstallInstructions();
        }
        deferredPrompt = null;
        installButton.style.display = 'none';
      });
    } else {
      // If deferredPrompt is not available, show manual installation instructions
      showInstallInstructions();
    }
  });
});

// Listen for the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  // Update UI to notify the user they can add to home screen
  installButton.style.display = 'block';
});

// Hide the install button when the PWA is installed
window.addEventListener('appinstalled', (evt) => {
  console.log('App was installed');
  installButton.style.display = 'none';
});
