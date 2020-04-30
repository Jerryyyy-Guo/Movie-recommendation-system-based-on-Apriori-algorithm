var mongoose = require('mongoose');//加载mongoose
var tempsSchema = require('../schemas/temp');//加载schemas文件//users为表名

module.exports = mongoose.model('Temp',tempsSchema);//创建模型并且暴露出去
