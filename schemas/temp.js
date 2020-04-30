var mongoose = require('mongoose');

//用户数据表结构
module.exports = new mongoose.Schema({

	recommendname: Array, //推荐的电影名
})