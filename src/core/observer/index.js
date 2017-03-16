/**
 * Created by Administrator on 2017/3/10.
 */

export class Observer {
	constructor ( data ) {
		this.data = data;
		this.walk ( data );
	}

	walk ( data ) {
		Object.keys ( data ).forEach ( k => {
			this.convert ( k, data[ k ] );
		} );
	}

	convert ( k, v ) {
		this.defineReactive ( this.data, k, v );
	}

	defineReactive ( data, key, val ) {
		const dep = new Dep ();
		//递归遍历子属性
		const childObj = observe ( val );
		Object.defineProperty ( data, key, {
			enumerable: true,
			configurable: false,
			get: function () {
				if ( Dep.target ) {
					dep.depend ();
				}
			},
			set: function ( newVal ) {
				if ( newVal === val ) {
					return;
				}
				val = newVal;
				//如果新值是对象的话，需要对他进行遍历监听
				const childObj = observe ( newVal );
				dep.notify ();
			}
		} );

	}
}
;

function observe ( value, vm ) {
	if ( !value || typeof value !== 'object' ) {
		return;
	}

	return new Observer ( value );
}



