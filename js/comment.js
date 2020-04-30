
var prepage = 2;
var page = 1;
var pages = 0;
var comments = [];



$('#messageBtn').on('click',function(){
	$.ajax({
		type: 'post',
		url: '/api/comment/post',
		data: {
			movieid: $('#movieId').val(),
			content: $('#messageContent').val(),
		},
		success: function(responseDate){
			// console.log(responseDate);
			$('#messageContent').val('');
			comments = responseDate.data.comments.reverse();
			renderComment();

		},
	})
})

$.ajax({
	type: 'get',
	url: '/api/comment',
	data: {
		movieid: $('#movieId').val(),
	},
	success: function(responseDate){
		// console.log(responseDate);
		comments = responseDate.data.reverse();
		renderComment();

	},
})



function formatDate(d) {
	var date1 = new Date(d);
	return date1.getFullYear() + '年' + (date1.getMonth()+1) + '月' + date1.getDate() + '日' + date1.getHours() + ':' +date1.getMinutes() + ':' + date1.getSeconds();
}


$('.page').delegate('a', 'click', function() {
	if($(this).parent().hasClass('previous')){
		page--;
	} else {
		page++;
	}
	renderComment ();
});




//渲染数组
function renderComment (){



	$('#messageCount').html(comments.length);
	var pages = Math.max(Math.ceil(comments.length / prepage),1);
	var start = Math.max(0,(page-1) * prepage);
	var end = Math.min(start + prepage,comments.length);

	var $lis = $('.pager li');
	$lis.eq(1).html(page + '/' + pages);

	if (page <= 1){
		page = 1;
		// $lis.eq(0).addClass("disabled");
		$lis.eq(0).html('<a href=""><span aria-hidden="true">&larr;</span> 没有上一页了</a>');
	} else {
		$lis.eq(0).html('<a href="javascript:;"><span aria-hidden="true">&larr;</span> 上一页</a>');
	};
	if (page >= pages) {
		page = pages;
		// $lis.eq(2).addClass("disabled");
		$lis.eq(2).html('<a href="">没有下一页了 <span aria-hidden="true">&rarr;</span></a>');
	} else {
		$lis.eq(2).html('<a href="javascript:;">下一页 <span aria-hidden="true">&rarr;</span></a>');
	}

	if (comments.length == 0 ) {
		$('.messageList').html('<div class="messageList con-container" ><li><div class="title">还没有留言</div></li></div>');
	} else {
		var html = '';
		for (var i = start ;i < end; i++) {
			html += '<div class="messageList con-container"><span>'+ comments[i].username + '</span><span>' + formatDate(comments[i].postTime) + '</span><p>' + comments[i].content + '</p></div>'
		};
		$('.messageList').html(html);
	}



};