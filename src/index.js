import _sampleCombine from 'xstream/extra/sampleCombine';
import _xs from 'xstream';
import { makeDOMDriver } from '@cycle/dom';
import { MDCRipple } from '@material/ripple';
import { MDCTextField } from '@material/textfield';
import { MDCTopAppBar } from '@material/top-app-bar';
import { run } from '@cycle/run';
import { v4 as uuidv4 } from 'uuid';
import { withState } from '@cycle/state';
import AutoNumeric from 'autonumeric';
import currency from 'currency.js';
import html from 'snabby';

import { makeOrbitDBDriver } from './drivers/orbit-db/index.js';

/** @type {import('xstream/extra/sampleCombine').default} */
const sampleCombine = _sampleCombine.default || _sampleCombine;
/** @type {typeof import('xstream').Stream} */
const xs = _xs.default || _xs;

const EntryMode = {
  add: Symbol('add'),
  edit: Symbol('edit'),
  idle: Symbol('idle'),
};

/**
 * @param {Object}                                              sources
 * @param {import('@cycle/dom').DOMSource}                      sources.DOM
 * @param {import('./drivers/orbit-db/index.js').OrbitDBSource} sources.orbitdb
 * @param {import('@cycle/state').StateSource}                  sources.state
 */
function main(sources) {
  const state$ = sources.state.stream;

  const entries$ = sources.orbitdb.docs('entries').query((_doc) => true);

  const vdom$ = xs.combine(entries$, state$).map(([entries, { balance, currentEntry, entryMode }]) => html`
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
          ${[...(currentEntry?.draft ? [currentEntry] : []), ...entries].map((entry) => ({
              ...entry,
              amount: currency(entry.amount),
            })).map(({ _id: entryId, amount, name }) => html`
            <li @class=${{
              'mdc-card': true,
            }} @dataset=${{
              id: entryId,
            }}>
              <div @class=${{
                'mdc-card__primary-action': entryMode === EntryMode.idle,
                'mdc-layout-grid': true,
                'app-card__layout-grid': true,
              }} @hook=${{
                insert: (vnode) => {
                  // eslint-disable-next-line no-new
                  new MDCRipple(vnode.elm);
                },
              }}>
                <div @class=${{
                  'mdc-layout-grid__inner': true,
                  'app-card__text': true,
                }}>
                  <span @class=${{
                    'mdc-layout-grid__cell': true,
                    'mdc-layout-grid__cell--span-1-phone': true,
                    'mdc-layout-grid__cell--span-1-tablet': true,
                    'mdc-layout-grid__cell--span-1-desktop': true,
                    'app-card__icon': true,
                    'material-icons': true,
                  }} @attrs=${{
                    'aria-hidden': true,
                  }}>store</span>
                  ${entryId === currentEntry?._id ? html`
                    <label @class=${{
                      'mdc-text-field': true,
                      'mdc-text-field--filled': true,
                      'mdc-layout-grid__cell': true,
                      'mdc-layout-grid__cell--span-4-phone': true,
                      'mdc-layout-grid__cell--span-5-tablet': true,
                      'mdc-layout-grid__cell--span-9-desktop': true,
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
                      'mdc-layout-grid__cell': true,
                      'mdc-layout-grid__cell--span-2-phone': true,
                      'mdc-layout-grid__cell--span-6-tablet': true,
                      'mdc-layout-grid__cell--span-9-desktop': true,
                      'mdc-typography': true,
                      'mdc-typography--headline6': true,
                    }}>${name}</span>
                  `}
                  ${entryId === currentEntry?._id ? html`
                    <label @class=${{
                      'mdc-text-field': true,
                      'mdc-text-field--filled': true,
                      'mdc-layout-grid__cell': true,
                      'mdc-layout-grid__cell--span-2-phone': true,
                      'mdc-layout-grid__cell--span-2-tablet': true,
                      'mdc-layout-grid__cell--span-2-desktop': true,
                      // 'app-card__text--align-right': true,
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
                      'mdc-layout-grid__cell': true,
                      'mdc-layout-grid__cell--span-1-phone': true,
                      'mdc-layout-grid__cell--span-1-tablet': true,
                      'mdc-layout-grid__cell--span-2-desktop': true,
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

  const initReducer$ = entries$.map((entries) => (prevState) => ({
    ...prevState,
    balance: entries.reduce((acc, entry) => acc.add(entry.amount), currency(0)),
    entryMode: prevState?.entryMode ?? EntryMode.idle,
  }));
  const addButtonClickEvent$ = sources.DOM.select('button.add').events('click');
  const addEntryReducer$ = addButtonClickEvent$.map((_ev) => (prevState) => ({
    ...prevState,
    currentEntry: {
      _id: uuidv4(),
      amount: currency(0).value,
      draft: true,
      name: '',
    },
    entryMode: EntryMode.add,
  }));
  const entryCardClickEvent$ = sources.DOM.select('ol.entries.idle > li').events('click');
  const editEntryReducer$ = entryCardClickEvent$
    .compose(sampleCombine(entries$))
    .map(([ev, entries]) => {
      const entryId = ev.ownerTarget.dataset.id;
      const currentEntry = entries.find((entry) => entry._id === entryId);

      return (prevState) => ({
        ...prevState,
        currentEntry,
        entryMode: EntryMode.edit,
      });
    });
  const nameTextFieldInputEvent$ = sources.DOM.select('input.name').events('input');
  const updateNameReducer$ = nameTextFieldInputEvent$.map((ev) => {
    const inputValue = ev.ownerTarget.value;

    return (prevState) => ({
      ...prevState,
      currentEntry: {
        ...prevState.currentEntry,
        name: inputValue,
      },
    });
  });
  const amountTextFieldInputEvent$ = sources.DOM.select('input.amount').events('input');
  const updateAmountReducer$ = amountTextFieldInputEvent$.map((ev) => {
    const inputValue = ev.ownerTarget.value;

    return (prevState) => ({
      ...prevState,
      currentEntry: {
        ...prevState.currentEntry,
        amount: currency(inputValue).value,
      },
    });
  });
  const saveButtonClickEvent$ = sources.DOM.select('button.save').events('click');
  const saveEntryOperation$ = saveButtonClickEvent$
    .compose(sampleCombine(state$))
    .map(([_ev, {
      currentEntry: {
        _id: entryId,
        amount,
        name,
      },
    }]) => (
      sources.orbitdb.docs('entries').put({
        _id: entryId,
        amount,
        name,
      })
    ));
  const saveEntryReducer$ = saveButtonClickEvent$
    .compose(sampleCombine(state$))
    .map(([_ev, { currentEntry: { _id: entryId } }]) => (
      entries$.filter((entries) => (
        entries.some((entry) => entry._id === entryId)
      ))
    ))
    .flatten()
    .map((_entries) => (prevState) => ({
      ...prevState,
      currentEntry: null,
      entryMode: EntryMode.idle,
    }));
  const deleteButtonClickEvent$ = sources.DOM.select('button.delete').events('click');
  const deleteEntryOperation$ = deleteButtonClickEvent$
    .compose(sampleCombine(state$))
    .map(([_ev, { currentEntry: { _id: entryId } }]) => (
      sources.orbitdb.docs('entries').del(entryId)
    ));
  const deleteEntryReducer$ = deleteButtonClickEvent$.map((_ev) => (prevState) => ({
    ...prevState,
    currentEntry: null,
    entryMode: EntryMode.idle,
  }));
  const closeButtonClickEvent$ = sources.DOM.select('button.close').events('click');
  const cancelAddReducer$ = closeButtonClickEvent$.map((_ev) => (prevState) => ({
    ...prevState,
    currentEntry: null,
    entryMode: EntryMode.idle,
  }));
  const cancelEditReducer$ = closeButtonClickEvent$.map((_ev) => (prevState) => ({
    ...prevState,
    currentEntry: null,
    entryMode: EntryMode.idle,
  }));

  const operation$ = xs.merge(
    saveEntryOperation$,
    deleteEntryOperation$,
  );
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
    orbitdb: operation$,
    state: reducer$,
  };

  return sinks;
}

const wrappedMain = withState(main);

const drivers = {
  DOM: makeDOMDriver('#app'),
  orbitdb: makeOrbitDBDriver(),
};

run(wrappedMain, drivers);
