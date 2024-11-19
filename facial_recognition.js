//(TODO) NKL
async function loadModels() {
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    console.log("Models loaded");
}

async function startWebcam() {
    const video = document.getElementById('webcam');
    video.style.display = 'block';

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(stream) {
                video.srcObject = stream;
                video.play();
            })
            .catch(function(err) {
                console.log("An error occurred: " + err);
            });
    } else {
        alert("Sorry, your browser does not support webcam access.");
    }
}

document.getElementById('captureButton').addEventListener('click', async function() {
    const video = document.getElementById('webcam');
    const canvasPic = document.getElementById('canvasPic');
    const context = canvasPic.getContext('2d');

    // Clear the result container before displaying the captured image
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = ''; // Clear previous results

    // Set canvas size to video size
    canvasPic.width = video.videoWidth;
    canvasPic.height = video.videoHeight;

    // Draw the current video frame on the canvas
    context.drawImage(video, 0, 0, canvasPic.width, canvasPic.height);

    // Hide the video element and show the canvas
    video.style.display = 'none';
    canvasPic.style.display = 'block';

    resultContainer.appendChild(canvasPic);

    const detections = await faceapi.detectAllFaces(canvasPic).withFaceLandmarks().withFaceDescriptors();

    const displaySize = { width: canvasPic.width, height: canvasPic.height };
    const faceMatcher = new faceapi.FaceMatcher(await loadLabeledImages(), 0.6);
    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    // Draw detections on the canvas
    resizedDetections.forEach((detection, i) => {
        const result = faceMatcher.findBestMatch(detection.descriptor);
        const box = detection.detection.box;

        context.strokeStyle = '#00FF00';
        context.lineWidth = 2;
        context.strokeRect(box.x, box.y, box.width, box.height);

        // Draw label
        context.fillStyle = '#00FF00';
        context.font = '16px Arial';
        context.fillText(result.toString(), box.x, box.y - 10);

        let isUserCorrect = verifyUser(result.toString());
        console.log(result.toString());

        const recognitionResult = document.createElement('p');
        recognitionResult.innerText = isUserCorrect ? "User Is Correct" : "User is not correct";
        resultContainer.appendChild(recognitionResult);
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        console.error("Geolocation is not supported by this browser.");
    }



    //(TODO) NWC
    function showPosition(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        console.log(latitude, longitude);
        const latAndLong = {lat: latitude, lng: longitude};
        let latAndLongSupposed = readFromDb();

        if (acceptedCoord(latAndLong.lat, latAndLong.lng, latAndLongSupposed.lat, latAndLongSupposed.lng)) {
            const coordinatesResult = document.createElement('p');
            coordinatesResult.innerText = "Coordinates Accepted";
            resultContainer.appendChild(coordinatesResult);
        } else {
            const coordinatesResult = document.createElement('p');
            coordinatesResult.innerText = "Coordinates Unaccepted";
            resultContainer.appendChild(coordinatesResult);
        }
    }
});

function acceptedCoord(latCurrent, lngCurrent, latSupposed, lngSupposed) {
    let latDiff = latCurrent - latSupposed;
    let lngDiff = lngCurrent - lngSupposed;
    if (latDiff < 0) {
        latDiff *= -1;
    }
    if (lngDiff < 0) {
        lngDiff *= -1;
    }
    return latDiff < 0.0005 && lngDiff < 0.0005;
}

function verifyUser(nameCurrent) {
    const index = nameCurrent.indexOf("(") - 1;
    const nameUser = nameCurrent.substring(0, index);
    const nameGotten = readFromDb();
    let nameSupposed = nameGotten.name;

    return nameSupposed === nameUser;
}

function readFromDb() {
    return {lat: 3.1502222, lng: 101.6944619, name: "Eminem"}
}

function loadLabeledImages() {
    const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Tony Stark', 'Eminem']
    return Promise.all(
        labels.map(async label => {
            const descriptions = []
            for (let i = 1; i <= 2; i++) {
                const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/SteebNg/softwareEnginAssign/faceRecog/labeled_images/${label}/${i}.jpg`)
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                if (detections) {
                    descriptions.push(detections.descriptor)
                }
            }
            return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
    )
}

(async function() {
    await loadModels();
})();
