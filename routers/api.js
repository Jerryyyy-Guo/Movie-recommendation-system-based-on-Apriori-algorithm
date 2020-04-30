var express = require('express');
var router = express.Router();
var responseData; //统一返回格式
var User = require('../models/User');
var Movie = require('../models/Movie');
var Temp = require('../models/Temp');

router.use(function (req, res, next) {
	responseData = {
		code: 0, //返回的错误码，0为默认即无错误
		message: '无错误', //没有错误返回空字符；
	}
	Movie.find().then(function(movies){
		movie = movies;
	})
	next();
});

//注册部分
router.post('/user/register',function(req,res,next){//req对象下的body方法获取post请求过来的数据
	var username = req.body.username; //网站传过来的用户名数据
	var password = req.body.password; //网站传过来的密码数据
	// console.log(req.body);
	// console.log(req.body.username);
	// console.log(req.body.password);
	/*
	 *	对数据进行处理
		判断用户名是否为空：
		错误码和message在F12  network的preview中查看
		用户注册
	*注册逻辑
	*1、内容不为空
	*2、密码不为空
	*3、用户名长度1-18位
	*4、密码6-20位
	*
	*数据库操作
	*1、用户名是否被注册（利用数据库查询）
	*/
	if (username == '') {
		responseData.code = 1;
		responseData.message = '用户名不能为空！';
		res.json(responseData);//执行后不能继续往下走，需要返回
		return ;
	};
	//判断密码否为空：
	if (password == '') {
		responseData.code = 2;
		responseData.message = '密码不能为空！';
		res.json(responseData);
		return ;
	};  
	//用户名长度1-18位
	if (username.length>18) {	
		responseData.code = 3;
		responseData.message = '用户名大于18！';
		res.json(responseData);//执行后不能继续往下走，需要返回
		return ;
	};
	//密码6-20位
	if (password.length<6) {	
		responseData.code = 4;
		responseData.message = '密码小于6位！';
		res.json(responseData);//执行后不能继续往下走，需要返回
		return ;
	};

	if (password.length>18) {	
		responseData.code = 5;
		responseData.message = '密码过长大于18位！';
		res.json(responseData);//执行后不能继续往下走，需要返回
		return ;
	};
	//如果注册用户已经在数据库中出现重名情况；
	User.findOne({
		username: username
	}).then(function(userInfo){
		// console.log(userInfo);用于验证是否生效
		if (userInfo) {//表示数据库中有该记录
			responseData.code = 6;
			responseData.message = '用户已被注册，请重新注册！';
			res.json(responseData);
			return;
		};
	// 否则保存用户注册信息到数据库中（用model模板中的mongoose模块提供的方法）
	var user = new User({
		username: username,
		password: password
	})
	return user.save();
	}).then(function(newUserInfo){//一定要schemas暴露出去否则存储不了数据
		console.log("**********************************");
		console.log("用户注册信息：")
		console.log(newUserInfo);//在服务在显示 新用户 注册数据库信息
		console.log("**********************************");

		responseData.message = '注册成功！';//导回到responseData的message中即code：0；时候
		res.json(responseData);//将responseData以json形式输出到浏览器preview中
	});
});
//登录部分
router.post('/user/login', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	//密码验证

	if (username == '' || password == '') {//密码或用户名等于空
		responseData.code = 1;
		responseData.message = '用户名或密码不能为空！';
		res.json(responseData);
		return;
	}
	//查询数据库中是否存在相同用户名和密码的记录是否存在，如果存在则登录成功
	User.findOne({
		username: username,
		password: password
	}).then(function(userInfo){
		if (!userInfo) {
			responseData.code = 2;
			responseData.message = '用户名或密码错误！';
			res.json(responseData);
			return;
		}
		//进行到这步说明验证成功密码和用户名正确；
		responseData.message = '登陆成功！';
		responseData.userInfo = {//后端返回用户信息
			_id: userInfo._id,
			username: userInfo.username,
		};
		req.cookies.set('userInfo', JSON.stringify({
			_id: userInfo._id,
			username: userInfo.username,
		}));
		res.json(responseData);
		return;
	})
});
//退出部分
router.get('/user/logout',function(req, res){
	req.cookies.set('userInfo', null);
	responseData.message = '退出成功！';
	res.json(responseData);
	return;
})

