// js中 const 定义常量   let 定义变量

//1、初始化Game game（宽度，高度，渲染方式，父级）
//canvas渲染    webGl渲染
const game = new Phaser.Game(400,505,Phaser.AUTO,'game')


//2、准备游戏场景，加载场景 menu菜单场景，play场景
// game对象里面自定义States  States用来存放场景
game.States = { }

// game对象的States属性挂在一个menu对象，menu对象用来做游戏菜单场景
// 场景是一个函数，一般包含三个方法
//preload 场景未加载使用，预加载资源
// create 场景已经加载，执行的方法
// update  场景实时加载，执行的方法
game.States.menu = function(){
    
    this.preload = function(){
         // 加载（图片资源命名background，资源路径）
        game.load.image('background','assets/background.png')

        game.load.image('ground','assets/ground.png')    

        //已经预加载的资源可直接用
        //spritesheet序列帧  精灵   动画
        game.load.spritesheet('bird','assets/bird.png',34,24,3) //小鸟
        game.load.image('title','assets/title.png') //标题

        //加载按钮图片  需要可交互
        game.load.image('btnImage','assets/start-button.png')  

        // 加载管道
        game.load.spritesheet('pipe','assets/pipes.png',54,320,2)
        //game.load.spritesheet('pipe','assets/pipes.png',54,320,2)

    }
    this.create =  function(){
       
        // tile瓷砖  tileSprite地图精灵   经常做背景
        // tileSprite（x轴，y轴，宽度，高度，什么资源）
        const bg = game.add.tileSprite(0,0,game.width,game.height,'background')

        // 自动播放 x轴以向左移动，y轴不变
        bg.autoScroll(-10,0)

        const ground = game.add.tileSprite(0,game.height-112,game.width,112,'ground')
        ground.autoScroll(-100,0)

        // 1.创建小组titleGroup
        const titleGroup = game.add.group()
        // 2.加入标题
        titleGroup.create(0,0,'title')
        // 3.加入小鸟到group
        const bird = titleGroup.create(190,10,'bird')
        // 4.让小鸟飞
        // animations添加动画和删除动画
        // animations.add添加   animations.remove  移除
        // animations只有spritesheet序列帧精灵 才能使用
        bird.animations.add('fly')
        // 一般网页12帧  24帧流畅
        bird.animations.play('fly',12,true)

        // titleGroup位置
        titleGroup.x = 100
        titleGroup.y = 150
        
        // Phaser有一个缓冲类  tween  to是播放效果
        // 参数，时间  （毫秒），缓慢动画类ease easeIn easeOut （bull匀速）  布尔类型（是否重复动画）
        // x轴不变，y在原来150的基础上加120  ，1000毫秒  
        game.add.tween(titleGroup).to({ y:120},1000,null,true,0,Number.MAX_VALUE,true)

        const btn = game.add.button(game.width/2,game.height/2,'btnImage',function(){
        
            console.log("跳至下一个场景")
            game.state.start('myplay')
        })
        // 按钮中心点默认在左上角  0.5  0.设置在中心
        btn.anchor.setTo(0.5,0.5)

    }



}

game.States.play = function(){

    this.preload = function(){
        // 预加载
    }

    this.create = function(){
        // 加载完成
   
        //加载背景
        // 不可用const定义  用this到play中
        this.bg = game.add.tileSprite(0,0,game.width,game.height,'background')

        // 管道组设计（避免管道挡住地板，先加载管道再加载地板，让地板覆盖管道）
        this.pipeGroup = game.add.group()
        // 开启物理引擎
        this.pipeGroup.enableBody = true

        // 加载地板
        this.ground = game.add.tileSprite(0,game.height-112,game.width,112,'ground')


      


        // 加载小鸟
        this.bird = game.add.sprite(50,150,'bird')
        this.bird.animations.add('fly')
        this.bird.animations.play('fly',12,true)
        this.bird.anchor.setTo(0.5,0.5)
        

        // 开始动作部分
        // 点击屏幕开始游戏

        // addOnce(执行方法，绑定到什么对象 如果是this指本身）)  只能执行一次
        game.input.onDown.addOnce(this.startGame,this)
        // 小鸟有一个重力向下掉
        // 小鸟头部会慢慢向下，最多不超过90度
        // 只有开启物理引擎才有body
        game.physics.enable(this.bird,Phaser.Physics.ARCADE)
       
        this.bird.body.gravity.x=0

        game.physics.enable(this.ground,Phaser.Physics.ARCADE)
        // 固定地板
        this.ground.body.immovable = true

        this.hasStarted = false  //判断游戏是否开始


        game.time.events.loop(1000,this.generatePipes,this)
        // loop一旦定义马上执行
        game.time.events.stop(false)

    }

   

    this.update = function(){
    
        if(this.hasStarted==false){
            return
        }
        //    collide碰撞检测   在hitGround实现
        game.physics.arcade.collide(this.bird,this.ground,this.hitGround,null,this)
        if(this.bird.angle<90){
            this.bird.angle+=2.5

        }   

    }

    this.generatePipes = function(gap){
        // 管道生成
        // 1.设置上下管道中间空白区块大小 100(无gap参数就用100)
        gap = gap || 100
        // 2.计算管道空白区间位置
        // Math.random() 产生0-1的随机数  Math.floor返回小于或等于x的整数
        //const position =110+ Math.floor(210*Math.random())
        const position = -250 +Math.floor(Math.random()*200)
      
        const topPieY = position    //上面管道长度
        const buttomPieY = 100+ 320+position  //下管道长度 (实际为在y轴的位置 )

        const topPie = game.add.sprite(game.width,topPieY,'pipe',0,this.pipeGroup)
        const bottomPie = game.add.sprite(game.width,buttomPieY,'pipe',1,this.pipeGroup)

        this.pipeGroup.setAll('body.velocity.x',-200)
    }

    this.startGame = function(){
        
        this.hasStarted = true
        console.log("开始")
        this.bg.autoScroll(-10,0)
        this.ground.autoScroll(-100,0)
        // gravity重力  恒定方向不变
        this.bird.body.gravity.y=1150  
        
        // this.game.add.tween(this.bird).to({angle: 90}, 650).start() //头慢慢下降 角度变化

        // addOnce 监听一次自动销毁
        // 为事件本身添加this.fly
        game.input.onDown.add(this.fly,this)
        game.time.events.start()
    }


    this.fly =function(){
        // console.log("飞")
        // velocity作用力  
        this.bird.body.velocity.y=-350
        game.add.tween(this.bird).to({ angle:-30},100,null,true,0,0,false)


    }
    this.hitGround = function(){
        console.log("撞到地板")
    }
   

}

// game对象添加场景
game.state.add('mymenu',game.States.menu)
game.state.add('myplay',game.States.play)
game.state.start('mymenu')


