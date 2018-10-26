import { html, IoElement, IoObject, IoButton } from '../../io/build/io.js';

class IoInspectorBreadcrumbs extends IoElement {
  static get style() {
    return html`<style>:host {display: flex;flex: 1 0;flex-direction: row;padding: 0.2em;background-color: rgba(0, 0, 0, 0.5);}:host > io-inspector-link {overflow: hidden;text-overflow: ellipsis;}:host > io-inspector-link:first-of-type,:host > io-inspector-link:last-of-type {overflow: visible;text-overflow: clip;}:host > io-inspector-link:not(:first-of-type):before {content: '/';margin: 0 0.2em;}</style>`;
  }
  static get properties() {
    return {
      crumbs: Array,
    };
  }
  changed() {
    this.template([this.crumbs.map(i => ['io-inspector-link', {value: i}])]);
  }
}

IoInspectorBreadcrumbs.Register();

class IoInspectorGroup extends IoObject {
  static get style() {
    return html`<style>:host {display: flex;flex-direction: column;}:host > io-boolean {padding: 0.2em;font-size: 1.1em;border: 1px outset rgba(255, 255, 255, 1);background: rgba(0, 0, 0, 0.25);}:host > div {padding: 0.2em 0;border: 1px outset rgba(255, 255, 255, 0.5);background: rgba(128, 128, 128, 0.4);overflow: hidden;}:host > div > :nth-child(1) {text-align: right;overflow: hidden;text-overflow: ellipsis;flex: 0 1 9em;padding-left: 0.5em;min-width: 3em;}:host > div > :nth-child(2) {flex: 1 1;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;min-width: 6em;}:host > div > io-inspector-link {flex: 0 0 auto !important;min-width: 0 !important;text-decoration: underline;}</style>`;
  }
  static get properties() {
    return {
      persist: false,
    };
  }
  valueChanged() {
    if (this.persist) {
      const groupKey = this.label + '-' + (this.value.uuid || this.value.guid || this.value.constructor.name);
      const expanded = localStorage.getItem('io-inspector-group-expanded-' + groupKey);
      this.expanded = expanded === null ? this.label === 'properties' ? true : false : expanded === 'true' ? true : false;
    } else {
      this.expanded = this.label === 'properties';
    }
  }
  expandedChanged() {
    if (this.persist) {
      const groupKey = this.label + '-' + (this.value.uuid || this.value.guid || this.value.constructor.name);
      localStorage.setItem('io-inspector-group-expanded-' + groupKey, this.expanded);
    }
  }
  static get config() {
    return {
      'Object': {
        'type:object': {tag: 'io-inspector-link'},
        'type:boolean': {tag: 'io-boolean', config: {true: '☑ yes', false: '☐ no'}},
      }
    };
  }
}

IoInspectorGroup.Register();

class IoInspectorLink extends IoButton {
  changed() {
    this.template([['span', this.value.constructor.name]]);
  }
  _onAction(event) {
    event.stopPropagation();
    if (event.which === 13 || event.which === 32 || event.type !== 'keyup') {
      event.preventDefault();
      this.pressed = false;
      this.dispatchEvent('io-inspector-link-clicked', {value: this.value});
    }
    this._onUp(event);
  }
}

IoInspectorLink.Register();

