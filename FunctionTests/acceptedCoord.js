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

module.exports = acceptedCoord;