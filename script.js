// const imageUpload = document.getElementById('imageUpload')
const video = document.getElementById('video');
const canvasPic = document.getElementById('canvas');
const context = canvasPic.getContext('2d');
const captureButton = document.getElementById('captureButton');

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start)

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
captureButton.addEventListener('click', async function() {
    // Set canvas size to video size
    canvasPic.width = video.videoWidth;
    canvasPic.height = video.videoHeight;

    // Draw the current video frame on the canvas
    context.drawImage(video, 0, 0, canvasPic.width, canvasPic.height);

    // Show the canvas (captured image)
    canvasPic.style.display = 'block';

    // Optionally, get the image data URL (if you want to upload it, for example)
    // const imageDataUrl = canvasPic.toDataURL('image/png');
    // console.log(imageDataUrl);  // You can use this data URL to upload the image

    // const image = await faceapi.bufferToImage(canvasPic.toDataURL());
    const detections = await faceapi
        .detectAllFaces(canvasPic)
        .withFaceLandmarks()
        .withFaceDescriptors();

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

        if (isUserCorrect) {
            document.getElementById("outputPerson").innerHTML = "User Is Correct";
        } else {
            document.getElementById("outputPerson").innerHTML = "User is not correct";
        }
    });
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
    const latAndLong = {lat: latitude, lng: longitude};
    let latAndLongSupposed = readFromDb();

    if (acceptedCoord(latAndLong.lat, latAndLong.lng, latAndLongSupposed.lat, latAndLongSupposed.lng)) {
        document.getElementById("outputCoord").innerHTML = `Coordinates Accepted`;
    } else {
        document.getElementById("outputCoord").innerHTML = `Coordinates Unaccepted`;
    }
}

function verifyUser(nameCurrent) {
    const index = nameCurrent.indexOf("(") - 1;
    const nameUser = nameCurrent.substring(0, index);
    const nameGotten = readFromDb();
    let nameSupposed = nameGotten.name;

    return nameSupposed === nameUser;
}

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

function readFromDb() {
    return {lat: 5.3940957376736085, lng: 100.3065250210288, name: "Eminem"}
}

// async function start() {
//   // const container = document.createElement('div')
//   // container.style.position = 'relative'
//   // document.body.append(container)
//   const labeledFaceDescriptors = await loadLabeledImages()
//   const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
//   let image
//   let canvas
//   document.body.append('Loaded')
//   canvasPic.addEventListener('change', async () => {
//     if (image) image.remove()
//     if (canvas) canvas.remove()
//     image = await faceapi.bufferToImage(canvasPic)
//     // container.append(image)
//     canvas = faceapi.createCanvasFromMedia(image)
//     // container.append(canvas)
//     const displaySize = { width: image.width, height: image.height }
//     faceapi.matchDimensions(canvas, displaySize)
//     const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
//     const resizedDetections = faceapi.resizeResults(detections, displaySize)
//     const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
//     results.forEach((result, i) => {
//       const box = resizedDetections[i].detection.box
//       const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
//       drawBox.draw(canvas)
//         console.log(result.toString())
//     })
//   })
// }


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

async function start() {
    document.body.append('Face API models loaded.');
}
