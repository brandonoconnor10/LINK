// Handle Save button
document.getElementById('saveBtn').addEventListener('click', async () => {
  const url = document.getElementById('urlInput').value;
  const title = document.getElementById('titleInput').value;

  try {
    const response = await fetch('http://localhost:5000/api/saveLink', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        title,
        originClient: 'extension'
      })
    });

    const data = await response.json();
    console.log('Saved:', data);
    alert('Link saved!');
  } catch (err) {
    console.error(err);
    alert('Error saving link');
  }
});

// Handle View button (single clean handler)
document.getElementById('viewBtn').addEventListener('click', async () => {
  try {
    const response = await fetch('http://localhost:5000/api/getLinks');
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
            method: 'DELETE'
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
              headers: { 'Content-Type': 'application/json' },
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

      // Attach buttons
      item.appendChild(delBtn);
      item.appendChild(editBtn);
      list.appendChild(item);
    });
  } catch (err) {
    console.error(err);
    alert('Error fetching links');
  }
});
