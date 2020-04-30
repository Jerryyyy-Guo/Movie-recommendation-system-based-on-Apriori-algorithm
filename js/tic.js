$('.btn').on('click',function(){
	var tic = document.getElementByName("tic")
	var tics = new Array();
	for (var i = 0; i < tic.length; i++) {
		if (tic[i].checked == true) {
			tics.push[tic[i].value];
		}
	}
	return tics.join(",");//返回值为存入数据库中的字符串
});