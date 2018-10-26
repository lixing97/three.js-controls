/**
 * @author arodic / https://github.com/arodic
 *
 * Minimal implementation of io mixin: https://github.com/arodic/io
 * Includes event listener/dispatcher and defineProperties() method.
 * Changed properties trigger "[prop]-changed" event, and execution of changed() and [prop]Changed() functions.
 */

export const IoLiteMixin = (superclass) => class extends superclass {
	addEventListener(type, listener) {
		this._listeners = this._listeners || {};
		this._listeners[type] = this._listeners[type] || [];
		if (this._listeners[type].indexOf(listener) === -1) {
			this._listeners[type].push(listener);
		}
	}
	hasEventListener(type, listener) {
		if (this._listeners === undefined) return false;
		return this._listeners[type] !== undefined && this._listeners[type].indexOf(listener) !== -1;
	}
	removeEventListener(type, listener) {
		if (this._listeners === undefined) return;
		if (this._listeners[type] !== undefined) {
			var index = this._listeners[type].indexOf(listener);
			if (index !== -1) this._listeners[type].splice(index, 1);
		}
	}
	dispatchEvent(type, detail = {}) {
		const event = {
			path: [this],
			target: this,
			detail: detail,
		};
		if (this._listeners && this._listeners[type] !== undefined) {
			const array = this._listeners[type].slice(0);
			for (let i = 0, l = array.length; i < l; i ++) {
				array[i].call(this, event);
			}
		} else if (this.parent && event.bubbles) {};
	}
	defineProperties(props) {
		if (!this.hasOwnProperty('_properties')) {
			Object.defineProperty(this, '_properties', {
				value: {},
				enumerable: false
			});
		}
		for (let prop in props) {
			// let propDef = props[prop];
			// if (propDef === null || propDef === undefined) {
			// 	propDef = {value: propDef};
			// } else if (typeof propDef !== 'object') {
			// 	propDef = {value: propDef};
			// }
			// defineProperty(this, prop, propDef);
			defineProperty(this, prop, props[prop]);
		}
	}
	// TODO: dispose
}

const defineProperty = function(scope, prop, def) {
	let defaultObserver = prop + 'Changed';
	let customObserver;
	let initValue = def;
	if (def && typeof def === 'object' && def.value !== undefined) {
		initValue = def.value;
		if (typeof def.observer === 'string') {
			customObserver = def.observer;
		}
	}

	scope._properties[prop] = initValue;
	if (initValue === undefined) {
		console.warn('IoLiteMixin: ' + prop + ' is mandatory!');
	}
	if (!scope.hasOwnProperty(prop)) { // TODO: test
		Object.defineProperty(scope, prop, {
			get: function() {
				return scope._properties[prop] !== undefined ? scope._properties[prop] : initValue;
			},
			set: function(value) {
				if (scope._properties[prop] !== value) {
					const oldValue = scope._properties[prop];
					scope._properties[prop] = value;
					if (typeof scope.paramChanged === 'function') scope.paramChanged.call(scope, value, oldValue);
					if (typeof scope[defaultObserver] === 'function') scope[defaultObserver](value, oldValue);
					if (typeof scope[customObserver] === 'function') scope[customObserver](value, oldValue);
					scope.dispatchEvent(prop + '-changed', {value: value, oldValue: oldValue, bubbles: true});
					scope.dispatchEvent('change', {property: prop, value: value, oldValue: oldValue});
				}
			},
			enumerable: prop.charAt(0) !== '_'
		});
	}
	scope[prop] = initValue;
}

export class IoLite extends IoLiteMixin(Object) {}
