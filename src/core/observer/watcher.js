/**
 * Created by Administrator on 2017/3/10.
 */
class Watcher {
	constructor ( vm, exp, cb ) {
		this.cb = cb;
		this.vm = vm;
		this.exp = exp;
		this.depIds = {};
		this.value = this.get ();
	}

	update () {
		this.run ();
	}

	run () {
		let value = this.get ();
		let oldVal = this.value;
		if ( value !== oldVal ) {
			this.value = value;
			this.cb.call ( this.vm, value, oldVal );
		}
	}

	addDep ( dep ) {
		//必须检查这个观察者是否已经存在在对应属性的订阅器队列上，否则当一个属性被多次取值时，会重复添加观察者
		if ( !this.depIds.hasOwnProperty ( dep.id ) ) {
			dep.addSub ( this );
			//记录已经该观察者已被加入到对应属性的订阅器队列中
			this.depIds[ dep.id ] = dep;
		}
	}

	get () {
		//将当前的观察者缓存在Dep.target上
		Dep.target = this;
		//取值时，将观察者插入对应属性的订阅器队列中
		let value = this.getVMVal ();
		//删除缓存
		Dep.target = null;
		return value;
	}

	getVMVal () {
		let exp = this.exp.split ( '.' );
		let val = this.vm._data;
		//迭代遍历子属性，从而使父属性和子属性之间可以互相监听变化
		exp.forEach ( k => {
			val = val[ k ];
		} );
		return val;
	}

}