const _test_cases = [
  1,
  "pornhub.com",
  0,
  "127.0.0.1",
  0,
  "qq.com",
  0,
  "im.qq.com",
  0,
  "www.qq.com",
  1,
  "youtube.com",
  1,
  "google.com",
  0,
  "localhost",
];

// 0:random, 1: cn: 2:us
var _test_current_ns_resolve_desire_type = 0;
// 0:false, 1: true -1:random
var _test_current_in_net_desire_type = -1;

const _test_ips = { cn: "113.219.136.8", us: "47.246.25.253" };

function isPlainHostName(host) {
  if (host.toLowerCase() == "localhost") return true;
  return false;
}

var _test_boolValueG = (function* () {
  while (1) {
    yield Math.random() >= 0.5;
  }
})();

var _test_ipG = (function* () {
  // generator for random ips.
  while (1) {
    yield Math.floor(Math.random() * 255) +
      1 +
      "." +
      Math.floor(Math.random() * 255) +
      "." +
      Math.floor(Math.random() * 255) +
      "." +
      Math.floor(Math.random() * 255);
  }
})();

function dnsResolve(host) {
  if (_test_current_ns_resolve_desire_type === 1) {
    return _test_ips.cn;
  } else if (_test_current_ns_resolve_desire_type === 2) {
    return _test_ips.us;
  } else {
    return _test_ipG.next().value;
  }
}

function isInNet(ip, ipstart, ipmask) {
  if (_test_current_in_net_desire_type === 0) {
    return false;
  } else if (_test_current_in_net_desire_type === 1) {
    return true;
  } else {
    return _test_boolValueG.next().value;
  }
}

function shExpMatch(a, b) {
  return _test_boolValueG.next().value;
}

function _testPac(url, host) {
  ret = FindProxyForURL(url, host);
  if (typeof DIRECT == "undefined") {
    if (ret.toLowerCase().indexOf("direct") >= 0) {
      return 0;
    }
    return 1;
  } else if (ret === DIRECT) return 0;
  else return 1;
}

function _testBatch(out_obj) {
  output.value = "";
  for (var j = 0; j < _test_cases.length; j += 2) {
    var test_case = _test_cases[j + 1];
    var test_result_desire = _test_cases[j];
    if (test_result_desire === 1) {
      _test_current_ns_resolve_desire_type = 2;
    } else {
      _test_current_ns_resolve_desire_type = 1;
    }
    if (test_case === "127.0.0.1") {
      _test_current_in_net_desire_type = 1;
    } else {
      _test_current_in_net_desire_type = 0;
    }
    var test_result = _testPac(test_case, test_case);
    var out_line = "" + test_result + " " + test_case + " ";
    if (test_result === test_result_desire) {
      out_line = out_line + "Pass";
    } else {
      out_line = out_line + "NOT Pass";
    }
    out_obj.value = out_obj.value + out_line + "\n";
  }

  _test_current_ns_resolve_desire_type = 0;
  _test_current_in_net_desire_type = -1;
  var start = new Date();
  if (_test_cases.length > 1) {
    for (var j = 0; j < 100000; ++j) {
      var test_case = _test_cases[1];
      _testPac(test_case, test_case);
    }
  }
  var end = new Date();
  alert(String(end - start) + "ms in 100,000 tests");
}

function _begin_test() {
  var output = document.getElementById("output");
  _testBatch(output);
}

function _test_one() {
  var input = document.getElementById("input");
  var result_obj = document.getElementById("result");
  result = _testPac(input.value, input.value);
  if (result === 1) result_obj.value = "Proxy";
  else result_obj.value = "Direct";
}
