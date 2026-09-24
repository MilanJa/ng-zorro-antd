/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
// Minimal stand-in for `react` / `react-dom` so antd's token modules evaluate without React.
// Only module-evaluation-time calls need to work (createContext, forwardRef, memo); hooks are never called.
const noop = () => {};
const createContext = () => ({ Provider: noop, Consumer: noop, _currentValue: undefined });
const React = {
  createContext, createElement: noop, cloneElement: noop, isValidElement: () => false,
  Fragment: Symbol('Fragment'), forwardRef: f => f, memo: f => f, lazy: f => f,
  Component: class {}, PureComponent: class {},
  useContext: noop, useState: noop, useEffect: noop, useLayoutEffect: noop, useMemo: noop, useRef: noop,
  useCallback: noop, useId: noop, useInsertionEffect: noop, useImperativeHandle: noop, useReducer: noop,
  useSyncExternalStore: noop, version: '0.0.0-ng-zorro-shim',
  Children: { map: noop, forEach: noop, toArray: () => [] }, createRef: () => ({ current: null }),
  StrictMode: noop, Suspense: noop, createRoot: noop, render: noop, unmountComponentAtNode: noop, flushSync: f => f()
};
module.exports = React;
module.exports.default = React;
