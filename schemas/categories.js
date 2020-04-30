var mongoose = require('mongoose');

//电影数据表结构
module.exports = new mongoose.Schema({//最好不要记录在cookies

	name: {
		type: String,//不能用；结尾
		default: ''
	},
})
