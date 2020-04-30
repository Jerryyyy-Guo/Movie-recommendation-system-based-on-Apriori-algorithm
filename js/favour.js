// var dots = document.getElementsByClassName("favour");
// for (var i = 0; i < dots.length; i++) {
// 	(function (i) {
// 		dots[i].onclick = function () {
// 			console.log(i + 1)
// 		}
// 	})(i)
// }

$('.favour').on('click', function () {
	$.ajax({
		type: 'post',
		url: '/api/favour/post',
		data: {
			movietic: $('#movieTic').val(),
			movieid: $('#movieId').val(),
			movietitle: $('#movieTitle').val(),
		},
		success: function (responseData) {
			console.log(responseData);
			renderFavour(responseData.data.favour.reverse()); //数组翻转
		},
		error: function (responseData) {
			console.log(responseData);
		}
	})
});



const min_sup = 2;
var movieData = [];
var movieArr = [];
var dataArr = [];
var msg;
//页面重载获取用户所有收藏
$.ajax({
	type: 'get',
	url: '/api/favour',
	data: {},
	success: function (responseData) {
		console.log(responseData);
		renderFavour(responseData.data.reverse()); //数组翻转

		movieData = responseData.data;
		/**************************推荐题材*****************************/
		console.log(movieData); //包含标题标签内容的数组
		for (var i = 0; i < movieData.length; i++) {
			movieArr.push(movieData[i].movietic);
		}
		// console.log(movieArr);//标签数组["动作,爱情,恐怖","动作,科幻"]
		// console.log(typeof(movieArr));
		var groupArr = group(movieArr, 1);
		// console.log("分组后groupArr：");
		// console.log(groupArr);//[["动作,爱情,恐怖"],["动作,科幻"]]
		for (var i = 0; i < groupArr.length; i++) {
			var dataJson = groupArr[i].toString().substr(0);
			// console.log(dataJson);
			dataJson = dataJson.split(',');
			// console.log(dataJson);
			// console.log(typeof(dataJson));
			dataArr.push(dataJson);
		}
		// console.log(dataArr.length);
		// console.log(dataArr);//[["动作", "爱情", "恐怖"],["动作", "科幻"]]
		// console.log(typeof(dataArr));
		if (dataArr.length < 5) {
			$('#tj').html('<p>' + "请至少收藏5部电影！" + '</p>');
			$('#like').html('<p>' + "请至少收藏5部电影！" + '</p>');
		} else {
			let Ck1 = freq1Gen(dataArr);
			// console.log("dataArr freq1Gen后的Ck1" + Ck1);
			// console.log(Ck1);
			while (Ck1.length !== 0) {

				Ck = Ck1;
				// console.log(Ck1);
				// console.log(Ck);
				Ck1 = freqKGen(Ck);
			}
			console.log("推荐题材结果");
			console.log(Ck); //输出推荐结果[["爱情", "动作"],["动作", "科幻"]]

			// console.log(typeof(Ck));
			var html = '';
			for (var i = 0; i < Ck.length; i++) {
				html += '<p>' + "<" + Ck[i] + ">" + '</p>';
			};
			$('#tj').html(html);
			// var msg = JSON.stringify(Ck);

			// var a = Object.assign(Ck);
			// var a = [];
			// for( var i =0 ;i<Ck.length;i++){
			// 	var b = Ck[i].toString();
			// 	a.push(b);
			// }
			// console.log(a);//["爱情,动作", "动作,科幻"]
			// console.log(typeof(a));//Object


			// var arrays = new Array();
			// var b = {};
			// for( var i =0 ;i<a.length;i++){
			// 	b['tic'] = a[i];
			// 	arrays.push(b);
			// }
			// var json_arrays = JSON.stringify(arrays);
			// console.log(json_arrays);//[{"tic":"动作,科幻"},{"tic":"动作,科幻"}]


			// var where = json_arrays;
			// console.log(where);

			/**************************推荐电影*****************************/
			$.ajax({
				type: 'get',
				url: '/api/all',
				data: {
					tic: Ck
				},
				success: function (all) {
					console.log(all);
					console.log(all[1].title);

					var html = '';
					for (var i = 0; i < all.length; i++) {
						html += '<a href=' + '/view?movieid=' + all[i]._id + '>' + '<p>' + "《" + all[i].title + "》" + '</p>' + '</a>';
					};
					$('#like').html(html);
				}
			})
		}
	},
})






