'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TopLayout = exports.Layout = exports.View = exports.Fragment = exports.Component = undefined;
exports.default = aukTuraco;

var _nightingale = require('nightingale');

var _springbokjsDom = require('springbokjs-dom');

var _springbokjsDom2 = _interopRequireDefault(_springbokjsDom);

var _turaco = require('turaco');

var _loaders = require('turaco/lib/browser/loaders');

var _BrowserComponentRenderer = require('turaco/lib/browser/renderers/BrowserComponentRenderer');

var _BrowserComponentRenderer2 = _interopRequireDefault(_BrowserComponentRenderer);

var _BrowserViewRenderer2 = require('turaco/lib/browser/renderers/BrowserViewRenderer');

var _BrowserViewRenderer3 = _interopRequireDefault(_BrowserViewRenderer2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* global $document */

global.React = global.$ = _springbokjsDom2.default;

var logger = new _nightingale.ConsoleLogger('ibex.turaco');

var IbexComponentRenderer = (function (_BrowserComponentRend) {
    _inherits(IbexComponentRenderer, _BrowserComponentRend);

    function IbexComponentRenderer() {
        _classCallCheck(this, IbexComponentRenderer);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(IbexComponentRenderer).apply(this, arguments));
    }

    _createClass(IbexComponentRenderer, [{
        key: 'load',
        value: function load(componentName, $container, options) {
            return _get(Object.getPrototypeOf(IbexComponentRenderer.prototype), 'load', this).call(this, { name: componentName, nameOrClass: componentName }, $container, options);
        }
    }]);

    return IbexComponentRenderer;
})(_BrowserComponentRenderer2.default);

var IbexViewRenderer = (function (_BrowserViewRenderer) {
    _inherits(IbexViewRenderer, _BrowserViewRenderer);

    function IbexViewRenderer() {
        _classCallCheck(this, IbexViewRenderer);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(IbexViewRenderer).apply(this, arguments));
    }

    _createClass(IbexViewRenderer, [{
        key: 'load',
        value: function load(viewName, $container, options) {
            return _get(Object.getPrototypeOf(IbexViewRenderer.prototype), 'load', this).call(this, { name: viewName, nameOrClass: viewName }, $container, options);
        }
    }, {
        key: '_internalRender',
        value: function _internalRender(sourceView, nameOrClass, properties, data) {
            return this.createThenRender({
                name: nameOrClass.name,
                nameOrClass: nameOrClass,
                context: sourceView.context
            }, properties, data);
        }
    }]);

    return IbexViewRenderer;
})(_BrowserViewRenderer3.default);

var oldViewComponent = _turaco.View.prototype.component;

_turaco.View.prototype.component = function (componentClass) {
    return oldViewComponent.call(this, {
        name: componentClass.name,
        nameOrClass: componentClass,
        context: this.context
    });
};

var oldComponentComponent = _turaco.Component.prototype.component;

_turaco.Component.prototype.component = function (componentClass) {
    return oldComponentComponent.call(this, {
        name: componentClass.name,
        nameOrClass: componentClass,
        context: this.context
    });
};

exports.Component = _turaco.Component;
exports.Fragment = _turaco.Fragment;
exports.View = _turaco.View;
exports.Layout = _turaco.Layout;
exports.TopLayout = _turaco.TopLayout;

function instanceFactory(dirname, suffix) {
    return function (_ref, options) {
        var nameOrClass = _ref.nameOrClass;
        var context = _ref.context;

        if (nameOrClass === undefined) {
            throw new Error('Cannot instanciate undefined');
        }

        if (typeof nameOrClass !== 'function') {
            var path = dirname + nameOrClass + (suffix || '');
            nameOrClass = System.import(path).then(function (objOrClass) {
                if (typeof objOrClass !== 'function') {
                    return objOrClass.default;
                }

                return objOrClass;
            });
            context = context || options.context;
        }

        if ((typeof nameOrClass === 'undefined' ? 'undefined' : _typeof(nameOrClass)) === 'object' && typeof nameOrClass.then === 'function') {
            return nameOrClass.then(function (Class) {
                var instance = new Class(); // jscs:ignore requireCapitalizedConstructors
                instance.context = context;
                return instance;
            });
        } else {
            // const instance = Object.create(nameOrClass.prototype);
            // nameOrClass.call(instance);
            var instance = new nameOrClass(); // eslint-disable-line new-cap
            instance.context = context;
            return instance;
        }
    };
}

function aukTuraco(viewDirectory) {
    return function (app) {
        app.componentRenderer = new IbexComponentRenderer(instanceFactory(viewDirectory + 'components/'));

        app.viewRenderer = new IbexViewRenderer(instanceFactory(viewDirectory), app.componentRenderer);

        app.context.render = function (View, properties, data) {
            var _this3 = this;

            logger.debug('render view', { viewName: View.name, properties: properties, data: data });

            if (!View) {
                throw new Error('View is undefined, class expected');
            }

            return this.app.viewRenderer.createThenRender({
                name: View.name,
                nameOrClass: View,
                context: this
            }, properties, data).then(function (view) {
                return _this3.body = view.toHtmlString();
            });
        };

        var context = Object.create(app.context); // initial context.
        if (document.readyState === 'complete') {
            logger.debug('load components and views, document is already ready');
            (0, _loaders.loadComponents)(app.componentRenderer, { context: context });
            (0, _loaders.loadViews)(app.viewRenderer, { context: context });
        } else {
            logger.debug('waiting document ready');
            $document.on('DOMContentLoaded', function () {
                logger.debug('load components and views, document is ready');
                (0, _loaders.loadComponents)(app.componentRenderer, { context: context });
                (0, _loaders.loadViews)(app.viewRenderer, { context: context });
            });
        }
    };
}
//# sourceMappingURL=index.js.map