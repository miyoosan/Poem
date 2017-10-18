import {
      AsyncStorage,
      } from 'react-native';
const nothead = require('../images/ic_account_circle_black.png');
import HttpUtil from './HttpUtil';

var Utils = {};

Utils.dateStr = function(date){
  //获取js 时间戳
  var time=new Date().getTime();
  //去掉 js 时间戳后三位，与php 时间戳保持一致
  time=parseInt((time-date*1000)/1000);

  //存储转换值
  var s;
  if(time<60*10){//十分钟内
      return '刚刚';
  }else if((time<60*60)&&(time>=60*10)){
      //超过十分钟少于1小时
      s = Math.floor(time/60);
      return  s+"分钟前";
  }else if((time<60*60*24)&&(time>=60*60)){
      //超过1小时少于24小时
      s = Math.floor(time/60/60);
      return  s+"小时前";
  }else if((time<60*60*24*3)&&(time>=60*60*24)){
      //超过1天少于3天内
      s = Math.floor(time/60/60/24);
      return s+"天前";
  }else{
      //超过3天
      var date= new Date(parseInt(date) * 1000);
      return date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate();
  }
}
Utils.log = function(key,value){
  console.log('~~~~~~'+key+':'+JSON.stringify(value)+'~~~~~');
}


Utils.getHead = function(head){
  let headurl = head?{uri:HttpUtil.getHeadurl(head)}:nothead;
  return headurl
}
export default Utils;
