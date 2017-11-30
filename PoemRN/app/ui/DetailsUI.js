'use strict'
/**
 * 作品详情页
 * @flow
 */
import React from 'react';
import { Icon } from 'react-native-elements';
import {
  StyleSheet,
  Text,
  View ,
  Alert,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
} from 'react-native';
import {connect} from 'react-redux';
import * as PoemsActions from '../redux/actions/PoemsActions';
import * as UserActions from '../redux/actions/UserActions';

import {
  CommentListItem,
  LoveListView,
} from '../custom/Custom';
import {
      StyleConfig,
      HeaderConfig,
      StorageConfig,
      UIName,
      Utils,
      HttpUtil,
      pstyles,
      goPersonalUI,
      HomePoemDao,
      Global,
      PImage,
      showToast,
      } from '../AppUtil';
import{
      NavBack,
      }from '../custom/Custom';
const boundary = 80;
type Props = {
    navigation:any,
    mypoem:Object,
    papp:Object,
};

type State = {
    id:string,
    refreshing:boolean,
    sourceData:Array<Object>,
    loves:Array<Object>,
    selected:Map<string, boolean>,
    labels:Array<Object>,
    extend:Object,
    photo:string,
    isphoto:boolean,
};

class DetailsUI extends React.Component<Props,State>{
  static navigationOptions = ({navigation}) => ({
    title: '详情',
    headerTintColor:HeaderConfig.headerTintColor,
    headerTitleStyle:HeaderConfig.headerTitleStyle,
    headerStyle:HeaderConfig.headerStyle,
    headerLeft:(<NavBack navigation={navigation}/>),
  });
  dataContainer = [];
  navigate = null;
  _onLove:Function;
  _onLoveItem:Function;
  _onLoves:Function;
  _onPoemLayout:Function;
  _onPersonal:Function;
  _onDelComment:Function;
  constructor(props){
    super(props);
    let params = this.props.navigation.state.params;
    let poem = {userid:'',content:'',lovenum:0,commentnum:0,love:0};
    Object.assign(this.props.mypoem,poem);
    this.state = {
        id:params.id,
        ftype:params.ftype,
        sourceData : [],
        selected: (new Map(): Map<string, boolean>),
        refreshing: false,
        loves:[],//点赞列表
        labels:[],
        extend:{},
        photo:'',
        isphoto:false,
    }
    this._onLove = this._onLove.bind(this);
    this._onLoveItem = this._onLoveItem.bind(this);
    this._onLoves= this._onLoves.bind(this);
    this._onPoemLayout = this._onPoemLayout.bind(this);
    this._onPersonal = this._onPersonal.bind(this);
    this._onDelComment = this._onDelComment.bind(this);
  }

  componentDidMount(){
    this._requestPoem();
    this._requestLoves();
    this._requestNewestComment();
  }

