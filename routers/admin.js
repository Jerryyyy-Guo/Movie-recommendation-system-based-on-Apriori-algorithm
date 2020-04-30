var express = require('express');
var router = express.Router();
var User = require('../models/User'); //引入User模型可以理解为数据库
var Category = require('../models/Category');
var Movie = require('../models/Movie');

router.use(function(req, res ,next){
	if (!req.userInfo.isAdmin) { //当前用户为非管理员用户
		res.send('对不起，只有管理员才有权限进入后台管理！')
		return;
	}
	next();
});

// 首页
router.get('/', function(req,res,next){
	res.render('admin/index', {	
		userInfo: req.userInfo //请求用户名
	})//admin前没有‘/’
	// res.send('后台管理首页') //输出信息
});

// 用户管理
router.get('/user', function(req ,res ,next){
	// 从数据库中获取所有用户信息 把数据分配给模板
	// limit(number)限制获取数据的条数，
	// skip(number)忽略数据条数 实现数据分页
	// 每页显示5条
	// 1： 1-5 skip:0  -> (当前页-1)*limit
	// 2： 6-10 skip:5 -> 
	var page = Number(req.query.page || 1);
	var limit = 5;
	var pages = 0;
	User.countDocuments().then(function(count){
		pages = Math.ceil(count/limit);
		page = Math.min( page , pages );
		page = Math.max( page , 1 )
		var skip = (page-1) * limit;
		User.find().limit(limit).skip(skip).then(function(users){
			console.log('///////////////////用户信息/////////////////');
			console.log('用户库:');
			console.log(users);
			console.log('///////////////////用户信息/////////////////');
			res.render('admin/user_index', {
				userInfo: req.userInfo,
				users: users,
				page: page,
				limit: limit,
				pages: pages,
				count:count
			})
		})
	})
});

// 电影管理
router.get('/movie',function(req ,res ,next){
	var page = Number(req.query.page || 1);
	var limit = 5;
	var pages = 0;
	Movie.countDocuments().then(function(count){
		pages = Math.ceil(count/limit);
		page = Math.min( page , pages );
		page = Math.max( page , 1 );
		var skip = (page-1) * limit;
		Movie.find().limit(limit).skip(skip).populate(['category', 'user']).sort({addTime: -1}).then(function(movies){
			
			console.log('///////////////////电影信息/////////////////');
			console.log('电影库:');
			console.log(movies);
			console.log('///////////////////电影信息/////////////////');
			res.render('admin/movie_index', {
				userInfo: req.userInfo,
				movies: movies,
				page: page,
				limit: limit,
				pages: pages,
				count: count
			})
		})
	})
});


// 电影分类管理
router.get('/category',function(req ,res ,next){
	var page = Number(req.query.page || 1);
	var limit = 5;
	var pages = 0;
	Category.countDocuments().then(function(count){
		pages = Math.ceil(count/limit);
		page = Math.min( page , pages );
		page = Math.max( page , 1 )
		var skip = (page-1) * limit;
		//1:升序
		//-1:降序
		Category.find().sort({_id: -1}).limit(limit).skip(skip).then(function(categories){
			
			console.log('///////////////////分类信息/////////////////');
			console.log('分类库:');
			console.log(categories);
			console.log('///////////////////分类信息/////////////////');

			res.render('admin/category_index', {
				userInfo: req.userInfo,
				categories: categories,
				page: page,
				limit: limit,
				pages: pages,
				count:count
			})
		})
	})
});

// 添加电影
router.get('/movie/add',function(req ,res ,next){
	Category.find().sort({_id: -1}).then(function(categories){
		res.render('admin/movie_add',{
			userInfo: req.userInfo,
			categories: categories
		})
	});
});

// 电影内容、图片保存 get方式：给前端数据，post方式：给后端提交数据
router.post('/movie/add',function(req ,res ,next){
	console.log('///////////////////提交的分类库/////////////////');//保存情况
	console.log('分类库:');
	console.log(req.body);
	console.log('///////////////////提交的分类库/////////////////');
	
	if (req.body.tic == []) {
		res.render('admin/error', {
			userInfo: req.userInfo,
			message: "电影标签不能为空！"
		})
		return;
	}

	if (req.body.title == '') {
		res.render('admin/error', {
			userInfo: req.userInfo,
			message: "电影名称不能为空！"
		})
		return;
	}

	if (req.body.brief == '') {
		res.render('admin/error', {
			userInfo: req.userInfo,
			message: "电影名称不能为空！"
		})
		return;
	}

	if (req.body.pic == '') {
		res.render('admin/error', {
			userInfo: req.userInfo,
			message: "电影名称不能为空！"
		})
		return;
	}

	if (req.body.content == '') {
		res.render('admin/error', {
			userInfo: req.userInfo,
			message: "电影名称不能为空！"
		})
		return;
	}

	//保存数据到数据库
	new Movie({
		category: req.body.category,
		title: req.body.title,
		user: req.userInfo._id.toString(),
		brief: req.body.brief,
		pic: req.body.pic,
		content: req.body.content,
		tic: req.body.tic
	}).save().then(function(rs){

		res.render('admin/success', {
			userInfo: req.userInfo,
			message: "电影信息保存成功！",
			url: '/admin/movie'
		});
	});
});


