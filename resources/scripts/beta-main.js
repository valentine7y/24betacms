var Beta24 = {
	urlValidate: function(url) {
		var pattern = /http:\/\/[\w-]*(\.[\w-]*)+/ig;
		return pattern.test(url);
	},
	emailValidate: function(email) {
		var pattern = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/ig;
		return pattern.test(email);
	},
	imageLazyLoad: function() {
		for (i in arguments) {
			if (arguments[i].is('img'))
				arguments[i].lazyload({effect: 'fadeIn', threshold: 200});
		}
	}
};

var BetaPost = {
	increaseVisitNums: function(id, url) {
		if (id <= 0 || url.length == 0) return false;
		var data = 'id=' + id;
		var jqXhr = $.post(url, data, undefined, 'jsonp');
		jqXhr.done(function(data){
			$('.beta-post-detail .beta-visit-nums').text(data);
		});
	},
	create: function(event) {
		$(this).find('.post-clearfix').removeClass('alert-error');
		var title = $.trim($('#post-title').val());
		var site = $.trim($('#post-site').val());
		var email = $.trim($('#post-email').val());

		if (title.length == 0) {
			$(this).find('#post-title').parents('.post-clearfix').addClass('alert-error');
			$(this).find('#post-title').focus();
			event.preventDefault();
		}
		else if (site.length > 0 && !Beta24.urlValidate(site)) {
			$(this).find('#post-site').parents('.post-clearfix').addClass('alert-error');
			$(this).find('#post-site').focus();
			event.preventDefault();
		}
		else if (email.length > 0 && !Beta24.emailValidate(email)) {
			$(this).find('#post-email').parents('.post-clearfix').addClass('alert-error');
			$(this).find('#post-email').focus();
			event.preventDefault();
		}
		else if (event.data.content.isEmpty()) {
			$(this).find('#beta-content').parents('.post-clearfix').addClass('alert-error');
			event.data.content.focus();
			event.preventDefault();
		}
		else if ($(this).find('.beta-captcha:visible').length == 0) {
			var captchaEl = $(this).find('.captcha-clearfix img.beta-captcha-img');
			captchaEl.attr('src', captchaEl.attr('lazy-src')).removeAttr('lazy-src');
			$(this).find('.captcha-clearfix').fadeIn('fast');
			$(this).find('.beta-captcha:visible').focus();
			event.preventDefault();
		}
		else {
			var captcha = $.trim($(this).find('.beta-captcha').val());
			if (captcha.length != 4) {
				$(this).find('.beta-captcha').parents('.post-clearfix').addClass('alert-error');
				$(this).find('.beta-captcha').focus();
				event.preventDefault();
			}
			else
				;
		}
	}
};

