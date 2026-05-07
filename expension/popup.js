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
