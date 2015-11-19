/**
 *####ui组件基类####
 *
 *提供一个插件化的jQuery ui组件写法,参数放在组件的options中,并可以merge元素中data-*的参数,实例运行时会直接执行init函数.
 *
 *
 ***举例**
 *
 *  ;(function($, undefined) {
*		$.ui.define('myui', {
*			 options: {
*				say:'hi'//组件参数,用this.options.test调用
*			},
*			init:function(){
*				//初始化函数,实例中会直接执行init
*			}
*		});
*	})(jQuery);
 *
 ***使用此组件**
 *
 *html部分
 *
 *  <div id="test" data-tag="istest"></div>
 *js部分
 *
 *  $('#test').myui({
*		say:'test'
*	})
 *
 * **update**
 * 2013-10-14 17:59:45 by liuwei1
 */

if (typeof($.ui) == 'undefined') {
	$.ui = {};
}

;
(function ($, undefined) {
	function isPlainObject(obj) {
		return Object.prototype.toString.call(obj) === '[object Object]';
	}

	//从某个元素上读取某个属性
	function parseData(data) {
		try { // JSON.parse可能报错
			// 当data===null表示，没有此属性
			data = data === 'true' ? true :
				data === 'false' ? false : data === 'null' ? null :

					// 如果是数字类型，则将字符串类型转成数字类型
					+data + '' === data ? +data :
						/(?:\{[\s\S]*\}|\[[\s\S]*\])$/.test(data) ?
							JSON.parse(data) : data;
		} catch (ex) {
			data = undefined;
		}

		return data;
	}

	//从DOM节点上获取配置项
	function getDomOptions(el) {
		var ret = {},
			attrs = el && el.attributes,
			len = attrs && attrs.length,
			key,
			data;

		while (len--) {
			data = attrs[len];
			key = data.name;

			if (key.substring(0, 5) !== 'data-') {
				continue;
			}

			key = key.substring(5);
			data = parseData(data.value);

			data === undefined || (ret[key] = data);
		}

		return ret;
	}

	//合并对象
	function mergeObj() {
		var args = [].slice.call(arguments),
			i = args.length,
			last;

		while (i--) {
			last = last || args[i];
			isPlainObject(args[i]) || args.splice(i, 1);
		}

		return args.length ?
			$.extend.apply(null, [true, {}].concat(args)) : last;
		// 深拷贝，options中某项为object时，用例中不能用==判断
	}

	/*
	 var event = {
	 //绑定事件
	 on:function (name, fun) {
	 var me = this;
	 this.events = this.events || (this.events = []);
	 this.events[name] = this.events[name] || [];
	 var funType = typeof(fun);

	 if (typeof(fun) === 'undefined'){
	 var fun = function(){
	 if (me[name]){
	 me[name]();
	 }
	 }
	 }

	 if (typeof(fun) === 'function'){
	 this.events[name].push(fun);
	 }
	 },
	 //解除事件绑定
	 off:function (name, fun) {
	 var even = this.events[name];
	 if (even) {
	 var l = even.length;
	 while (l--) {
	 if (even[l] === fun) {
	 even.splice(even[l], 1);
	 }
	 }

	 }
	 },
	 //触发事件
	 trigger : function (name, obj) {
	 var event = this.events[name];
	 if (event) {
	 for (var i in event ){
	 if (typeof(event[i]) == 'function'){
	 event[i]();
	 }
	 }
	 }
	 },
	 removeAll:function (name) {
	 this.events = [];
	 }
	 };*/

	//所有实例唯一id
	$.ui.guid = 0;

	//创建一个类
	function createClass(name, object) {
		function klass(el, options) {
			var me = this;
			me.el = $(el);
			var opts = me.options = mergeObj(klass.options, getDomOptions(el), options);
			me.name = name.toLowerCase();

			$.ui.guid++;
			me.guid = $.ui.guid;

			//加载组件相应样式
			if (me.options.hasCssLink && me.options.cssLinkVersion && me.options.baseVersion && typeof(seajs) != 'undefined') {
				seajs.use('//misc.360buyimg.com/jdf/' + me.options.baseVersion + '/ui/' + name + '/' + me.options.cssLinkVersion + '/' + name + '.css', function (css) {
					me.init();
				});
			} else {
				me.init();
			}

			//组件统计
			if (/isdebug=(-\d)*-0/.test(location.search) && window.pageConfig) {
				if (window.pageConfig.uiLog) {
					window.pageConfig.uiLog.push(me);
				} else {
					window.pageConfig.uiLog = [me];
				}
				console.log(me);
			}

			return me;
		}

		var fn = ['options'];
		for (var i = 0; i < fn.length; i++) {
			var item = fn[i];
			object[item] && (klass[item] = object[item]);
			delete object[item];
		}

		for (var i in object) {
			klass.prototype[i] = object[i];
		}

		return klass;
	}

	//在$.fn上挂组件
	$.ui.fn = function (name) {
		var name = name.toLowerCase();
		$.fn[name] = function (opts) {
			var obj;
			$.each(this, function (i, el) {
				obj = new $.ui[name](el, opts);
			});
			return obj;
		};
	}

	/**
	 * 定义一个组件
	 * @methord define
	 */
	$.ui.define = function (name, object) {
		$.ui[name] = createClass(name, object);
		$.ui.fn(name);
	};

})(jQuery);

