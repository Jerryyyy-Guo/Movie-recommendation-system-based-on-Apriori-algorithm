var mongoose = require('mongoose');//加载mongoose
var categoriesSchema = require('../schemas/categories');//加载schemas文件//categories为表名

module.exports = mongoose.model('Category',categoriesSchema);//创建模型并且暴露出去
