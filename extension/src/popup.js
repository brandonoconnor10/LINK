function showLoggedIn() {
  document.getElementById('loggedOut').style.display = 'none';
  document.getElementById('loggedIn').style.display = 'block';
}

function showLoggedOut() {
  document.getElementById('loggedOut').style.display = 'block';
  document.getElementById('loggedIn').style.display = 'none';
}

// Check login state on open
chrome.storage.local.get('jwt', ({ jwt }) => {
  if (jwt) showLoggedIn();
  else showLoggedOut();
});

// Login — happens directly in popup, no separate tab
document.getElementById('loginBtn').addEventListener('click', () => {
  chrome.identity.getAuthToken({ interactive: true }, async (token) => {
    if (chrome.runtime.lastError || !token) {
      alert('Login failed: ' + (chrome.runtime.lastError?.message || 'No token'));
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await res.json();

      if (!data.token) {
        alert('Login failed: no JWT returned');
        return;
      }

      chrome.storage.local.set({ jwt: data.token }, () => {
        showLoggedIn();
      });

    } catch (err) {
      console.error(err);
      alert('Login failed: ' + err.message);
    }
  });
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  chrome.identity.getAuthToken({ interactive: false }, (token) => {
    if (token) {
      chrome.identity.removeCachedAuthToken({ token }, () => {
        fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`).catch(() => {});
      });
    }
  });

  chrome.storage.local.remove('jwt', () => {
    showLoggedOut();
  });
});

// Save
document.getElementById('saveBtn').addEventListener('click', async () => {
  const url = document.getElementById('urlInput').value;
  const title = document.getElementById('titleInput').value;

  if (!url || !title) {
    alert('Please enter both a title and URL.');
    return;
  }

  chrome.storage.local.get('jwt', async ({ jwt }) => {
    if (!jwt) { showLoggedOut(); return; }

    try {
      const response = await fetch('http://localhost:5000/api/saveLink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({ url, title, originClient: 'extension' })
      });

      const data = await response.json();
      alert('Link saved!');
      document.getElementById('urlInput').value = '';
      document.getElementById('titleInput').value = '';
    } catch (err) {
      console.error(err);
      alert('Error saving link');
    }
  });
});

// View
document.getElementById('viewBtn').addEventListener('click', async () => {
  chrome.storage.local.get('jwt', async ({ jwt }) => {
    if (!jwt) { showLoggedOut(); return; }

    try {
      const response = await fetch('http://localhost:5000/api/getLinks', {
        headers: { 'Authorization': `Bearer ${jwt}` }
      });
      const links = await response.json();

      const list = document.getElementById('linksList');
      list.innerHTML = '';

      if (links.length === 0) {
        list.innerHTML = '<li>No links saved yet.</li>';
        return;
      }

      links.forEach(link => {
        const item = document.createElement('li');
        item.textContent = `${link.title} - ${link.url}`;

        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.onclick = async () => {
          try {
            await fetch(`http://localhost:5000/api/deleteLink/${link._id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${jwt}` }
            });
            item.remove();
          } catch (err) {
            alert('Error deleting link');
          }
        };

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.onclick = async () => {
          const newTitle = prompt('Enter new title:', link.title);
          const newUrl = prompt('Enter new URL:', link.url);

          if (newTitle && newUrl) {
            try {
              const response = await fetch(`http://localhost:5000/api/updateLink/${link._id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${jwt}`
                },
                body: JSON.stringify({ title: newTitle, url: newUrl })
              });

              const data = await response.json();
              item.textContent = `${data.updated.title} - ${data.updated.url}`;
              item.appendChild(delBtn);
              item.appendChild(editBtn);
            } catch (err) {
              alert('Error updating link');
            }
          }
        };

        item.appendChild(delBtn);
        item.appendChild(editBtn);
        list.appendChild(item);
      });
    } catch (err) {
      console.error(err);
      alert('Error fetching links');
    }
  });
});