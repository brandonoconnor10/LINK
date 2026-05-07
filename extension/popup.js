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

document.getElementById('viewBtn').addEventListener('click', async () => {
  try {
    const response = await fetch('http://localhost:5000/api/getLinks');
    const links = await response.json();

    const list = document.getElementById('linksList');
    list.innerHTML = '';

    links.forEach(link => {
      const item = document.createElement('li');
      item.textContent = `${link.title} - ${link.url}`;

      // Add delete button
      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.onclick = async () => {
        try {
          await fetch(`http://localhost:5000/api/deleteLink/${link._id}`, {
            method: 'DELETE'
          });
          alert('Link deleted!');
          item.remove(); // remove from UI
        } catch (err) {
          console.error(err);
          alert('Error deleting link');
        }
      };

      item.appendChild(delBtn);
      list.appendChild(item);
    });
  } catch (err) {
    console.error(err);
    alert('Error fetching links');
  }
});
