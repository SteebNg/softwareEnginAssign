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
    locationDisplay.textContent = `Latitude: ${latitude}, Longitude: ${longitude}`;
    document.body.appendChild(locationDisplay);
}

// Load the face recognition models from the specified URI
Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start) // Once models are loaded, call the start function

// Asynchronous start function to initialize face recognition
async function start() {
    const container = document.createElement('div')
    container.style.position = 'relative'
    document.body.append(container)

    // Load labeled images and create face matcher
    const labeledFaceDescriptors = await loadLabeledImages()
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6) // 0.6 is the threshold for matching

    let image
    let canvas
    document.body.append('Loaded')

    // Event listener for file input change
    imageUpload.addEventListener('change', async () => {
        if (image) image.remove() // Remove previous image if it exists
        if (canvas) canvas.remove() // Remove previous canvas if it exists

        // Convert uploaded file to image and display it
        image = await faceapi.bufferToImage(imageUpload.files[0])
        container.append(image)

        // Create a canvas to draw face detection boxes
        canvas = faceapi.createCanvasFromMedia(image)
        container.append(canvas)
        const displaySize = { width: image.width, height: image.height }
        faceapi.matchDimensions(canvas, displaySize)

        // Detect all faces in the image with landmarks and descriptors
        const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)

        // Find the best match for each detected face
        const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))

        // Draw boxes around detected faces with labels
        results.forEach((result, i) => {
            const box = resizedDetections[i].detection.box
            const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
            drawBox.draw(canvas)
        })
    })
}

// Function to load labeled images for face recognition
function loadLabeledImages() {
    const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Tony Stark']
    return Promise.all(
        labels.map(async label => {
            const descriptions = []
            for (let i = 1; i <= 2; i++) {
                // Fetch image from the given URL
                const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/SteebNg/softwareEnginAssign/master/labeled_images/${label}/${i}.jpg`)

                // Detect face in the image with landmarks and descriptor
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                descriptions.push(detections.descriptor) // Add face descriptor to descriptions
            }

            // Create and return labeled face descriptors for each label
            return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
    )
}