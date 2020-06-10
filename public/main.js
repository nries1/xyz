var _window = window,
    MYGEOMETRY = _window.MYGEOMETRY;
window.addEventListener('load', function () {
  document.getElementById('form').addEventListener('submit', function (e) {
    submit(e);
  });
});

var submit = function submit(e) {
  e.preventDefault();
  var _e$target$elements = e.target.elements,
      uLat = _e$target$elements.uLat,
      uLon = _e$target$elements.uLon,
      uAlt = _e$target$elements.uAlt,
      oLat = _e$target$elements.oLat,
      oLon = _e$target$elements.oLon,
      oAlt = _e$target$elements.oAlt,
      uBearing = _e$target$elements.uBearing;
  var getBearing = MYGEOMETRY.getBearing,
      getHaversineDistance = MYGEOMETRY.getHaversineDistance,
      getXandZ = MYGEOMETRY.getXandZ;
  var xDemo = document.getElementById('x');
  var zDemo = document.getElementById('z');
  var yDemo = document.getElementById('y');
  var bearing = getBearing(uLat.value, uLon.value, oLat.value, oLon.value);
  console.log('bearing = ', bearing);
  var distance = getHaversineDistance(uLat.value, uLon.value, oLat.value, oLon.value);
  console.log('distance = ', distance);

  var _getXandZ = getXandZ(bearing, distance, uBearing.value),
      x = _getXandZ.x,
      z = _getXandZ.z;

  console.log('xz = ', x, ' ', z);
  objectAlt = Number(oAlt.value) || 0;
  userAlt = Number(uAlt.value) || 0;
  console.log(objectAlt);
  console.log(userAlt);
  console.log(objectAlt > userAlt);
  var y = objectAlt - userAlt;
  xDemo.innerHTML = x;
  zDemo.innerHTML = z;
  yDemo.innerHTML = y;
};