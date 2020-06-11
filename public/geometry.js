//TODO: Run this through a transpiler for Edge users
(function (window) {
  var MYGEOMETRY = {};

  MYGEOMETRY.toRadians = function (degrees) {
    var rads = degrees * Math.PI / 180;
    return rads;
  };

  MYGEOMETRY.toDegrees = function (radians) {
    var degrees = radians * (180 / Math.PI);
    if (degrees < 0) degrees = 360 + degrees;
    return degrees;
  };

  MYGEOMETRY.getBearing = function (userLat, userLon, objectLat, objectLon) {
    // this is the angle that a user would need to start walking at in order to get from their location to the object's location
    // formula from https://www.igismap.com/formula-to-find-bearing-or-heading-angle-between-two-points-latitude-longitude/
    objectLat = MYGEOMETRY.toRadians(objectLat);
    objectLon = MYGEOMETRY.toRadians(objectLon);
    userLat = MYGEOMETRY.toRadians(userLat);
    userLon = MYGEOMETRY.toRadians(userLon);
    var longitudeDelta = objectLon - userLon; // tweaking bearing formula

    var X = Math.cos(objectLat) * Math.sin(longitudeDelta);
    var Y = Math.cos(userLat) * Math.sin(objectLat) - Math.sin(userLat) * Math.cos(objectLat) * Math.cos(longitudeDelta);
    var bearing = Math.atan2(X, Y);
    return MYGEOMETRY.toDegrees(bearing);
  };

  MYGEOMETRY.getUserBearing = function (bearing, compassHeading) {
    // adjust true north based on the user's look direction to make wherever the user is looking appear to be "forward"
    // e.g. the bearing between a user and an object may be 45deg.
    // meaning the user would start walking along a 45 degree
    // angle (given the curvature of the earth) to reach the object.
    // But, that 45 degrees is relative to a bearing of 0 deg (due north)
    // if the user is facing west (270 deg) and the bearing is 45 deg,
    // then we need to adjust the angle that they would need to walk at.
    // To do that we add the angle between the user's compass bearing and due north to their bearing.
    // So in the example, if the bearing is 45 deg but the user is facing west (270 deg), we need 
    // to compesate for the fact the user is "turned" westward from the direction that we assumed they were we
    // calculated the original bearing. Specifically, they're turned 360 - 270 = 90 deg westward. So we add that 90 deg
    // to their bearing and the user bearing ends up being 90 + 45 = 135 deg.
    return compassHeading > bearing ? 360 - compassHeading + bearing : bearing - compassHeading;
  };

  MYGEOMETRY.getHaversineDistance = function (userLat, userLon, objectLat, objectLon) {
    // formula from https://www.movable-type.co.uk/scripts/latlong.html
    // calculate the distance over the Earth between 2 points given lat and long
    var R = 6371e3; // Earth's radius in meters

    var rLat1 = MYGEOMETRY.toRadians(userLat);
    var rLat2 = MYGEOMETRY.toRadians(objectLat);
    var dLat = MYGEOMETRY.toRadians(objectLat - userLat);
    var dLon = MYGEOMETRY.toRadians(objectLon - userLon);
    var a = (Math.pow(Math.sin(dLat / 2), 2) + Math.cos(rLat1)) * Math.cos(rLat2) * Math.pow(Math.sin(dLon / 2), 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var distance = R * c;
    return distance;
  };

  MYGEOMETRY.getXandZ = function (bearing, distance, compassHeading) {
    //return the x and z coordinates needed to place an object relative to a user
    //given the bearing and distance between the user and that object
    var getUserBearing = MYGEOMETRY.getUserBearing,
        getTheta = MYGEOMETRY.getTheta,
        getQuadrant = MYGEOMETRY.getQuadrant;
    bearing = getUserBearing(bearing, compassHeading);
    var theta = getTheta(bearing);
    var quadrant = getQuadrant(bearing);
    var sinTheta = Math.abs(Math.sin(theta));
    var cosTheta = Math.abs(Math.cos(theta));
    var oppositeLeg = cosTheta * distance;
    var adjacentLeg = sinTheta * distance;
    console.log('quadrant = ', quadrant);
    if (quadrant === 1) return {
      x: oppositeLeg,
      z: 0 - adjacentLeg
    };
    if (quadrant === 2) return {
      z: adjacentLeg,
      x: oppositeLeg
    };
    if (quadrant === 3) return {
      x: 0 - oppositeLeg,
      z: adjacentLeg
    };
    if (quadrant === 4) return {
      x: 0 - adjacentLeg,
      z: 0 - oppositeLeg
    };
  };

  MYGEOMETRY.getTheta = function (bearing) {
    // get the angle btw 0 and 90 for a given bearing angle (0 to 360);
    // e.g. if the user's bearing is 275deg (5 deg more than due west), their theta is 5 deg
    var theta = bearing <= 90 ? 90 - bearing : bearing - Math.floor(bearing / 90) * 90;
    return theta;
  };

  MYGEOMETRY.getQuadrant = function (theta) {
    if (theta <= 90) return 1;
    if (theta <= 180) return 2;
    if (theta <= 270) return 3;
    return 4;
  };

  window.MYGEOMETRY = MYGEOMETRY;
})(window);