//plugin 2013-12-17 17:44:15 add

;
(function ($, undefined) {
	/**
	 * 浏览器类型检测
	 * @method $.browser
	 */
	if (typeof($.browser) == 'undefined') {
		var userAgent = navigator.userAgent.toLowerCase();
		$.browser = {
			version: (userAgent.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [])[1],
			safari: /webkit/.test(userAgent),
			opera: /opera/.test(userAgent),
			msie: /msie/.test(userAgent) && !/opera/.test(userAgent),
			mozilla: /mozilla/.test(userAgent) && !/(compatible|webkit)/.test(userAgent)
		};
	} else {
		if (!$.browser.webkit) {
			var userAgent = navigator.userAgent.toLowerCase();
			$.browser.webkit = /webkit/.test(userAgent);
		}
		;
	}

	//移动终端检测 2015-1-8
	$.extend($.browser, function () {
		var u = navigator.userAgent, app = navigator.appVersion;
		return {
			mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
			ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
			android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
			iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
			iPad: u.indexOf('iPad') > -1, //是否iPad
			webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
		};
	}());

	$.browser.isMobile = function () {
		return $.browser.mobile || $.browser.ios || $.browser.android;
	}

	/**
	 * isIE6
	 * $.browser.isIE6()
	 */
	$.browser.isIE6 = function () {
		return $.browser.msie && $.browser.version == 6;
	}

	/**
	 * isIE7
	 * $.browser.isIE7()
	 */
	$.browser.isIE7 = function () {
		return $.browser.msie && $.browser.version == 7;
	}

	/**
	 * isIE8
	 * $.browser.isIE8()
	 */
	$.browser.isIE8 = function () {
		return $.browser.msie && $.browser.version == 8;
	}

	/**
	 * isIE9
	 * $.browser.isIE9()
	 */
	$.browser.isIE9 = function () {
		return $.browser.msie && $.browser.version == 9;
	}

	/**
	 * isIE10
	 * $.browser.isIE10()
	 */
	$.browser.isIE10 = function () {
		return $.browser.msie && $.browser.version == 10;
	}

	/**
	 * isIE11
	 * $.browser.isIE11()
	 */
	$.browser.isIE11 = function () {
		return $.browser.msie && $.browser.version == 11;
	}

	/**
	 * 页面文档和浏览器窗口宽高
	 * @method $.page
	 */
	$.page = function () {
	}

	/**
	 * 当前页面
	 * $.page.doc()
	 */
	$.page.doc = function () {
		return document.compatMode == "BackCompat" ? document.body : document.documentElement;
	}

	/**
	 * 浏览器窗口宽
	 * $.page.clientWidth()
	 */
	$.page.clientWidth = function () {
		return $.page.doc().clientWidth;
	}

	/**
	 * 浏览器窗口高
	 * $.page.clientHeight()
	 */
	$.page.clientHeight = function () {
		return $.page.doc().clientHeight;
	}

	/**
	 * 文档宽
	 * $.page.docWidth()
	 */
	$.page.docWidth = function () {
		return Math.max($.page.doc().clientWidth, $.page.doc().scrollWidth);
	}

	/**
	 * 文档高
	 * $.page.docHeight()
	 */
	$.page.docHeight = function () {
		return Math.max($.page.doc().clientHeight, $.page.doc().scrollHeight);
	}

	/**
	 * 检测HTML节点间的关系
	 * @method $.contains
	 * @param {Object} parent 父节点
	 * @param {Object} node 子节点
	 */
	if (typeof($.contains) == 'undefined') {
		$.contains = function (parent, node) {
			return parent.compareDocumentPosition
				? !!(parent.compareDocumentPosition(node) & 16)
				: parent !== node && parent.contains(node)
		}
	}
	;

	/**
	 * 节流函数
	 *  减少执行频率, 多次调用，在指定的时间内，只会执行一次。
	 * @method $.throttle
	 * @param {Function} func 要节流的函数
	 * @param {Number} wait 延时时间
	 * @example var throttleFn= function(){todoSomething()};var throttled = $.throttle(throttleFn,200);
	 */
	$.throttle = function (func, wait) {
		var context, args, timeout, result;
		var previous = 0;
		var later = function () {
			previous = new Date;
			timeout = null;
			result = func.apply(context, args);
		};
		return function () {
			var now = new Date;
			var remaining = wait - (now - previous);
			context = this;
			args = arguments;
			if (remaining <= 0) {
				clearTimeout(timeout);
				timeout = null;
				previous = now;
				result = func.apply(context, args);
			} else if (!timeout) {
				timeout = setTimeout(later, remaining);
			}
			return result;
		};
	}

	/**
	 * 解析模版tpl
	 * @method $.tpl
	 * @param {String} str 模板
	 * @param {Object} data 数据
	 * @example var data = {name: 'lilei'}; var str = "<h3><%=name%></h3>"; console.log($.tpl(str, data)); // => <h3>lilei</h3>
	 */
	$.tpl = function (str, data) {
		var tpl = "var p=[],print=function(){p.push.apply(p,arguments);};" +
			"with(obj){p.push('" +
			str.replace(/[\r\t\n]/g, " ")
				.split("<%").join("\t")
				.replace(/((^|%>)[^\t]*)'/g, "$1\r")
				.replace(/\t=(.*?)%>/g, "',$1,'")
				.split("\t").join("');")
				.split("%>").join("p.push('")
				.split("\r").join("\\'")
			+ "');}return p.join('');";

		fn = new Function("obj", tpl);
		return data ? fn(data) : fn;
	};
})(jQuery);

/**
 * @touch events 2015-1-8
 */
;
(function ($) {
	if (!$.browser.isMobile()) {
		return;
	}

	var touch = {}, touchTimeout;

	function parentIfText(node) {
		return 'tagName' in node ? node : node.parentNode
	}

	function swipeDirection(x1, x2, y1, y2) {
		var xDelta = Math.abs(x1 - x2), yDelta = Math.abs(y1 - y2)
		return xDelta >= yDelta ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
	}

	var longTapDelay = 750, longTapTimeout

	function longTap() {
		longTapTimeout = null
		if (touch.last) {
			touch.el.trigger('longTap')
			touch = {}
		}
	}

	function cancelLongTap() {
		if (longTapTimeout) clearTimeout(longTapTimeout)
		longTapTimeout = null
	}

	$(document).ready(function () {
		var now, delta;
		$(document.body).bind('touchstart', function (e) {
			now = Date.now()
			delta = now - (touch.last || now)
			touch.el = $(parentIfText(e.target))
			touchTimeout && clearTimeout(touchTimeout)
			touch.x1 = e.pageX
			touch.y1 = e.pageY
			if (delta > 0 && delta <= 250) touch.isDoubleTap = true
			touch.last = now
			longTapTimeout = setTimeout(longTap, longTapDelay)
		}).bind('touchmove', function (e) {
			cancelLongTap()
			touch.x2 = e.pageX
			touch.y2 = e.pageY
		}).bind('touchend', function (e) {
			cancelLongTap()

			// double tap (tapped twice within 250ms)
			if (touch.isDoubleTap) {
				touch.el.trigger('doubleTap')
				touch = {}
				// swipe
			} else if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) ||
				(touch.y2 && Math.abs(touch.y1 - touch.y2) > 30)) {
				touch.el.trigger('swipe') &&
				touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
				touch = {}

				// normal tap
			} else if ('last' in touch) {
				touch.el.trigger('tap')
				touchTimeout = setTimeout(function () {
					touchTimeout = null
					touch.el.trigger('singleTap')
					touch = {}
				}, 250)
			}
		}).bind('touchcancel', function () {
			if (touchTimeout) clearTimeout(touchTimeout)
			if (longTapTimeout) clearTimeout(longTapTimeout)
			longTapTimeout = touchTimeout = null
			touch = {}
		})
	})

	;
	['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function (m) {
		$.fn[m] = function (callback) {
			return this.bind(m, callback)
		}
	});
})($)