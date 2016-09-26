var example =(function(window){
    "use strict";

    function FlappyBird(){
        var self = this ;

        this.main =document.getElementById("flappy-bird");
        //角色
        this.role = {
            dom:document.getElementById("role") || 0,
            //目前设置三种状态，下落（bottom),上升(top)，游戏结束(over)
            state:"bottom",
            coordinate:{
                x:0,
                y:0,
                h:document.getElementById("role").offsetHeight,
                w:document.getElementById("role").offsetWidth
            }
        };
        //障碍物
        this.obstacle = {
            dom:document.getElementById("obstacle"),
            //存放当前拦截物坐标，用于检测碰撞
            coordinate : {
                top:{
                    h:null,
                    y:null,
                },
                bottom:{
                    h:null,
                    y:null,
                },
                x:null,
                w:null
            }
        };

        //左移动的背景
        this.bg = document.getElementById("left-move");


        this.img = ["images/user_03.png","images/user_05.png","images/user_07.png"];

        //计分
        this.scoring = {
            dom:document.getElementById("scoring") ,
            number:0
        };

        //存放所有定时器
        this.time = {
            bottomMove:null,
            topMove:null,
            leftMove:null,
            angleMove:null,
            switchPng:null
        };

        //下降速度
        this.difficulty = 20;


        /* 角色的行为变化，涉及动画效果略多，考虑之后的扩展性，简单地使用了观察者模式*/

        //保存订阅的function
        this.issuance = {};

        //发布
        this.release = function(start){
            for(var i in self.issuance){
                self.issuance[i](start);
            }
        };

        //订阅
        this.subscribe = function(topics,fn){
            if(topics && fn){
                self.issuance[topics] = fn;
            }
        };

        //取消订阅
        this.stop = function(topics){
            for(var i in self.issuance){
                if (i == topics) {
                    delete  self.issuance[i];
                }
            }
        }
    }

    FlappyBird.prototype = {

        init:function(){
            /*初始化相关数据*/
            this.setKeyUp = true;
            this.clearTime();
            var bg = document.getElementById("game-bg");
            bg.style.left = 0;
            this.obstacle.dom.innerHTML = "";
            this.scoring.number = -1;
            this.setScoring();

            //开始进行游戏
            this.rolcArtoon();
            this.bgMove();
            this.crZaw(300);
            this.crZaw(700);

        },

        clearTime:function(){
            for(var i in  this.time){
                clearInterval(this.time[i]);
            }
        },

        /*控制角色动画效果*/

        rolcArtoon :function(){

            this.role.state = "bottom";
            this.role.dom.style.bottom = "500px";
            this.role.dom.style.WebkitTransform = "rotate(70deg)";

            var _self = this,
                _initBottm = null,
            //控制重力下降的倍数
                _multiple =  this.difficulty /10;



            //角色的X坐标，固定不变，获取一次
            _self.role.coordinate.x = _self.role.dom.offsetLeft;


            var _margfn = function(){
                _initBottm = parseInt(_self.role.dom.getAttribute("style").slice(7));

                _initBottm =  _self.bottomMove(_initBottm,_multiple);
                //下降速度不断加快
                _multiple =  (_multiple*10 + 2)/10;


                if(_initBottm <= -40){
                    _self.gameOver();
                }

                _self.role.dom.style.bottom = parseInt(_initBottm)+"px";
                //不断刷新角色的Y坐标
                _self.getRoleY( _self.role.dom.offsetTop);
            };

            this.subscribe("bottom",function(start){
                if(start == "bottom"){
                    _multiple =  _self.difficulty /10;
                    clearInterval(_self.time.switchPng);
                    clearInterval(_self.time.topMove);
                    clearInterval(_self.time.bottomMove);
                    _self._switch = 1;
                    _self.roleAngleMove(70);
                    _self.time.bottomMove = setInterval(_margfn,30);
                }else{
                    clearInterval(_self.time.bottomMove);
                }
            });

            this.release(this.role.state);

            document.onkeyup = function(e){
                if(!_self.setKeyUp){
                    return false;
                }
                e = e || window.event;
                if(e.keyCode == 32){
                    _self.topMove(_self.role.dom,35);
                }
            };
        },
        //控制onkeyup的开关
        setKeyUp :true,
        //刷新role的Y坐标
        getRoleY : function(y){
            this.role.coordinate.y = parseInt(y);
        },

        //控制飞翔效果的开关，防止多次飞翔效果累加
        _switch:1,
        //飞翔效果
        gitSwitch :function(id,img){

            if(this._switch === false){
                return false;
            }

            var i = 0,
                self = this;
            self._switch = false;
            this.time.switchPng = setInterval(function(){
                if(i >= img.length){
                    i = 0;
                }


                id.setAttribute("src",img[i]);
                i++;
            },100)
        },
        //重力下落动画
        bottomMove :function(ele,multiple){
            if(!ele){
                return false;
            }
            ele = ele - ((multiple + 2)) ;

            return ele;
        },
        //向上缓冲动画
        topMove :function(role,range){
            var self = this;
            var end = range + parseInt(role.getAttribute("style").slice(7));

            this.role.state = "top";

            clearInterval(self.time.topMove);
            function _topMove(){
                var roleTop = parseInt(role.getAttribute("style").slice(7));
                if(roleTop >= end){
                    clearInterval(self.time.topMove);
                    self.role.state = "bottom";
                    self.release(self.role.state);
                }

                var movePx = (end - roleTop)/3;
                movePx = Math.ceil(movePx);

                //防止向上动画超出可见区域
                if(roleTop+movePx > 560){
                    clearInterval(self.time.topMove);
                    self.role.state = "bottom";
                    self.release(self.role.state);
                }

                role.style.bottom =(roleTop+movePx)+"px";


                //刷新角色的Y坐标
                self.getRoleY(role.offsetTop);

            }

            this.subscribe("top",function(start){
                if(start == "top"){
                    clearInterval(self.time.topMove);
                    clearInterval(self.time.bottomMove);

                    var coleImg =  self.role.dom.getElementsByTagName("img")[0];
                    self.gitSwitch(coleImg,self.img);
                    self.roleAngleMove(-30);
                    self.time.topMove = setInterval(_topMove,30);
                }else{
                    clearInterval(self.time.topMove);
                }
            });

            this.release(this.role.state);
        },
        //角色角度转动
        roleAngleMove:function(angle){
            var self = this;
            clearInterval(self.time.angleMove);

            function angleMove(){
                var end = parseInt(self.role.dom.style.WebkitTransform.slice(7));

                if(end == angle){
                    clearInterval(self.time.angleMove);
                }

                var movePx = angle>30 ? (angle - end)/5 :  (angle - end)/2;
                movePx =movePx>0 ? Math.ceil(movePx) : Math.floor(movePx);

                role.style.WebkitTransform = "rotate("+(end+movePx)+"deg)";
            }
            this.time.angleMove = setInterval(angleMove,10)

        },

        /*随机障碍物生成*/

        //最多可存在22个障碍物（无空隙），最少保留三格空隙
        ZAW_NUM : 22,
        ZAW_KX : 3,

        //生成障碍物
        setZaw:function(){

            var div = document.createElement("div");
            div.innerHTML = "<ul class='top-hinder'></ul><ul class='bottom-hinder'></ul>";
            var ul = div.getElementsByTagName("ul");

            //随机生成上方障碍物数量
            var topNumber = this.randomNumber(4,16);
            //随机生成下方障碍物数量
            var bottomNumber = this.randomNumber(4,this.ZAW_NUM-topNumber-this.ZAW_KX);

            //生成相应数量的DOM
            ul[0] = this.setLi(ul[0],topNumber,topNumber-2);
            ul[1] = this.setLi(ul[1],bottomNumber,0);

            return div
        },
        setLi:function(ul,number,head){
            for(var i=0;i<number-1;i++){
                if(i == head){
                    ul.innerHTML += "<li class='head'></li>";
                }else{
                    ul.innerHTML += "<li></li>";
                }
            }
            return ul;
        },
        randomNumber:function(start,end){
            //parseInt(Math.random()*(上限-下限+1)+下限)
            var randomNu = parseInt(Math.random()*(end-start +1) + Number(start));
            return randomNu
        },


        /*背景移动动画*/

        //记录当前坐标
        bgCoordinate:0,

        //障碍物的间隔
        ZAW_JG:300,
        //障碍物宽度
        ZAW_WIDTH:50,
        //背景移动，计算left值，转成相应分数
        bgMove:function(){
            var self = this;

            self.bg.style.left = 0;

            //背景移动的速度
            var _seed = 2;


            self.obstacle.coordinate.w = self.ZAW_WIDTH;

            function leftMove(){
                var leftPx = self.bg.style.left;

                self.bg.style.left = parseInt(leftPx) + (-_seed) +"px";
                self.bgCoordinate = parseInt(self.bg.style.left);

                var lPx = Math.abs(self.bgCoordinate);
                var divPx = self.obstacle.dom.getElementsByTagName("div")[0].style.left;



                //计分
                if(lPx-54 == parseInt(divPx)){
                    self.setScoring();
                }

                //画布向左偏移同时，不断删除DOM和新增DOM
                if(lPx-150 >= parseInt(divPx)){
                    self.crZaw(parseInt(divPx)+800);
                    self.rmZaw(self.obstacle.dom.getElementsByTagName("div")[0]);
                }

                //切换背景图
                if(lPx % 2718 == 0){
                    self.bgSilide();
                }

                //进行碰撞检测
                if(lPx >= parseInt(divPx)-90 && lPx <= parseInt(divPx)+30 ){
                    self.collisionDetection(divPx);
                }

            }
            self.time.leftMove = setInterval(leftMove,10);

        },
        //将障碍物插入到dom中
        crZaw:function(left){
            var zawDiv = this.setZaw();
            zawDiv.style.left = left+"px";
            this.obstacle.dom.appendChild(zawDiv);
            var ul = zawDiv.getElementsByTagName("ul")[0];
        },
        //删除已经被隐藏的障碍物
        rmZaw:function(left){
            this.obstacle.dom.removeChild(left);
        },
        //背景图无缝切换
        bgSilide:function(){

            var bg = document.getElementById("game-bg");
            bg.style.left = Math.abs(this.bgCoordinate) +"px";
        },

        /*计分*/
        setScoring:function(){
            this.scoring.number ++ ;
            this.scoring.dom.innerText = "分数："+this.scoring.number ;
        },

        /*碰撞检测*/
        collisionDetection:function(bgy){
            bgy = parseInt(bgy);
            var self = this;
            /* console.log(parseInt(bgy));
             console.log(this.role);*/

            var div = this.obstacle.dom.getElementsByTagName("div");
            for(var i= 0,len=div.length;i<len;i++){

                var left = parseInt(div[i].style.left);

                if(left == bgy){

                    var ul  = div[i].getElementsByTagName("ul");
                    var topH = ul[0].offsetHeight;
                    var bottomH = ul[1].offsetHeight;

                    var topSetTop = ul[0].offsetTop,
                        bottomSetTop = ul[1].offsetTop;

                    self.obstacle.coordinate.top.h = topH ;
                    self.obstacle.coordinate.top.y = topSetTop;
                    self.obstacle.coordinate.bottom.h = bottomH;
                    self.obstacle.coordinate.bottom.y = bottomSetTop;
                    self.obstacle.coordinate.x = 0;

                    //返回碰撞结果
                    var result = self.coordinateContrast(self.role.coordinate , self.obstacle.coordinate);

                    //监听游戏结束
                    if(result == false){
                        self.gameOver();
                        return false;
                    }

                }
            }


        },
        //对比两个对象之间的x,y坐标、宽、高，返回碰撞结果
        coordinateContrast : function(role,zaw){

          /*  console.log( "1: "+ (role.x > zaw.x));
            console.log( "2: " + (role.y > zaw.top.y));
            console.log( "3: " + (role.y < zaw.bottom.y ));
            console.log( "4: " + (role.x + role.w > (zaw.top.y)));
            console.log( "5: " + (role.y<(zaw.bottom.y +zaw.bottom.h)));
            console.log( "6: " + (role.y+role.w-15  > zaw.top.y));
            console.log( "7: " + (role.y+role.w-15 < zaw.bottom.y));
            console.log( "8: " + (role.y+role.w > (zaw.top.y+zaw.top.h)));
            console.log( "9: " + (role.y+role.w<(zaw.bottom.y+zaw.bottom.h)));
            console.log( "10: " + (role.y+role.h > zaw.top.y));
            console.log( "11: " + (role.y+role.h < zaw.bottom.y));
            console.log( "12: " + (role.y+role.w > (zaw.top.y+zaw.top.h)));
            console.log( "13: " +(role.y+role.h <(zaw.bottom.y+zaw.bottom.h)));

            console.log(zaw);
            console.log(role);*/

            if(        role.x > zaw.x
                && role.y > zaw.top.y
                && role.y < zaw.bottom.y
                && role.x + role.w > (zaw.top.y)
                && role.y < (zaw.bottom.y+zaw.bottom.h)
                && role.y+role.w-15  > zaw.top.y
                && role.y+role.w-15 < zaw.bottom.y
                    // && role.y+role.w > (zaw.top.y+zaw.top.h)
                && role.y+role.w<(zaw.bottom.y+zaw.bottom.h)
                && role.y+role.h > zaw.top.y
                && role.y+role.h < zaw.bottom.y
                && role.y+role.w > (zaw.top.y+zaw.top.h)
                && role.y+role.h <(zaw.bottom.y+zaw.bottom.h)
                && role.y > (zaw.top.y+zaw.top.h)
            ){
                return true;
            }else{
                return false;
            }
        },
        //结算，重置
        gameOver:function(){
            console.log("游戏结束！得分："+this.scoring.number+"分");
            this.setKeyUp = false;
            this.clearTime();
            return false;
        }
    };




    //实例化
    var example;

    if(typeof _example != "object"){
        example = new FlappyBird();
        return example;
    }else{
        return example;
    }
}(window));