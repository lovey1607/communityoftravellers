// Mock window, document, and localStorage for Node testing
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div><div id="main-content"></div><div id="main-nav"></div><div id="main-footer"></div><div id="toast-container"></div></body></html>', {
  url: 'http://localhost/'
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.localStorage = {
  getItem: (key) => null,
  setItem: (key, val) => {},
  removeItem: (key) => {}
};

// Mock canvas and Three.js elements
class MockWebGLRenderer {
  constructor() {}
  setSize() {}
  render() {}
  domElement = dom.window.document.createElement('div');
}
global.window.WebGLRenderer = MockWebGLRenderer;

// Mock custom elements or others if needed
import { renderHostsPage } from './src/pages/info-pages.js';
import { renderHostProfilePage } from './src/pages/host-profile.js';
import { renderHomePage } from './src/pages/home.js';
import { renderTripsPage } from './src/pages/trips.js';
import { renderTripDetailPage } from './src/pages/trip-detail.js';

console.log('🧪 Starting render simulation tests...');

try {
  console.log('1. Rendering Home Page...');
  renderHomePage();
  console.log('✅ Home Page rendered successfully!');
} catch (e) {
  console.error('❌ Home Page crash:', e);
}

try {
  console.log('2. Rendering Trips Page...');
  renderTripsPage();
  console.log('✅ Trips Page rendered successfully!');
} catch (e) {
  console.error('❌ Trips Page crash:', e);
}

try {
  console.log('3. Rendering Hosts Page...');
  renderHostsPage();
  console.log('✅ Hosts Page rendered successfully!');
} catch (e) {
  console.error('❌ Hosts Page crash:', e);
}

try {
  console.log('4. Rendering Host Profile Page...');
  renderHostProfilePage('host-001');
  console.log('✅ Host Profile Page rendered successfully!');
} catch (e) {
  console.error('❌ Host Profile Page crash:', e);
}

try {
  console.log('5. Rendering Trip Detail Page...');
  renderTripDetailPage('spiti-creator-expedition');
  console.log('✅ Trip Detail Page rendered successfully!');
} catch (e) {
  console.error('❌ Trip Detail Page crash:', e);
}

console.log('🧪 Render simulation tests complete!');
