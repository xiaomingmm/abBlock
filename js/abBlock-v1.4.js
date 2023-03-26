/*!
 *
 * abBlock-v1.4 (导航定位&吸顶)滚动插件
 * 官网: http://ab.geshai.com/other-plus/abBlock
 *
 * 有疑难问题可选择QQ群① 158544200 或QQ群② 790370978 进行反馈
 *
 * Copyright Carlo,Cloud
 *
 * 请尊重原创，保留头部版权
 * 在保留版权的前提下，可应用于个人或商业用途
 *
 */
;(function($) {
	$.fn.abBlock = function(__opts, __evt){
		/* 默认参数 */
		$.fn.abBlock.__defs = {
			"_version": 1.4,
			"scroll": "html,body", /* 父容器元素 */
			"tit": false, /* tit默认导航列表项元素 */
			"titContainer": "", /* 导航容器，(tit)列表项父容器元素 */
			"block": false, /* 内容板块，(tit)列表项对应内容项元素 */
			"stickType": "left", /* 水平方向(默认=left): left=靠左, right=靠右 */
			"positionType": 1, /* 方位: 1=顶部, 2=垂直居中, 3=底部 */
			"offsetY": 0, /* Y坐标偏移 */
			"offsetX": 0, /* X坐标偏移 */
			"early": 0, /* block内容移动时(默认=0)，提前多少像素亮高下一个导航 */
			"appoint": false, /* [false|string|integer]，定点位置。当滚动条滚动到该(元素或指定滚动高)的位置时，显示 resContainer 容器元素 */
			"onClass": false, /* 容器吸顶时(titContainer)的class样式名 */
			"offClass": false, /* 容器吸顶前(titContainer)的class样式名 */
			"titOnClass": "on", /* tit列表项当前索引class样式名 */
			"speed": 250, /* 滚动过度动画毫秒(ms) */
			"callback": null, /* 回调函数 */

			"_style": "#ab0bd0437x",
			"_topExp": "ab_abac96_fixed",
			"_onClass": "ab_abac96_def"
		};
		__opts = $.extend({}, $.fn.abBlock.__defs, __opts);

		/**
		 * 回调函数
		 * @__ind integer 当前tit|resTit之项目编号
		 * @__st  integer 滚动条动态值
		 */
		__opts.callbackFunc = function(__ind, __st) {
			if(typeof(__opts.callback) == "function") {
				__opts.callback(__ind, __st);
			}
		};

		/**
		 * 是否为ie6
		 */
		__opts.isIE6 = function() {
			return ($.browser.msie && (parseInt($.browser.version) < 7));
		};

		/**
		 * 获取滚动条动态
		 */
		__opts.scrollTop = function() {
			return parseFloat($(window).scrollTop());
		};

		/**
		 * tit 是否关闭
		 */
		__opts.titIsOff = function () {
			return (false === this.tit);
		};

		/**
		 * px
		 * @param __v
		 * @returns {string}
		 */
		__opts.px = function (__v) {
			return (__v.toString() + "px");
		};

		/**
		 * window and document
		 */
		__opts.winDocWh = function () {
			return {
				"winW": $(window).width(),
				"winH": $(window).height()
			};
		};

		/**
		 * appoint 定点位置
		 */
		__opts.appointTop = function () {
			if (false === this.appoint) {
				return 0;
			}

			// 检查是否以设置的数字为点位
			if (/^[1-9]([0-9]+)?$/.test(this.appoint)) {
				return parseFloat(this.appoint);
			}

			// 以元素位置为点位
			var __o = $(this.appoint, __cntr);
			return (this.hasLen(__o) ? __o.offset().top : 0);
		};

		/**
		 * 元素是否存在
		 * @__o object HTML对象
		 */
		__opts.hasLen = function(__o) {
			return (0 != __o.length);
		};

		/**
		 * 返回指定的板块的参数值
		 * @__i integer 指定的编号
		 */
		__opts.blockSet = function(__i) {
			var __o = __block.eq(__i);
			return {
				"index": __i,
				"top": __o.offset().top - __early,
				"left": __o.offset().left,
				"oWidth": __o.outerWidth(true),
				"oHeight": __o.outerHeight(true)
			};
		};

		/**
		 * 启动滚动条
		 * @__i number index
		 */
		__opts.animate = function(__i) {
			var __v = this.blockSet(__i);

			// scroll animate
			$(this.scroll)
				.stop(true, true)
				.animate({scrollTop: this.px(__v.top)}, this.speed, function () {
					__opts.setIsClick(false);
				});
		};

		/**
		 * titContainer 过度效果
		 */
		__opts.titContainerProcess = function (__is) {
			if (__is) {
				__titContainer.removeClass(__offClass);

				__titContainer.addClass(__onClass);
				__titContainer.addClass(this._onClass);
			} else {
				__titContainer.addClass(__offClass);

				__titContainer.removeClass(__onClass);
				__titContainer.removeClass(this._onClass);
			}
		};

		/**
		 * 设置tit列表当前索引的onClass
		 */
		__opts.setClass = function() {
			if(!this.titIsOff() && this.hasLen(__tit)) {
				if(__indexOld == -1) {
					__tit.removeClass(__titOnClass);
				} else {
					__tit.eq(__indexOld).removeClass(__titOnClass);
				}

				// titOnClass
				__tit.eq(__index).addClass(__titOnClass);
			}
		};

		/**
		 * scroll
		 */
		__opts.scrollExp = function () {
			var __sTop = $(window).scrollTop();
			var __st = (__sTop + 1) + __early;

			// first ?
			if (1 >= __block.length || __block.eq(1).offset().top > __st) {
				__index = 0;
			} else {
				// each
				__block.each(function (__ind, __el) {
					var __nextInd = __ind + 1;

					// find index
					if (__nextInd < __block.length) {
						if ($(__el).offset().top <= __st && __block.eq(__nextInd).offset().top > __st) {
							__index = __ind;
							return true;
						}
					} else {
						// last
						if ($(__el).offset().top <= __st  || (__st + $(window).height() + 1) >= $(document).height()) {
							__index = __ind;
							return true;
						}
					}
				});
			}

			// set
			if(__index != __indexOld) {
				__opts.setClass();
			}

			// appoint
			if(__sTop >= __appointTop) {
				__opts.titContainerProcess(true);
			} else {
				__opts.titContainerProcess(false);
			}

			__indexOld = __index;
			__history_ST = __st;

			// callback
			__opts.callbackFunc(__index, __history_ST);
		};

		/**
		 * 滚动条监听任务
		 */
		__opts.scrollEvent = function () {
			$(window).scroll(function () {
				__opts.scrollExp();
			});
		};

		/**
		 * wheel
		 */
		__opts.wheelExp = function (__evt) {
			// clicked?
			if (!__opts.isClicked()) {
				return true;
			}

			// click(false)
			__opts.setIsClick(false);
			// stop
			$(__opts.scroll).stop(true, true);
		};

		/**
		 * 鼠标滑动监听任务
		 */
		__opts.wheelEvent = function () {
			var __event = (/Firefox/i.test(navigator.userAgent) ? "DOMMouseScroll": "mousewheel");
			var __dom = __cntr[0];

			// event
			if (__dom.attachEvent) {
				__dom.attachEvent("on" + __event, this.wheelExp);
			} else if (__dom.addEventListener) {
				__dom.addEventListener(__event, this.wheelExp, false);
			}
		};

		/**
		 * Create style
		 */
		__opts.createStyle = function () {
			if (0 != $(__opts._style).length) {
				return false;
			}

			// style
			var __styleArr = [];
			var __yStyle = [__positionTypeExp.name, ":", __positionTypeExp.value, "px;"].join("");

			// 默认css
			if (this.isIE6()) {
				__styleArr.push("html{_text-overflow:ellipsis;/*background-image:url(about:blank);background-attachment:fixed;*/}");
				__styleArr.push("." + __opts._onClass + "{position:absolute;bottom:auto;left:" + __positionTypeExp.left + "px !important;" + __yStyle + "}");
				__styleArr.push("." + __opts._topExp + "{left:200px;" + __positionTypeExp.name + ":expression(eval(document.documentElement.scrollTop + " + __positionTypeExp.value + "));");
			} else {
				__styleArr.push("." + __opts._onClass + "{position:fixed;left:" + __positionTypeExp.left + "px !important;" + __yStyle + "}");
			}

			// style
			$("body").append("<style type=\"text/css\" id=\"" + __opts._style.substring(1) + "\">" + __styleArr.join("") + "</style>");

			// 解决ie6抖动
			if (this.isIE6()){
				__titContainer.addClass(__opts._topExp);
			}

			// on class
			if (false === __opts.onClass) {
				__onClass = __opts._onClass;
			}
		};

		/**
		 * container offset
		 */
		__opts.getOffsetExp = function () {
			var __left = __cntr.offset().left;
			var __right = __left + __cntr.outerWidth();

			return {
				"left": Math.max(0, __left) + __positionOffsetX,
				"right": Math.max(0, __right - this.titContainerWidth()) - __positionOffsetX
			}
		};

		/**
		 * titContainer width
		 */
		__opts.titContainerWidth = function () {
			return parseFloat(__titContainer.outerWidth(true)) || 0;
		};

		/**
		 * titContainer height
		 */
		__opts.titContainerHeight = function () {
			return parseFloat(__titContainer.outerHeight(true)) || 0;
		};

		/**
		 * Is it on the right?
		 */
		__opts.isStickRight = function () {
			return ("right" === __stickType);
		};

		/**
		 * Is it clicked?
		 */
		__opts.isClicked = function () {
			return __isClick;
		};

		/**
		 * click mark
		 */
		__opts.setIsClick = function (__v) {
			__isClick = __v;
		};

		/**
		 * position name
		 */
		__opts.posTypeToExp = function () {
			var __v = {
				"name": "top",
				"value": 0,
				// stick x
				"left": 0
			};

			// left | right
			var __offset = this.getOffsetExp();

			// switch
			switch (__positionType) {
				/* center: 2 */
				case 2:
					__v.value = Math.max(0, this.winDocWh().winH - this.titContainerHeight()) / 2;
					__v.value += __positionOffsetY;
					break;
				/* bottom: 3 */
				case 3:
					if (__opts.isIE6()) {
						__v.value = Math.max(0, this.winDocWh().winH - this.titContainerHeight()) - __positionOffsetY;
					} else {
						__v.name = "bottom";
						__v.value += __positionOffsetY;
					}
					break;
				/* top: 1 */
				default:
					__v.value += __positionOffsetY;
					break;
			}

			// X(left|right)
			if (!this.isStickRight()) {
				__v.left = __offset.left;
			} else {
				__v.left = __offset.right;
			}

			return __v;
		};

		/**
		 * 初始化启动
		 */
		__opts.init = function() {
			// tit
			if(!this.titIsOff() && this.hasLen(__tit)) {
				// click
				__tit.click(function(__e) {
					__opts.setIsClick(true);
					__opts.animate(__tit.index(this));
				});
			}

			// createStyle
			this.createStyle();
			// wheel event
			this.wheelEvent();
			// scroll event
			this.scrollEvent();
			// scroll
			this.scrollExp();
		};

		/* vars */
		var __cntr = $(this);
		var __tit = $(__opts.tit, __cntr),
			__titContainer = $(__opts.titContainer, __cntr),
			__block = $(__opts.block, __cntr);

		/* titContainer on class */
		var __onClass = __opts.onClass;
		/* titContainer off class */
		var __offClass = __opts.offClass;

		/* tit on class */
		var __titOnClass = __opts.titOnClass;

		/* position type */
		var __positionType = __opts.positionType;
		/* stick type */
		var __stickType = __opts.stickType;
		/* offsetY */
		var __positionOffsetY = parseFloat(__opts.offsetY);
		/* positionOffsetX */
		var __positionOffsetX = parseFloat(__opts.offsetX);
		/* early */
		var __early = parseFloat(__opts.early);

		/* 当前索引,历史索引 */
		var __index = 0, __indexOld = -1, __isClick = false;

		/* 历史滚动参数值 */
		var __history_ST = __opts.scrollTop();

		/* 点位位置 */
		var __appointTop = __opts.appointTop();

		/* position to attr */
		var __positionTypeExp = __opts.posTypeToExp();

		// init
		__opts.init();
	};
})(jQuery);