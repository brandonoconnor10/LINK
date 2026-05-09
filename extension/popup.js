import { auth, provider } from "./firebase.js";
import { signInWithPopup } from "firebase/auth";

// Handle Save button
document.getElementById('saveBtn').addEventListener('click', async () => {
  const url = document.getElementById('urlInput').value;
  const title = document.getElementById('titleInput').value;

  chrome.storage.local.get('jwt', async ({ jwt }) => {
    if (!jwt) {
      alert('You must be logged in first.');
      return;
    }

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
      console.log('Saved:', data);
      alert('Link saved!');
    } catch (err) {
      console.error(err);
      alert('Error saving link');
    }
  });
});

// Handle View button
document.getElementById('viewBtn').addEventListener('click', async () => {
  chrome.storage.local.get('jwt', async ({ jwt }) => {
    if (!jwt) {
      alert('You must be logged in first.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/getLinks', {
        headers: { 'Authorization': `Bearer ${jwt}` }
      });
      const links = await response.json();

      const list = document.getElementById('linksList');
      list.innerHTML = '';

      links.forEach(link => {
        const item = document.createElement('li');
        item.textContent = `${link.title} - ${link.url}`;

        // Delete button
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.onclick = async () => {
          try {
            await fetch(`http://localhost:5000/api/deleteLink/${link._id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${jwt}` }
            });
            alert('Link deleted!');
            item.remove();
          } catch (err) {
            console.error(err);
            alert('Error deleting link');
          }
        };

        // Edit button
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
              alert('Link updated!');
              item.textContent = `${data.updated.title} - ${data.updated.url}`;
              item.appendChild(delBtn);
              item.appendChild(editBtn);
            } catch (err) {
              console.error(err);
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

// Firebase Google Sign-In
document.getElementById("loginBtn").addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();

    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken })
    });

    const data = await res.json();
    chrome.storage.local.set({ jwt: data.token });
    console.log("Logged in:", data.user);
    alert("Login successful!");
  } catch (err) {
    console.error("Login failed", err);
    alert("Login failed");
  }
});

// Logout button
document.getElementById('logoutBtn').addEventListener('click', () => {
  chrome.storage.local.remove('jwt', () => {
    alert('Logged out successfully!');
    console.log("JWT cleared");
    location.reload();
  });
});