  componentWillUnmount(){

  }
  shouldComponentUpdate(nextProps, nextState){
    // console.log('---DetailsUI() shouldComponentUpdate');
    // // console.log(this.papp);
    // console.log(this.props.papp);
    // console.log(nextProps.papp);
    //切换用户id
    // if(nextProps.papp.userid !== this.props.papp.userid){
    //   console.log('------DetailsUI() shouldComponentUpdate');
    //   console.log('------change userid');
    //   Object.assign(this.props.papp,nextProps.papp);
    // }
    // console.log('------DetailsUI() shouldComponentUpdate');
    // console.log('------change refcomment');
    console.log('------nextProps.papp.refcomment:',nextProps.papp.refcomment);
    console.log('------this.props.papp.refcomment:',this.props.papp.refcomment);
    if(nextProps.papp.refcomment == true && this.props.papp.refcomment == false){
      console.log('------DetailsUI() shouldComponentUpdate');
      console.log('------change refcomment');
      console.log('------nextProps.papp.refcomment:',nextProps.papp.refcomment);
      console.log('------this.props.papp.refcomment:',this.props.papp.refcomment);
      // Object.assign(this.props.papp,nextProps.papp);
      // if(nextProps.papp.refcomment){
        let { dispatch } = this.props.navigation;
        dispatch(UserActions.raRefComment(false));
        console.log('------_requestNewestComment tag1')
        this._requestNewestComment();
        this._requestLoveComment();
      // }
    }
    if(nextProps.mypoem != this.props.mypoem){
      console.log('------DetailsUI() shouldComponentUpdate');
      console.log('------change mypoem');
      console.log('------nextProps.mypoem');
      console.log(nextProps.mypoem)
      console.log('------this.props.mypoem');
      console.log(this.props.mypoem)
      let extend = this._getExtend(nextProps.mypoem);
      let isphoto = this._isPhoto(extend);
      let photo = '';
      if(isphoto){
        photo = extend.photo;
      }
      this.setState({extend:extend,photo:photo,isphoto:isphoto});
      this._loadLabels(nextProps.mypoem)
    }
    return true;
  }
  render(){
    return(
      <ScrollView
        ref="ScrollView"
        style={pstyles.container}>
        {this._renderPoem()}
        {this._renderLabels()}
        {/* ---menu--- */}
        {this._renderMenu()}
        {/* --点赞列表-- */}
        <View
          ref="love"
        >
        {this._renderLove()}
        </View>
        {/* ---评论列表--- */}
        <FlatList
                  data={ this.state.sourceData }
                  extraData={ this.state.selected }
                  keyExtractor={ this._keyExtractor }
                  renderItem={ this._renderItem }
                  // 决定当距离内容最底部还有多远时触发onEndReached回调；数值范围0~1，例如：0.5表示可见布局的最底端距离content最底端等于可见布局一半高度的时候调用该回调
                  onEndReachedThreshold={0.1}
                  // 当列表被滚动到距离内容最底部不足onEndReacchedThreshold设置的距离时调用
                  onEndReached={ this._onEndReached }
                  // ListHeaderComponent={ this._renderHeader }
                  // ListFooterComponent={ this._renderFooter }
                  ItemSeparatorComponent={ this._renderItemSeparatorComponent }
                  ListEmptyComponent={ this._renderEmptyView }
                  refreshing={ this.state.refreshing }
                  onRefresh={ this._renderRefresh }
                  // 是一个可选的优化，用于避免动态测量内容，+1是加上分割线的高度
                  getItemLayout={(data, index) => ( { length: 40, offset: (40 + 1) * index, index } )}
              />
      </ScrollView>
    )
  }
  _renderPoem(){
    if(this.state.isphoto){
      return(
        <View
          ref="poem"
          style={pstyles.poem}
          onLayout={this._onPoemLayout}>
          <View style={pstyles.photo}>
            <PImage
              style={this._getStyle(this.state.extend)}
              source={Utils.getPhoto(this.state.photo?this.state.photo+'_big':'')}
              noborder={true}
              />
          </View>
          <Text style={pstyles.poem_title}>
            {this.props.mypoem.title}
          </Text>
          <Text style={[pstyles.poem_content,{textAlign:this._renderAlign(this.props.mypoem)}]}>
            {this.props.mypoem.content}
          </Text>
        </View>
      )
    }else{
      return(
        <View
          ref="poem"
          style={pstyles.poem}
          onLayout={this._onPoemLayout}>
          <Text style={pstyles.poem_title}>
            {this.props.mypoem.title}
          </Text>
          <Text style={[pstyles.poem_content,{textAlign:this._renderAlign(this.props.mypoem)}]}>
            {this.props.mypoem.content}
          </Text>
        </View>
      )
    }
  }
  _renderLabels(){
    return(
      <View style={styles.labels}>
          {this.state.labels.map((item, index) => {
            return(
              <View
                key={item.key}
                style={styles.labelbg}>
                <Text style={styles.label}>
                  {item.name}
                </Text>
              </View>
            )
          })}
      </View>
    )
  }
  /**
   * 功能视图
   */
  _renderMenu(){
    if(this.props.mypoem.userid == this.props.papp.userid){
      return(
        <View
          ref="menu"
          style={styles.menu}
        >
            {/* 评论 */}
            <TouchableOpacity
              onPress={()=>{
                if(Utils.isLogin(this.props.navigation)){
                  this.props.navigation.navigate(UIName.CommentUI,{id:this.state.id,cid:0})
                }
              }}>
              <View style={styles.menu_item}>
                <Icon
                  name='sms'
                  size={26}
                  type="MaterialIcons"
                  color={StyleConfig.C_D4D4D4}
                  />
                  <Text style={styles.menu_font}>
                    {this._renderCommentnum(this.props.mypoem.commentnum)}
                  </Text>
              </View>
            </TouchableOpacity>
            {/* 点赞 */}
            <TouchableOpacity
              onPress={()=>{
                this._onLove();
              }}>
              <View style={styles.menu_item}>
                <Icon
                  name='thumb-up'
                  size={26}
                  type="MaterialIcons"
                  color={this._renderLoveColor()}
                  />
                  <Text style={styles.menu_font}>
                    {this._renderLovenum(this.props.mypoem.lovenum)}
                  </Text>
              </View>
            </TouchableOpacity>
            {/* 修改 */}
            <TouchableOpacity
              onPress={()=>{
                this.props.navigation.navigate(UIName.AddPoemUI,{ftype:1,id:this.state.id,poem:this.props.mypoem})
              }}>
              <View style={styles.menu_item}>
                <Icon
                  name='border-color'
                  size={26}
                  type="MaterialIcons"
                  color={StyleConfig.C_D4D4D4}
                  />
              </View>
            </TouchableOpacity>
            {/* 删除 */}
            <TouchableOpacity
              onPress={()=>Alert.alert(
              '删除',
              '是否确认删除？',
              [
                {text: '取消', style: 'cancel'},
                {text: '确认', onPress: () => {
                  this._onDeletePoem()
                }},
              ],
              { cancelable: false }
            )}>
              <View style={styles.menu_item}>
                <Icon
                  name='delete'
                  size={26}
                  type="MaterialIcons"
                  color={StyleConfig.C_D4D4D4}
                  />
              </View>
            </TouchableOpacity>
        </View>
      )
    }else{
      return(
        <View
          ref="menu"
          style={styles.menu}
        >
            <TouchableOpacity
              onPress={()=>{
                if(Utils.isLogin(this.props.navigation)){
                  this.props.navigation.navigate(UIName.CommentUI,{id:this.state.id});
                }
              }}>
              <View style={styles.menu_item}>
                <Icon
                  name='sms'
                  size={26}
                  type="MaterialIcons"
                  color={StyleConfig.C_D4D4D4}
                  />
                  <Text style={styles.menu_font}>
                    {this._renderCommentnum(this.props.mypoem.commentnum)}
                  </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={()=>{
                this._onLove();
              }}>
              <View style={styles.menu_item}>
                <Icon
                  name='thumb-up'
                  size={26}
                  type="MaterialIcons"
                  color={this._renderLoveColor()}
                  />
                  <Text style={styles.menu_font}>
                    {this._renderLovenum(this.props.mypoem.lovenum)}
                  </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={()=>{
                this._onReport();
              }}>
              <View style={styles.menu_item}>
                <Icon
                  name='new-releases'
                  size={26}
                  type="MaterialIcons"
                  color={StyleConfig.C_D4D4D4}
                  />
              </View>
            </TouchableOpacity>
        </View>
      )
    }
  }
  /**
   * 评论数
   */
  _renderCommentnum(commentnum){
    return commentnum > 0 ? commentnum:'';
  }
  _renderAlign(item){
    let align = 'center';
    if(item.extend){
      let extend = JSON.parse(item.extend)
      if(extend.align)align = extend.align
    }
    return align;
  }
  _isPhoto(extend:Object):boolean{
    let isphoto = false;
    if(extend&&extend.photo&&extend.pw&&extend.ph){
      isphoto = true;
    }
    return isphoto;
  }
  _getStyle(extend){
      let style = {resizeMode:'cover',width:Global.width-boundary,height:Global.width-boundary};
      if(extend.pw > extend.ph){
        let style1 = {width:Global.width-boundary,height:(Global.width-boundary)*extend.ph/extend.pw}
        style = Object.assign({},style,style1)
      }
      if(extend.pw < extend.ph){
        let style2 = {width:Global.width-boundary,height:(Global.width-boundary)*extend.ph/extend.pw}
        style = Object.assign({},style,style2)
        console.log('-------_getStyle')
        console.log(style)
      }
      return style;
  }
  _getExtend(item:Object):Object{
    let extend = {}
    if(item&&item.extend){
      extend = JSON.parse(item.extend);
    }
    console.log('------_getExtend')
    console.log(extend)
    return extend;
  }
  _loadLabels(poem){
    let labelsarray = [];
    let extend = this.state.extend;
    if(extend&&extend.labels){
      let labels = extend.labels.split(',');
      for(var i = 0 ; i < labels.length;i++){
        labelsarray.push({key:i,name:labels[i]})
      }
    }
    console.log('------labelsarray')
    console.log(labelsarray)
    this.setState({labels:labelsarray})
  }
  _renderEmptyView = () => (
    <View style={styles.empty}>
     {/* <Text style={styles.empty_font}>暂无内容
     </Text> */}
    </View>
  );
  /**
   * 点赞数
   */
  _renderLovenum(lovenum){
    return lovenum > 0 ? lovenum:'';
  }
  /**
   * 点赞颜色
   */
  _renderLoveColor(){
    return this.props.mypoem.love > 0 ? StyleConfig.C_000000:StyleConfig.C_D4D4D4;
  }
  /**
   * 点赞列表
   */
  _renderLove(){
    return(
      <LoveListView
        ref='lovelistview'
        loves={this.state.loves}
        poem={this.props.mypoem}
        onLove={this._onLove}
        onLoves={this._onLoves}
        onLoveItem={this._onLoveItem}
        />
    )
  }
  _onPoemLayout(event){
    if(this.state.ftype == 1){
      //使用大括号是为了限制let结构赋值得到的变量的作用域，因为接来下还要结构解构赋值一次
      //  {
         //获取根View的宽高，以及左上角的坐标值
         let {x, y, width, height} = event.nativeEvent.layout;
         if(this.props.mypoem.content){
           this.refs.ScrollView.scrollTo({x: 0, y: height+10, animated: false})
         }
      //  }
    }
  }
  _keyExtractor = (item, index) => index+'';
  _onPressItem = (id:string,item) => {
      this.setState((state) => {
          const selected = new Map(state.selected);
          selected.set(id, !selected.get(id));
          return {selected}
      });
      // console.log(this)
      if(Utils.isLogin(this.props.navigation)){
          this.props.navigation.navigate(UIName.CommentUI,{id:item.pid,cid:item.id,cpseudonym:item.pseudonym});
      }
  };
  _onPersonal(userid){
    console.log(userid)
    goPersonalUI(this.props.navigation.navigate,userid);
  }
  _onDelComment(comment:Object){
    if(comment.userid == this.props.papp.userid){
      Alert.alert(
        '删除评论',
        '是否确认删除？',
        [
          {text: '取消', style: 'cancel'},
          {text: '确认', onPress: () => {
              var json = JSON.stringify({
                id:comment.id,
                pid:comment.pid,
                userid:this.props.papp.userid,
              });
              HttpUtil.post(HttpUtil.POEM_DELCOMMENT,json).then((res)=>{
                if(res.code == 0){
                  let id = res.data.id;
                  let comments = this.state.sourceData;
                  let del_num = 0;
                  for(var i = comments.length-1;i >= 0 ; i --){
                    if(comments[i].id == id){
                      comments.splice(i, 1);
                      del_num += 1;
                    }
                  }
                  this.setState({sourceData:comments});
                  if(del_num > 0){
                    let poem = this.props.mypoem;
                    let commentnum = poem.commentnum >= del_num?poem.commentnum-del_num:0;
                    poem.commentnum = commentnum;
                    let { dispatch } = this.props.navigation;
                    dispatch(PoemsActions.raUpPoemLC(poem));
                  }


                }else{
                  showToast(res.errmsg);
                }
              }).catch((err)=>{
                  console.error(err);
              });
          }},
        ],
        { cancelable: false }
      )
    }
  }
  _renderItem = ({item}) =>{
      return(
          <CommentListItem
              id={item.id}
              onPressItem={ this._onPressItem }
              selected={ !!this.state.selected.get(item.id) }
              comment= {item}
              headurl={Utils.getHead(item.head)}
              time={Utils.dateStr(item.time)}
              onPersonal={this._onPersonal}
              userid={this.props.papp.userid}
              onDelComment={this._onDelComment}
          />
      );
  };
  _renderItemSeparatorComponent = ({highlighted}) => (
      <View style={pstyles.separator_not}></View>
  );
  // 下拉刷新
  _renderRefresh = () => {
      console.log('------_requestNewestComment tag2');
     this._requestNewestComment();
  }
  // 上拉刷新
  _onEndReached = () => {
    if(this.state.refreshing){
      return;
    }
    console.log('---DetailsUI() POEM_HISTORY_COMMENT')
    this.setState({refreshing: true}) // 开始刷新
    var fromid = 0;
    var fromid = 0;
    if(this.state.sourceData.length > 0 ){
      fromid = this.state.sourceData[this.state.sourceData.length-1].id;
    }
    var json = JSON.stringify({
      id:fromid,
      pid:this.state.id,
    });
    HttpUtil.post(HttpUtil.POEM_HISTORY_COMMENT,json).then((data)=>{
      if(data.code == 0){
          var comments = data.data;
           if(comments.length > 0){
             this.dataContainer = this.dataContainer.concat(comments);
             this.setState({
               sourceData: this.dataContainer
             });
           }
      }else{
        showToast(data.errmsg);
      }
      this.setState({refreshing: false});
    }).catch((err)=>{
      console.error(err);
    })
  }
  /**
   * 删除作品
   */
  _onDeletePoem(){
    if(!this.props.papp.userid){
      return;
    }
    var json = JSON.stringify({
      id:this.state.id,
      userid:this.props.papp.userid,
    });
    HttpUtil.post(HttpUtil.POEM_DELPOEM,json).then((data)=>{
      if(data.code == 0){
        let poem = data.data;
        let { dispatch } = this.props.navigation;
        dispatch(PoemsActions.raDelPoem(poem));
     	  this.props.navigation.goBack();
      }else{
        showToast(data.errmsg);
      }
    }).catch((err)=>{
        console.error(err);
    });
  }
  /**
   * 点赞
   */
  _onLove(){
    if(!Utils.isLogin(this.props.navigation)){
        return;
    }
    var onlove = this.props.mypoem.love == 0 ?1:0;
    var json = JSON.stringify({
      id:this.state.id,
      userid:this.props.papp.userid,
      love:onlove,
    });
    HttpUtil.post(HttpUtil.POEM_LOVEPOEM,json).then((result)=>{
      if(result.code == 0){
        var love = result.data;
        console.log('result love:'+JSON.stringify(love));
        let id  = love.id;
        var loves = this.state.loves;
        if(love.love == 0){//删除
          if(loves.length > 0 ){
            for(var i = loves.length-1 ; i >= 0 ; i -- ){
              if(loves[i].id == id){
                loves.splice(i,1);
              }
            }
          }
        }else{
            var isexist = false;
            for(var i = loves.length-1 ; i >= 0 ; i -- ){
              if(loves[i].id == id){
                isexist = true;
                break;
              }
            }
            if(!isexist){
              loves.push(love);
            }
        }
        var poem = this.props.mypoem;
        var lovenum = poem.lovenum;
        if(love.love == 1){
          lovenum += 1;
        }else{
          if(lovenum > 0 ){
            lovenum -= 1;
          }
        }
        poem.lovenum = lovenum;
        poem.mylove = poem.love = love.love;
        this.setState({
          loves:loves,
        });
        HomePoemDao.updateHomePoemLove(poem);
        let { dispatch } = this.props.navigation;
        dispatch(PoemsActions.raLoveMe(poem));
        this.refs.lovelistview.loadPages();
        this._requestLoveComment();
      }else{
        showToast(result.errmsg);
      }
    }).catch((err)=>{
      console.error(err);
    })
  }
  /**
   * 点赞列表
   */
  _onLoves(){
    this.props.navigation.navigate(UIName.LovesUI,{id:this.state.id})
  }
  _onReport(){
    if(!Utils.isLogin(this.props.navigation)){
        return;
    }
    this.props.navigation.navigate(UIName.ReportUI,{title:'举报作品',type:1,rid:this.state.id,ruserid:this.props.mypoem.userid});
  }
  /**
   * 点赞元素
   */
  _onLoveItem(item){
    if(item.userid == this.props.papp.userid){
      return;
    }
    goPersonalUI(this.props.navigation.navigate,item.userid);
  }
  /**
   * 作品信息
   */
  _requestPoem(){
      var json = JSON.stringify({
        pid:this.state.id,
        userid:this.props.papp.userid,
      });
      HttpUtil.post(HttpUtil.POEM_INFO,json).then(res=>{
        if(res.code == 0){
          var poem = res.data;
          let { dispatch } = this.props.navigation;
          dispatch(PoemsActions.raSetPoem(poem));
        }else{
          showToast(res.errmsg);
        }
      }).catch(err=>{
        console.error(err);
      })
  }
  /**
   * 请求点赞列表
   */
  _requestLoves(){
    var json = JSON.stringify({
      id:this.state.id,
    });
    // console.log('_requestLoves:'+json);
    HttpUtil.post(HttpUtil.POEM_LOVES,json).then((data)=>{
        if(data.code == 0){
          var loves = data.data;
          this.setState({
            loves:loves,
          })
          this.refs.lovelistview.loadPages();
        }else{
          showToast(data.errmsg);
        }
    }).catch((err)=>{
      console.error(err);
    });
  }
  /**
   * 请求评论列表
   */
  _requestNewestComment(){
    if(this.state.refreshing){
      return;
    }
    console.log('---DetailsUI() _requestNewestComment')
    this.setState({refreshing: true}) // 开始刷新
    var fromid = 0;
    if(this.state.sourceData.length > 0 ){
      fromid = this.state.sourceData[0].id;
    }
    var json = JSON.stringify({
      id:fromid,
      pid:this.state.id,
    });
    HttpUtil.post(HttpUtil.POEM_NEWEST_COMMENT,json).then((data)=>{
      // console.log(HttpUtil.POEM_NEWEST_COMMENT+':'+data);
      if(data.code == 0){
          var comments = data.data;
           if(comments.length > 0){
             this.dataContainer = comments.concat(this.dataContainer);
             this.setState({
               sourceData: this.dataContainer
             });
           }
      }else{
        showToast(data.errmsg);
      }
      this.setState({refreshing: false});
    }).catch((err)=>{
      console.error(err);
    })
  }
  /**
   * 请求点单数和评论数
   */
  _requestLoveComment(){
    var json = JSON.stringify({
      pid:this.state.id,
    })
    HttpUtil.post(HttpUtil.POEM_LOVE_COMMENT,json).then(res=>{
      if(res.code == 0){
          var poem = this.props.mypoem;
          var data = res.data;
          if(poem.id == data.id){
            poem.lovenum = data.lovenum;
            poem.commentnum = data.commentnum;
            let { dispatch } = this.props.navigation;
            dispatch(PoemsActions.raUpPoemLC(poem));
          }
      }else{
        showToast(res.errmsg);
      }
    }).catch(err=>{
      console.error(err);
    })
  }
}

const styles = StyleSheet.create({
  menu:{
    paddingLeft:60,
    flexDirection:'row',
    justifyContent:'flex-end',
  },
  menu_item:{
    flexDirection:'row',
    padding:10,
  },
  menu_font:{
    fontSize:18,
    color:StyleConfig.C_D4D4D4,
    marginLeft:4,
  },
  empty:{
      flex:1,
      justifyContent:'center',
      alignItems:'center',
  },
  empty_font:{
    marginTop:160,
    fontSize:18,
    color:StyleConfig.C_D4D4D4,
  },
  labels:{
    flexDirection:'row',
    flexWrap:'wrap',
    paddingLeft:10,
    paddingRight:10,
  },
  labelbg:{
    padding:4,
  },
  label:{
    fontSize:18,
    paddingLeft:6,
    paddingRight:6,
    paddingTop:2,
    paddingBottom:2,
    color:StyleConfig.C_000000,
    borderColor:StyleConfig.C_000000,
    borderWidth:1,
    borderRadius:4,
  }
})
function mapStateToProps(state) {
  return {

  };
}
export default connect(
    state => ({
        papp: state.papp,
        mypoem:state.poems.mypoem,
    }),
)(DetailsUI);
