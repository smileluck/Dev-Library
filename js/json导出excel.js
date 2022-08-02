var user = [],
  task = [];
window.onload = function () {
  userDue();
  TaskDue();
};

userDue = function () {
  let arr = [];
  // 用户维度
  for (let i = 0; i < user.length; i++) {
    let item = user[i];
    let newObj = {};
    newObj.openid = item._id; // openid
    newObj.nick_name = item.nick_name; //昵称
    if (item.teak.length > 0) {
      for (let j = 0; j < item.teak.length; j++) {
        newObj.task_title = item.teak[j].taskInfo[0].title; //参与任务名称
        newObj.task_detail = item.teak[j].taskInfo[0].detail; //任务简介
        newObj.task_freq = item.teak[j].taskInfo[0].freq; //任务频次
        newObj.task_create_time = item.teak[j].taskInfo[0].formatDate; //创建时间
        newObj.task_dk_count =
          item.teak[j].dkCount.length > 0 ? item.teak[j].dkCount[0].num : 0; //打卡次数
        arr.push(newObj);
      }
    } else {
      newObj.task_title = "";
      newObj.task_detail = "";
      newObj.task_freq = "";
      newObj.task_create_time = "";
      newObj.task_dk_count = "";
      arr.push(newObj);
    }
  }
  console.log("user", arr);
  jsonToExcel2(
    arr,
    "openid,微信昵称,任务名,任务简介,任务打卡频次,创建时间,打卡次数",
    [
      "openid",
      "nick_name",
      "task_title",
      "task_detail",
      "task_freq",
      "task_create_time",
      "task_dk_count",
    ],
    "用户维度"
  );
};

TaskDue = function () {
  let arr = [];
  // 用户维度
  for (let i = 0; i < task.length; i++) {
    let item = task[i];
    let newObj = {};
    newObj.task_title = item.title.replaceAll("\n", ""); //任务名
    newObj.task_detail = item.detail.replaceAll("\n", ""); //任务简介
    newObj.task_freq = item.freq; //打卡频次
    newObj.task_create_time = item.formatDate; //创建时间
    newObj.people_num = item.people_num.length > 0 ? item.people_num[0].num : 0; //成员数
    newObj.dk_nick_name =
      item.dkCount.length > 0
        ? item.dkCount[0].peopleInfo.length > 0
          ? item.dkCount[0].peopleInfo[0].nick_name
          : ""
        : ""; //第一名微信昵称
    newObj.dk_count = item.dkCount.length > 0 ? item.dkCount[0].score : ""; //最大打卡次数
    arr.push(newObj);
  }
  console.log("Task", arr);
  // jsonToExcel(arr,"任务名,任务简介,任务打卡频次,创建时间,任务成员数,排行榜第一名(微信昵称),第一名打卡次数")
  jsonToExcel2(
    arr,
    "任务名,任务简介,任务打卡频次,创建时间,任务成员数,排行榜第一名(微信昵称),第一名打卡次数",
    [
      "task_title",
      "task_detail",
      "task_freq",
      "task_create_time",
      "people_num",
      "dk_nick_name",
      "dk_count",
    ],
    "设备维度"
  );
};

function jsonToExcel(data, head, name = "导出的文件名") {
  let str = head ? head + "\n" : "";
  data.forEach((item) => {
    // 拼接json数据, 增加 \t 为了不让表格显示科学计数法或者其他格式
    for (let key in item) {
      str = `${str + item[key] + "\t"},`;
    }
    str += "\n";
  });
  // encodeURIComponent解决中文乱码
  const uri = "data:text/csv;charset=utf-8,\ufeff" + encodeURIComponent(str);
  // 通过创建a标签实现
  const link = document.createElement("a");
  link.href = uri;
  // 对下载的文件命名
  link.download = `${name + ".csv"}`;
  link.click();
}

function jsonToExcel2(data, head, sortArr, name = "导出的文件名") {
  let str = head ? head + "\n" : "";
  data.forEach((item) => {
    // 拼接json数据, 增加 \t 为了不让表格显示科学计数法或者其他格式
    for (let i = 0; i < sortArr.length; i++) {
      str = `${str + item[sortArr[i]] + "\t"},`;
    }
    str += "\n";
  });
  // encodeURIComponent解决中文乱码
  const uri = "data:text/csv;charset=utf-8,\ufeff" + encodeURIComponent(str);
  // 通过创建a标签实现
  const link = document.createElement("a");
  link.href = uri;
  // 对下载的文件命名
  link.download = `${name + ".csv"}`;
  link.click();
}
