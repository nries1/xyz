//TODO: Run this through a transpiler for Edge users
(function(window) {
    let MYGEOMETRY = {};
  
    MYGEOMETRY.toRadians = function(degrees) {
      const rads = (degrees * Math.PI) / 180;
      return rads;
    };
  
    MYGEOMETRY.toDegrees = function(radians) {
      let degrees = radians * (180 / Math.PI);
      if (degrees < 0) degrees = 360 + degrees;
      return degrees;
    };
  
    MYGEOMETRY.getBearing = function(userLat, userLon, objectLat, objectLon) {
      // this is the angle that a user would need to start walking at in order to get from their location to the object's location
      objectLat = MYGEOMETRY.toRadians(objectLat);
      objectLon = MYGEOMETRY.toRadians(objectLon);
      userLat = MYGEOMETRY.toRadians(userLat);
      userLon = MYGEOMETRY.toRadians(userLon);
      const Y = Math.sin(objectLon - userLon) * Math.cos(objectLat);
      const X =
        Math.cos(userLat) * Math.sin(objectLat) -
        Math.sin(userLat) *
          Math.cos(objectLat) *
          Math.cos(objectLon - userLon);
      const bearing = Math.atan2(Y, X);
      return MYGEOMETRY.toDegrees(bearing);
    };
  
    MYGEOMETRY.getUserBearing = function(bearing, compassHeading) {
      // adjust true north based on the user's look direction to make wherever the user is looking appear to be "forward"
      // e.g. the bearing between a user and an object may be 45deg.
      // meaning the user would walk start walking along a 45 degree
      // angle (given the curvature of the earth) to reach the object.
      // But, that 45 degrees is relative to a bearing of 0 deg (due north)
      // if the user is facing west (270 deg) and the bearing is 45 deg,
      // then we need to adjust the angle that they would need to walk at.
      // To do that we add the angle between the user's compass bearing and due north to their bearing.
      // So in the example, if the bearing is 45 deg but the user is facing west (270 deg), we need 
      // to compesate for the fact the user is "turned" westward from the direction that we assumed they were we
      // calculated the original bearing. Specifically, they're turned 360 - 270 = 90 deg westward. So we add that 90 deg
      // to their bearing and the user bearing ends up being 90 + 45 = 135 deg.
      return compassHeading > bearing
        ? 360 - compassHeading + bearing
        : bearing - compassHeading;
    };
  
    MYGEOMETRY.getHaversineDistance = function(userLat, userLon, objectLat, objectLon) {
      // formula from https://www.movable-type.co.uk/scripts/latlong.html
      // calculate the distance over the Earth between 2 points given lat and long
      const R = 6371e3; // Earth's radius in meters
      const rLat1 = MYGEOMETRY.toRadians(userLat);
      const rLat2 = MYGEOMETRY.toRadians(objectLat);
      const dLat = MYGEOMETRY.toRadians(objectLat - userLat);
      const dLon = MYGEOMETRY.toRadians(objectLon - userLon);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rLat1) *
          Math.cos(rLat2) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      return distance;
    };
  
    MYGEOMETRY.getXandZ = function(bearing, distance, compassHeading) {
      //return the x and z coordinates needed to place an object relative to a user
      //given the bearing and distance between the user and that object
      const { getUserBearing, getTheta, getQuadrant } = MYGEOMETRY
      bearing = getUserBearing(bearing, compassHeading);
      const theta = getTheta(bearing);
      const quadrant = getQuadrant(bearing);
      const sinTheta = Math.abs(Math.sin(theta));
      const CosTheta = Math.abs(Math.cos(theta));
      const oppositeLeg = CosTheta * distance;
      const adjacentLeg = sinTheta * distance;
      if (quadrant === 1)
        return {
          x: oppositeLeg,
          z: 0 - adjacentLeg
        };
      if (quadrant === 2) return { z: adjacentLeg, x: oppositeLeg };
      if (quadrant === 3)
        return {
          x: 0 - oppositeLeg,
          z: adjacentLeg
        };
      if (quadrant === 4)
        return {
          x: 0 - adjacentLeg,
          z: 0 - oppositeLeg
        };
    };
  
    MYGEOMETRY.getTheta = function(bearing) {
      //get the angle btw 0 and 90 for a given bearing angle (0 to 360);
      // e.g. if the user's bearing is 275deg (5 deg more than due west), their theta is 5 deg
      const theta = bearing - Math.floor(bearing / 90) * 90;
      return theta;
    };
  
    MYGEOMETRY.getQuadrant = function(theta) {
      if (theta < 90) return 1;
      if (theta < 180) return 2;
      if (theta < 270) return 3;
      return 4;
    };
    window.MYGEOMETRY = MYGEOMETRY;
  })(window);