var mongoose = require('mongoose');//加载mongoose
var moviesSchema = require('../schemas/movies');//加载schemas文件//users为表名

module.exports = mongoose.model('Movie',moviesSchema);//创建模型并且暴露出去
