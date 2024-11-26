//(TODO) NKL
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs, getDoc, doc, setDoc, initializeFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const KEY_USERS_LIST = "users";

let map;

async function initMap() {
    const { Map } = await google.maps.importLibrary("maps");

    const map = new Map(document.getElementById("map"), {
        center: { lat: 4.776740526177678, lng: 109.87607996748248 },
        zoom: 5.5,
        mapId: "map",
    });

    // Fetch verification data from localStorage
    const verificationData = JSON.parse(localStorage.getItem('verificationData'));
    if (verificationData) {
        for (const user of verificationData) {
            const { coordinates, title, status } = user;

            // Add a marker for each verified user
            const img = new Image();
            img.src = "https://via.placeholder.com/40"; // Replace with dynamic user image URL if available
            await addMarker(img, coordinates, title, status, map);
        }
    } else {
        console.error("No verification data found in localStorage.");
    }
}

function scaleImage(glyphImg) {
    const maxWidth = 40; // Set your desired maximum width
    const maxHeight = 40; // Set your desired maximum height

    // Calculate aspect ratio preserving dimensions
    const imgRatio = glyphImg.naturalWidth / glyphImg.naturalHeight;

    let newWidth = maxWidth;
    let newHeight = maxHeight;

    if (imgRatio > 1) {
        newHeight = maxHeight;
        newWidth = newHeight * imgRatio;
    } else {
        newWidth = maxWidth;
        newHeight = newWidth / imgRatio;
    }

    glyphImg.width = newWidth;
    glyphImg.height = newHeight;

    return glyphImg;
}


//(TODO) NWC
async function addMarker(image, coordinates, titleMarker, status, map) {
    const { PinElement } = await google.maps.importLibrary('marker');
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    // const glyphImg = scaleImage(image);
    let glyphImg = document.createElement("img");

    glyphImg.src = image;

    glyphImg = scaleImage(glyphImg);

    let pin;
    if (status === 'good') {
        pin = new PinElement({
            scale: 2,
            background: "#3BB143"
        });
    } else if (status === 'potentialIssue') {
        pin = new PinElement({
            scale: 2,
            background: "#ffff00"
        });
    } else {
        pin = new PinElement({
            scale: 2,
            background: "#FF0000"
        });
    }

    new AdvancedMarkerElement({
        map: map,
        position: coordinates,
        title: titleMarker,
        content: pin.element,
    });
}


//(TODO) Henry Tan
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA52UsRsXxE-Jk2ZOnnqBQYSAzWHAG6UbM",
    authDomain: "softwareengineer-57691.firebaseapp.com",
    projectId: "softwareengineer-57691",
    storageBucket: "softwareengineer-57691.appspot.com",
    messagingSenderId: "724862222311",
    appId: "1:724862222311:web:8584fc27bcf11c8b084742",
    measurementId: "G-544WZNMBPJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

initMap();


//get data from firebase storage and firestore
//firestore long and lat and for the status
//storage is for image of the persons that uses that location
const querySnapshot = await getDocs(collection(db, "users"));
await querySnapshot.forEach((doc) => {
    if (doc.exists) {
        let username = doc.data() ['name'];
        let coordinates = {lat: doc.data() ['lat'], lng: doc.data() ['long']};
        let titleMarker = doc.data() ['title'];
        let status = doc.data() ['status'];
        let img

        getDownloadURL(ref(storage, 'users/' + doc.id + '/' + 'image.jpg'))
            .then((url) => {
                img = document.createElement("img");
                img.setAttribute("src", url);
            });

        addMarker(img, coordinates, titleMarker, status);
    }
})