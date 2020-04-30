var express = require('express');
var router = express.Router();
var Category = require('../models/Category');
var Movie = require('../models/Movie');
var User = require('../models/User');


//处理通用的数据
var data;

router.use(function(req ,res ,next){
	data = {
		userInfo: req.userInfo,
		categories: [],
	}
	User.find().then(function(user){
		data.user = user;
	})
	Category.find().then(function(categories){
		data.categories = categories;
		next();
	})
});

router.get('/',function(req,res,next){

	console.log("//////////////////【用户登录信息：】//////////////////////");
	console.log("【用户登录信息：】");
	console.log(req.userInfo);
	console.log("//////////////////【：用户登录信息】//////////////////////");
	//读取所有movie
	data.category = req.query.category || '';
	data.page = Number(req.query.page || 1);
	data.limit = 4;
	data.pages = 0;

	var where = {};
	if (data.category) {
		where.category = data.category
	}

	Movie.where(where).countDocuments().then(function(count){

		data.count = count;
		data.pages = Math.ceil( data.count/data.limit);
		data.page = Math.min( data.page , data.pages );
		data.page = Math.max( data.page , 1 );
		var skip = (data.page-1) * data.limit;
		
		return Movie.find().where(where).limit(data.limit).skip(skip).populate(['category', 'user']);
	}).then(function(movies){//第二个参数是分配给main.html的数据模板中可以使用userInfo变量
		data.movies = movies;

		console.log("//////////////////【data值:】//////////////////////");
		console.log('【data值:】');
		console.log(data);
		console.log("//////////////////【:data值】//////////////////////");
		// console.log(movies.title);
		res.render('main/index', data);
	})
});

router.get('/view', function(req, res, next){

	var movieId = req.query.movieid || '';

	Movie.findOne({
		_id: movieId
	}).then(function(movie){
		data.movie = movie;
		console.log("//////////////////【该电影data:】//////////////////////");
		console.log('【data值:】');
		console.log(data);
		console.log("//////////////////【:该电影data】//////////////////////");

		movie.views++;
		movie.save();
		res.render('main/view', data);
	});
});

module.exports = router;//将router返回出去被app.use('/admin',require('./router/admin'))接收

