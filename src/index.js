import _xs from 'xstream';
import { makeDOMDriver } from '@cycle/dom';
import { run } from '@cycle/run';
import { ripple, textField, topAppBar } from 'material-components-web';
import { withState } from '@cycle/state';
import AutoNumeric from 'autonumeric';
import currency from 'currency.js';
import html from 'snabby';

const MDCRipple = ripple.MDCRipple;
const MDCTextField = textField.MDCTextField;
const MDCTopAppBar = topAppBar.MDCTopAppBar;
const xs = _xs.default || _xs;

function main(sources) {
  const state$ = sources.state.stream.debug();
  const vdom$ = state$.map(({ addingEntry, balance, entries }) => html`
    <div>
      <header @class=${{
        'mdc-top-app-bar': true,
        'mdc-top-app-bar--fixed': true,
      }} @hook=${{
        insert: (vnode) => {
          new MDCTopAppBar(vnode.elm);
        },
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
          ${entries.map(({ draft, name, amount }) => html`
            <li @class=${{
              'mdc-card': true,
            }}>
              <div @class=${{
                'app-card__text': true,
              }}>
                <span @class=${{
                  'app-card__icon': true,
                  'material-icons': true,
                }} @attrs=${{
                  'aria-hidden': true,
                }}>
                  store
                </span>
                ${draft ? html`
                  <label @class=${{
                    'mdc-text-field': true,
                    'mdc-text-field--filled': true,
                  }} @hook=${{
                    insert: (vnode) => {
                      new MDCTextField(vnode.elm);
                    },
                  }}>
                    <span @class=${{
                      'mdc-text-field__ripple': true,
                    }}></span>
                    <span @class=${{
                      'mdc-floating-label': true,
                    }} @attrs=${{
                      id: 'name-text-field',
                    }}>
                      Name
                    </span>
                    <input @class=${{
                      'mdc-text-field__input': true,
                      name: true,
                    }} @attrs=${{
                      type: 'text',
                      'aria-labelledby': 'name-text-field',
                      value: name,
                    }} @props=${{
                      value: name,
                    }}>
                    <span @class=${{
                      'mdc-line-ripple': true,
                    }}></span>
                  </label>
                ` : html`
                  <span @class=${{
                    'mdc-typography': true,
                    'mdc-typography--headline6': true,
                  }}>
                    ${name}
                  </span>
                `}
                ${draft ? html`
                  <label @class=${{
                    'mdc-text-field': true,
                    'mdc-text-field--filled': true,
                    'app-card__text--align-right': true,
                  }} @hook=${{
                    insert: (vnode) => {
                      new MDCTextField(vnode.elm);
                    },
                  }}>
                    <span @class=${{
                      'mdc-text-field__ripple': true,
                    }}></span>
                    <span @class=${{
                      'mdc-floating-label': true,
                    }} @attrs=${{
                      id: 'amount-text-field',
                    }}>
                      Amount
                    </span>
                    <input @class=${{
                      'mdc-text-field__input': true,
                      amount: true,
                    }} @attrs=${{
                      type: 'text',
                      'aria-labelledby': 'amount-text-field',
                      inputmode: 'numeric',
                    }} @props=${{
                      value: amount.value,
                    }} @hook=${{
                      insert: (vnode) => {
                        new AutoNumeric(vnode.elm, 'numericPos');
                      },
                    }}>
                    <span @class=${{
                      'mdc-line-ripple': true,
                    }}></span>
                  </label>
                ` : html`
                  <span @class=${{
                    'mdc-typography': true,
                    'mdc-typography--subtitle2': true,
                    'app-card__text--align-right': true,
                  }}>
                    ${amount.format()}
                  </span>
                `}
              </div>
            </li>
          `)}
        </ol>
      </main>
      <button @class=${{
        'mdc-fab': true,
        'mdc-elevation--z6': true,
        'app-fab--fixed': true,
        add: !addingEntry,
        save: addingEntry,
      }} @attrs=${{
        'aria-label': 'add',
      }} @hook=${{
        insert: (vnode) => {
          new MDCRipple(vnode.elm);
        },
      }}>
        <div @class=${{
          'mdc-fab__ripple': true,
        }}></div>
        <span @class=${{
          'mdc-fab__icon': true,
          'material-icons': true,
        }}>
          ${addingEntry ? 'done' : 'add'}
        </span>
      </button>
    </div>
  `);

  const initReducer$ = xs.of((_prevState) => ({
    addingEntry: false,
    balance: currency(0),
    entries: [
    ],
  }));
  const addButtonClickEvent$ = sources.DOM.select('button.add').events('click').debug(ev => {console.log(ev.currentTarget)});
  const saveButtonClickEvent$ = sources.DOM.select('button.save').events('click').debug(ev => {console.log(ev.currentTarget)});
  const addEntryReducer$ = addButtonClickEvent$.map((_ev) => (prevState) => ({
    ...prevState,
    addingEntry: true,
    entries: [
      ...prevState.entries,
      {
        draft: true,
        editing: true,
        name: '',
        amount: currency(0),
      },
    ],
  }));
  const nameTextFieldInputEvent$ = sources.DOM.select('input.name').events('input');
  const updateNameReducer$ = nameTextFieldInputEvent$.map((ev) => (prevState) => ({
    ...prevState,
    entries: prevState.entries.map((entry) => (entry.editing ? {
      ...entry,
      name: ev.target.value,
    } : entry)),
  }));
  const amountTextFieldInputEvent$ = sources.DOM.select('input.amount').events('input');
  const updateAmountReducer$ = amountTextFieldInputEvent$.map((ev) => (prevState) => ({
    ...prevState,
    entries: prevState.entries.map((entry) => (entry.editing ? {
      ...entry,
      amount: currency(ev.target.value),
    } : entry)),
  }));
  const saveEntryReducer$ = saveButtonClickEvent$.map((_ev) => (prevState) => ({
    ...prevState,
    addingEntry: false,
    entries: prevState.entries.map((entry) => (entry.editing ? {
      ...entry,
      draft: false,
      editing: false,
     } : entry))
  }));

  const reducer$ = xs.merge(initReducer$, addEntryReducer$, updateNameReducer$, updateAmountReducer$, saveEntryReducer$);

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
