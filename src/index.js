import _xs from 'xstream';
import { div, makeDOMDriver } from '@cycle/dom';
import { run } from '@cycle/run';
import { withState } from '@cycle/state';
import currency from 'currency.js';

const xs = _xs.default || _xs;

function main(sources) {
  const state$ = sources.state.stream;
  const vdom$ = state$.map(state => div([
    div('.balance', state.balance.format()),
  ]));

  const initReducer$ = xs.of(function initReducer(prevState) {
    return {
      balance: currency(0),
    };
  });
  const reducer$ = xs.merge(initReducer$, /*...*/);

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
