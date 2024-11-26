const acceptedCoord = require('./acceptedCoord')

test('User Not In Coordinate Range', () =>{
    expect(acceptedCoord(1.874297,2.798423,3.482023,4.094523)).toBe(false)
})

test('User In Coordinate Range', () =>{
    expect(acceptedCoord(1.874297,2.798423,1.874287,2.798433)).toBe(true)
})

test('User Beside The Specific Building', () =>{
    expect(acceptedCoord(5.332113,100.277822,5.332148, 100.277935)).toBe(true)
})

test('User opposite The Specific Building', () =>{
    expect(acceptedCoord(5.332118470757158, 100.27783586353088,5.331926187353926, 100.27780635923209)).toBe(true)
})


const verifyUser = require('./verifyUser')

test(' User is not Verified', () =>{
    expect(verifyUser('John')).toBe(false)
})

test('User is verified', () =>{
    expect(verifyUser('Eminem (')).toBe(true)
})


