const KEY_USERS_LIST = "users";

let map;

async function initMap() {
    const { Map } = await google.maps.importLibrary("maps");

    map = new Map(document.getElementById("map"), {
        center: { lat: 4.776740526177678, lng: 109.87607996748248 },
        zoom: 6.5,
        mapId: "map",
    });
}

async function addMarker(image, coordinates, titleMarker, status) {

    const { PinElement } = await google.maps.importLibrary('marker');
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    let glyphImg = document.createElement("img");

    //"https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png"
    glyphImg.src = image;

    glyphImg = scaleImage(glyphImg);

    let pin;

    if (status === 'good') {
        pin = new PinElement({
            glyph: glyphImg,
            scale: 3.4,
            background: "#ff0000"
        })
    } else if (status === 'potentialIssue') {
        pin = new PinElement({
            glyph: glyphImg,
            scale: 3.4,
            background: "#ffff00"
        })
    } else {
        pin = new PinElement({
            glyph: glyphImg,
            scale: 3.4,
            background: "#a52a2a"
        })
    }

    const marker = new AdvancedMarkerElement({
        map: map,
        position: coordinates,
        title: titleMarker,
        content: pin.element,
    });
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

initMap();