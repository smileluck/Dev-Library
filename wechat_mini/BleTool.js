/**
 * version:2.0
 * author: B.Smile
 * 
 * 
 */

const tool = require('tool.js')
const MainService = "0000FFE7"
const WriteCharacteristic = "0000FEC7"
const UpdateCharacteristic = "0000FEC8"
const ReadCharacteristic = "0000FEC9"



module.exports = class {
  constructor() {
    let that = this;
    //记录自身，防止某些函数this指向问题
    that.self = this;
    //是否开启调试
    that.debug = false;
    //操作状态控制
    that.onlyOne = false; //唯一控制
    that.silent = false; //静默连接
    that.rootChangeStop = false; //路由修改是否停止
    that.canRun = false; //蓝牙库是否可以继续运行
    that.rootPage = null;

    //属性
    that.available = false;
    that.searchState = false;
    that.platform = null;
    that.connectState = false;
    //蓝牙搜索计时器
    that.getDeviceAllTime = 3;
    that.getDeviceTime = that.getDeviceAllTime;
    that.getDeviceTimeState = true;
    that.getDeviceTimeOut = null;
    that.getDeviceRSSICount = 0;
    that.getCanDevice = false;
    //蓝牙连接计时
    that.getConnectDeviceAllTime = 2;
    that.getConnectDeviceTime = that.getConnectDeviceAllTime;
    that.getConnectDeviceTimeState = true;
    that.connectId = null;
    //显示计时器
    that.showMentionTimer = null;

    that.listenAdapterStateChange();
    that.listenConnection();
    that.openBLEAdapter(function() {
      that.closeBeforeConnect();
    });

  }

  /**
   * 调试打印
   */
  consolePrint() {
    let that = this;
    if (that.debug) {
      console.log(arguments)
    }
  }

  /**
   * 检查是否唯一
   */
  checkOnlyOne(opt, onlyOne) {
    let that = this;
    let goon = that.onlyOne;
    if (typeof onlyOne == "boolean") {
      that.onlyOne = onlyOne;
    }
    if (goon && opt.toast) {
      console.log("正在执行蓝牙操作")
      wx.showToast({
        title: '正在执行蓝牙操作',
        icon: "none"
      })
    }

    return goon;
  }
  //检查蓝牙适配器
  checkAvailable(opt, available) {
    let that = this;
    if (typeof available == "boolean") {
      that.available = available;
    }
    console.log("蓝牙适配器检查", that.available, available);
    if (!that.available && opt.toast) {
      console.log("请打开蓝牙")
      that.showMention('请打开蓝牙', true)
    }
    return that.available;
  }
  //检查蓝牙连接状态

  /**
   * app初始化断开之前连接的蓝牙信息
   */
  closeBeforeConnect() {
    let that = this;
    tool.storage.getValue("connectId", function(data) {
      if (data) {
        that.connectId = data;
        that.cancelBleConnect(function() {
          tool.storage.remove("connectId");
          console.log("清除connectId", that.connectId);
          that.connectId = null;
        });
      }
    })
  }
  /**
   * 获取系统信息
   */
  getSysInfo(callBack) {
    let that = this;
    wx.getSystemInfo({
      success(res) {
        // console.log(res.model)
        // console.log(res.pixelRatio)
        // console.log(res.windowWidth)
        // console.log(res.windowHeight)
        // console.log(res.language)
        // console.log(res.version)
        console.log(res.platform)
        that.platform = res.platform;
        callBack();
      }
    })
  }
  /**
   * 监听适配器状态
   */
  listenAdapterStateChange() {
    var that = this
    wx.onBluetoothAdapterStateChange(function(res) {
      console.log("listenAdapterStateChange", res)
      that.searchState = res.discovering
      let available = that.checkAvailable({
        toast: true
      }, res.available);
      if (!res.available) {
        that.onlyOne = false; //唯一控制
        that.silent = false; //静默连接
        that.rootChangeStop = false; //路由修改是否停止
      }
      // if (res.available) {
      //   // if (!that.available) {
      //   that.available = res.available
      //   // that.startSearchDevice();
      //   // }
      // } else {
      //   that.available = res.available
      //   console.log("请打开蓝牙2")
      //   that.showMention('请打开蓝牙2', true)
      // }
    })
  }
  /**
   * 监听连接状态
   */
  listenConnection() {
    let that = this;
    console.log("listenConnection")
    wx.onBLEConnectionStateChange(function(res) {
      console.log("connectState", res);
      that.connectState = res.connected;
      if (res.connected) {
        that.showToast({
          title: "连接成功",
        })
      } else {
        console.log(that.available, false)
        // if (that.available) {
        //   that.startSearchDevice()
        // }
        that.showToast({
          title: "连接断开",
        })
      }
    })
  }

  /**
   * 打开蓝牙适配器
   */
  openBLEAdapter(callBack) {
    let that = this
    console.log("openBLEAdapter")
    wx.openBluetoothAdapter({
      success: function(res) {
        console.log('openBLEAdapter_success')
        that.checkAvailable({
          toast: true
        }, true)
        that.showMention("开启蓝牙成功", true);
        // setTimeout(function() {
        //   that.startSearchDevice(callBack);
        // }, 1000)
        callBack();
      },
      fail: function(res) {
        console.log('openBLEAdapter_fail', res)
        that.checkAvailable({
          toast: true
        }, false)
      }
    })
  }

  /**
   * 开始搜索
   */
  startSearchDevice(callBack) {
    let that = this;
    console.log("startSearchDevice")
    if (that.checkAvailable({})) {
      if (!that.searchState) {
        // if (that.platform == "ios") {
        console.log("延时1s搜索")
        that.showMention('准备搜索设备', true, 1)
        setTimeout(function() {
          that.wechatSearchDevice(callBack);
        }, 1000)
        // } else {
        // console.log("立即搜索")
        // that.wechatSearchDevice();
        // }
      }
    } else {
      that.showMention("请打开蓝牙", true);
    }
  }

  /**
   * 开始搜索微信方法
   */
  wechatSearchDevice(callBack) {
    let that = this;
    wx.startBluetoothDevicesDiscovery({
      // services: [MainService],
      success: function(res) {
        that.searchState = true;
        console.log("成功,准备开始搜索: ")
        console.log(res)
        that.showMention('开始搜索设备', true)
        if (callBack != undefined) {
          callBack();
        }
      },
      fail: function(res) {
        that.available = false
        that.searchState = false;
        console.log("开启搜索失败: ")
        that.showToast({
          title: '开启搜索失败',
        })
      }
    })
  }

  /**
   * 获取设备
   */
  getDevices(mac, callBack, listenFun, options) {
    let that = this;
    console.log("getDevices", options)
    mac = mac.toLowerCase(); //转换小写

    if (!that.checkAvailable({
        toast: true
      })) {
      return;
    }

    //检查是否有蓝牙操作在运行
    if (that.checkOnlyOne({
        toast: true
      }, true)) {
      return;
    }

    //配置属性
    // that.onlyOne = true;
    console.log("typeof options", typeof options)
    if (typeof options == "object") {
      that.slient = options.slient || false;
      that.rootChangeStop = options.rootChangeStop || false;
    } else {
      that.slient = false;
      that.rootChangeStop = false;
    }

    that.callBack = function() {
      that.onlyOne = false;
      callBack()
    }
    that.listenFun = listenFun
    if (that.connectState && that.mac == mac) {
      that.callBack()
      return;
    }
    that.startSearchDevice();
    that.rootPage = getCurrentPages()[getCurrentPages().length - 1].route;
    that.showMention("开始搜索", true, 3)
    that.resetSearchDevice(mac);
  }

  /**
   * 检查路由变化，判断是否停止蓝牙操作
   */
  checkRoutePageChange() {
    let that = this;
    if (that.rootChangeStop) {
      if (getCurrentPages()[getCurrentPages().length - 1].route != that.rootPage) {
        console.log("路由变化，停止操作");
        that.showToast({
          title: "页面变化，停止蓝牙",
          icon: "none"
        });
        return true;
      }
    }
    return false;
  }

  /**
   * 重置搜索
   */
  resetSearchDevice(mac) {
    let that = this;
    that.getDeviceTime = that.getDeviceAllTime;
    that.getDeviceTimeState = true;
    that.getCanDevice = false;
    that.getDeviceRSSICount = 0;
    if (that.getDeviceTimeOut != null) {
      clearInterval(that.getDeviceTimeOut);
    }
    that.getDeviceTimeOut = setInterval(function() {
      if (that.checkRoutePageChange()) {
        that.onlyOne = false;
        clearInterval(that.getDeviceTimeOut);
        return;
      }
      if (that.getDeviceTimeState && that.getDeviceTime > 0) {
        that.wechatGetDevice(mac);
      }
    }, 2000);
  }

  /**
   * 微信获取设备
   */
  wechatGetDevice(mac) {
    let that = this;
    console.log('筛选蓝牙设备 start')
    that.getDeviceTimeState = false;
    that.showMention("第" + (that.getDeviceAllTime - that.getDeviceTime + 1) + '次搜索设备', false)
    wx.getBluetoothDevices({
      success: function(res) {
        // console.log("wechatGetDeviceSuccess", res)
        for (let i in res.devices) {
          let name = res.devices[i].name.toLowerCase();
          if (name.indexOf(mac) > -1) {
            console.log("find", res.devices[i]);
            that.showMention('发现设备,检测信号', true)
            if (res.devices[i].RSSI < -92) {
              that.getDeviceRSSICount++;
              if (that.getDeviceRSSICount >= 3) {
                clearInterval(that.getDeviceTimeOut);
                wx.showModal({
                  title: '提示',
                  confirmText: "重试",
                  content: "信号过差，请靠近设备后，点击重试",
                  success(res) {
                    if (res.confirm) {
                      console.log('用户点击确定');
                      that.getDeviceTime = that.getDeviceAllTime;
                      that.getDeviceTimeState = true;
                      that.getCanDevice = false;
                      that.showMention('重新连接', true, 3)
                      that.getDeviceRSSICount = 0;
                      that.getDeviceTimeOut = setInterval(function() {
                        if (that.getDeviceTimeState && that.getDeviceTime > 0) {
                          that.wechatGetDevice(mac);
                        }
                      }, 2000);
                    } else if (res.cancel) {
                      that.onlyOne = false;
                      console.log('用户点击取消')
                    }
                  }
                })
                return;
              }
            } else {
              that.stopSearchDevice();
              if (that.connectId != res.devices[i].deviceId && that.connectId != null) {
                console.log("不一致")
                // that.connectState = false;
                if (that.connectState) {
                  that.cancelBleConnect(function() {
                    that.mac = mac
                    that.connectId = res.devices[i].deviceId
                    that.device = res.devices[i]
                    that.kIndex = tool.uint8Array2Str(res.devices[i].advertisData);
                    console.warn("kIndex", that.kIndex);
                    that.getCanDevice = true;
                    that.getDeviceTime = 0;
                    that.getDeviceTimeState = false;

                    if (that.connectState) {
                      that.searchService()
                    } else {
                      that.getConnectDeviceTime = that.getConnectDeviceAllTime;
                      that.connectDevice()
                    }
                    that.stopSearchDevice();
                    clearInterval(that.getDeviceTimeOut);
                  });
                  return;
                }
              }
              that.mac = mac
              that.connectId = res.devices[i].deviceId
              that.device = res.devices[i]

              that.kIndex = tool.uint8Array2Str(res.devices[i].advertisData);
              console.warn("kIndex", that.kIndex);

              that.getCanDevice = true;
              that.getDeviceTime = 0;
              that.getDeviceTimeState = false;

              if (that.connectState) {
                that.searchService()
              } else {
                that.getConnectDeviceTime = that.getConnectDeviceAllTime;
                that.connectDevice()
              }
              that.stopSearchDevice();
              clearInterval(that.getDeviceTimeOut);
              break;
            }
          }
        }
        that.getDeviceTimeState = !that.getDeviceTimeState;
        that.getDeviceTime--;
        if (!that.getCanDevice && that.getDeviceTime <= 0) {
          that.showMention('未搜索到设备', true, 2)
          console.log("slient", that.slient)
          if (!that.slient) {
            setTimeout(function() {
              wx.showModal({
                title: '提示',
                content: '请确认设备上电后，打开定位，再尝试购买！',
                showCancel: false,
                success(res) {
                  if (res.confirm) {
                    console.log('用户点击确定')
                  } else if (res.cancel) {
                    console.log('用户点击取消')
                  }
                }
              })
            }, 2000);
          }
          that.slient = false;
          that.onlyOne = false;
        }
      },
      fail: function(res) {
        console.log("wechatGetDeviceFail", res)
      },
      complete: function(res) {
        console.log("wechatGetDeviceComplete", res)
      }
    })
  }


  /**
   * 获取蓝牙设备广播值
   */
  getAdvertisData(mac, callback = () => {}) {
    console.log("getAdvertisData")
    mac = mac.toUpperCase()
    let that = this;
    wx.getBluetoothDevices({
      success: function(res) {
        console.log("getAdvertisData", res.devices);
        for (let i in res.devices) {
          let name = res.devices[i].name;
          if (name.indexOf(mac) > -1) {
            that.kIndex = tool.uint8Array2Str(res.devices[i].advertisData);
            console.log("获取广播值", that.kIndex)
            break;
          }
        }
      },
      fail: function() {
        console.log("获取失败，使用首次获取的advertisData");
      },
      complete: function() {
        callback();
      }
    })
  }

  /**
   * 停止搜索
   */
  stopSearchDevice() {
    console.log("stopSearchDevice")
    let that = this;
    wx.stopBluetoothDevicesDiscovery({
      success: function(res) {
        that.searchState = false;
        console.log("停止搜索")
      },
    })
  }

  /**
   * 创建连接
   */
  connectDevice(msg) {
    let that = this;
    console.log("connectDevice")
    if (that.checkRoutePageChange()) {
      return;
    }
    msg = msg == undefined ? '连接中' : msg;
    that.showMention(msg, false)
    wx.createBLEConnection({
      deviceId: that.connectId,
      success: function(res) {
        console.log(res)
        console.log("连接成功")
        that.showMention('连接成功', true)
        that.connectState = true;
        that.searchService();
        console.log("保存", that.connectId);
        tool.storage.save("connectId", that.connectId)
      },
      fail: function(res) {
        console.log("miss", res)
        that.connectState = false;
        that.getConnectDeviceTime--;
        if (that.checkRoutePageChange()) {
          return;
        }
        if (!that.checkAvailable({})) {
          that.showMention("蓝牙关闭", true, 2)
        } else {
          if (that.getConnectDeviceTime > 0) {
            that.showMention("连接失败", false)
            setTimeout(function() {
              // that.connectDevice("第" + (that.getConnectDeviceAllTime - that.getConnectDeviceTime) + "次重连中");
              that.connectDevice("重连中");
            }, 1000);
          } else {
            that.showMention("重连失败", true, 2);
            wx.showModal({
              title: '温馨提示',
              content: '请确认设备正常通电，即将重启蓝牙适配器',
              success: function(res) {
                if (res.confirm) {
                  console.log('用户点击确定，开始重启重连')
                  that.restartBleAdapter(function() {
                    // that.getConnectDeviceTime = that.getConnectDeviceAllTime;
                    // that.connectDevice()
                    that.resetSearchDevice(that.mac)
                  })
                } else if (res.cancel) {
                  console.log('用户点击取消, 取消重启重连')
                }
              }
            })
          }
        }
      }
    })
  }


  /**
   * 搜索服务
   */
  searchService() {
    console.log("searchService")
    let that = this;
    that.showMention('数据处理中', true, 3)
    wx.getBLEDeviceServices({
      //服务uid
      deviceId: that.connectId,
      success: function(res) {
        console.log(res)
        for (let i = 0; i < res.services.length; i++) {
          let rs = res.services[i]
          if (rs.uuid.indexOf(MainService) > -1) {
            console.log('找到匹配服务', res.services[i].uuid)
            that.mainservice = res.services[i].uuid;
            that.characteristic()
            break;
          }
        }
      },
      fail: function() {
        wx.hideLoading();
        console.log("搜索服务失败");
        that.showToast({
          title: '搜索服务失败',
        })
      }
    })
  }

  /**
   * 特征值获取
   */
  characteristic() {
    console.log("characteristic")
    let that = this
    wx.getBLEDeviceCharacteristics({
      deviceId: that.connectId,
      serviceId: that.mainservice,
      success: function(res) {
        console.log("特征id:", res)
        for (let i = 0; i < res.characteristics.length; i++) { //写入的特征值
          let ct = res.characteristics[i]
          if (ct.uuid.indexOf(UpdateCharacteristic) > -1) {
            console.log('找到更新匹配特征', ct.uuid)
            that.updateuuid = ct.uuid;
            that.openNotify(ct.uuid);
          } else if (ct.uuid.indexOf(WriteCharacteristic) > -1) {
            console.log('找到写匹配特征', ct.uuid)
            that.writeuuid = ct.uuid;
          } else if (ct.uuid.indexOf(ReadCharacteristic) > -1) {
            console.log('找到读匹配特征', ct.uuid)
            that.readuuid = ct.uuid
          }
        }

        //连接成功后，不保持静默方式
        that.slient = false;
        // setTimeout(function() {
        that.callBack();
        // }, 1000)
      },
      fail: function(res) {
        console.log('找不到特征值')
        console.log(res);
        wx.hideLoading();
        that.showToast({
          title: '找不到特征值',
        })
      }
    })
  }


  //读取设备状态
  readDeviceState() {
    var that = this;
    wx.readBLECharacteristicValue({
      deviceId: that.connectId,
      serviceId: that.mainservice,
      characteristicId: that.readuuid,
      success: function(res) {
        console.log('readBLECharacteristicValue:', res.errCode)
      },
      fail: function(res) {
        console.log('readBLECharacteristicValue:', res.errCode)
      }
    })
  }


  /**
   * 监听特征值
   */
  listenNotifyValueChange() {
    console.log("listenNotifyValueChange")
    var that = this
    console.log("监听特征变化")
    wx.onBLECharacteristicValueChange(function(res) {
      console.log("收到数据")
      // console.log('WriteDataType = ' + WriteDataType)
      let value = res.value
      console.log(value);
      let value2 = tool.uint8Array2Str(value)
      console.log("returnstr", value2)
      let dataView = new DataView(tool.string2Buffer(value2))
      that.listenFun(dataView);
      // return;
    })
  }


  /**
   * 打开订阅
   */
  openNotify(uuid) {
    var that = this
    console.log("openNotify")
    wx.notifyBLECharacteristicValueChange({
      deviceId: that.connectId,
      serviceId: that.mainservice,
      characteristicId: uuid,
      state: true,
      success: function(res) {
        console.log("notify打开成功", res)
        that.listenNotifyValueChange()
        // console.log()
        // wx.onBLECharacteristicValueChange(function (res) {
        //   console.log("订阅的值",res)
        // })
      },
      fail: function(res) {
        console.log("notify打开失败");
        console.log(res)
        wx.hideLoading();
        that.showToast({
          title: 'notify打开失败',
        })
      },
    })
  }

  /**
   * 写入数据
   */
  writeCharacteristicValue(str, func) {
    console.log("writeCharacteristicValue")
    let that = this;
    if (that.checkRoutePageChange()) {
      return;
    }
    // console.log(that.connectId, that.mainservice, that.writeuuid, str);
    if (!that.connectState) {
      tool.showMention("未连接设备")
      return;
    }
    func = func || function() {};

    let resObj = {}

    wx.writeBLECharacteristicValue({
      deviceId: that.connectId,
      serviceId: that.mainservice,
      characteristicId: that.writeuuid,
      value: tool.string2Buffer(str),
      success: function(res) {
        that.showToast({
          title: '写入成功',
        })
        console.log("writeDate-->", res);
        resObj.state = "success"
        func(resObj)
      },
      fail: function() {
        console.log("写入失败")
        resObj.state = "fail"
        func(resObj)
      }
    })
  }

  /**
   * 关闭蓝牙连接
   */
  cancelBleConnect(callback = function() {}) {
    let that = this;
    console.log("cancelBleConnect")
    if (that.connectState) {
      wx.closeBLEConnection({
        deviceId: that.connectId,
        success: function(res) {
          console.log("断开连接成功")
          that.showToast({
            title: '断开连接成功',
          })
          that.connectState = false;
          callback();
        },
        fail: function(res) {
          that.connectState = false;
          callback();
        }
      })
    }
  }



  // 重启蓝牙
  restartBleAdapter(callBack, options) {
    var that = this // 注意this的层级关系
    // that.available = false;
    that.searchState = false;
    if (!that.checkAvailable({
        toast: true
      })) {
      that.openBLEAdapter(callBack);
    } else {
      if (that.connectState) {
        console.log("取消连接")
        that.cancelBleConnect(function() {
          that.wechatCloseBleAdapter(callBack);
        })
      } else {
        console.log("关闭蓝牙")
        that.wechatCloseBleAdapter(callBack)
      }
    }
  }

  //微信关闭蓝牙
  wechatCloseBleAdapter(callBack, needOpen) {
    let that = this;
    needOpen = needOpen || true;
    if (that.available) {
      that.showMention("准备重启蓝牙", true)
      console.log("wechatCloseBleAdapter", that.available)
      wx.closeBluetoothAdapter({
        success: function(res) {
          console.log(1)
          console.log('关闭完毕')
          console.log(res)
          that.available = false;
          that.showMention("重启蓝牙中", true, 5)
          if (needOpen) {
            setTimeout(function() {
              that.openBLEAdapter(callBack);
            }, 1000)
          }
        },
        fail: function() {

        }
      })
    } else {
      setTimeout(function() {
        that.showMention("开启蓝牙中", true)
        that.openBLEAdapter(callBack);
      }, 1000)
    }
  }

  //微信获取设备列表
  getDeviceList(count, time, callBack) {
    let that = this;
    that.searchCount = count;
    // that.searchState = true;
    if (that.searchInterval != null) {
      clearInterval(that.searchInterval);
      that.searchInterval = null;
    }
    that.searchInterval = setInterval(function() {
      if (that.checkRoutePageChange()) {
        return;
      }
      that.showMention("第" + (count - that.searchCount + 1) + "次搜索", false)
      if (that.searchCount > 0) {
        wx.getBluetoothDevices({
          success: function(res) {
            console.log(635, res)
          }
        })
        that.searchCount--;
        return;
      } else {
        that.showMention("搜索成功", true, 2)
        clearInterval(that.searchInterval);
        wx.getBluetoothDevices({
          success: function(res) {
            console.log("getDeviceListSuccess", res)
            callBack(res.devices);
          }
        })
      }
    }, time * 1000)
  }

  /*
    delay: 秒为单位,默认1.5s
  */
  showMention(msg, hidden, delay) {
    let that = this
    if (that.slient) {
      return
    }
    wx.showLoading({
      title: msg,
      mask: true, //显示透明蒙层，防止触摸穿透
    })
    if (that.showMentionTimer != null) {
      clearTimeout(that.showMentionTimer);
    }
    if (hidden == true) {
      if (delay == undefined) {
        delay = 1.5
      }
      that.showMentionTimer = setTimeout(function() {
        console.log("hideLoading")
        wx.hideLoading()
      }, delay * 1000)
    }
  }

  /*
    delay: 秒为单位,默认1.5s
  */
  showToast(obj) {
    let that = this
    if (that.slient) {
      return
    }
    obj.mask = obj.mask || true;
    wx.hideToast();
    wx.showToast(obj);
  }
}