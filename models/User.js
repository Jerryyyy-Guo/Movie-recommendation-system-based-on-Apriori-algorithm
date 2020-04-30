var mongoose = require('mongoose');//加载mongoose
var usersSchema = require('../schemas/users');//加载schemas文件//users为表名

module.exports = mongoose.model('User',usersSchema);//创建模型并且暴露出去
