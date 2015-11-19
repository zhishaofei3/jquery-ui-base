/**
*####分页组件####
*
***Demo**
* [pager](../ui/pager/1.0.0/example/pager.html "Demo")
*
***参数**
*
*  - `currentPageClass` {String} 'ui-pager-current'  当前页样式
*  - `currentPage` {Number}  1  当前页码
*  - `total` {Number} 0 一共多少条数据
*  - `pageSize` {Number} 10 一页面显示多少条数据
*  - `viewSize` {Number}  5 除首尾页外显示几个页码数字
*  - `onFirstPage` {Function} null  第一页回调函数
*  - `onLastPage` {Function} null  最后一页回调函数
*  - `prevText`{String}  '上一页'  上一页文案（请不要传特殊字符或不完整的html代码）
*  - `nextText` {String} '下一页'  下一页文案（请不要传特殊字符或不完整的html代码）
*  - `prevClass`{String}  'ui-pager-prev'  上一页className
*  - `nextClass`{String}  'ui-pager-next'  下一页className
*  - `pageHref`{String}  null  页码上的href
*  - `callback` {Function} null  点击页码回调函数
*	
***举例**
* 
*	$('#pager').pager();
*
* **ctime**
* 2013-11-8 15:32:38  by liuwei1
*
*/

	$.ui.define('pager', {
		options: {
			hasCssLink:true,
			baseVersion:'1.0.0',
			cssLinkVersion:'1.0.0',
			
			currentPageClass : 'ui-pager-current',//当前页样式
			currentPage : 1,//当前页码

			total:0, //一共多少条数据
			pageSize:10, //一页面显示多少条数据
			viewSize : 5,//除首尾页外显示几个页码数字

			onFirstPage:null,//第一页回调函数
			onLastPage:null,//最后一页回调函数

			prevText : '上一页',//上一页文案
			nextText : '下一页',//下一页文案
			
			prevClass : 'ui-pager-prev',//上一页className
			nextClass : 'ui-pager-next',//下一页className

			pageHref : null,//页码上的href
			callback:null//点击页码回调函数
        },
		 /**
         * 显示
         * @method rander
         */
		rander:function(){
			var self = this;
			var opts = self.options;
			var html = '';

			if (opts.total < 1){
				self.el.html(html);
				return;
			}

			//total大于1时,显示
			if(opts.total && opts.pageSize){
				opts.totalPage = Math.ceil(opts.total / opts.pageSize);
			}

			if (opts.currentPage > opts.totalPage){
				opts.currentPage  = opts.totalPage;
			}

			//除首尾页外的起始数
			var begin = 2;
			var end = 2;

			if ( opts.totalPage < opts.viewSize + 2 ){
				begin = 2;
				end = opts.totalPage - 1;
			}else if( opts.currentPage >= opts.totalPage - opts.viewSize ){
				begin = opts.totalPage - opts.viewSize;
				end = opts.totalPage -1;
			}else{
				begin = Math.max( 2, opts.currentPage - Math.floor(opts.viewSize/2) );
				end = Math.min( opts.totalPage-1, begin+opts.viewSize-1 );
			}

			var pageHref = opts.pageHref ? opts.pageHref : 'javascript:void(0)';

			var pagerLink = function (i){
				var classHtml = i==opts.currentPage ? ' class='+opts.currentPageClass : '';
				var href = i==opts.currentPage ? 'javascript:void(0)' : pageHref;
				var dataCurrent = i==opts.currentPage ? 'data-current="true"' : '';
				return '<a rel="'+i+'" '+classHtml+' href="'+href+'" '+dataCurrent+'>'+i+'</a>';
			};

			//上一页
			if (opts.currentPage>1){
				html +=  '<a rel="'+(opts.currentPage-1)+'" class="'+opts.prevClass+'" href="'+pageHref+'">'+opts.prevText+'</a>';
			}

			//首页
			html +=  pagerLink(1);

			if ( begin > 2 ){
				html += '<span>...</span> ';					
			}
			
			//连续分页
			for (var i = begin ; i <= end ; i++ ){
				html += pagerLink(i);
			}
			
			if ( end < opts.totalPage-1 ){
				html += '<span>...</span> ';					
			}

			//末页
			if (opts.totalPage > 1){
				html += pagerLink(opts.totalPage);
			}

			//下一页
			if (opts.currentPage<opts.totalPage){
				html +=  '<a rel="'+(opts.currentPage+1)+'" class="'+opts.nextClass+'" href="'+pageHref+'">'+opts.nextText+'</a>';
			}
			
			self.el.html(html);
		},
		/**
        * 更新
        * @method update
        */
		update:function(num){
			var self = this;
			var opts = self.options;
			opts.currentPage = parseInt(num);
			self.rander();
			if (opts.callback){
				opts.callback(opts.currentPage);
			}
			
			if ( opts.onFirstPage && (opts.currentPage == 1) ){
				opts.onFirstPage(opts.currentPage);
			}

			if ( opts.onLastPage && (opts.currentPage == opts.totalPage) ){
				opts.onLastPage(opts.currentPage);
			}
		},
		bind:function(){
			var self = this;
			self.el.delegate('a[rel]', 'click', function(){
				var _this = $(this);
				if ( !_this.attr('data-current') ){
					//因为要重绘，所以给埋点事件点时间执行
					setTimeout(function(){self.update(_this.attr('rel'));}, 0);
				}
			});
		},
		init:function(){
			var self = this;
			self.rander();
			self.bind();
		}
	});