//收藏提交
router.post('/favour/post',function(req, res){
	//电影ID
	console.log(req.userInfo.username);
	var username = req.userInfo.username;
	var postDate = {
		username: req.userInfo.username,//收藏用户
		movieid: req.body.movieid,//收藏电影ID
		movietitle: req.body.movietitle,//收藏电影
		movietic: req.body.movietic,//收藏标签
		postTime: new Date(),//收藏时间
	};

	User.findOne({
		username: username,
	}).then(function(user){
		var arr = user.favour;
		var movieid = req.body.movieid;
		var result = arr.some(function(item) {//判断是否存在
			if (item.movieid == movieid ) {
				return true;
			}
		})// console.log(result);
		if (result) {//存在电影
			responseData.code = 1;
			responseData.message = '已收藏该电影，收藏失败！';
			responseData.data = user;
			res.json(responseData);
			return;
		} else {//不存在电影
			responseData.code = 0;
			responseData.message = '未收藏此电影！';
			user.favour.push(postDate);
			return user.save().then(function(newUser){
				responseData.code = 3;
				responseData.message = '收藏成功！';
				responseData.data = newUser;
				res.json(responseData);

				console.log('打印前端post的data');
				console.log(responseData);

				// console.log(movieId);
				// console.log(newUser.favour);
			});
		}
	})
})
//获取用户全部收藏
router.get('/favour', function(req ,res){
	var username = req.userInfo.username;
	// console.log(username);
	User.findOne({
		username: username,
	}).then(function(user){
		
		responseData.code = 0;
		responseData.message = '可以收藏！';
		responseData.data = user.favour;
		res.json(responseData);

		var arr = [];
		for(var i = 0;i<user.favour.length; i++){
			arr.push(user.favour[i].movietic);
		}
		console.log("*************user*****************");
		console.log('user表');
		// console.log(user);
		console.log(user.favour);
		// console.log(user.favour.length);
		console.log("收藏电影的标签数组:" + arr);
		console.log("*************user*****************");
	})

})

router.get('/all',function(req ,res ,next){
	 	var where = req.query;//ajax get到的条件
	 	console.log('///////////////////where/////////////////');
		console.log(where);//{ tic: [ [ '爱情', '动作' ], [ '动作', '科幻' ] ] }
		console.log('///////////////////where/////////////////');
		console.log(where.tic[0]);//[ '爱情', '动作' ]
		var arr = where.tic;
		var criteria = [];
		arr.forEach(e => {
			criteria.push({tic:{$all:e}})
		})
		Movie.find({
			$or:criteria
		}).then(function (result) {
			console.log('///////////////////result/////////////////');
			console.log(result);
			console.log('///////////////////result/////////////////');
			result.code = 0;
			result.message = '开始推荐！';
			res.json(result);
			// res.send(result);
			// res.render('main/index',{
			// 	result: result
			// })
		})
		
	});



router.post('/comment/post',function(req, res ,next){
	var movieId = req.body.movieid || '';
	var postDate = {
		username: req.userInfo.username,
		postTime: new Date(),
		content: req.body.content,
	};
	Movie.findOne({
		_id: movieId
	}).then(function(content){
		content.comments.push(postDate);
		return content.save();
	}).then(function(newContent){
		responseData.message = '评论成功！';
		responseData.data = newContent;
		res.json(responseData);
	})
})

router.get('/comment',function(req,res){
	var movieId = req.query.movieid || '';
	Movie.findOne({
		_id: movieId
	}).then(function(content){
		responseData.data = content.comments;
		res.json(responseData);
	})
})


module.exports = router; //将router返回出去被app.use('/admin',require('./router/admin'))接收