const IoInspectorConfig = {
  types: {
    'Object': {
      'type:object': {tag: 'io-inspector-link'},
      'type:boolean': {tag: 'io-boolean', props: {true: '☑ yes', false: '☐ no'}},
    },
  },
  groups: {
    'Node': {
      'hierarchy': [
        'isConnected', 'ownerDocument', 'parentNode', 'parentElement', 'childNodes',
        'firstChild', 'lastChild', 'previousSibling', 'nextSibling',
      ],
      'advanced': [
        'nodeValue', 'textContent', 'nodeType', 'nodeName', 'baseURI',
      ],
      'hidden': [
        'ELEMENT_NODE', 'ATTRIBUTE_NODE', 'TEXT_NODE', 'CDATA_SECTION_NODE',
        'ENTITY_REFERENCE_NODE', 'ENTITY_NODE', 'PROCESSING_INSTRUCTION_NODE',
        'COMMENT_NODE', 'DOCUMENT_NODE', 'DOCUMENT_TYPE_NODE', 'DOCUMENT_FRAGMENT_NODE',
        'NOTATION_NODE', 'DOCUMENT_POSITION_DISCONNECTED', 'DOCUMENT_POSITION_PRECEDING',
        'DOCUMENT_POSITION_FOLLOWING', 'DOCUMENT_POSITION_CONTAINS', 'DOCUMENT_POSITION_CONTAINED_BY',
        'DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC',
        'normalize', 'cloneNode', 'isEqualNode', 'isSameNode', 'compareDocumentPosition', 'contains',
        'lookupPrefix', 'lookupNamespaceURI', 'isDefaultNamespace', 'insertBefore', 'appendChild',
        'replaceChild', 'removeChild', 'hasChildNodes', 'getRootNode',
      ],
    },
    'Element': {
      'properties': [
        'id', 'className',
      ],
      'hierarchy': [
        'shadowRoot', 'previousElementSibling', 'nextElementSibling', 'children',
        'firstElementChild', 'lastElementChild', 'childElementCount', 'slot', 'assignedSlot',
      ],
      'style': [
        'attributeStyleMap',
      ],
      'advanced': [
        'classList', 'attributes', 'localName', 'tagName', 'namespaceURI', 'prefix', 'innerHTML', 'outerHTML',
      ],
      'layout': [
        'scrollTop', 'scrollLeft', 'scrollWidth', 'scrollHeight', 'clientTop', 'clientLeft', 'clientWidth', 'clientHeight',
      ],
      'events': [
        'onbeforecopy', 'onbeforecut', 'onbeforepaste',
        'oncopy', 'oncut', 'onpaste', 'onsearch', 'onselectstart',
        'onwebkitfullscreenchange', 'onwebkitfullscreenerror'
      ]
    },
    'HTMLElement': {
      'properties': [
        'title', 'hidden', 'tabIndex', 'draggable', 'contentEditable', 'isContentEditable',
      ],
      'style': [
        'style',
      ],
      'layout': [
        'offsetParent', 'offsetTop', 'offsetLeft', 'offsetWidth', 'offsetHeight',
      ],
      'advanced': [
        'innerText', 'outerText', 'dataset', 'accessKey', 'nonce'
      ],
      'language': [
        'inputMode', 'dir', 'lang', 'translate', 'spellcheck', 'autocapitalize',
      ],
      'events': [
        'onabort', 'onblur', 'oncancel', 'oncanplay',
        'oncanplaythrough', 'onchange', 'onclick', 'onclose', 'oncontextmenu', 'oncuechange', 'ondblclick', 'ondrag',
        'ondragend', 'ondragenter', 'ondragleave', 'ondragover', 'ondragstart', 'ondrop', 'ondurationchange', 'onemptied',
        'onended', 'onerror', 'onfocus', 'oninput', 'oninvalid', 'onkeydown', 'onkeypress', 'onkeyup', 'onload',
        'onloadeddata', 'onloadedmetadata', 'onloadstart', 'onmousedown', 'onmouseenter', 'onmouseleave', 'onmousemove',
        'onmouseout', 'onmouseover', 'onmouseup', 'onmousewheel', 'onpause', 'onplay', 'onplaying', 'onprogress',
        'onratechange', 'onreset', 'onresize', 'onscroll', 'onseeked', 'onseeking', 'onselect', 'onstalled', 'onsubmit',
        'onsuspend', 'ontimeupdate', 'ontoggle', 'onvolumechange', 'onwaiting', 'onwheel', 'onauxclick',
        'ongotpointercapture', 'onlostpointercapture', 'onpointerdown', 'onpointermove', 'onpointerup', 'onpointercancel',
        'onpointerover', 'onpointerout', 'onpointerenter', 'onpointerleave',
      ]
    },
    'Object': {
      'properties': ['name'],
    },
  }
};

function isValueOfPropertyOf(prop, object) {
  for (let key in object) if (object[key] === prop) return key;
  return null;
}

class IoInspector extends IoElement {
  static get style() {
    return html`<style>:host {display: flex;flex-direction: column;}</style>`;
  }
  static get properties() {
    return {
      value: Object,
      config: Object,
      crumbs: Array,
      persist: false,
    };
  }
  static get listeners() {
    return {
      'io-inspector-link-clicked': '_onLinkClicked',
    };
  }
  _onLinkClicked(event) {
    event.stopPropagation();
    this.value = event.detail.value;
  }
  changed() {
    let groups = {};
    let assigned = [];
    let proto = this.value;
    let keys = [];
    // TODO: optimize?
    while (proto) {
      keys = [...keys, ...Object.keys(proto)];
      let config = IoInspectorConfig.groups[proto.constructor.name] || {};
      for (let group in config) {
        groups[group] = groups[group] || [];
        // console.log(config[group])
        for (let i = 0; i < config[group].length; i++) {
          let key = config[group][i];
          let propKeys = Object.keys(proto);
          if (propKeys.indexOf(key) !== -1 && groups[group].indexOf(key) === -1) {
            groups[group].push(key);
            assigned.push(key);
          }
        }
      }
      proto = proto.__proto__;
    }

    for (let group in groups) {
      if (groups[group].length === 0) delete groups[group];
    }
    delete groups.hidden;

    if (assigned.length === 0) {
      groups['properties'] = keys;
    } else {
      for (let i = 0; i < keys.length; i++) {
        groups['properties'] = groups['properties'] || [];
        if (assigned.indexOf(keys[i]) === -1) {
          groups['properties'].push(keys[i]);
        }
      }
    }

    let crumb = this.crumbs.find((crumb) => { return crumb === this.value; });
    let lastrumb = this.crumbs[this.crumbs.length - 1];
    if (crumb) {
      this.crumbs.length = this.crumbs.indexOf(crumb) + 1;
    } else {
      if (!lastrumb || !isValueOfPropertyOf(this.value, lastrumb)) {
        this.crumbs.length = 0;
      }
      this.crumbs.push(
        this.value
      );
    }

    this.template([
      ['io-inspector-breadcrumbs', {crumbs: [...this.crumbs]}],
      Object.keys(groups).map(key =>
        ['io-inspector-group', {
          value: this.value, props: groups[key], label: key, config: this.config, persist: this.persist}
        ]
      )
    ]);

  }
}

IoInspector.Register();

export { IoInspector };
