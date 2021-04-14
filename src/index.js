import _sampleCombine from 'xstream/extra/sampleCombine';
import _xs from 'xstream';
import { makeDOMDriver } from '@cycle/dom';
import { MDCRipple } from '@material/ripple';
import { MDCTextField } from '@material/textfield';
import { MDCTopAppBar } from '@material/top-app-bar';
import { run } from '@cycle/run';
import { withState } from '@cycle/state';
import AutoNumeric from 'autonumeric';
import currency from 'currency.js';
import html from 'snabby';

/** @type {import('xstream/extra/sampleCombine').SampleCombineSignature} */
const sampleCombine = _sampleCombine.default || _sampleCombine;
/** @type {typeof import('xstream').Stream} */
const xs = _xs.default || _xs;

const EntryMode = {
  add: Symbol('add'),
  edit: Symbol('edit'),
  idle: Symbol('idle'),
};

/**
 * @param {Object}                              sources
 * @param {import('@cycle/dom').DOMSource}      sources.DOM
 * @param {import('@cycle/state').StateSource}  sources.state
 */
function main(sources) {
  const state$ = sources.state.stream;
  const savedEntries$ = state$.filter(({ entryMode }) => entryMode === EntryMode.idle)
    .map(({ entries }) => entries);
  const vdom$ = state$.map(({ balance, entries, entryMode }) => html`
    <div>
      <header @class=${{
        'mdc-top-app-bar': true,
        'mdc-top-app-bar--fixed': true,
        'app-top-app-bar--contextual': entryMode !== EntryMode.idle,
      }} @hook=${{
        insert: (vnode) => {
          // eslint-disable-next-line no-new
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
            <button @class=${{
              'mdc-top-app-bar__navigation-icon': true,
              'mdc-icon-button': true,
              'material-icons': true,
              close: entryMode !== EntryMode.idle,
            }} @attrs=${{
              'aria-label': entryMode === EntryMode.idle ? 'Open navigation menu' : 'Close',
            }}>${entryMode === EntryMode.idle ? 'menu' : 'close'}</button>
            <span @class=${{
              'mdc-top-app-bar__title': true,
            }}>${{
              [EntryMode.idle]: balance.format(),
              [EntryMode.add]: 'Add entry',
              [EntryMode.edit]: 'Edit entry',
            }[entryMode]}</span>
          </section>
          ${entryMode === EntryMode.idle ? '' : html`
            <section @class=${{
              'mdc-top-app-bar__section': true,
              'mdc-top-app-bar__section--align-end': true,
            }} @attrs=${{
              role: 'toolbar',
            }}>
              <button @class=${{
                'mdc-top-app-bar__action-item': true,
                'mdc-icon-button': true,
                'material-icons': true,
                save: true,
              }} @attr=${{
                'aria-label': 'Save',
              }}>done</button>
              ${entryMode === EntryMode.edit ? html`
                <button @class=${{
                  'mdc-top-app-bar__action-item': true,
                  'mdc-icon-button': true,
                  'material-icons': true,
                  delete: true,
                }} @attr=${{
                  'aria-label': 'Delete',
                }}>delete</button>
              ` : ''}
            </section>
          `}
        </div>
      </header>
      <main @class=${{
        'mdc-top-app-bar--fixed-adjust': true,
      }}>
        <ol @class=${{
          'app-card-collection': true,
          entries: true,
          idle: entryMode === EntryMode.idle,
        }}>
          ${entries.map(({ amount, editing, name }, idx) => html`
            <li @class=${{
              'mdc-card': true,
            }} @dataset=${{
              idx: String(idx),
            }}>
              <div @class=${{
                'mdc-card__primary-action': entryMode === EntryMode.idle,
              }} @hook=${{
                insert: (vnode) => {
                  // eslint-disable-next-line no-new
                  new MDCRipple(vnode.elm);
                },
              }}>
                <div @class=${{
                  'app-card__text': true,
                }}>
                  <span @class=${{
                    'app-card__icon': true,
                    'material-icons': true,
                  }} @attrs=${{
                    'aria-hidden': true,
                  }}>store</span>
                  ${editing ? html`
                    <label @class=${{
                      'mdc-text-field': true,
                      'mdc-text-field--filled': true,
                    }} @hook=${{
                      insert: (vnode) => {
                        // eslint-disable-next-line no-new
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
                      }}>Name</span>
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
                    }}>${name}</span>
                  `}
                  ${editing ? html`
                    <label @class=${{
                      'mdc-text-field': true,
                      'mdc-text-field--filled': true,
                      'app-card__text--align-right': true,
                    }} @hook=${{
                      insert: (vnode) => {
                        // eslint-disable-next-line no-new
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
                      }}>Amount</span>
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
                          // eslint-disable-next-line no-new
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
                    }}>${amount.format()}</span>
                  `}
                </div>
              </div>
            </li>
          `)}
        </ol>
      </main>
      ${entryMode === EntryMode.idle ? html`
        <button @class=${{
          'mdc-fab': true,
          'mdc-elevation--z6': true,
          'app-fab--fixed': true,
          add: true,
        }} @attrs=${{
          'aria-label': 'Add entry',
        }} @hook=${{
          insert: (vnode) => {
            // eslint-disable-next-line no-new
            new MDCRipple(vnode.elm);
          },
        }}>
          <div @class=${{
            'mdc-fab__ripple': true,
          }}></div>
          <span @class=${{
            'mdc-fab__icon': true,
            'material-icons': true,
          }}>add</span>
        </button>
      ` : ''}
    </div>
  `);

  const initReducer$ = xs.of((_prevState) => ({
    balance: currency(0),
    entries: [
    ],
    entryMode: EntryMode.idle,
  }));
  const addButtonClickEvent$ = sources.DOM.select('button.add').events('click');
  const addEntryReducer$ = addButtonClickEvent$.map((_ev) => (prevState) => ({
    ...prevState,
    entries: [
      ...prevState.entries,
      {
        amount: currency(0),
        draft: true,
        editing: true,
        name: '',
      },
    ],
    entryMode: EntryMode.add,
  }));
  const entryCardClickEvent$ = sources.DOM.select('ol.entries.idle > li').events('click');
  const editEntryReducer$ = entryCardClickEvent$.map((ev) => {
    const entryIdx = Number(ev.ownerTarget.dataset.idx);

    return (prevState) => ({
      ...prevState,
      entries: prevState.entries.map((entry, idx) => (idx === entryIdx ? {
        ...entry,
        editing: true,
      } : entry)),
      entryMode: EntryMode.edit,
    });
  });
  const nameTextFieldInputEvent$ = sources.DOM.select('input.name').events('input');
  const updateNameReducer$ = nameTextFieldInputEvent$.map((ev) => {
    const inputValue = ev.ownerTarget.value;
    const entryIdx = Number(ev.ownerTarget.closest('li').dataset.idx);

    return (prevState) => ({
      ...prevState,
      entries: prevState.entries.map((entry, idx) => (idx === entryIdx ? {
        ...entry,
        name: inputValue,
      } : entry)),
    });
  });
  const amountTextFieldInputEvent$ = sources.DOM.select('input.amount').events('input');
  const updateAmountReducer$ = amountTextFieldInputEvent$.map((ev) => {
    const inputValue = ev.ownerTarget.value;
    const entryIdx = Number(ev.ownerTarget.closest('li').dataset.idx);

    return (prevState) => ({
      ...prevState,
      entries: prevState.entries.map((entry, idx) => (idx === entryIdx ? {
        ...entry,
        amount: currency(inputValue),
      } : entry)),
    });
  });
  const saveButtonClickEvent$ = sources.DOM.select('button.save').events('click');
  const saveEntryReducer$ = saveButtonClickEvent$.map((_ev) => (prevState) => {
    const entries = prevState.entries.map((entry) => (entry.editing ? {
      ...entry,
      draft: false,
      editing: false,
    } : entry));

    return ({
      ...prevState,
      balance: entries.reduce((acc, entry) => acc.add(entry.amount), currency(0)),
      entries,
      entryMode: EntryMode.idle,
    });
  });
  const deleteButtonClickEvent$ = sources.DOM.select('button.delete').events('click');
  const deleteEntryReducer$ = deleteButtonClickEvent$.map((_ev) => (prevState) => {
    const entries = prevState.entries.filter((entry) => !entry.editing);

    return ({
      ...prevState,
      balance: entries.reduce((acc, entry) => acc.add(entry.amount), currency(0)),
      entries,
      entryMode: EntryMode.idle,
    });
  });
  const closeButtonClickEvent$ = sources.DOM.select('button.close').events('click');
  const cancelAddReducer$ = closeButtonClickEvent$.map((_ev) => (prevState) => ({
    ...prevState,
    entries: prevState.entries.filter((entry) => !entry.draft),
    entryMode: EntryMode.idle,
  }));
  const cancelEditReducer$ = closeButtonClickEvent$.compose(sampleCombine(savedEntries$))
    .map(([_ev, savedEntries]) => (prevState) => ({
      ...prevState,
      entries: savedEntries,
      entryMode: EntryMode.idle,
    }));

  const reducer$ = xs.merge(
    initReducer$,
    addEntryReducer$,
    editEntryReducer$,
    updateNameReducer$,
    updateAmountReducer$,
    saveEntryReducer$,
    deleteEntryReducer$,
    cancelAddReducer$,
    cancelEditReducer$,
  );

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
