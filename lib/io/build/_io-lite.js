/**
 * @author arodic / https://github.com/arodic
 *
 * Minimal implementation of io mixin: https://github.com/arodic/io
 * Includes event listener/dispatcher and defineProperties() method.
 * Changed properties trigger "change" and "[prop]-changed" events, and execution of [prop]Changed() callback.
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
			type: type,
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
			defineProperty(this, prop, props[prop]);
		}
	}
	// TODO: dispose
}

const defineProperty = function(scope, propName, propDef) {	scope._properties[propName] = initValue;
	if (initValue === undefined) {
		console.warn('IoLiteMixin: ' + propName + ' is mandatory!');
	}
	if (!scope.hasOwnProperty(propName)) { // TODO: test
		Object.defineProperty(scope, propName, {
			get: function() {
				return scope._properties[propName];
			},
			set: function(value) {
				if (scope._properties[propName] !== value) {
					const oldValue = scope._properties[propName];
					scope._properties[propName] = value;
					if (typeof scope.paramChanged === 'function') scope.paramChanged.call(scope, value, oldValue);
					if (typeof scope[defaultObserver] === 'function') scope[defaultObserver](value, oldValue);
					if (typeof scope[customObserver] === 'function') scope[customObserver](value, oldValue);
					scope.dispatchEvent(propName + '-changed', {value: value, oldValue: oldValue, bubbles: true});
					scope.dispatchEvent('change', {property: propName, value: value, oldValue: oldValue});
				}
			},
			enumerable: propName.charAt(0) !== '_'
		});
	}
	scope[propName] = initValue;
}
