var PROXY = __PROXY__;
var DIRECT = "DIRECT;";

var privateNetworks = __PrivateNetworks__;

var CNIPv4Ranges = __CNIPv4Ranges__;

function isIPv4(host) {
  var bytes = host.split(".");
  if (bytes.length === 4) {
    var piece_1 = Number(bytes[0]);
    if (isNaN(piece_1) || piece_1 < 1 || piece_1 > 0xffff) {
      return false;
    }
    var piece_2 = Number(bytes[1]);
    if (isNaN(piece_2) || piece_2 < 0 || piece_2 > 0xffff) {
      return false;
    }
    var piece_3 = Number(bytes[2]);
    if (isNaN(piece_3) || piece_3 < 0 || piece_3 > 0xffff) {
      return false;
    }
    var piece_4 = Number(bytes[3]);
    if (isNaN(piece_4) || piece_4 < 1 || piece_4 > 0xffff) {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
}

function cast24BitLowOfIPToInt(ip) {
  var bytes = ip.split(".");
  var result = 0;
  for (var i = 0, len = bytes.length; i <= len - 1; i++) {
    result = result * 256 + Number(bytes[i]);
  }
  return result & 0xffffff;
}

function isIPInSubnet(ip, subnetHead24BitLow, subnetTail24BitLow) {
  var ipInt24BitL = cast24BitLowOfIPToInt(ip);
  if (ipInt24BitL <= subnetTail24BitLow && ipInt24BitL >= subnetHead24BitLow) {
    return true;
  }
  return false;
}

function isIPInSubnetCollection(ip, collection) {
  var first8Bit = ip.match(/^\d+/)[0];
  var SearchRange = collection[first8Bit];
  if (SearchRange) {
    for (var i = 0, len = SearchRange.length; i + 1 <= len - 1; i += 2) {
      if (i + 1 > len - 1) {
        break;
      }
      if (isIPInSubnet(ip, SearchRange[i], SearchRange[i + 1])) {
        return true;
      }
    }
  }
  return false;
}

function isIPv4InPrivateNetwork(ip) {
  return isIPInSubnetCollection(ip, privateNetworks);
}

function isCNIPv4(ip) {
  return isIPInSubnetCollection(ip, CNIPv4Ranges);
}

function FindProxyForURL(url, host) {
  var ipHost = host;

  if (isPlainHostName(host)) {
    return DIRECT;
  } else if (!isIPv4(host)) {
    ipHost = dnsResolve(host);
  }

  if (!ipHost) {
    // use proxy when can't resolve host.
    return PROXY;
  } else if (!isIPv4(ipHost)) {
    // IPv6 or else
    return DIRECT;
  } else if (isIPv4InPrivateNetwork(ipHost)) {
    return DIRECT;
  } else if (isCNIPv4(ipHost)) {
    return DIRECT;
  } else {
    return PROXY;
  }
}