var BetaComment = {
	create: function(event){
		event.preventDefault();
		var form = $(this).parents('form');
		var msg = form.next('.beta-alert-message');
		if (msg.length == 0)
			msg = $('#beta-create-message').clone().removeAttr('id');
		var msgtext = msg.find('.text');
		form.after(msg);

		if (form.find('div.error').length > 0) {
			msgtext.html($('.ajax-jsstr .ajax-rules-invalid').text());
			msg.removeClass('alert-success').addClass('alert-error').show();
			return false;
		}
		else {
			var contentEl = form.find('.comment-content');
			var content = $.trim(contentEl.val());
			var minlen = parseInt(contentEl.attr('minlen'));
			minlen = (isNaN(minlen) || minlen == 0) ? 5 : minlen;
			if (content.length < minlen) {
				msgtext.html($('.ajax-jsstr .ajax-rules-invalid').text());
				msg.removeClass('alert-success').addClass('alert-error').show();
				contentEl.focus();
				return false;
			}
			var captchaEl = form.find('.beta-captcha');
			var captcha = $.trim(captchaEl.val());
			if (captcha.length != 4) {
				msgtext.html($('.ajax-jsstr .ajax-rules-invalid').text());
				msg.removeClass('alert-success').addClass('alert-error').show();
				captchaEl.focus();
				return false;
			}
		}

		var jqXhr = $.ajax({
			type: 'post',
			url: form.attr('action'),
			data: form.serialize(),
			dataType: 'jsonp',
			cache: false,
			beforeSend: function(jqXhr){
				msgtext.html($('.ajax-jsstr .ajax-send').text());
				msg.removeClass('alert-error').addClass('alert-success').show();
			}
		});
		jqXhr.done(function(data){
			msgtext.html(data.text);
			form.find('.refresh-captcha').trigger('click');
			if (data.errno == 0) {
				form.find('.beta-captcha').val('');
				form.find('textarea').val('');
				form.find('.comment-clearfix').removeClass('alert-error').removeClass('alert-success');
				msg.removeClass('alert-error').addClass('alert-success').show();
				var lastComment = $('.beta-post-show .beta-comment-item:last');
				if (lastComment.length == 0)
					lastComment = $('#beta-comment-list');
				lastComment.after(data.html);
				if (form.attr('id') == undefined)
					form.remove();
			}
			else
				msg.removeClass('alert-success').addClass('alert-error').show();
		});
		jqXhr.fail(function(event, jqXHR, ajaxSettings, thrownError){
			jqXhr.abort();
			msgtext.html($('.ajax-jsstr .ajax-fail').text());
			msg.removeClass('alert-success').addClass('alert-error').show();
		});
		return false;
	},
	reply: function() {
		var form = $(this).parents('.beta-comment-item').next('form');
		if (form.length == 0) {
			form = $('#comment-form').clone().removeAttr('id').addClass('comment-reply-form').attr('action', $(this).attr('data-url'));;
			form.find('.comment-captcha').hide();
			$(this).parents('.beta-comment-item').after(form);
			form.find('.clearfix').removeClass('alert-error').removeClass('alert-success');
		}
		else if (form.filter(':visible').length == 0) {
			form.show();
			form.find('.comment-content').focus();
		}
		else
			form.hide();

	},
	rating: function(event) {
		event.preventDefault();
		var commentItem = $(this).parents('.beta-comment-item');
		var msg = commentItem.next('.beta-alert-message');
		if (msg.length == 0)
			msg = $('#beta-comment-message').clone().removeAttr('id');
		var msgtext = msg.find('.text');

		if ($(this).attr('data-clicked')) {
			msgtext.html($('.ajax-jsstr .ajax-has-joined').text());
			if (msg.hasClass('alert-success')) msg.removeClass('alert-success');
			if (!msg.hasClass('alert-error')) msg.addClass('alert-error');
			commentItem.after(msg);
			msg.show();
			return false;
		}

		var tthis = this;
		var url = $(this).attr('data-url');
		var jqXhr = $.ajax({
			url: url,
			dataType: 'jsonp',
			type: 'post',
			cache: false,
			beforeSend: function(jqXhr) {
				msgtext.html($('.ajax-jsstr .ajax-send').text());
				msg.removeClass('alert-error').addClass('alert-success');
				commentItem.after(msg);
				msg.show();
			}
		});
		jqXhr.done(function(data){
			if (data.errno == 0) {
				var jqnums = $(tthis).find('.beta-comment-join-nums');
				jqnums.text(parseInt(jqnums.text()) + 1);
				$(tthis).attr('data-clicked', 1);
				msgtext.html(data.text);
				if (msg.hasClass('alert-error')) msg.removeClass('alert-error');
				if (!msg.hasClass('alert-success')) msg.addClass('alert-success');
			}
			else {
				if (msg.hasClass('alert-success')) msg.removeClass('alert-success');
				if (!msg.hasClass('alert-error')) msg.addClass('alert-error');
			}
			commentItem.after(msg);
			msg.show();
		});
		jqXhr.fail(function(event, jqXHR, ajaxSettings, thrownError){
			msgtext.html($('.ajax-jsstr .ajax-fail').text());
			if (msg.hasClass('alert-success')) msg.removeClass('alert-success');
			if (!msg.hasClass('alert-error')) msg.addClass('alert-error');
			commentItem.after(msg);
			msg.show();
		});
	},
	usernameValidate: function(event) {
		var name = $.trim($(this).val());
		var help = $(this).parents('.comment-input').find('.help-inline');
		var helperror = $(this).parents('.comment-input').find('.help-error');
		var clearfix = $(this).parents('.comment-clearfix');
		if (name.length == 0) {
			helperror.hide();
			clearfix.removeClass('alert-error').removeClass('alert-success');
			return true;
		}

		help.hide();
		if (name.length > 50) {
			helperror.show();
			$(this).parents('.comment-clearfix').removeClass('alert-success').addClass('alert-error');
			return false;
		}
		else {
			clearfix.removeClass('alert-error').addClass('alert-success');
			return true;
		}

	},
	siteValidate: function(event) {
		var url = $.trim($(this).val());
		var help = $(this).parents('.comment-input').find('.help-inline');
		var helperror = $(this).parents('.comment-input').find('.help-error');
		var clearfix = $(this).parents('.comment-clearfix');

		if (url.length == 0) {
			helperror.hide();
			clearfix.removeClass('alert-error').removeClass('alert-success');
			return true;
		}

		help.hide();
		if (Beta24.urlValidate(url)) {
			clearfix.removeClass('alert-error').addClass('alert-success');
			return true;
		}
		else {
			helperror.show();
			clearfix.removeClass('alert-success').addClass('alert-error');
			return false;
		}
	},
	emailValidate: function(event){
		var email = $.trim($(this).val());
		var help = $(this).parents('.comment-input').find('.help-inline');
		var helperror = $(this).parents('.comment-input').find('.help-error');
		var clearfix = $(this).parents('.comment-clearfix');
		if (email.length == 0) {
			helperror.hide();
			clearfix.removeClass('alert-error').removeClass('alert-success');
			return true;
		}

		help.hide();
		if (Beta24.emailValidate(email)) {
			clearfix.removeClass('alert-error').addClass('alert-success');
			return true;
		}
		else {
			helperror.show();
			clearfix.removeClass('alert-success').addClass('alert-error');
			return false;
		}
	},
	captchaValidate: function(event){
		var captcha = $.trim($(this).val());
		var help = $(this).parents('.comment-input').find('.help-inline');
		var helperror = $(this).parents('.comment-input').find('.help-error');
		var clearfix = $(this).parents('.comment-clearfix');

		help.hide();
		if (captcha.length == 4) {
			clearfix.removeClass('alert-error').addClass('alert-success');
			return true;
		}
		else {
			helperror.show();
			clearfix.removeClass('alert-success').addClass('alert-error');
			return false;
		}
	},
	contentValidate: function(event) {
		var content = $.trim($(this).val());
		var minlen = parseInt($(this).attr('minlen'));
		var clearfix = $(this).parents('.comment-clearfix');
		minlen = (isNaN(minlen) || minlen == 0) ? 5 : minlen;
		if (content.length > minlen) {
			clearfix.removeClass('alert-error').addClass('alert-success');
			return true;
		}
		else {
			clearfix.removeClass('alert-success').addClass('alert-error');
			return false;
		}
	},
	showCaptcha: function(event) {
		var captchaRow = $(this).parents('form').find('.comment-captcha:hidden');
		if (captchaRow.length == 0) return false;

		var captchaEl = $(this).parents('form').find('img.beta-captcha-img');
		captchaEl.attr('src', captchaEl.attr('lazy-src'));
		captchaEl.trigger('click');
		captchaRow.fadeIn('fast');
		$(this).focus();
	},
	refreshCaptcha: function(event) {
		event.preventDefault();
		var url = $(this).parents('.comment-input').find('.refresh-captcha').attr('href');
		var jqXhr = $.ajax({
			url: url,
			dataType: 'json',
			cache: false
		});
		jqXhr.done(function(data){
			$('.beta-captcha-img').attr('src', data['url']);
			$('body').data('captcha.hash', [data['hash1'], data['hash2']]);
		});
		return false;
	}
};