//渲染数组
function renderFavour(favour) {
	var html = '';
	for (var i = 0; i < favour.length; i++) {
		html += '<p>' + favour[i].movietitle + '</p>'
	};
	$('#favourlist').html(html);
	// console.log(favour[i].movieid);
};

function group(array, subGroupLength) { //将arr分为多个数组得到groupArray
	let index = 0;
	let newArray = [];
	while (index < array.length) {
		newArray.push(array.slice(index, index += subGroupLength));
	}
	return newArray;
}

/*var dataArr = [];
let row = arr.join(" ");//用空格让数组之间连接
dataArr.push(row);
console.log(dataArr);//["动作,爱情 战争,动作,科幻 动作,战争 动作,科幻"]
console.log(typeof(dataArr));//object
console.log(row);//string
console.log(typeof(row));//string*/
//1.计算候选集C1
function freq1Gen(data) {
	var buffer = [];
	var isShow = false;
	for (var i = data.length - 1; i >= 0; i--) {
		for (var j = data[i].length - 1; j >= 0; j--) {
			isShow = false;
			for (var k = buffer.length - 1; k >= 0; k--) {
				if (buffer[k].name == data[i][j]) {
					buffer[k].count++;
					isShow = true;
					break;
				}
			}
			if (isShow == false) {
				buffer.push({
					name: data[i][j],
					count: 1
				})
			}
		}
	}
	var ret = [];
	for (var i = buffer.length - 1; i >= 0; i--) {
		if (buffer[i].count >= min_sup) {
			ret.push([buffer[i].name]);
		}
	}
	return ret;
}

//2.计算候选集C(k+1)
function freqKGen(data) {
	var candi = [];
	for (var i = 0; i < data.length; i++) {
		for (var j = i + 1; j < data.length; j++) {
			candi.push(data[i].concat(data[j]).unique());
		}
	}
	candi = unique(candi);
	var buffer = [];
	for (var i = candi.length - 1; i >= 0; i--) {
		buffer.push({
			arr: candi[i],
			count: 0
		});
	}
	//计算支持数
	for (var i = buffer.length - 1; i >= 0; i--) {
		for (var j = dataArr.length - 1; j >= 0; j--) {
			if (isContain(dataArr[j], buffer[i].arr)) {
				buffer[i].count++;
			}
		}
	}
	//剪枝
	var ret = [];
	for (var i = buffer.length - 1; i >= 0; i--) {
		if (buffer[i].count >= min_sup) {
			ret.push(buffer[i].arr);
		}
	}
	return ret;
}



//判断arr1是否包含arr2
function isContain(arr1, arr2) {
	for (var i = arr2.length - 1; i >= 0; i--) {
		if (!arr1.includes(arr2[i])) {
			return false;
		}
	}
	return true;
}


function unique(arr) {
	var toDel = []
	for (var i = 0; i < arr.length; i++) {
		for (var j = i + 1; j < arr.length; j++) {
			if (arr[i].length == arr[j].length) {
				var flag = true;
				for (var k = 0; k < arr[j].length; k++) {
					if (!arr[i].includes(arr[j][k])) {
						flag = false;
						break;
					}
				}
				if (flag) {
					toDel.push(i);
					break;
				}
			}

		}
	}
	for (var i = toDel.length - 1; i >= 0; i--) {
		arr.splice(toDel[i], 1);
	}
	return arr;
}

//数组去重
Array.prototype.unique = function () {
	var n = {},
		r = []; //n为hash表，r为临时数组
	for (var i = 0; i < this.length; i++) //遍历当前数组
	{
		if (!n[this[i]]) //如果hash表中没有当前项
		{
			n[this[i]] = true; //存入hash表
			r.push(this[i]); //把当前数组的当前项push到临时数组里面
		}
	}
	return r;
}