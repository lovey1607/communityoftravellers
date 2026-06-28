// ============================================
// SPA Router — Hash-based client-side routing
// ============================================

class Router {
    constructor() {
        this.routes = [];
        this.currentRoute = null;
        this.beforeHooks = [];
        this.afterHooks = [];
        this.notFoundHandler = null;
        
        window.addEventListener('hashchange', () => this.resolve());
        window.addEventListener('load', () => this.resolve());
    }

    // Register a route
    on(path, handler, meta = {}) {
        this.routes.push({
            path,
            handler,
            meta,
            regex: this._pathToRegex(path),
            paramNames: this._extractParamNames(path)
        });
        return this;
    }

    // Register 404 handler
    notFound(handler) {
        this.notFoundHandler = handler;
        return this;
    }

    // Navigation guard
    beforeEach(hook) {
        this.beforeHooks.push(hook);
        return this;
    }

    afterEach(hook) {
        this.afterHooks.push(hook);
        return this;
    }

    // Navigate to a route
    navigate(path) {
        window.location.hash = path;
    }

    // Get current path
    getPath() {
        return window.location.hash.slice(1) || '/';
    }

    // Get query parameters
    getQuery() {
        const hash = window.location.hash.slice(1);
        const queryIndex = hash.indexOf('?');
        if (queryIndex === -1) return {};
        
        const params = new URLSearchParams(hash.slice(queryIndex));
        const query = {};
        for (const [key, value] of params) {
            query[key] = value;
        }
        return query;
    }

    // Resolve current route
    async resolve() {
        const fullPath = this.getPath();
        const [path] = fullPath.split('?');
        const query = this.getQuery();

        // Find matching route
        let matched = null;
        let params = {};

        for (const route of this.routes) {
            const match = path.match(route.regex);
            if (match) {
                matched = route;
                params = this._extractParams(route, match);
                break;
            }
        }

        if (!matched) {
            if (this.notFoundHandler) {
                this.notFoundHandler({ path, query, params: {} });
            }
            return;
        }

        const context = {
            path,
            fullPath,
            query,
            params,
            meta: matched.meta,
            from: this.currentRoute
        };

        // Run before hooks
        for (const hook of this.beforeHooks) {
            const result = await hook(context);
            if (result === false) return;
        }

        // Page transition
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.classList.add('page-exit');
            await new Promise(r => setTimeout(r, 150));
            mainContent.classList.remove('page-exit');
        }

        // Execute route handler
        await matched.handler(context);

        // Page enter animation
        if (mainContent) {
            mainContent.classList.add('page-enter');
            setTimeout(() => mainContent.classList.remove('page-enter'), 400);
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        this.currentRoute = context;

        // Run after hooks
        for (const hook of this.afterHooks) {
            hook(context);
        }

        // Trigger scroll animations
        this._initScrollAnimations();
    }

    // Convert path pattern to regex
    _pathToRegex(path) {
        const pattern = path
            .replace(/\//g, '\\/')
            .replace(/:(\w+)/g, '([^/]+)');
        return new RegExp(`^${pattern}$`);
    }

    // Extract parameter names from path
    _extractParamNames(path) {
        const names = [];
        const regex = /:(\w+)/g;
        let match;
        while ((match = regex.exec(path)) !== null) {
            names.push(match[1]);
        }
        return names;
    }

    // Extract parameter values
    _extractParams(route, match) {
        const params = {};
        route.paramNames.forEach((name, i) => {
            params[name] = decodeURIComponent(match[i + 1]);
        });
        return params;
    }

    // Initialize scroll-triggered animations
    _initScrollAnimations() {
        requestAnimationFrame(() => {
            const elements = document.querySelectorAll('.animate-in, .animate-in-left, .animate-in-right, .animate-in-scale');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            elements.forEach(el => observer.observe(el));
        });
    }
}

// Create singleton router instance
export const router = new Router();

// Helper: create link element
export function createLink(path, text, className = '') {
    const a = document.createElement('a');
    a.href = `#${path}`;
    a.textContent = text;
    if (className) a.className = className;
    return a;
}

// Helper: navigate programmatically
export function navigateTo(path) {
    router.navigate(path);
}
