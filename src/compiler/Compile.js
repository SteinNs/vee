/**
 * Created by Administrator on 2017/3/16.
 */

//工具函数库
let util = {
	isElementNode( node ){
		return node.nodeType === 1;
	},
	isTextNode( node ){
		return node.nodeType === 3;
	},
	isDirective( attrName ){
		return attrName.indexOf ( 'v-' ) === 0;
	},
	isEventDirective( dir ){
		return dir.indexOf ( 'on' ) === 0;
	}
};

//更新值函数
let updater = {
	textUpdater( node, value ){
		node.textContent = typeof value == 'undefined' ? '' : value;
	},
	modelUpdater( node, value, oldValue ){
		node.value = typeof value == 'undefined' ? '' : value;
	}
};

//编译函数工具
let compileUtil = {

	text( node, vm, exp ){
		this.bind ( node, vm, exp, 'text' );
	},
	//数据绑定函数
	bind( node, vm, exp, dir ){
		let updaterFn = updater[ `${dir}Updater` ];
		//为节点取值队形，初始化视图
		updaterFn && updaterFn ( node, this._getVMVal ( vm, exp ) );
		//取值完毕后，新建一个Watcher，从而在对应属性的订阅器队列中加入该Watcher
		new Watcher ( vm, exp, ( value, oldValue ) => {
			updaterFn && updaterFn ( node, value, oldValue );
		} )
	},
	//事件处理函数
	eventHandler( node, vm, exp, dir ){
		let eventType = dir.split ( ':' )[ 1 ];
		let handler = vm.$option.methods && vm.$options.methods[ exp ];
		if ( eventType && handler ) {
			node.addEventListener ( eventType, handler.bind ( vm ), false );
		}
	},

	model( node, vm, exp ){
		//数据初始化，并绑定观察者
		this.bind ( node, vm, exp, 'model' );
		//取得当前数据
		let val = this._getVMVal ( vm, exp );
		node.addEventListener ( 'input', e => {
			let newValue = e.target.value;
			if ( val === newValue ) {
				return;
			}
			this._setVMVal ( vm, exp, newValue );
			val = newValue;
		} );

	},
	_getVMVal( vm, exp ){
		let val = vm._data;
		exp = exp.split ( '.' );
		//迭代遍历表达式知道找到最终属性，如parent.child.name迭代遍历到name属性，然后取值
		exp.forEach ( k => {
			val = val[ k ];
		} );
		return val;
	},
	_setVMVal( vm, exp, value ){
		let val = vm._data;
		exp = exp.split ( '.' );
		//迭代遍历表达式知道找到最终属性，如parent.child.name迭代遍历到name属性，然后赋值
		exp.forEach ( ( k, i ) => {
			if ( i < exp.length - 1 ) {
				val = val[ k ];
			} else {
				val[ k ] = value;
			}
		} )
	}
}


class Compile {
	constructor ( el, vm ) {
		this.$el = util.isElementNode ( el ) ? el : document.querySelector ( el );
		this.$vm = vm;
		if ( this.$el ) {
			this.$fragment = this.node2Fragment ( this.$el );
			this.init ();
			this.$el.appendChild ( this.$fragment );
		}
	}

	//node2Fragment函数用于将模板解析时的离线缓存，避免频繁的DOM操作影响性能
	node2Fragment ( el ) {
		let fragment = document.createDocumentFragment ();
		let child;
		while ( child = el.firstChild ) {
			fragment.appendChild ( child );
		}
		return fragment;
	}

	//init函数用于初始化
	init () {
		this.compileElement ( this.$fragment );
	}

	//compileElement函数用于编译节点，如果该节点是element节点，那么需要
	//看一下是否有vue的属性，并对vue属性进行处理，如果是text节点，那么需要看一下
	//是否是模板字符串，如果是，需要进行处理
	compileElement ( el ) {
		let childNodes = el.childNodes;

		for (let node of childNodes) {

			let reg = /\{\{(.*)\}\}/;
			let text = node.textContent;
			if ( util.isElementNode ( node ) ) {
				this.compile ( node );
			} else if ( util.isTextNode ( node ) && reg.test () ) {
				this.compileText ( node, RegExp.$1 );
			}
			//递归遍历子节点
			if ( node.childNodes && node.childNodes.length ) {
				this.compileElement ( node );
			}
		}
		;
	}

	//element节点编译函数,将Vue属性进行处理，然后从节点上删掉
	compile ( node ) {
		let attrs = node.attributes;
		for (let attr of attrs) {
			let attrName = attr.nodeName;
			if ( util.isDirective ( attrName ) ) {
				let exp = attr.nodeValue;
				let dir = attrName.substring ( 2 );
				if ( util.isEventDirective ( dir ) ) {
					compileUtil.eventHandler ( node, this.$vm, exp, dir );
				} else {
					compileUtil[ dir ] && compileUtil[ dir ] ( node, this.$vm, exp );
				}
				node.removeAttribute ( attrName );
			}
		}
	}

	//text节点编译函数，将模板字符串进行处理
	compileText ( node, exp ) {
		compileUtil.text ( node, this.$vm, exp );
	}

}

