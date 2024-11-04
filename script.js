const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const captureButton = document.getElementById('captureButton');

navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(function(stream) {
        video.srcObject = stream;
        video.width = 500;
        video.height = 500;
    })
    .catch(function(error) {
        console.log("Error accessing the camera: " + error);
    });

getLocation()

// Capture an image when the button is clicked
captureButton.addEventListener('click', function() {
    // Set canvas size to video size
    canvas.width = video.width;
    canvas.height = video.height;

    // Draw the current video frame on the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Show the canvas (captured image)
    canvas.style.display = 'block';

    // Optionally, get the image data URL (if you want to upload it, for example)
    const imageDataUrl = canvas.toDataURL('image/png');
    console.log(imageDataUrl);  // You can use this data URL to upload the image

});

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        console.error("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // Display the latitude and longitude below the canvas
    const locationDisplay = document.createElement('p');
    locationDisplay.textContent = 'Latitude: ${latitude}, Longitude: ${longitude}';
    document.body.appendChild(locationDisplay);
}