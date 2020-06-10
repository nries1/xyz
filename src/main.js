const { MYGEOMETRY } = window;

window.addEventListener('load', function() {
    document.getElementById('form').addEventListener('submit', function(e) {
        submit(e);
    })
})

const submit = e => {
    e.preventDefault();
    const { uLat, uLon, uAlt, oLat, oLon, oAlt, uBearing } = e.target.elements;
    const { getBearing, getHaversineDistance, getXandZ } = MYGEOMETRY;
    const xDemo = document.getElementById('x');
    const zDemo = document.getElementById('z');
    const yDemo = document.getElementById('y');
    const bearing = getBearing(uLat.value, uLon.value, oLat.value, oLon.value);
    console.log('bearing = ', bearing)
    const distance = getHaversineDistance(uLat.value, uLon.value, oLat.value, oLon.value )
    console.log('distance = ', distance)
    const { x, z } = getXandZ(bearing, distance, uBearing.value)
    console.log('xz = ',x, ' ', z)
    objectAlt = Number(oAlt.value) || 0;
    userAlt = Number(uAlt.value) || 0;
    console.log(objectAlt)
    console.log(userAlt)
    console.log(objectAlt > userAlt)
    const y = objectAlt - userAlt;
    xDemo.innerHTML = x;
    zDemo.innerHTML = z;
    yDemo.innerHTML = y;
}