"use strict";

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

  MYGEOMETRY.getBearing = function (user, business) {
    var businessLat = MYGEOMETRY.toRadians(business.latitude);
    var businessLng = MYGEOMETRY.toRadians(business.longitude);
    var userLat = MYGEOMETRY.toRadians(user.latitude);
    var userLng = MYGEOMETRY.toRadians(user.longitude);
    var Y = Math.sin(businessLng - userLng) * Math.cos(businessLat);
    var X = Math.cos(userLat) * Math.sin(businessLat) - Math.sin(userLat) * Math.cos(businessLat) * Math.cos(businessLng - userLng);
    var bearing = Math.atan2(Y, X);
    return MYGEOMETRY.toDegrees(bearing);
  };

  MYGEOMETRY.getUserBearing = function (bearing, compassHeading) {
    //adjust true north based on the user's look direction to make wherever the user is looking appear to be "forward"
    return compassHeading > bearing ? 360 - compassHeading + bearing : bearing - compassHeading;
  };

  MYGEOMETRY.getHaversineDistance = function (user, business) {
    var lat1 = user.latitude;
    var lon1 = user.longitude;
    var lat2 = business.latitude;
    var lon2 = business.longitude; // formula from https://www.movable-type.co.uk/scripts/latlong.html
    // calculate the distance over the Earth between 2 points given lat and long

    var R = 6371e3; // Earth's radius in meters

    var rLat1 = MYGEOMETRY.toRadians(lat1);
    var rLat2 = MYGEOMETRY.toRadians(lat2);
    var dLat = MYGEOMETRY.toRadians(lat2 - lat1);
    var dLon = MYGEOMETRY.toRadians(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var distance = R * c;
    return distance;
  };

  MYGEOMETRY.getXandZ = function (bearing, distance, compassHeading) {
    //return the x and z coordinates needed to place an object relative to a user
    //given the bearing and distance between the user and that object
    bearing = MYGEOMETRY.getUserBearing(bearing, compassHeading);
    var theta = MYGEOMETRY.getTheta(bearing);
    var quadrant = MYGEOMETRY.getQuadrant(bearing);
    var sinTheta = Math.abs(Math.sin(theta));
    var CosTheta = Math.abs(Math.cos(theta));
    var oppositeLeg = CosTheta * distance;
    var adjacentLeg = sinTheta * distance;
    if (quadrant === 1) return {
      x: oppositeLeg,
      z: 0 - adjacentLeg
    };
    if (quadrant === 2) return {
      x: adjacentLeg,
      z: oppositeLeg
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
    //get the angle btw 0 and 90 for a given bearing angle (0 to 360);
    var theta = bearing - Math.floor(bearing / 90) * 90;
    return theta;
  };

  MYGEOMETRY.getQuadrant = function (theta) {
    if (theta < 90) return 1;
    if (theta < 180) return 2;
    if (theta < 270) return 3;
    return 4;
  };

  window.MYGEOMETRY = MYGEOMETRY;
})(window);