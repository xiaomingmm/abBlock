/*!
 *
 * abBlock-v1.5 (导航定位&吸顶)滚动插件
 * 官网: http://ab.geshai.com/other-plus/abBlock
 *
 * 有疑难问题可选择QQ群① 158544200 或QQ群② 790370978 进行反馈
 *
 * Copyright 2010-2022, Carlo,Cloud
 *
 * 请尊重原创，保留头部版权
 * 在保留版权的前提下，可应用于个人或商业用途
 *
 */
;(function($) {
	$.fn.abBlock = function(__opts, __evt) {
		/* 默认参数 */
		$.fn.abBlock.__defs = {
			"_version": 1.5,
			"scroll": "html,body", /* 父容器元素 */
			"tit": false, /* tit默认导航列表项元素 */
			"titContainer": "", /* 导航容器，(tit)列表项父容器元素 */
			"block": false, /* 内容板块，(tit)列表项对应内容项元素 */
			"stickType": "left", /* 水平方向(默认=left): left=靠左, right=靠右 */
			"positionType": 1, /* 方位: 1=顶部, 2=垂直居中, 3=底部 */
			"offsetY": 0, /* Y坐标偏移 */
			"offsetX": 0, /* X坐标偏移 */
			"early": 0, /* block内容移动时(默认=0)，提前多少像素亮高下一个导航 */
			"appoint": false, /* [false|string|integer]，定点位置。当滚动条滚动到该(元素或指定滚动高)的位置时，显示 titContainer 容器元素 */
			"place": false, /* [false|string|integer]，终点位置(默认=false)。当滚动条滑动到该指定位置时，结束(titContainer)浮动吸顶跟随 */
			"onClass": false, /* 容器吸顶时(titContainer)的class样式名 */
			"offClass": false, /* 容器吸顶前(titContainer)的class样式名 */
			"titOnClass": "on", /* tit列表项当前索引class样式名 */
			"speed": 250, /* 滚动过度动画毫秒(ms) */
			"rollType": 0, /* (滚动条滑动)吸顶时显示类型(结合 appoint 一起使用)。0=无。1=向下滑动不显示，向上滑动显示。2=向下滑动显示，向上滑动不显示。 */
			"callback": null, /* 回调函数 */

			"_init": false,
			"_rd": "ab$1",
			"_style": "#ab_$1_x",
			"_topExp": "ab_$1_fixed",
			"_onClass": "ab_$1_def"
		};
		__opts = $.extend({}, $.fn.abBlock.__defs, __opts);

		/**
		 * 回调函数
		 * @__ind integer 当前tit|resTit之项目编号
		 * @__st  integer 滚动条动态值
		 */
		__opts.callbackFunc = function(__ind, __st) {
			if($.isFunction(this.callback)) {
				this.callback(__ind, __st);
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
		 * Rand string
		 * @returns {string}
		 */
		__opts.randStr = function () {
			var __randData = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
			var __id = 0, __strArr = [];

			for(var __i = 0; __i < 10; __i++) {
				__id = Math.max(Math.ceil(Math.random() * 26), 1);
				__strArr.push(__randData[__id - 1]);
			}

			return __strArr.join("");
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
		 * rollType
		 * @returns {number|number}
		 */
		__opts.getRollType = function () {
			return (/^[12]$/.test(this.rollType) ? parseInt(this.rollType) : 0);
		};

		/**
		 * 元素是否存在
		 * @__o object HTML对象
		 */
		__opts.hasLen = function(__o) {
			return (0 != __o.length);
		};

		/**
		 * 获取参数top位置
		 */
		__opts.valueTop = function (__val) {
			if (false === __val) {
				return 0;
			}

			// 检查是否以设置的数字为点位
			if (/^[1-9]([0-9]+)?$/.test(__val)) {
				return parseFloat(__val);
			}

			// 以元素位置为点位
			var __o = $(__val);
			return (this.hasLen(__o) ? __o.offset().top : 0);
		};

		/**
		 * element attr
		 */
		__opts.elInfo = function (__el) {
			return {
				"oTop": __el.offset().top,
				"oHeight": __el.outerHeight()
			};
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
		__opts.tcView = function (__is) {
			if (__is) {
				if (!__titContainer.hasClass(this._onClass)) {
					__titContainer
						.removeClass(__offClass)
						.addClass(__onClass)
						.addClass(this._onClass);
				}
			} else {
				if (__titContainer.hasClass(this._onClass)) {
					__titContainer
						.addClass(__offClass)
						.removeClass(__onClass)
						.removeClass(this._onClass);
				}
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
			var __sTop = this.scrollTop();
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
				this.setClass();
			}

			// appoint
			if(__sTop >= __appointTop) {
				this.scrollView(true);
			} else {
				this.scrollView(false);
			}

			__indexOld = __index;
			__history_ST = __st;

			// callback
			this.callbackFunc(__index, __history_ST);
		};

		/**
		 * scroll view
		 */
		__opts.scrollView = function (__is) {
			switch (this.getRollType()) {
				/* 向下滑动不显示，向上滑动显示 */
				case 1:
					if (-1 == __wheelDelta && __is) {
						this.tcView(false);
					} else {
						this.tcView(__is);
					}
					break;

				/* 向下滑动显示，向上滑动不显示 */
				case 2:
					if (-1 == __wheelDelta && __is) {
						this.tcView(true);
					} else {
						this.tcView(this.scrollTop() > 0 && __is ? false : __is);
					}
					break;

				default:
					this.tcView(__is);
					break;
			}

			// place
			this.placeView();
		};

		/**
		 * place view
		 */
		__opts.placeView = function () {
			if (__placeTop < 1 || !__titContainerInfo.hasOwnProperty("oTop")) {
				return false;
			}

			var __topVal = 0, __scrollTop = this.scrollTop();
			var __elPos = (__titContainerInfo.oTop + __titContainerInfo.oHeight + __scrollTop);

			// arrived place
			if (__elPos >= __placeTop) {
				if (__isIe6) {
					__topVal = (__titContainerInfo.oTop + __scrollTop) + (__placeTop - __elPos);
				} else {
					__topVal = (__placeTop - __scrollTop - __titContainerInfo.oHeight);
				}

				// css
				__titContainer.attr(this._rd, 1).css("top", this.px(__topVal));
			} else {
				if ("1" == __titContainer.attr(this._rd)) {
					__titContainer.removeAttr("style");
				}
				__titContainer.attr(this._rd, 0);
			}
		};

		/**
		 * 滚动条监听任务
		 */
		__opts.scrollEvent = function () {
			var __that = this,
				__isMousewheel = false,
				__oriEvt = null,
				__currScrollTop = 0,
				__endScrollTop = 0;

			// scroll
			$(window).scroll(function () {
				__currScrollTop = __that.scrollTop();

				if (!__isMousewheel) {
					__wheelDelta = (__currScrollTop >= __endScrollTop ? -1 : 1);
				}

				// exp
				__that.scrollExp();
				__endScrollTop = __currScrollTop;
			});

			// mousewheel
			$(document).on("mousewheel DOMMouseScroll wheel", function (__evt) {
				__isMousewheel = true;
				__oriEvt = __evt.originalEvent;
				__wheelDelta = (__oriEvt.wheelDelta && (__oriEvt.wheelDelta > 0 ? 1 : -1)) || (__oriEvt.detail && (__oriEvt.detail > 0 ? -1 : 1));

				__that.wheelExp(__evt);
			}).mousedown(function () {
				__isMousewheel = false;
			});
		};

		/**
		 * wheel
		 */
		__opts.wheelExp = function (__evt) {
			// clicked?
			if (!this.isClicked()) {
				return true;
			}

			// click(false)
			this.setIsClick(false);
			// stop
			$(this.scroll).stop(true, true);
		};

		/**
		 * Create style
		 */
		__opts.createStyle = function () {
			// style
			var __styleArr = [];
			var __yStyle = [__positionTypeExp.name, ":", __positionTypeExp.value, "px;"].join("");

			// 默认css
			if (this.isIE6()) {
				// 解决ie6抖动
				__titContainer.addClass(this._topExp);

				// style
				__styleArr.push("html{_text-overflow:ellipsis;/*background-image:url(about:blank);background-attachment:fixed;*/}");
				__styleArr.push("." + this._onClass + "{position:absolute;bottom:auto;left:" + __positionTypeExp.left + "px !important;" + __yStyle + "}");
				__styleArr.push("." + this._topExp + "{/*left:0px;*/" + __positionTypeExp.name + ":expression(eval(document.documentElement.scrollTop + " + __positionTypeExp.value + "));");
			} else {
				__styleArr.push("." + this._onClass + "{position:fixed;left:" + __positionTypeExp.left + "px !important;" + __yStyle + "}");
			}

			// init? (这里同步兼容IE6只能remove)
			if (this._init) {
				$(this._style).remove();
			}

			// style
			$("<style type=\"text/css\" id=\"$1\">$2</style>"
				.replace("$1", this._style.substring(1))
				.replace("$2", __styleArr.join(""))).appendTo("head");

			// on class
			if (false === this.onClass) {
				__onClass = this._onClass;
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
					if (this.isIE6()) {
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
		 * resize
		 */
		__opts.resize = function () {
			var __that = this;
			// listen `resize`
			$(window).resize(function () {
				/* position to attr */
				__positionTypeExp = __that.posTypeToExp();

				// createStyle
				__that.createStyle();

				// `titContainer` offset top
				__titContainerInfo = __that.elInfo(__titContainer);
				__titContainerInfo.oTop -= __that.scrollTop();
			});
		};

		/**
		 * defs init
		 */
		__opts.thatInit = function () {
			var __rdStr = this.randStr();
			// vars
			this._rd = this._rd.replace("$1", __rdStr);
			this._style = this._style.replace("$1", __rdStr);
			this._topExp = this._topExp.replace("$1", __rdStr);
			this._onClass = this._onClass.replace("$1", __rdStr);
		};

		/**
		 * Init
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
			// scroll event
			this.scrollEvent();
			// scroll
			this.scrollExp();

			// `titContainer` offset top
			__titContainerInfo = this.elInfo(__titContainer);
			__titContainerInfo.oTop -= this.scrollTop();
			this._init = true;
		};

		/* current object init */
		__opts.thatInit();

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
		var __index = 0, __indexOld = -1, __isClick = false, __isIe6 = __opts.isIE6(), __wheelDelta = 0, __titContainerInfo = {};

		/* 历史滚动参数值 */
		var __history_ST = __opts.scrollTop();

		/* 点位位置 */
		var __appointTop = __opts.valueTop(__opts.appoint);

		/* 终点位置 */
		var __placeTop = __opts.valueTop(__opts.place);

		/* position to attr */
		var __positionTypeExp = __opts.posTypeToExp();

		// init
		__opts.init();

		// resize
		__opts.resize();
	};
})(jQuery);