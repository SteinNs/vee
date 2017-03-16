/**
 * Created by Administrator on 2017/3/9.
 */

let uid = 0;

export default class Dep {

	constructor () {
		//取id用于观察者判断是否存在对应属性的订阅器中
		this.id = uid++;
		this.subs = [];
	}

	/*
	 观察者队列
	 @params sub:Watcher
	 */
	addSub ( sub ) {
		this.subs.push ( sub );
	}

	removeSub ( sub ) {
		let index = this.subs.indexOf(sub);
		if(index != -1){
			this.subs.splice(index,1);
		}
	}

	/*
	 依赖函数，当编译模板时发现绑定属性，进而在对应data属性的getter上设置观察者，过程中会将观察者
	 缓存在Dep.target中,所以应该根据是否存在Dep.target来判断是否将data属性监听
	 */
	depend () {
		Dep.target && Dep.target.addDep ( this );
	}

	/*
	 消息函数，当data对应属性发生变动，调用观察者队列中的所有观察者的更新函数
	 */
	notify () {
		const subs = [ ...this.subs ];
		for (let sub of subs) {
			sub.update ();
		}
	}
}

Dep.target = null;