var mongoose = require('mongoose');

//用户数据表结构
module.exports = new mongoose.Schema({//最好不要记录在cookies

	username:String, //用户名
	password:String, //密码
	isAdmin:{
		type:Boolean,
		default:false//不能用；结尾
	},
	  
	favour: {//收藏
		type: Array,
		default: [],
	},
	//用模型类来对数据进行增删改查即：文件夹models
})
