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

module.exports = verifyUser;