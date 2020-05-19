/*
  解析二维码参数
  */
function getDeviceCode(url) {
  var that = this;
  var mac = getQueryString(url, "mac").split(',')[0];
  if (mac == null) {
    tool.showMention('错误的设备号', true);
    return;
  }
  return mac;
}

/*
  16进制字符串转整形数组
*/
function str2Bytes(str) {
  var len = str.length;
  if (len % 2 != 0) {
    return null;
  }
  var hexA = new Array();
  for (var i = 0; i < len; i += 2) {
    var s = str.substr(i, 2);
    var v = parseInt(s, 16);
    hexA.push(v);
  }

  return hexA;
}

/*
  整形数组转buffer
*/
function array2Buffer(arr) {
  let buffer = new ArrayBuffer(arr.length)
  let dataView = new DataView(buffer)
  for (let i = 0; i < arr.length; i++) {
    dataView.setUint8(i, arr[i])
  }

  return buffer
}

/*
  16进制字符串转数组
*/
function string2Buffer(str) {
  let arr = str2Bytes(str);
  return array2Buffer(arr)
}

/*
  ArrayBuffer转十六进制字符串
*/
function uint8Array2Str(buffer) {
  var str = "";
  let dataView = new DataView(buffer)
  for (let i = 0; i < dataView.byteLength; i++) {
    var tmp = dataView.getUint8(i).toString(16)
    if (tmp.length == 1) {
      tmp = "0" + tmp
    }
    str += tmp
  }
  return str;
}

function reverse16(str16) {
  //十六进制倒序,非十六进制返回空
  var strarr = (str16 + "").split("");
  if (strarr.length % 2 == 0) {
    var s = new Array();
    for (var i = strarr.length - 1; i > 0; i = i - 2) {
      s.push(strarr[i - 1]);
      s.push(str16[i]);
    }
    var str = s.join("");
    return str;
  }
  return "";
}

/*
  delay: 秒为单位,默认1.5s
*/
var showMentionTimer = null;

function showMention(msg, hidden, delay) {
  wx.showLoading({
    title: msg,
    mask: true, //显示透明蒙层，防止触摸穿透
  })
  if (showMentionTimer != null) {
    clearTimeout(showMentionTimer);
  }
  if (hidden == true) {
    if (delay == undefined) {
      delay = 1.5
    }
    showMentionTimer = setTimeout(function() {
      console.log("hideLoading")
      wx.hideLoading()
    }, delay * 1000)
  }
}

function currentTime() {
  var date = new Date()
  return date.getTime / 1000
}

var storage = {
  save: function(key, value) {
    wx.setStorage({
      key: key,
      data: value
    })
  },
  remove: function(key, callBack) {
    wx.removeStorage({
      key: key
    })
  },
  getValue: function(key, callBack) {
    wx.getStorage({
      key: key,
      success(res) {
        console.log(res.data)
        callBack(res.data);
      }
    })
  },
  clear: function() {
    wx.clearStorage()
  }

}

/**
 * 网路请求封装
 */

function requestFn(obj) {
  let url = obj.url || {};
  let data = obj.data || {};
  let header = obj.header || {};
  let method = obj.method || "GET";
  let dataType = obj.dataType || "json";
  let responseType = obj.responseType || "text";
  let successFn = obj.success || function(res) {
    wx.showToast({
      title: res.data.msg,
    })
  };
  let failFn = obj.fail || function(res) {
    wx.showToast({
      title: '网络请求失败',
    })
  };
  let completeFn = obj.complete || function(res) {};
  wx.request({
    url: url,
    data: data,
    header: header,
    method: method,
    dataType: dataType,
    responseType: responseType,
    success: function(res) {
      if (!res.data.resType) {
        if (res.data.code == 401) {
          // setTimeout(function() {
          //   wx.switchTab({
          //     url: '/pages/login/login',
          //   })
          // }, 1500)
          wx.showToast({
            title: '登录失效，重新登录',
            icon: "none"
          })
          return;
        }
      }
      successFn(res);
    },
    fail: function(res) {
      failFn(res)
    },
    complete: function(res) {
      completeFn(res)
    },
  })
}

module.exports = {
  showMention: showMention,
  currentTime: currentTime,
  string2Buffer: string2Buffer,
  uint8Array2Str: uint8Array2Str,
  reverse16: reverse16,
  getQueryString: getQueryString,
  storage: storage,
  getDeviceCode: getDeviceCode,
  requestFn: requestFn
}

/*
  时间对象
*/
function dateObject() {
  var curDate = new Date()
  console.log('当前时间_toLocaleString = ' + curDate.toLocaleString())
  console.log('当前时间_toString = ' + curDate.toString())
  console.log('当前时间_toTimeString = ' + curDate.toTimeString())
  console.log('当前时间_toDateString = ' + curDate.toDateString())
  console.log('当前时间_toUTCString = ' + curDate.toUTCString())
  console.log('当前时间_toLocaleTimeString = ' + curDate.toLocaleTimeString())
  console.log('当前时间_toLocaleDateString = ' + curDate.toLocaleDateString())

  var timeStamp = curDate.getTime() + 3600 * 24 * 1000 // 第二天同一时间
  var nextDate = new Date()
  nextDate.setTime(timeStamp)
  console.log('过期时间 = ' + nextDate.toLocaleString())
}

function getQueryString(url, name) {
  try {
    if (url.indexOf('?')) {
      url = url.split('?')[1];
    }
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = url.match(reg);
    if (r != null) {
      return unescape(r[2]);
    }
  } catch (err) {

  }
  return null;
}

Date.prototype.format = function(fmt) {
  var o = {
    "M+": this.getMonth() + 1, //月份 
    "d+": this.getDate(), //日 
    "h+": this.getHours(), //小时 
    "m+": this.getMinutes(), //分 
    "s+": this.getSeconds(), //秒 
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
    "S": this.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
  }
  return fmt;
}

/*
index.js? [sm]:41 当前时间_toLocaleString = 11/16/2017, 9:32:23 AM
index.js? [sm]:41 当前时间_toString = Thu Nov 16 2017 09:32:23 GMT+0800 (CST)
index.js? [sm]:42 当前时间_toTimeString = 09:32:23 GMT+0800 (CST)
index.js? [sm]:43 当前时间_toDateString = Thu Nov 16 2017
index.js? [sm]:44 当前时间_toUTCString = Thu, 16 Nov 2017 01:32:23 GMT
index.js? [sm]:45 当前时间_toLocaleTimeString = 9:32:23 AM
index.js? [sm]:46 当前时间_toLocaleDateString = 11/16/2017
*/

/* 快捷键

格式调整
　　Ctrl+S：保存文件

　　Ctrl+[， Ctrl+]：代码行缩进

　　Ctrl+Shift+[， Ctrl+Shift+]：折叠打开代码块

　　Ctrl+C Ctrl+V：复制粘贴，如果没有选中任何文字则复制粘贴一行

　　Shift+Alt+F：代码格式化

　　Alt+Up，Alt+Down：上下移动一行

　　Shift+Alt+Up，Shift+Alt+Down：向上向下复制一行

　　Ctrl+Shift+Enter：在当前行上方插入一行

光标相关

　　Ctrl+End：移动到文件结尾

　　Ctrl+Home：移动到文件开头

　　Ctrl+i：选中当前行

　　Shift+End：选择从光标到行尾

　　Shift+Home：选择从行首到光标处

　　Ctrl+Shift+L：选中所有匹配

　　Ctrl+D：选中匹配

　　Ctrl+U：光标回退
*/