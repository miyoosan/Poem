'use strict'
/**
 * 私信列表item
 */
import React from 'react';
import {
   StyleSheet,
   Text,
   View,
   TouchableNativeFeedback,
   Vibration,
} from 'react-native';
import {
      StyleConfig,
      ImageConfig,
      Utils,
      pstyles,
      HttpUtil,
      PImage,
    } from '../AppUtil';
export default class ChatListItem extends React.Component{
  swipeable = null;
  constructor(props){
    super(props);
  }
  componentDidMount(){

  }
  componentWillUpdate(){

  }
  _onPress = () => {
      this.props.onPressItem(this.props.id,this.props.item);
  };
  _onDel = () => {
    Vibration.vibrate([0,10],false);
    this.props.onDelItem(this.props.id,this.props.item);
  };
  _onIcon = ()=>{
    this.props.onIconItem(this.props.id,this.props.item);
  }
  render(){
    const item = this.props.item;
    return (
      <TouchableNativeFeedback
        {...this.props}
        delayLongPress={1000}
        onLongPress={this._onDel}
        onPress={this._onPress}
        >
        <View style={[styles.msg]}>
          <TouchableNativeFeedback
            style={styles.msg_icon}
            onPress={this._onIcon}>
            <View>
              <PImage
              style={pstyles.small_head}
              source={this._logicSource(item)}
              />
              {this._renderNum(item)}
            </View>
          </TouchableNativeFeedback>
          <View style={styles.msg_text}>
            <View>
              <Text style={styles.msg_title}>{item.pseudonym}</Text>
              <Text style={styles.msg_content} numberOfLines={1}>{item.msg}</Text>
            </View>
          </View>
          <View style={styles.msg_more}>
            <Text style={styles.msg_time}>{Utils.dateStr(item.time)}</Text>
          </View>
        </View>
      </TouchableNativeFeedback>
      );
  }
  _logicSource(item){
    var source = ImageConfig.nothead;
    var head = item.head;
    if(head){
      source = {uri:HttpUtil.getHeadurl(head)};
    }
    return source;
  }

  _renderNum(item){
    // console.log(item)
    let num  = item.num;
    if(num > 0){
      if(num > 99){
        return(
          <View style={styles.msg_num_bg1}>
          <Text style={[styles.msg_num,{fontSize:9}]}>
            ...
          </Text>
          </View>
        )
      }else if(num > 9){
        return(
          <View style={styles.msg_num_bg1}>
          <Text style={[styles.msg_num,{fontSize:9}]}>
            {num}
          </Text>
          </View>
        )
      }else{
        return(
          <View style={styles.msg_num_bg}>
          <Text style={[styles.msg_num,{fontSize:12}]}>
            {num}
          </Text>
        </View>
        )
      }
    }else{
      return null;
    }
  }
}

const styles = StyleSheet.create({
  msg:{
    flexDirection:'row',
    padding:10,
    height:64,
  },
  msg_icon:{

  },
  msg_text:{
    flex:1,
    paddingLeft:10,
  },
  msg_title:{
    paddingBottom:6,
  },
  msg_content:{

  },
  msg_more:{

  },
  msg_titme:{

  },
  msg_html:{

  },
  msg_name:{
    fontSize:18,
    color:StyleConfig.C_1E8AE8,
  },
  msg_love:{
    fontSize:18,
    color:StyleConfig.C_7B8992,
  },
  msg_info:{
    fontSize:18,
    color:StyleConfig.C_000000,
  },
  msg_time:{
    color:StyleConfig.C_7B8992,
  },
  msg_num_bg:{
      backgroundColor:'#ff4040',
      alignItems:'center',
      justifyContent:'center',
      borderRadius:7,
      position: 'absolute',
      width:14,
      height:14,
      top: 0,
      right: 0,
  },
  msg_num_bg1:{
      backgroundColor:'#ff4040',
      alignItems:'center',
      justifyContent:'center',
      borderRadius:7,
      position: 'absolute',
      width:18,
      height:14,
      top: 0,
      right: -0,
  },
  msg_num:{
    color:StyleConfig.C_FFFFFF,
    backgroundColor:'transparent',//'transparent',
    textAlign:'center',
    marginTop:-1,
    // width:14,
    // height:14,
  },
  delete:{
    justifyContent:'center',
    backgroundColor:'red',
    height:64,
  },
  delete_font:{
    fontSize:18,
    width:80,
    textAlign:'center',
    color:StyleConfig.C_FFFFFF,
  }
});