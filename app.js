// app.js应用程序的启动（入口）文件

/*
*模块划分：
1、前台模块 app.use('/',require('./router/main'))
2、后台管理模块 app.use('/admin',require('./router/admin'))
3、API接口模块 app.use('api',require('./router/api'))
*/

var express = require('express'); //加载express模块
var mongoose = require('mongoose'); //加载mongoose数据库模块
// exports.mongoose = mongoose;

var path = require('path');
var favicon = require('favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');

var swig = require('swig'); //加载swig模块 //有缓存开发过程不断调试不利于开发
var XJ = require('xls-to-json'); //加载xls转json模块
var Cookies = require('cookies'); //加载cookies模块
var bodyParser = require('body-parser');//处理post提交到服务器的数据
var User = require('./models/User'); //引用models模板，并通过他获取当前用户信息
/*加载html文件*/

// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');
var app = express(); //创建App应用 =>nodejs http

// app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(cookieParser());

app.engine('html', swig.renderFile); //定义模块引擎，使用swig.renderFile方法解析后缀名为html的文件
//engine表示对于模板使用的engine，其实就是一个回调函数用来把特定的模板生成html文件，在render的时候调用，来处理模板文件，发送给用户
app.set('views', './views'); //第一个参数必须是views，第二个参数是目录,（存放模板文件）
app.set('view engine', 'html'); //注册所使用的模板引擎，第一个参数必须是view （给模板文件添加后缀）engine，第二个参数和是app.engine的模块引擎的第一个参数
swig.setDefaults({ cache: false }); //取消缓存方法，默认为true；
app.use(bodyParser.urlencoded({ extended: true }))

app.use(function (req, res, next) { //是指cookies,调用cookies方法，加载cookies到request对象里
	req.cookies = new Cookies(req, res); //利用set、get方法获取request和response

	// console.log(req.cookies.get('userInfo'));
	req.userInfo = {}
	//解析登录用户的cookies信息
	if (req.cookies.get('userInfo')) {
		try {
			req.userInfo = JSON.parse(req.cookies.get('userInfo')); //解析userInfo到request
			User.findById(req.userInfo._id).then(function (userInfo) {
				req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
				next();
			}) //获取当前用户是否为管理员
		} catch (e) {
			next();
		}
	} else {
		next();
	}
	// console.log(typeof req.cookies.get('userInfo'));
	// console.log(req.userInfo);
	// console.log(req.userInfo._id);
})

/*加载html文件*/
/*根据不同功能划分模块*/
app.use('/admin', require('./routers/admin'));//后台数据库
app.use('/api', require('./routers/api'));//用户登录注册验证
// app.use('/film',require('./routers/film'));//电影管理页面
app.use('/', require('./routers/main'));//前端界面展示
/*静态文件托管css文件*/
app.use('/public', express.static(__dirname + '/public'));//当用户访问的URL以/public开始，那么直接返回__dirname + '/public'下的文件
/*静态文件托管css文件*/

app.get('/', function (req, res, next) { //开发过程中，需要取消模块缓存
	// res.send('<h1>欢迎光临<h1>')//利用swig模块，实现前后端分离，将html文件send给浏览器
	res.render('index');
	//结合app.engine读取指定目录下的指定文件，解析并返回给客户端，(只能写一条！！！！第一个参数表示模板的文件，相对于views目录下的HTML文件)(第二个参数是传递给模板使用的数据)
});


// app.use(function(req, res, next){
// var err = new Error('Not Found');
// err.status = 404;
// next(err);
// });
// //开发错误处理
// if (app.get('env') === 'development') {
// app.use(function(err ,req ,res ,next){
// res.status(err.status || 500);
// res.render('error',{
// message: err.message,
// error: err
// });
// });
// }
// //生产错误处理
// app.use(function(err ,req ,res ,next){
// res.status(err.status || 500);
// res.render('error',{
// message: err.message,
// error: {}
// });
// });

// module.exports = app;
// app.listen(3000,function(){
// console.log('server begin...');
// })



mongoose.connect('mongodb://localhost:27017/blog', {
	useNewUrlParser: true, useUnifiedTopology:
		true
}, function (err) {
	if (err) {
		console.log('数据库连接失败');
	} else {
		console.log('数据库连接成功');
		app.listen('8080');//由于数据库失败会导致一些列问题，因此app.listen要写在一起
	}
});//连接服务器第一个参数是链接地址以及协议（mongdb）
		// app.listen('8080'); //监听http请求 服务器端口号

		//通过app.get()、app.post()处理用户请求，把URL路径和函数进行绑定
		//app.get('/',function(req,res,next){})
		//req: request对象 —— 保存客户端请求相关的数据 —— http.request
		//res: response对象 —— 服务端输出对象，提供了一些服务器输出相关的一些方法 —— http.response
		//next: 用于执行下一个和路径匹配的函数
		//res.send(string)发送内容至客户端
		//app.engine('html',swig.renderFile);(第一个参数，html可以是其他引擎名称)，(第二个参数，表示用于解析处理模板内容的解析方法)

/*
*用户发送http请求 —> URL —> 解析路由 —> 找到匹配的规则 —> 执行绑定函数，返回对应内容到浏览器 —>
分为静态和动态处理
以/public开头为静态文件 —> 静态 —> 直接读取指定目录下文件；返回给浏览器
以/开头的动态文件 —> 动态 —> 处理业务逻辑；加载模板；解析模板 —> 返回数据给用户
*/


		// excle转json方法1，直接引用模板方法
/*XJ({
input: "sample.xls", // 输入xls文件
output: "output.json", // 输出json文件
rowsToSkip: 0 ,// 工作表顶部要跳过的行数；默认为0
}, function(err, result) {
if(err) {
console.error(err);
} else {
console.log(result);
}
});*/
		// excle转json方法2，引入tranxls.js方法
		// var tranxls = require('./tranxls.js');
		// tranxls.xls;