//电影修改
router.get('/movie/edit', function(req, res ,next){
	var id = req.query.id || '';//获取要修改的电影的信息，并用表单形式展现出来
	var categories = [];

	Category.find().sort({_id: 1}).then(function(rs){
		categories = rs;
		return Movie.findOne({//获取要修改的电影信息
			_id: id
		}).populate('category'); 
	}).then(function(movie){
		if (!movie) {
			res.render('admin/error', {
				userInfo: req.userInfo,
				message: '电影信息不存在！'
			});
			return Promise.reject();
		} else {
			res.render('admin/movie_edit', {
				userInfo: req.userInfo,
				categories: categories,
				movie: movie
			});
		}
	})
	
})
//电影保存
router.post('/movie/edit', function(req ,res ,next){

	var id = req.query.id || ''; 
	var name = req.body.name || ''; //获取post提交过来的新名称
	if (req.body.name == '') {
		res.render('admin/error', {
			userInfo: req.userInfo,
			message: "电影名称不能为空！"
		})
		return;
	}

	if (req.body.brief == '') {
		res.render('admin/error', {
			userInfo: req.userInfo,
			message: "电影简介不能为空！"
		})
		return;
	}

	if (req.body.pic == '') {
		res.render('admin/error', {
			userInfo: req.userInfo,
			message: "电影图片不能为空！"
		})
		return;
	}

	if (req.body.content == '') {
		res.render('admin/error', {
			userInfo: req.userInfo,
			message: "电影内容不能为空！"
		})
		return;
	}

	Movie.update({
		_id: id
	}, {
		category: req.body.category,
		title: req.body.title,
		brief: req.body.brief,
		pic: req.body.pic,
		content: req.body.content,
		tic: req.body.tic
	}).then(function(){
		res.render('admin/success', {
			userInfo: req.userInfo,
			message: '电影修改成功！',
			// url: '/admin/movie/edit?id=/edit?id='+id
			url: '/admin/movie'
		})
	});
}); 

//电影删除
router.get('/movie/delete', function(req ,res ,next){
	var id = req.query.id || ''; //获取要删除的ID
	Movie.deleteOne({_id :id}).then(function(){
		res.render('admin/success', {
			userInfo: req.userInfo,
			message: '删除成功！',
			url: '/admin/movie'
		});
	});
});


// 添加电影分类
router.get('/category/add',function(req ,res ,next){
	res.render('admin/category_add',{
		userInfo: req.userInfo
	})
});

// 电影分类保存get方式：给前端数据，post方式：给后端提交数据
router.post('/category/add',function(req ,res ,next){

	var name = req.body.name || '';
	if (name == '') {
		res.render('admin/error',{
			userInfo: req.userInfo,
			message: '内容不能为空！'
		});
		return;
	}

	//数据库中是否有同名电影分类，利用category

	Category.findOne({
		name: name
	}).then(function(rs){
		if(rs){//如果数据库中存在该电影
			res.render('admin/error',{
				userInfo: req.userInfo,
				message: '分类已经存在！'
			})
			return Promise.reject();
		} else {//表示数据库中不存在该电影，可以保存
			return new Category({
				name: name,
			}).save();
		}
	}).then(function(newCategory){
		res.render('admin/success',{
			userInfo: req.userInfo,
			message: '分类保存成功！',
			url: 'admin/category'
		})
	})
});

//电影分类修改
router.get('/category/edit', function(req, res ,next){
	var id = req.query.id || '';//获取要修改的电影的信息，并用表单形式展现出来

	Category.findOne({//获取要修改的电影信息
		_id: id
	}).then(function(category){
		if (!category) {
			res.render('admin/error', {
				userInfo: req.userInfo,
				message: '分类信息不存在！'
			});
			return Promise.reject();
		} else {
			res.render('admin/category_edit', {
				userInfo: req.userInfo,
				category: category
			});
		}
	})
})

//电影分类修改后保存
router.post('/category/edit', function(req ,res ,next){

	var id = req.query.id || ''; //获取post提交过来的新名称
	var name = req.body.name || ''; //

	Category.findOne({//获取要修改的电影信息
		_id: id
	}).then(function(category){
		if (!category) {
			res.render('admin/error', {
				userInfo: req.userInfo,
				message: '分类信息不存在！'
			});
			return Promise.reject();
		} else {
			if (name == category.name) {//用户没有修改提交时
				res.render('admin/success', {
					userInfo: req.userInfo,
					message: '修改成功！',
					url: '/admin/category'
				});
				return Promise.reject();
			} else {//不能直接保存，要验证要修改的名称是否存在
				return Category.findOne({
					_id: {$ne: id},//id不是我要修改的id,但名称相同
					name: name 
				});
			}
		}
	}).then(function(sameCategory){//存在同名时
		if (sameCategory) {
			res.render('admin/error', {
				userInfo: req.userInfo,
				message: '数据库中已经存在同名电影！'
			});
			return Promise.reject();
		} else {//验证完成，调用保存方法
			return Category.update(
				{_id: id},
				{name: name});
		}
	}).then(function(){
		res.render('admin/success', {
			userInfo: req.userInfo,
			message: '修改成功！',
			url: '/admin/category'
		});
	})
})

//电影分类删除
router.get('/category/delete', function(req ,res ,next){
	var id = req.query.id || ''; //获取要删除的ID
	Category.deleteOne({_id :id}).then(function(){
		res.render('admin/success', {
			userInfo: req.userInfo,
			message: '删除成功！',
			url: '/admin/category'
		});
	});
});

module.exports = router;//将router返回出去被app.use('/admin',require('./router/admin'))接收