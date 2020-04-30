
$(document).ready(function() {
	$(".signup-btn").click(function(event){
		event.preventDefault();
	});

	$(function(){//缩略图设置
		$('.thumbnail img').jqthumb({
			width: 320,
			height: 180,
			after: function(imgObj){
				imgObj.css('opacity', 0).animate({opacity: 1}, 2000);
			}
		});
	});


	$(".brief").each(function() {//字数省略
		var maxwidth =50;//显示多少字符
		if ($(this).text().length > maxwidth) {
			$(this).text($(this).text().substring(0, maxwidth));
			$(this).html($(this).html() + '...');
		}
	});


	//登录注册页面切换
	//切换登录界面
	$('.goin').on('click', function() {
		$('.dl').show();
		$('.zc').hide();
	});
	//切换注册界面
	$('.goup').on('click', function() {
		$('.zc').show();
		$('.dl').hide();
	});

	//brief文字数量限制
	setTimeout(function()
	{
		var max = 120;
		var tot, str;
		$('#brief').each(function() {
			str = String($(this).html());
			tot = str.length;
			str = (tot <= max)
			? str
			: str.substring(0,(max + 1))+"...";
			$(this).html(str);
		});
	},500);


	//注册
	$('.signup-btn').on('click', function() {
		//通过ajax提交注册请求
		$.ajax({
			type: 'post',
			url: '/api/user/register',
			data: {
				username: $('.zc-username').val(),
				password: $('.zc-password').val()
			},
			dataType: 'json',
			success: function(result){
				$('.colWarning').html(result.message);
				console.log('成功');
				if (!result.code) {//注册成功
					setTimeout(function(){
						$('.dl').show();
						$('.zc').hide();
					},1000)
				}
			},
			error: function(){
				console.log('提交失败');
			}
		})
	});
	//登录
	$('.signin-btn').on('click', function() {
		//通过ajax提交注册请求
		$.ajax({
			type: 'post',
			url: '/api/user/login',
			dataType: 'json',
			data: {
				username: $('.dl-username').val(),
				password: $('.dl-password').val()
			},
			success: function(result) {
				$('.colWarning').html(result.message);
				if (!result.code) {//登录成功
					// setTimeout(function(){
					// 	$('.dl').hide();
					// 	$('.success').show();

					// 	$('.success-user').html(result.userInfo.username);//显示用户信息
					// 	$('.success-content').html("你好，欢迎登陆!");
					// },1000);
					window.location.reload(); //cookies后不需要隐藏，直接刷新页面
					setTimeout(function(){
					},1000)
				}
			}
		})
	})
	//退出
	$('.exit').on('click', function() {
		$.ajax({
			url: '/api/user/logout',
			success:function (result) {
				if (!result.code) {
					window.location.reload();
				}
			}
		})
		
	});

	
});

