/**
 * Created by Administrator on 2017/3/17.
 */
class Vee {
	constructor ( options ) {
		this.$options = options;
		let data = this._data = this.$options.data;
		//数据代理 vm.xxx -> vm._data.xxx
		Object.keys ( data ).forEach ( k => {
			this._proxy ( k );
		} );
		observe ( data, this );
		this.$compile = new Compile ( options.el || document.body, this );
	}

	$watch ( k, cb, options ) {
		new Watcher ( this, k, cb );
	}

	_proxy ( k ) {
		let self = this;
		Object.defineProperty ( this, k, {
			configurable: false,
			enumerable: true,
			get: function proxyGetter () {
				return self._data[ k ];
			},
			set: function proxySetter ( newVal ) {
				self._data[ k ] = newVal;
			}

		} )
	}
}