document.getElementById("googleLoginBtn").addEventListener("click", async () => {
  try {
    // Remove any cached token first to force fresh login
    const cachedToken = await new Promise((resolve) => {
      chrome.identity.getAuthToken({ interactive: false }, (token) => resolve(token));
    });

    if (cachedToken) {
      await new Promise((resolve) => {
        chrome.identity.removeCachedAuthToken({ token: cachedToken }, resolve);
      });
    }

    // Now get a fresh token interactively
    const token = await new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(token);
        }
      });
    });

    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });

    const data = await res.json();

    chrome.storage.local.set({ jwt: data.token }, () => {
      alert("Login successful!");
      window.close();
    });

  } catch (err) {
    console.error("Login failed", err);
    alert("Login failed: " + err.message);
  }
});