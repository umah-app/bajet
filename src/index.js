import _xs from 'xstream';
import { h, makeDOMDriver } from '@cycle/dom';
import { run } from '@cycle/run';
import { withState } from '@cycle/state';
import currency from 'currency.js';

const xs = _xs.default || _xs;

function main(sources) {
  const state$ = sources.state.stream;
  const vdom$ = state$.map(({ balance }) => h('div', [
    h('header.mdc-top-app-bar.mdc-top-app-bar--fixed', [
      h('div.mdc-top-app-bar__row', [
        h('section.mdc-top-app-bar__section.mdc-top-app-bar__section--align-start', [
          h('span.mdc-top-app-bar__title.balance', balance.format()),
        ]),
      ]),
    ]),
  ]));

  const initReducer$ = xs.of((_prevState) => ({
    balance: currency(0),
  }));
  const reducer$ = xs.merge(initReducer$ /* ... */);

  const sinks = {
    DOM: vdom$,
    state: reducer$,
  };

  return sinks;
}

const wrappedMain = withState(main);

const drivers = {
  DOM: makeDOMDriver('#app'),
};

run(wrappedMain, drivers);
