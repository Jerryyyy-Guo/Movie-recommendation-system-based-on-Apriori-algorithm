var mongoose = require('mongoose');

//电影数据表结构
module.exports = new mongoose.Schema({//最好不要记录在cookies
	category: {
		//关联字段 - 分类的ID
		type: mongoose.Schema.Types.ObjectId,
		//引用另一张表的模型
		ref: 'Category'
	},

	user: {
		type: mongoose.Schema.Types.ObjectId,
		//引用另一张表的模型
		ref: 'User'
	},

	title: {//电影名称
		type: String,
		default: ''
	}, 
	//用模型类来对数据进行增删改查即：文件夹models
	//简介
	brief: {
		type: String,
		default: ''
	},
	//内容、图片
	pic: {
		type: String,
		default: '' //默认值
	},

	content: {
		type: String,
		default: '' //默认值
	},

	views: {//点击量
		type: Number,
		default: 0
	},

	addTime: {//时间
		type: Date,
		default: Date.now
	},

	tic: {//标签
		type: Array,
		default: [],
	},

	comments: {//评论
		type: Array,
		default: [],
	}

});
