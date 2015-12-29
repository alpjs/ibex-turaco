/* global $document */
import { ConsoleLogger } from 'nightingale';
import $ from 'springbokjs-dom';
import { Component, Fragment, View, Layout, TopLayout } from 'turaco';
import { loadComponents, loadViews } from 'turaco/lib/browser/loaders';
import BrowserComponentRenderer from 'turaco/lib/browser/renderers/BrowserComponentRenderer';
import BrowserViewRenderer from 'turaco/lib/browser/renderers/BrowserViewRenderer';
global.React = global.$ = $;

const logger = new ConsoleLogger('ibex.turaco');

class IbexComponentRenderer extends BrowserComponentRenderer {
    load(componentName, $container, options) {
        return super.load({ name: componentName, nameOrClass: componentName }, $container, options);
    }
}

class IbexViewRenderer extends BrowserViewRenderer {
    load(viewName, $container, options) {
        return super.load({ name: viewName, nameOrClass: viewName }, $container, options);
    }

    _internalRender(sourceView, nameOrClass, properties, data) {
        return this.createThenRender({
            name: nameOrClass.name,
            nameOrClass: nameOrClass,
            context: sourceView.context,
        }, properties, data);
    }
}
const oldViewComponent = View.prototype.component;

View.prototype.component = function (componentClass) {
    return oldViewComponent.call(this, {
        name: componentClass.name,
        nameOrClass: componentClass,
        context: this.context,
    });
};

const oldComponentComponent = Component.prototype.component;

Component.prototype.component = function (componentClass) {
    return oldComponentComponent.call(this, {
        name: componentClass.name,
        nameOrClass: componentClass,
        context: this.context,
    });
};

export { Component, Fragment, View, Layout, TopLayout };

function instanceFactory(dirname, suffix) {
    return function ({ nameOrClass, context }, options) {
        if (nameOrClass === undefined) {
            throw new Error('Cannot instanciate undefined');
        }

        if (typeof nameOrClass !== 'function') {
            const path = dirname + nameOrClass + (suffix || '');
            nameOrClass = System.import(path).then(objOrClass => {
                if (typeof objOrClass !== 'function') {
                    return objOrClass.default;
                }

                return objOrClass;
            });
            context = context || options.context;
        }

        if (typeof nameOrClass === 'object' && typeof nameOrClass.then === 'function') {
            return nameOrClass.then(Class => {
                const instance = new Class(); // jscs:ignore requireCapitalizedConstructors
                instance.context = context;
                return instance;
            });
        } else {
            // const instance = Object.create(nameOrClass.prototype);
            // nameOrClass.call(instance);
            const instance = new nameOrClass(); // eslint-disable-line new-cap
            instance.context = context;
            return instance;
        }
    };
}

export default function aukTuraco(viewDirectory) {
    return (app) => {
        app.componentRenderer = new IbexComponentRenderer(
            instanceFactory(viewDirectory + 'components/')
        );

        app.viewRenderer = new IbexViewRenderer(
            instanceFactory(viewDirectory),
            app.componentRenderer
        );

        app.context.render = function (View, properties, data) {
            logger.debug('render view', { viewName: View.name, properties, data });

            if (!View) {
                throw new Error('View is undefined, class expected');
            }

            return this.app.viewRenderer.createThenRender({
                name: View.name,
                nameOrClass: View,
                context: this,
            }, properties, data)
                .then(view => this.body = view.toHtmlString());
        };

        const context = Object.create(app.context); // initial context.
        if (document.readyState === 'complete') {
            logger.debug('load components and views, document is already ready');
            loadComponents(app.componentRenderer, { context });
            loadViews(app.viewRenderer, { context });
        } else {
            logger.debug('waiting document ready');
            $document.on('DOMContentLoaded', () => {
                logger.debug('load components and views, document is ready');
                loadComponents(app.componentRenderer, { context });
                loadViews(app.viewRenderer, { context });
            });
        }
    };
}
