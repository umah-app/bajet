import _xs from 'xstream';
import { makeDOMDriver } from '@cycle/dom';
import { run } from '@cycle/run';
import { withState } from '@cycle/state';
import currency from 'currency.js';
import html from 'snabby';

const xs = _xs.default || _xs;

function main(sources) {
  const state$ = sources.state.stream.debug();
  const vdom$ = state$.map(({ addingEntry, balance, entries }) => html`
    <div>
      <header @class=${{
        'mdc-top-app-bar': true,
        'mdc-top-app-bar--fixed': true,
      }}>
        <div @class=${{
          'mdc-top-app-bar__row': true,
        }}>
          <section @class=${{
            'mdc-top-app-bar__section': true,
            'mdc-top-app-bar__section--align-start': true,
          }}>
            <span @class=${{
              'mdc-top-app-bar__title': true,
              balance: true,
            }}>
              ${balance.format()}
            </span>
          </section>
        </div>
      </header>
      <main @class=${{
        'mdc-top-app-bar--fixed-adjust': true,
      }}>
        <ol @class=${{
          'app-card-collection': true,
          entries: true,
        }}>
          ${entries.map(({ name, price }) => html`
            <li @class=${{
              'mdc-card': true,
            }}>
              <div @class=${{
                'app-card__text': true,
              }}>
                <span @class=${{
                  'app-card__icon': true,
                  'material-icons': true,
                }} @props=${{
                  'aria-hidden': true,
                }}>
                  store
                </span>
                <span @class=${{
                  'mdc-typography': true,
                  'mdc-typography--headline6': true,
                }}>
                  ${name}
                </span>
                <span @class=${{
                  'mdc-typography': true,
                  'mdc-typography--subtitle2': true,
                  'app-card__text--align-right': true,
                }}>
                  ${price.format()}
                </span>
              </div>
            </li>
          `)}
        </ol>
      </main>
      ${addingEntry ? [] : [html`
        <button @class=${{
          'mdc-fab': true,
          'mdc-elevation--z6': true,
          'app-fab--fixed': true,
          add: true,
        }} @props=${{
          'aria-label': 'add',
        }}>
          <span @class=${{
            'mdc-fab__icon': true,
            'material-icons': true,
          }}>
            add
          </span>
        </button>
      `]}
    </div>
  `);

  const initReducer$ = xs.of((_prevState) => ({
    addingEntry: false,
    balance: currency(0),
    entries: [
      {
        name: 'Meow',
        price: currency(99),
      },
      {
        name: 'Rawr',
        price: currency(12.34),
      },
    ],
  }));
  const addButtonClickEvent$ = sources.DOM.select('button.add').events('click');
  const addReducer$ = addButtonClickEvent$.map((_ev) => (prevState) => ({
    ...prevState,
    addingEntry: true,
    entries: [
      ...prevState.entries,
      {
        name: '',
        price: currency(0),
      },
    ],
  }));
  const reducer$ = xs.merge(initReducer$, addReducer$);

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
