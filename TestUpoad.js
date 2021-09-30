const formData = new FormData();
const photos = document.querySelector('input[type="file"][multiple]');

formData.append('title', 'My Vegas Vacation');
for (let i = 0; i < photos.files.length; i++) {
  formData.append("`photos_${i}`", photos.files[i]);
}

fetch('/posts', {
  method: 'POST',
  body: formData,
})
.then(response => response.json())
.then(result => {
  alert('Success:', result);
})
.catch(error => {
  alert('Error:', error);
});
