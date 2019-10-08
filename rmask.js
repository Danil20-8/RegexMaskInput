var maskInput = function() {
  document.querySelectorAll("input[mask]").forEach(function(el) {
    var rr = parseRegexMask(el.getAttribute("mask"));
    el.addEventListener("focus", function(event) {
      var tP = el.selectionStart;
      el.value = rr.fix(el.value);
      el.selectionStart = tP;
      el.selectionEnd = tP;
    });
    el.addEventListener("keyup", function(event) {
      var tP = el.selectionStart;
      var tv = el.value;
      el.value = rr.fix(tv);
      if (el.selectionStart === el.selectionEnd) {
        el.selectionStart = tP;
        el.selectionEnd = el.selectionStart;
      }
    });
  });
};

var parseRegexMask = function(str) {
  var r = [];
  var p = 0;
  while (p < str.length) {
    var t = parseRegexItemMask(str.substring(p));
    r.push(t);
    p += t.regex.length;
  }

  return {
    fix: function(s) {
      var f = "";
      for (var i = 0; i < r.length; ++i) {
        var u = r[i].fix(s);
        f += u.match;
        s = u.rest;
      }
      return f;
    }
  };
};
var parseRegexItemMask = function(str) {
  var cSet = "";
  var dChar = "";
  var much = "";
  var uRegex = null;

  switch (str[0]) {
    case "\\":
      cSet = str.substring(0, 2);
      switch (cSet) {
        case "\\d":
          dChar = "0";
          break;
        case "\\s":
          dChar = " ";
          break;
        default:
          dChar = cSet[1];
          break;
      }

      break;
    case "[":
      cSet = str.substring(0, str.indexOf("]") + 1);
      if (cSet[1] === "\\") dChar = cSet.substring(1, 3);
      else if (cSet[1] === "^") dChar = "_";
      else { dChar = cSet[1]; }
      break;
    default:
      cSet = str[0];
      dChar = cSet;
      break;
  }

  var str2 = str.substring(cSet.length);
  switch (str2[0]) {
    case "{":
      much = str2.substring(0, str2.indexOf("}") + 1);
      break;
    case "*":
      much = "*";
      if (str2[1] === "?") {
        uRegex = parseRegexItemMask(str2.substring(2));
      }
      break;
    case "?":
      much = "?";
      break;
    case "+":
      much = "+";
      if (str2[1] === "?") {
        uRegex = parseRegexItemMask(str2.substring(2));
      }
      break;
    default:
      break;
  }

  var regex = cSet + much + (uRegex ? "?" + uRegex.regex : "");
  return {
    regex: regex,
    fix: function(s) {
      var m = s.match(regex);
      if (m && m.index === 0) {
        return {
          match: m[0],
          rest: s.substring(m[0].length)
        };
      }
      for (;;) {
        var cm = s.match(cSet + much);
        if (cm && cm.index === 0) {
          if (uRegex) {
            var ufix = uRegex.fix(s.substring(cm[0].length));
            return {
              match: cm[0] + ufix.match,
              rest: ufix.rest
            };
          } else {
            return {
              match: cm[0],
              rest: s.substring(cm[0].length)
            };
          }
        } else {
          s = dChar + s;
        }
      }
    }
  };
};
