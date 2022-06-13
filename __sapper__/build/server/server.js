'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var sirv = _interopDefault(require('sirv'));
var polka = _interopDefault(require('polka'));
var bodyParser = _interopDefault(require('body-parser'));
var compression = _interopDefault(require('compression'));
var fs = _interopDefault(require('fs'));
var path = _interopDefault(require('path'));
var moment = _interopDefault(require('moment'));
var Stream$1 = _interopDefault(require('stream'));
var http = _interopDefault(require('http'));
var Url$1 = _interopDefault(require('url'));
var https = _interopDefault(require('https'));
var zlib = _interopDefault(require('zlib'));
var buffer$1 = _interopDefault(require('buffer'));
var crypto = _interopDefault(require('crypto'));
var tty = _interopDefault(require('tty'));
var util = _interopDefault(require('util'));
var net = _interopDefault(require('net'));
var events = _interopDefault(require('events'));
var constants = _interopDefault(require('constants'));
var assert = _interopDefault(require('assert'));
var os = _interopDefault(require('os'));
var child_process = _interopDefault(require('child_process'));

function post(req, res) {
  delete req.session.user;
  // return "logout";
  res.end(JSON.stringify({ ok: true }));
}

var route_0 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  post: post
});

function noop() { }
function is_promise(value) {
    return value && typeof value === 'object' && typeof value.then === 'function';
}
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function subscribe(store, ...callbacks) {
    if (store == null) {
        return noop;
    }
    const unsub = store.subscribe(...callbacks);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function get_store_value(store) {
    let value;
    subscribe(store, _ => value = _)();
    return value;
}
function compute_rest_props(props, keys) {
    const rest = {};
    keys = new Set(keys);
    for (const k in props)
        if (!keys.has(k) && k[0] !== '$')
            rest[k] = props[k];
    return rest;
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error('Function called outside component initialization');
    return current_component;
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}
function afterUpdate(fn) {
    get_current_component().$$.after_update.push(fn);
}
function setContext(key, context) {
    get_current_component().$$.context.set(key, context);
}
function getContext(key) {
    return get_current_component().$$.context.get(key);
}

// source: https://html.spec.whatwg.org/multipage/indices.html
const boolean_attributes = new Set([
    'allowfullscreen',
    'allowpaymentrequest',
    'async',
    'autofocus',
    'autoplay',
    'checked',
    'controls',
    'default',
    'defer',
    'disabled',
    'formnovalidate',
    'hidden',
    'ismap',
    'loop',
    'multiple',
    'muted',
    'nomodule',
    'novalidate',
    'open',
    'playsinline',
    'readonly',
    'required',
    'reversed',
    'selected'
]);

const invalid_attribute_name_character = /[\s'">/=\u{FDD0}-\u{FDEF}\u{FFFE}\u{FFFF}\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/u;
// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
// https://infra.spec.whatwg.org/#noncharacter
function spread(args, classes_to_add) {
    const attributes = Object.assign({}, ...args);
    if (classes_to_add) {
        if (attributes.class == null) {
            attributes.class = classes_to_add;
        }
        else {
            attributes.class += ' ' + classes_to_add;
        }
    }
    let str = '';
    Object.keys(attributes).forEach(name => {
        if (invalid_attribute_name_character.test(name))
            return;
        const value = attributes[name];
        if (value === true)
            str += ' ' + name;
        else if (boolean_attributes.has(name.toLowerCase())) {
            if (value)
                str += ' ' + name;
        }
        else if (value != null) {
            str += ` ${name}="${String(value).replace(/"/g, '&#34;').replace(/'/g, '&#39;')}"`;
        }
    });
    return str;
}
const escaped = {
    '"': '&quot;',
    "'": '&#39;',
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
};
function escape(html) {
    return String(html).replace(/["'&<>]/g, match => escaped[match]);
}
function each(items, fn) {
    let str = '';
    for (let i = 0; i < items.length; i += 1) {
        str += fn(items[i], i);
    }
    return str;
}
const missing_component = {
    $$render: () => ''
};
function validate_component(component, name) {
    if (!component || !component.$$render) {
        if (name === 'svelte:component')
            name += ' this={...}';
        throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
    }
    return component;
}
let on_destroy;
function create_ssr_component(fn) {
    function $$render(result, props, bindings, slots) {
        const parent_component = current_component;
        const $$ = {
            on_destroy,
            context: new Map(parent_component ? parent_component.$$.context : []),
            // these will be immediately discarded
            on_mount: [],
            before_update: [],
            after_update: [],
            callbacks: blank_object()
        };
        set_current_component({ $$ });
        const html = fn(result, props, bindings, slots);
        set_current_component(parent_component);
        return html;
    }
    return {
        render: (props = {}, options = {}) => {
            on_destroy = [];
            const result = { title: '', head: '', css: new Set() };
            const html = $$render(result, props, {}, options);
            run_all(on_destroy);
            return {
                html,
                css: {
                    code: Array.from(result.css).map(css => css.code).join('\n'),
                    map: null // TODO
                },
                head: result.title + result.head
            };
        },
        $$render
    };
}
function add_attribute(name, value, boolean) {
    if (value == null || (boolean && !value))
        return '';
    return ` ${name}${value === true ? '' : `=${typeof value === 'string' ? JSON.stringify(escape(value)) : `"${value}"`}`}`;
}

const subscriber_queue = [];
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
function writable(value, start = noop) {
    let stop;
    const subscribers = [];
    function set(new_value) {
        if (safe_not_equal(value, new_value)) {
            value = new_value;
            if (stop) { // store is ready
                const run_queue = !subscriber_queue.length;
                for (let i = 0; i < subscribers.length; i += 1) {
                    const s = subscribers[i];
                    s[1]();
                    subscriber_queue.push(s, value);
                }
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 2) {
                        subscriber_queue[i][0](subscriber_queue[i + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    function update(fn) {
        set(fn(value));
    }
    function subscribe(run, invalidate = noop) {
        const subscriber = [run, invalidate];
        subscribers.push(subscriber);
        if (subscribers.length === 1) {
            stop = start(set) || noop;
        }
        run(value);
        return () => {
            const index = subscribers.indexOf(subscriber);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
            if (subscribers.length === 0) {
                stop();
                stop = null;
            }
        };
    }
    return { set, update, subscribe };
}

const CONTEXT_KEY = {};

/* src/node_modules/@simple-svelte-autocomplete/src/SimpleAutocomplete.svelte generated by Svelte v3.29.4 */

const css = {
	code: ".autocomplete.svelte-6srlhw.svelte-6srlhw{min-width:200px}.autocomplete.svelte-6srlhw .svelte-6srlhw{box-sizing:border-box}.autocomplete-input.svelte-6srlhw.svelte-6srlhw{font:inherit;width:100%;height:100%;padding:5px 11px}.autocomplete-list.svelte-6srlhw.svelte-6srlhw{background:#fff;position:relative;width:100%;overflow-y:auto;z-index:99;padding:10px 0;top:0px;border:1px solid #999;max-height:calc(15 * (1rem + 10px) + 15px);user-select:none}.autocomplete-list.svelte-6srlhw.svelte-6srlhw:empty{padding:0}.autocomplete-list-item.svelte-6srlhw.svelte-6srlhw{padding:5px 15px;color:#333;cursor:pointer;line-height:1}.autocomplete-list-item.svelte-6srlhw.svelte-6srlhw:hover,.autocomplete-list-item.selected.svelte-6srlhw.svelte-6srlhw{background-color:#fafafa;color:#999}.autocomplete-list-item-no-results.svelte-6srlhw.svelte-6srlhw{padding:5px 15px;color:#999;line-height:1}.autocomplete-list.hidden.svelte-6srlhw.svelte-6srlhw{display:none}@media screen and (max-width: 3841px){.tag-text-ac.svelte-6srlhw.svelte-6srlhw{font-size:0.65vw !important}}@media screen and (max-width: 2561px){.tag-text-ac.svelte-6srlhw.svelte-6srlhw{font-size:0.65vw !important}}@media screen and (max-width: 1921px){.tag-text-ac.svelte-6srlhw.svelte-6srlhw{font-size:0.85vw !important}}@media screen and (max-width: 1681px){.tag-text-ac.svelte-6srlhw.svelte-6srlhw{font-size:0.85vw !important}}@media screen and (max-width: 1441px){.tag-text-ac.svelte-6srlhw.svelte-6srlhw{font-size:0.85vw !important}}@media screen and (max-width: 1367px){.tag-text-ac.svelte-6srlhw.svelte-6srlhw{font-size:0.75vw !important}}@media screen and (max-width: 1281px){.tag-text-ac.svelte-6srlhw.svelte-6srlhw{font-size:0.65vw !important}}@media screen and (max-width: 1025px){.tag-text-ac.svelte-6srlhw.svelte-6srlhw{font-size:0.45vw !important}}.tag-text-ac.svelte-6srlhw.svelte-6srlhw{font-size:0.85vw}",
	map: "{\"version\":3,\"file\":\"SimpleAutocomplete.svelte\",\"sources\":[\"SimpleAutocomplete.svelte\"],\"sourcesContent\":[\"<script>\\n  // the list of items  the user can select from\\n  export let items;\\n\\n  // field of each item that's used for the labels in the list\\n  export let labelFieldName = undefined;\\n  export let keywordsFieldName = labelFieldName;\\n  export let valueFieldName = undefined;\\n\\n  export let labelFunction = function(item) {\\n    if (item === undefined || item === null) {\\n      return \\\"\\\";\\n    }\\n    return labelFieldName ? item[labelFieldName] : item;\\n    //return \\\"Press enter to go to \\\"+labelFieldName ? item[labelFieldName] : item;\\n  };\\n\\n  export let keywordsFunction = function(item) {\\n    if (item === undefined || item === null) {\\n      return \\\"\\\";\\n    }\\n    return keywordsFieldName ? item[keywordsFieldName] : item;\\n  };\\n\\n  export let valueFunction = function(item) {\\n    if (item === undefined || item === null) {\\n      return item;\\n    }\\n    return valueFieldName ? item[valueFieldName] : item;\\n  };\\n\\n  export let keywordsCleanFunction = function(keywords) {\\n    return keywords;\\n  };\\n\\n  export let textCleanFunction = function(userEnteredText) {\\n    return userEnteredText;\\n  };\\n\\n  export let beforeChange = function(oldSelectedItem, newSelectedItem) {\\n    return true;\\n  };\\n  export let onChange = function(newSelectedItem) {};\\n\\n  export let selectFirstIfEmpty = false;\\n\\n  export let minCharactersToSearch = 1;\\n  export let maxItemsToShowInList = 0;\\n  export let noResultsText = \\\"No results found\\\";\\n\\n  const uniqueId = \\\"sautocomplete-\\\" + Math.floor(Math.random() * 1000);\\n\\n  function safeStringFunction(theFunction, argument) {\\n    if (typeof theFunction !== \\\"function\\\") {\\n      console.error(\\n        \\\"Not a function: \\\" + theFunction + \\\", argument: \\\" + argument\\n      );\\n    }\\n    let originalResult;\\n    try {\\n      originalResult = theFunction(argument);\\n    } catch (error) {\\n      console.warn(\\n        \\\"Error executing Autocomplete function on value: \\\" +\\n          argument +\\n          \\\" function: \\\" +\\n          theFunction\\n      );\\n    }\\n    let result = originalResult;\\n    if (result === undefined || result === null) {\\n      result = \\\"\\\";\\n    }\\n    if (typeof result !== \\\"string\\\") {\\n      result = result.toString();\\n    }\\n    return result;\\n  }\\n\\n  function safeLabelFunction(item) {\\n    // console.log(\\\"labelFunction: \\\" + labelFunction);\\n    // console.log(\\\"safeLabelFunction, item: \\\" + item);\\n    return safeStringFunction(labelFunction, item);\\n  }\\n\\n  function safeKeywordsFunction(item) {\\n    // console.log(\\\"safeKeywordsFunction\\\");\\n    const keywords = safeStringFunction(keywordsFunction, item);\\n    let result = safeStringFunction(keywordsCleanFunction, keywords);\\n    result = result.toLowerCase().trim();\\n    if (debug) {\\n      console.log(\\n        \\\"Extracted keywords: '\\\" +\\n          result +\\n          \\\"' from item: \\\" +\\n          JSON.stringify(item)\\n      );\\n    }\\n    return result;\\n  }\\n\\n  // the text displayed when no option is selected\\n  export let placeholder = undefined;\\n  // apply a className to the control\\n  export let className = undefined;\\n  // generate an HTML input with this name, containing the current value\\n  export let name = undefined;\\n  // adds the disabled tag to the HTML input\\n  export let disabled = false;\\n  // add the title to the HTML input\\n  export let title = undefined;\\n  export let debug = false;\\n\\n  // selected item state\\n  export let selectedItem = undefined;\\n  export let value = undefined;\\n  let text;\\n  let filteredTextLength = 0;\\n\\n  function onSelectedItemChanged() {\\n    value = valueFunction(selectedItem);\\n    text = safeLabelFunction(selectedItem);\\n    onChange(selectedItem);\\n  }\\n\\n  $: selectedItem, onSelectedItemChanged();\\n\\n  // HTML elements\\n  let input;\\n  let list;\\n\\n  // UI state\\n  let opened = false;\\n  let highlightIndex = -1;\\n\\n  // view model\\n  let filteredListItems;\\n\\n  let listItems = [];\\n\\n  function prepareListItems() {\\n    let tStart;\\n    if (debug) {\\n      tStart = performance.now();\\n      console.log(\\\"prepare items to search\\\");\\n      console.log(\\\"items: \\\" + JSON.stringify(items));\\n    }\\n    const length = items ? items.length : 0;\\n    listItems = new Array(length);\\n\\n    if (length > 0) {\\n      items.forEach((item, i) => {\\n        listItems[i] = getListItem(item);\\n      });\\n    }\\n\\n    if (debug) {\\n      const tEnd = performance.now();\\n      console.log(\\n        listItems.length +\\n          \\\" items to search prepared in \\\" +\\n          (tEnd - tStart) +\\n          \\\" milliseconds\\\"\\n      );\\n    }\\n  }\\n\\n  function getListItem(item) {\\n    return {\\n      // keywords representation of the item\\n      keywords: safeKeywordsFunction(item),\\n      // item label\\n      label: safeLabelFunction(item),\\n      // store reference to the origial item\\n      item: item\\n    };\\n  }\\n\\n  $: items, prepareListItems();\\n\\n  function prepareUserEnteredText(userEnteredText) {\\n    if (userEnteredText === undefined || userEnteredText === null) {\\n      return \\\"\\\";\\n    }\\n\\n    const textFiltered = userEnteredText\\n      .replace(/[&/\\\\\\\\#,+()$~%.'\\\":*?<>{}]/g, \\\" \\\")\\n      .trim();\\n\\n    filteredTextLength = textFiltered.length;\\n\\n    if (minCharactersToSearch > 1) {\\n      if (filteredTextLength < minCharactersToSearch) {\\n        return \\\"\\\";\\n      }\\n    }\\n\\n    const cleanUserEnteredText = textCleanFunction(textFiltered);\\n    const textFilteredLowerCase = cleanUserEnteredText.toLowerCase().trim();\\n\\n    if (debug) {\\n      console.log(\\n        \\\"Change user entered text '\\\" +\\n          userEnteredText +\\n          \\\"' into '\\\" +\\n          textFilteredLowerCase +\\n          \\\"'\\\"\\n      );\\n    }\\n    return textFilteredLowerCase;\\n  }\\n\\n  function search() {\\n    let tStart;\\n    if (debug) {\\n      tStart = performance.now();\\n      console.log(\\\"Searching user entered text: '\\\" + text + \\\"'\\\");\\n    }\\n\\n    const textFiltered = prepareUserEnteredText(text);\\n\\n    if (textFiltered === \\\"\\\") {\\n      filteredListItems = listItems;\\n      closeIfMinCharsToSearchReached();\\n      if (debug) {\\n        console.log(\\n          \\\"User entered text is empty set the list of items to all items\\\"\\n        );\\n      }\\n      return;\\n    }\\n\\n    const searchWords = textFiltered.split(\\\" \\\");\\n\\n    let tempfilteredListItems = listItems.filter(listItem => {\\n      const itemKeywords = listItem.keywords;\\n\\n      let matches = 0;\\n      searchWords.forEach(searchWord => {\\n        if (itemKeywords.includes(searchWord)) {\\n          matches++;\\n        }\\n      });\\n\\n      return matches >= searchWords.length;\\n    });\\n\\n    const hlfilter = highlightFilter(textFiltered, [\\\"label\\\"]);\\n    const filteredListItemsHighlighted = tempfilteredListItems.map(hlfilter);\\n\\n    filteredListItems = filteredListItemsHighlighted;\\n    closeIfMinCharsToSearchReached();\\n    if (debug) {\\n      const tEnd = performance.now();\\n      console.log(\\n        \\\"Search took \\\" +\\n          (tEnd - tStart) +\\n          \\\" milliseconds, found \\\" +\\n          filteredListItems.length +\\n          \\\" items\\\"\\n      );\\n    }\\n  }\\n\\n  // $: text, search();\\n\\n  function selectListItem(listItem) {\\n    if (debug) {\\n      console.log(\\\"selectListItem\\\");\\n    }\\n    const newSelectedItem = listItem.item;\\n    if (beforeChange(selectedItem, newSelectedItem)) {\\n      selectedItem = newSelectedItem;\\n    }\\n  }\\n\\n  function selectItem() {\\n    if (debug) {\\n      console.log(\\\"selectItem\\\");\\n    }\\n    const listItem = filteredListItems[highlightIndex];\\n    selectListItem(listItem);\\n    close();\\n  }\\n\\n  function up() {\\n    if (debug) {\\n      console.log(\\\"up\\\");\\n    }\\n\\n    open();\\n    if (highlightIndex > 0) highlightIndex--;\\n    highlight();\\n  }\\n\\n  function down() {\\n    if (debug) {\\n      console.log(\\\"down\\\");\\n    }\\n\\n    open();\\n    if (highlightIndex < filteredListItems.length - 1) highlightIndex++;\\n    highlight();\\n  }\\n\\n  function highlight() {\\n    if (debug) {\\n      console.log(\\\"highlight\\\");\\n    }\\n\\n    const query = \\\".selected\\\";\\n    if (debug) {\\n      console.log(\\\"Seaching DOM element: \\\" + query + \\\" in \\\" + list);\\n    }\\n    const el = list.querySelector(query);\\n    if (el) {\\n      if (typeof el.scrollIntoViewIfNeeded === \\\"function\\\") {\\n        if (debug) {\\n          console.log(\\\"Scrolling selected item into view\\\");\\n        }\\n        el.scrollIntoViewIfNeeded();\\n      } else {\\n        if (debug) {\\n          console.warn(\\n            \\\"Could not scroll selected item into view, scrollIntoViewIfNeeded not supported\\\"\\n          );\\n        }\\n      }\\n    } else {\\n      if (debug) {\\n        console.warn(\\\"Selected item not found to scroll into view\\\");\\n      }\\n    }\\n  }\\n\\n  function onListItemClick(listItem) {\\n    if (debug) {\\n      console.log(\\\"onListItemClick\\\");\\n    }\\n\\n    console.log(listItem);\\n    selectListItem(listItem);\\n    close();\\n  }\\n\\n  function onDocumentClick(e) {\\n    if (debug) {\\n      console.log(\\\"onDocumentClick: \\\" + JSON.stringify(e.target));\\n    }\\n    if (e.target.closest(\\\".\\\" + uniqueId)) {\\n      if (debug) {\\n        console.log(\\\"onDocumentClick inside\\\");\\n      }\\n      // resetListToAllItemsAndOpen();\\n      highlight();\\n    } else {\\n      if (debug) {\\n        console.log(\\\"onDocumentClick outside\\\");\\n      }\\n      close();\\n    }\\n  }\\n\\n  function onKeyDown(e) {\\n    if (debug) {\\n      console.log(\\\"onKeyDown\\\");\\n    }\\n\\n    let key = e.key;\\n    if (key === \\\"Tab\\\" && e.shiftKey) key = \\\"ShiftTab\\\";\\n    const fnmap = {\\n      Tab: opened ? down.bind(this) : null,\\n      ShiftTab: opened ? up.bind(this) : null,\\n      ArrowDown: down.bind(this),\\n      ArrowUp: up.bind(this),\\n      Escape: onEsc.bind(this)\\n    };\\n    const fn = fnmap[key];\\n    if (typeof fn === \\\"function\\\") {\\n      e.preventDefault();\\n      fn(e);\\n    }\\n  }\\n\\n  function onKeyPress(e) {\\n    if (debug) {\\n      console.log(\\\"onKeyPress\\\");\\n    }\\n\\n    if (e.key === \\\"Enter\\\") {\\n      e.preventDefault();\\n      selectItem();\\n    }\\n  }\\n\\n  function onInput(e) {\\n    if (debug) {\\n      console.log(\\\"onInput\\\");\\n    }\\n\\n    text = e.target.value;\\n    search();\\n    highlightIndex = 0;\\n    open();\\n  }\\n\\n  function onInputClick() {\\n    if (debug) {\\n      console.log(\\\"onInputClick\\\");\\n    }\\n    resetListToAllItemsAndOpen();\\n  }\\n\\n  function onEsc(e) {\\n    if (debug) {\\n      console.log(\\\"onEsc\\\");\\n    }\\n\\n    //if (text) return clear();\\n    e.stopPropagation();\\n    if (opened) {\\n      input.focus();\\n      close();\\n    }\\n  }\\n\\n  function onFocus() {\\n    if (debug) {\\n      console.log(\\\"onFocus\\\");\\n    }\\n\\n    resetListToAllItemsAndOpen();\\n  }\\n\\n  function resetListToAllItemsAndOpen() {\\n    if (debug) {\\n      console.log(\\\"resetListToAllItemsAndOpen\\\");\\n    }\\n\\n    filteredListItems = listItems;\\n\\n    open();\\n\\n    // find selected item\\n    if (selectedItem) {\\n      if (debug) {\\n        console.log(\\n          \\\"Searching currently selected item: \\\" + JSON.stringify(selectedItem)\\n        );\\n      }\\n      for (let i = 0; i < listItems.length; i++) {\\n        const listItem = listItems[i];\\n        if (debug) {\\n          console.log(\\\"Item \\\" + i + \\\": \\\" + JSON.stringify(listItem));\\n        }\\n        if (selectedItem == listItem.item) {\\n          highlightIndex = i;\\n          if (debug) {\\n            console.log(\\n              \\\"Found selected item: \\\" + i + \\\": \\\" + JSON.stringify(listItem)\\n            );\\n          }\\n          highlight();\\n          break;\\n        }\\n      }\\n    }\\n  }\\n\\n  function open() {\\n    if (debug) {\\n      console.log(\\\"open\\\");\\n    }\\n\\n    // check if the search text has more than the min chars required\\n    if (isMinCharsToSearchReached()) {\\n      return;\\n    }\\n\\n    opened = true;\\n  }\\n\\n  function close() {\\n    if (debug) {\\n      console.log(\\\"close\\\");\\n    }\\n    opened = false;\\n\\n    if (!text && selectFirstIfEmpty) {\\n      highlightFilter = 0;\\n      selectItem();\\n    }\\n  }\\n\\n  function isMinCharsToSearchReached() {\\n    return (\\n      minCharactersToSearch > 1 && filteredTextLength < minCharactersToSearch\\n    );\\n  }\\n\\n  function closeIfMinCharsToSearchReached() {\\n    if (isMinCharsToSearchReached()) {\\n      close();\\n    }\\n  }\\n\\n  function clear() {\\n    if (debug) {\\n      console.log(\\\"clear\\\");\\n    }\\n\\n    text = \\\"\\\";\\n    setTimeout(() => input.focus());\\n  }\\n\\n  function onBlur() {\\n    if (debug) {\\n      console.log(\\\"onBlur\\\");\\n    }\\n    close();\\n  }\\n  // 'item number one'.replace(/(it)(.*)(nu)(.*)(one)/ig, '<b>$1</b>$2 <b>$3</b>$4 <b>$5</b>')\\n  function highlightFilter(q, fields) {\\n    const qs = \\\"(\\\" + q.trim().replace(/\\\\s/g, \\\")(.*)(\\\") + \\\")\\\";\\n    const reg = new RegExp(qs, \\\"ig\\\");\\n    let n = 1;\\n    const len = qs.split(\\\")(\\\").length + 1;\\n    let repl = \\\"\\\";\\n    for (; n < len; n++) repl += n % 2 ? `<b>$${n}</b>` : `$${n}`;\\n\\n    return i => {\\n      const newI = Object.assign({ highlighted: {} }, i);\\n      if (fields) {\\n        fields.forEach(f => {\\n          if (!newI[f]) return;\\n          newI.highlighted[f] = newI[f].replace(reg, repl);\\n        });\\n      }\\n      return newI;\\n    };\\n  }\\n\\n   function truncate(str, n) {\\n    return str.length > n ? str.substr(0, n - 1) + \\\"...\\\" : str;\\n  }\\n\\n</script>\\n\\n<style>\\n  .autocomplete {\\n    min-width: 200px;\\n  }\\n  .autocomplete * {\\n    box-sizing: border-box;\\n  }\\n  .autocomplete-input {\\n    font: inherit;\\n    width: 100%;\\n    height: 100%;\\n    padding: 5px 11px;\\n  }\\n  .autocomplete-list {\\n    background: #fff;\\n    position: relative;\\n    width: 100%;\\n    overflow-y: auto;\\n    z-index: 99;\\n    padding: 10px 0;\\n    top: 0px;\\n    border: 1px solid #999;\\n    max-height: calc(15 * (1rem + 10px) + 15px);\\n    user-select: none;\\n  }\\n  .autocomplete-list:empty {\\n    padding: 0;\\n  }\\n  .autocomplete-list-item {\\n    padding: 5px 15px;\\n    color: #333;\\n    cursor: pointer;\\n    line-height: 1;\\n  }\\n\\n  .autocomplete-list-item:hover,\\n  .autocomplete-list-item.selected {\\n    background-color: #fafafa;\\n    color: #999;\\n  }\\n  .autocomplete-list-item-no-results {\\n    padding: 5px 15px;\\n    color: #999;\\n    line-height: 1;\\n  }\\n\\n  .autocomplete-list.hidden {\\n    display: none;\\n  }\\n\\n\\n@media screen and (max-width: 3841px) {\\n  .tag-text-ac {\\n    font-size: 0.65vw !important;\\n  }\\n} \\n\\n@media screen and (max-width: 2561px) {\\n  .tag-text-ac {\\n    font-size: 0.65vw !important;\\n  }\\n} \\n\\n@media screen and (max-width: 1921px) {\\n  .tag-text-ac {\\n    font-size: 0.85vw !important;\\n  }\\n} \\n\\n@media screen and (max-width: 1681px) {\\n  .tag-text-ac {\\n    font-size: 0.85vw !important;\\n  }\\n}      \\n\\n@media screen and (max-width: 1441px) {\\n  .tag-text-ac {\\n    font-size: 0.85vw !important;\\n  }\\n}     \\n\\n@media screen and (max-width: 1367px) {\\n  .tag-text-ac {\\n    font-size: 0.75vw !important;\\n  }\\n}    \\n\\n@media screen and (max-width: 1281px) {\\n  .tag-text-ac {\\n    font-size: 0.65vw !important;\\n  }\\n}  \\n\\n@media screen and (max-width: 1025px) {\\n  .tag-text-ac {\\n    font-size: 0.45vw !important;\\n  }\\n}\\n\\n\\n.tag-text-ac {\\n    font-size: 0.85vw;\\n  }\\n</style>\\n\\n<div class=\\\"{className} autocomplete select is-fullwidth {uniqueId}\\\">\\n  <input\\n    type=\\\"text\\\"\\n    class=\\\"header-search-input z-depth-2 autocomplete\\\"\\n    {placeholder}\\n    {name}\\n    {disabled}\\n    {title}\\n    bind:this={input}\\n    bind:value={text}\\n    on:input={onInput}\\n    on:focus={onFocus}\\n    on:keydown={onKeyDown}\\n    on:click={onInputClick}\\n    on:keypress={onKeyPress} />\\n\\n\\n\\n  <div\\n    class=\\\"autocomplete-list svelte-gfsz5d {opened ? '' : 'hidden'} is-fullwidth\\\"\\n    bind:this={list}>\\n\\n    {#if filteredListItems && filteredListItems.length > 0}\\n             <div class=\\\"row\\\">\\n\\n            <h6 class=\\\"search-title\\\" style=\\\"margin-bottom: 15px; padding-left: 15px; font-size: 0.90rem; \\\">PEOPLE</h6>\\n\\n          </div>\\n\\n      {#each filteredListItems as listItem, i}\\n        {#if maxItemsToShowInList <= 0 || i < maxItemsToShowInList}\\n         <div class=\\\"auto-suggestion\\\">\\n\\n             <div class=\\\"row\\\">\\n\\n                <div class=\\\"col s12\\\">\\n               <div\\n                  class=\\\"autocomplete-list-item {i === highlightIndex ? 'selected' : ''}\\\"\\n                  on:click={() => onListItemClick(listItem)}>\\n               {#if listItem.highlighted}\\n                <div class=\\\"row\\\">\\n                 <div class=\\\"col s4\\\">\\n                  <span><strong>Person name:</strong></span>\\n                  <span class=\\\"blue-text\\\">{@html listItem.highlighted.label} <small>({listItem.item.name})</small></span>\\n\\n                  </div>\\n\\n                   <div class=\\\"col s2\\\">\\n                   <span style=\\\"\\\">\\n                   <small class=\\\"grey-text\\\">\\n                    <strong>Id:</strong>\\n                    </small>\\n                  </span>\\n                  <span class=\\\"blue-text\\\" ><small>{listItem.item.id}</small></span>\\n                  </div>\\n\\n                  <div class=\\\"col s3\\\">\\n                  <span style=\\\"\\\">\\n                    <strong><small class=\\\"grey-text\\\">Contact:</small></strong>\\n                  </span>\\n                  <span class=\\\"blue-text\\\" ><small>\\n\\n                  {listItem.item.email}\\n\\n                  </small></span>\\n                  </div>\\n\\n                   <div class=\\\"col s3\\\">\\n                \\n                  </div>\\n\\n                 </div>\\n              {:else}\\n\\n\\n              <div class=\\\"row\\\">\\n                     <div class=\\\"col s4\\\">\\n                  <strong>Name:</strong> <span class=\\\"blue-text\\\">{@html listItem.label} <small>({listItem.item.name})</small></span>\\n                 </div>\\n                <div class=\\\"col s2\\\">\\n                  <span>\\n                    <small class=\\\"grey-text\\\">\\n                      <strong>Id:</strong>\\n                    </small>\\n                   </span>\\n                   <small><span class=\\\"blue-text\\\" >{listItem.item.id}</span></small>\\n                 </div>\\n\\n             <div class=\\\"col s3\\\">\\n                <span>\\n                <strong><small class=\\\"grey-text\\\">Contact:</small></strong>  </span>\\n                <span class=\\\"blue-text\\\" >\\n\\n                <small>\\n\\n                                  {listItem.item.email}\\n                </small></span>\\n              </div>\\n\\n                <div class=\\\"col s3\\\">\\n               \\n                </div>\\n\\n\\n             </div>\\n            {/if}\\n          </div>\\n          </div>\\n          </div>\\n\\n          </div>\\n        {/if}\\n      {/each}\\n\\n      {#if maxItemsToShowInList > 0 && filteredListItems.length > maxItemsToShowInList}\\n        <div class=\\\"autocomplete-list-item-no-results\\\">\\n          ...{filteredListItems.length - maxItemsToShowInList} results not shown\\n        </div>\\n      {/if}\\n    {:else if noResultsText}\\n      <div class=\\\"autocomplete-list-item-no-results\\\">{noResultsText}</div>\\n    {/if}\\n  </div>\\n</div>\\n\\n\\n\\n<svelte:window on:click={onDocumentClick} />\\n\"],\"names\":[],\"mappings\":\"AAqiBE,aAAa,4BAAC,CAAC,AACb,SAAS,CAAE,KAAK,AAClB,CAAC,AACD,2BAAa,CAAC,cAAE,CAAC,AACf,UAAU,CAAE,UAAU,AACxB,CAAC,AACD,mBAAmB,4BAAC,CAAC,AACnB,IAAI,CAAE,OAAO,CACb,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,GAAG,CAAC,IAAI,AACnB,CAAC,AACD,kBAAkB,4BAAC,CAAC,AAClB,UAAU,CAAE,IAAI,CAChB,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,IAAI,CACX,UAAU,CAAE,IAAI,CAChB,OAAO,CAAE,EAAE,CACX,OAAO,CAAE,IAAI,CAAC,CAAC,CACf,GAAG,CAAE,GAAG,CACR,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,CACtB,UAAU,CAAE,KAAK,EAAE,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAC3C,WAAW,CAAE,IAAI,AACnB,CAAC,AACD,8CAAkB,MAAM,AAAC,CAAC,AACxB,OAAO,CAAE,CAAC,AACZ,CAAC,AACD,uBAAuB,4BAAC,CAAC,AACvB,OAAO,CAAE,GAAG,CAAC,IAAI,CACjB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,OAAO,CACf,WAAW,CAAE,CAAC,AAChB,CAAC,AAED,mDAAuB,MAAM,CAC7B,uBAAuB,SAAS,4BAAC,CAAC,AAChC,gBAAgB,CAAE,OAAO,CACzB,KAAK,CAAE,IAAI,AACb,CAAC,AACD,kCAAkC,4BAAC,CAAC,AAClC,OAAO,CAAE,GAAG,CAAC,IAAI,CACjB,KAAK,CAAE,IAAI,CACX,WAAW,CAAE,CAAC,AAChB,CAAC,AAED,kBAAkB,OAAO,4BAAC,CAAC,AACzB,OAAO,CAAE,IAAI,AACf,CAAC,AAGH,OAAO,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AACrC,YAAY,4BAAC,CAAC,AACZ,SAAS,CAAE,MAAM,CAAC,UAAU,AAC9B,CAAC,AACH,CAAC,AAED,OAAO,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AACrC,YAAY,4BAAC,CAAC,AACZ,SAAS,CAAE,MAAM,CAAC,UAAU,AAC9B,CAAC,AACH,CAAC,AAED,OAAO,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AACrC,YAAY,4BAAC,CAAC,AACZ,SAAS,CAAE,MAAM,CAAC,UAAU,AAC9B,CAAC,AACH,CAAC,AAED,OAAO,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AACrC,YAAY,4BAAC,CAAC,AACZ,SAAS,CAAE,MAAM,CAAC,UAAU,AAC9B,CAAC,AACH,CAAC,AAED,OAAO,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AACrC,YAAY,4BAAC,CAAC,AACZ,SAAS,CAAE,MAAM,CAAC,UAAU,AAC9B,CAAC,AACH,CAAC,AAED,OAAO,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AACrC,YAAY,4BAAC,CAAC,AACZ,SAAS,CAAE,MAAM,CAAC,UAAU,AAC9B,CAAC,AACH,CAAC,AAED,OAAO,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AACrC,YAAY,4BAAC,CAAC,AACZ,SAAS,CAAE,MAAM,CAAC,UAAU,AAC9B,CAAC,AACH,CAAC,AAED,OAAO,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AACrC,YAAY,4BAAC,CAAC,AACZ,SAAS,CAAE,MAAM,CAAC,UAAU,AAC9B,CAAC,AACH,CAAC,AAGD,YAAY,4BAAC,CAAC,AACV,SAAS,CAAE,MAAM,AACnB,CAAC\"}"
};

function safeStringFunction(theFunction, argument) {
	if (typeof theFunction !== "function") {
		console.error("Not a function: " + theFunction + ", argument: " + argument);
	}

	let originalResult;

	try {
		originalResult = theFunction(argument);
	} catch(error) {
		console.warn("Error executing Autocomplete function on value: " + argument + " function: " + theFunction);
	}

	let result = originalResult;

	if (result === undefined || result === null) {
		result = "";
	}

	if (typeof result !== "string") {
		result = result.toString();
	}

	return result;
}

const SimpleAutocomplete = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { items } = $$props;
	let { labelFieldName = undefined } = $$props;
	let { keywordsFieldName = labelFieldName } = $$props;
	let { valueFieldName = undefined } = $$props;

	let { labelFunction = function (item) {
		if (item === undefined || item === null) {
			return "";
		}

		return labelFieldName ? item[labelFieldName] : item;
	} } = $$props; //return "Press enter to go to "+labelFieldName ? item[labelFieldName] : item;

	let { keywordsFunction = function (item) {
		if (item === undefined || item === null) {
			return "";
		}

		return keywordsFieldName ? item[keywordsFieldName] : item;
	} } = $$props;

	let { valueFunction = function (item) {
		if (item === undefined || item === null) {
			return item;
		}

		return valueFieldName ? item[valueFieldName] : item;
	} } = $$props;

	let { keywordsCleanFunction = function (keywords) {
		return keywords;
	} } = $$props;

	let { textCleanFunction = function (userEnteredText) {
		return userEnteredText;
	} } = $$props;

	let { beforeChange = function (oldSelectedItem, newSelectedItem) {
		return true;
	} } = $$props;

	let { onChange = function (newSelectedItem) {
		
	} } = $$props;

	let { selectFirstIfEmpty = false } = $$props;
	let { minCharactersToSearch = 1 } = $$props;
	let { maxItemsToShowInList = 0 } = $$props;
	let { noResultsText = "No results found" } = $$props;
	const uniqueId = "sautocomplete-" + Math.floor(Math.random() * 1000);

	function safeLabelFunction(item) {
		// console.log("labelFunction: " + labelFunction);
		// console.log("safeLabelFunction, item: " + item);
		return safeStringFunction(labelFunction, item);
	}

	function safeKeywordsFunction(item) {
		// console.log("safeKeywordsFunction");
		const keywords = safeStringFunction(keywordsFunction, item);

		let result = safeStringFunction(keywordsCleanFunction, keywords);
		result = result.toLowerCase().trim();

		if (debug) {
			console.log("Extracted keywords: '" + result + "' from item: " + JSON.stringify(item));
		}

		return result;
	}

	let { placeholder = undefined } = $$props;
	let { className = undefined } = $$props;
	let { name = undefined } = $$props;
	let { disabled = false } = $$props;
	let { title = undefined } = $$props;
	let { debug = false } = $$props;
	let { selectedItem = undefined } = $$props;
	let { value = undefined } = $$props;
	let text;

	function onSelectedItemChanged() {
		value = valueFunction(selectedItem);
		text = safeLabelFunction(selectedItem);
		onChange(selectedItem);
	}

	// HTML elements
	let input;

	let list;

	let listItems = [];

	function prepareListItems() {
		let tStart;

		if (debug) {
			tStart = performance.now();
			console.log("prepare items to search");
			console.log("items: " + JSON.stringify(items));
		}

		const length = items ? items.length : 0;
		listItems = new Array(length);

		if (length > 0) {
			items.forEach((item, i) => {
				listItems[i] = getListItem(item);
			});
		}

		if (debug) {
			const tEnd = performance.now();
			console.log(listItems.length + " items to search prepared in " + (tEnd - tStart) + " milliseconds");
		}
	}

	function getListItem(item) {
		return {
			// keywords representation of the item
			keywords: safeKeywordsFunction(item),
			// item label
			label: safeLabelFunction(item),
			// store reference to the origial item
			item
		};
	}

	if ($$props.items === void 0 && $$bindings.items && items !== void 0) $$bindings.items(items);
	if ($$props.labelFieldName === void 0 && $$bindings.labelFieldName && labelFieldName !== void 0) $$bindings.labelFieldName(labelFieldName);
	if ($$props.keywordsFieldName === void 0 && $$bindings.keywordsFieldName && keywordsFieldName !== void 0) $$bindings.keywordsFieldName(keywordsFieldName);
	if ($$props.valueFieldName === void 0 && $$bindings.valueFieldName && valueFieldName !== void 0) $$bindings.valueFieldName(valueFieldName);
	if ($$props.labelFunction === void 0 && $$bindings.labelFunction && labelFunction !== void 0) $$bindings.labelFunction(labelFunction);
	if ($$props.keywordsFunction === void 0 && $$bindings.keywordsFunction && keywordsFunction !== void 0) $$bindings.keywordsFunction(keywordsFunction);
	if ($$props.valueFunction === void 0 && $$bindings.valueFunction && valueFunction !== void 0) $$bindings.valueFunction(valueFunction);
	if ($$props.keywordsCleanFunction === void 0 && $$bindings.keywordsCleanFunction && keywordsCleanFunction !== void 0) $$bindings.keywordsCleanFunction(keywordsCleanFunction);
	if ($$props.textCleanFunction === void 0 && $$bindings.textCleanFunction && textCleanFunction !== void 0) $$bindings.textCleanFunction(textCleanFunction);
	if ($$props.beforeChange === void 0 && $$bindings.beforeChange && beforeChange !== void 0) $$bindings.beforeChange(beforeChange);
	if ($$props.onChange === void 0 && $$bindings.onChange && onChange !== void 0) $$bindings.onChange(onChange);
	if ($$props.selectFirstIfEmpty === void 0 && $$bindings.selectFirstIfEmpty && selectFirstIfEmpty !== void 0) $$bindings.selectFirstIfEmpty(selectFirstIfEmpty);
	if ($$props.minCharactersToSearch === void 0 && $$bindings.minCharactersToSearch && minCharactersToSearch !== void 0) $$bindings.minCharactersToSearch(minCharactersToSearch);
	if ($$props.maxItemsToShowInList === void 0 && $$bindings.maxItemsToShowInList && maxItemsToShowInList !== void 0) $$bindings.maxItemsToShowInList(maxItemsToShowInList);
	if ($$props.noResultsText === void 0 && $$bindings.noResultsText && noResultsText !== void 0) $$bindings.noResultsText(noResultsText);
	if ($$props.placeholder === void 0 && $$bindings.placeholder && placeholder !== void 0) $$bindings.placeholder(placeholder);
	if ($$props.className === void 0 && $$bindings.className && className !== void 0) $$bindings.className(className);
	if ($$props.name === void 0 && $$bindings.name && name !== void 0) $$bindings.name(name);
	if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0) $$bindings.disabled(disabled);
	if ($$props.title === void 0 && $$bindings.title && title !== void 0) $$bindings.title(title);
	if ($$props.debug === void 0 && $$bindings.debug && debug !== void 0) $$bindings.debug(debug);
	if ($$props.selectedItem === void 0 && $$bindings.selectedItem && selectedItem !== void 0) $$bindings.selectedItem(selectedItem);
	if ($$props.value === void 0 && $$bindings.value && value !== void 0) $$bindings.value(value);
	$$result.css.add(css);

	 {
		(onSelectedItemChanged());
	}

	 {
		(prepareListItems());
	}

	return `<div class="${escape(className) + " autocomplete select is-fullwidth " + escape(uniqueId) + " svelte-6srlhw"}"><input type="${"text"}" class="${"header-search-input z-depth-2 autocomplete svelte-6srlhw"}"${add_attribute("placeholder", placeholder, 0)}${add_attribute("name", name, 0)} ${disabled ? "disabled" : ""}${add_attribute("title", title, 0)}${add_attribute("this", input, 1)}${add_attribute("value", text, 1)}>



  <div class="${"autocomplete-list svelte-gfsz5d " + escape( "hidden") + " is-fullwidth" + " svelte-6srlhw"}"${add_attribute("this", list, 1)}>${ `${noResultsText
		? `<div class="${"autocomplete-list-item-no-results svelte-6srlhw"}">${escape(noResultsText)}</div>`
		: ``}`}</div></div>



`;
});

const base = 'https://ok-barometer.vercel.app/api';

function send({ method, path, data }) {
	const fetch =  require('node-fetch').default;

	const opts = { async: true, method, headers: {} };


	if (data) {
		opts.headers['Content-Type'] = 'application/json';
		opts.body = JSON.stringify(data);
	}

	return fetch(`${base}/${path}`, opts)
		.then(r => r.text()).catch(err => console.log(err) )
		.then(json => {
			try {
				if (json) {
			
				  let parsed = JSON.parse(json);
				  return parsed;
				} else {
				
					console.log('NOT JSON:'+json);
					console.log(base, path);
					console.log(opts);
						console.log(r);
					return r;
					
				}
			} catch (err) {
				throw err;
			}
		}).catch(err => {console.log(err); return err;} );
}

function get(path) {
	return send({ method: 'GET', path });
}

async function get_users() {
  let result;
  let users;
  const user_list = [];



  try {
    users = await get(`user`);
  } catch (err) {
    throw err;
  }

  try {
    if (!users) {
      throw 'Error getting users from database. Please try later.';
    } else if (users) {
      let i;
      for (i = 0; i < users.length; i++) {
        const us = users;
        let u = {};




        u = {
          id: us[i].id,
          name: us[i].name,
          email: us[i].email,

        };

        user_list.push(u);
      }

      result = user_list;
    } else {
      throw 'Error. Database input is not in the appropiate format. Please contact technical support.';
    }
  } catch (err) {
    throw err;
  }

  try {
    if (result) {
      return await result;
    }
    throw 'Error, loading data from the database. Please try later.';
  } catch (err) {
    throw err;
  }
}

/* src/components/Navbar.svelte generated by Svelte v3.29.4 */

const css$1 = {
	code: ".dropdown-menu.svelte-1m76dk4{position:absolute;top:100%;left:0;z-index:1000;float:left;min-width:6rem;padding:0.5rem 0;margin:0.125rem 0 0;font-size:1rem;color:#212529;text-align:left;list-style:none;background-color:#fff;background-clip:padding-box;border:1px solid rgba(0, 0, 0, 0.15);border-radius:0.25rem}.dropdown-menu-left.svelte-1m76dk4{right:0;left:auto}.notifications-item.svelte-1m76dk4{padding-right:140px}",
	map: "{\"version\":3,\"file\":\"Navbar.svelte\",\"sources\":[\"Navbar.svelte\"],\"sourcesContent\":[\"<script context=\\\"module\\\">\\n  export async function preload(page, session) {\\n    try {\\n      const user = session.user;\\n    } catch (err) {\\n      throw err;\\n    }\\n  }\\n</script>\\n\\n<script>\\n  import { goto, stores } from \\\"@sapper/app\\\";\\n  const { page, session } = stores();\\n  import { post } from \\\"@connections/utils.js\\\";\\n  import AutoComplete from \\\"@simple-svelte-autocomplete/src/SimpleAutocomplete.svelte\\\";\\n  import { slide } from \\\"svelte/transition\\\";\\n\\n  import { onMount } from \\\"svelte\\\";\\n\\n  import * as api from \\\"@utils/BarometerConnection\\\";\\n  import { get_users } from \\\"../components/get_data.js\\\";\\n\\n  let password;\\n\\n  // AUTOCOMPLETE DATA\\n  let selected_user;\\n  let selected_user_key;\\n\\n  let user_list;\\n\\n  get_users().then(function(result) {\\n    user_list = result;\\n  });\\n\\n  $session.profile_on = false;\\n\\n  let user = {\\n    user_name: \\\"Test User\\\",\\n    user_country: \\\"all\\\",\\n    user_region: \\\"all\\\",\\n    user_picture: \\\"avatar-0.png\\\",\\n    isRa: true\\n  };\\n\\n  if ($session.user) {\\n    user = $session.user;\\n  }\\n\\n  let search_state = 0;\\n\\n  let wrapper_class = \\\"header-search-wrapper\\\";\\n\\n  function searchHandle() {\\n    event.preventDefault();\\n    if (search_state === 0) {\\n      search_state = 1;\\n      wrapper_class = \\\"header-search-wrapper-focus\\\";\\n    } else {\\n      wrapper_class = \\\"header-search-wrapper\\\";\\n    }\\n  }\\n\\n  let notifications_on = false;\\n\\n  function collapse_notifications() {\\n    if ($session.notifications_on === false) {\\n      $session.profile_on = false;\\n      $session.notifications_on = true;\\n    } else {\\n      $session.notifications_on = false;\\n    }\\n  }\\n\\n  let connectivity_status = \\\"avatar-online\\\";\\n\\n  async function refresh() {\\n    try {\\n    } catch (err) {\\n      throw err;\\n    }\\n    try {\\n      user = $session.user;\\n\\n      const response = \\\"await post(`auth/login`, { user, password })\\\";\\n\\n      if (response.user) {\\n        $session.user = response.user;\\n        connectivity_status = \\\"avatar-online\\\";\\n      }\\n    } catch (err) {\\n      throw err;\\n    }\\n  }\\n\\n  let my;\\n  let mx;\\n  let is_online;\\n\\n  onMount(refresh);\\n\\n  function notify_delete() {\\n    $session.notifications_on = false;\\n    $session.profile_on = false;\\n  }\\n\\n  let profile_on = false;\\n  function collapse_profile() {\\n    console.log($session.profile_on);\\n    if ($session.profile_on === false) {\\n      $session.notifications_on = false;\\n      $session.profile_on = true;\\n    } else {\\n      $session.profile_on = false;\\n    }\\n  }\\n\\n  function reset_dropdowns() {\\n    $session.notifications_on = false;\\n    $session.profile_on = false;\\n  }\\n\\n  let notification_over = true;\\n  let notification_icon_over = true;\\n\\n  function notification_mouseover() {\\n    notification_over = true;\\n    console.log(\\\"notification over is \\\" + notification_over);\\n  }\\n\\n  function notification_mouseout() {\\n    notification_over = false;\\n    console.log(\\\"notification over is \\\" + notification_over);\\n  }\\n\\n  function notification_icon_mouseover() {\\n    notification_icon_over = true;\\n    console.log(\\\"notification over is \\\" + notification_icon_over);\\n  }\\n\\n  function notification_icon_mouseout() {\\n    notification_icon_over = false;\\n    console.log(\\\"notification over is \\\" + notification_icon_over);\\n  }\\n\\n  function profile_mouseover() {\\n    profile_over = true;\\n  }\\n\\n  function profile_mouseout() {\\n    profile_over = false;\\n  }\\n\\n  function profile_icon_mouseover() {\\n    profile_icon_over = true;\\n  }\\n\\n  function profile_icon_mouseout() {\\n    profile_icon_over = false;\\n  }\\n\\n  function decollapse_notifications() {\\n    notifications_on = false;\\n    console.log(\\\"notifications on is \\\" + notifications_on);\\n  }\\n\\n  function decollapse_profile() {\\n    profile_on = false;\\n    console.log(\\\"notifications on is \\\" + profile_on);\\n  }\\n\\n  function handleKeydown(event) {}\\n\\n  function handleKeyup(event) {}\\n\\n  function logout(event) {\\n    reset_dropdowns();\\n\\n    goto(\\\"/auth/login\\\");\\n  }\\n</script>\\n\\n<svelte:window\\n  bind:scrollY={my}\\n  bind:scrollX={mx}\\n  on:keydown={handleKeydown}\\n  on:keyup={handleKeyup}\\n/>\\n\\n<header class=\\\"page-topbar\\\" id=\\\"header\\\">\\n  <div class=\\\"navbar navbar-fixed\\\">\\n    <nav\\n      class=\\\"navbar-main navbar-color nav-collapsible sideNav-lock navbar-light\\n      white\\\"\\n      style=\\\"\\\"\\n    >\\n      <div\\n        class=\\\"nav-wrapper\\\"\\n        style=\\\"border-radius: 0px; background: #ffffff; box-shadow: 5px 5px 10px\\n        #9c9c9c, -5px -5px 10px #ffffff;\\\"\\n      >\\n        <div class=\\\"{wrapper_class} hide-on-med-and-down\\\">\\n          <i class=\\\"material-icons\\\">search</i>\\n\\n          {#await user_list}\\n            <p>Loading Users...</p>\\n            <div class=\\\"progress\\\">\\n              <div class=\\\"indeterminate\\\" />\\n            </div>\\n          {:then user_list}\\n\\n            <AutoComplete\\n              items={user_list}\\n              bind:selectedItem={selected_user}\\n              bind:value={selected_user_key}\\n              labelFieldName=\\\"location_company_name\\\"\\n              valueFieldName=\\\"id\\\"\\n              placeholder=\\\"Search for people who might feel just like me...\\\"\\n              on:click={searchHandle}\\n              on:change={searchHandle}\\n              maxItemsToShowInList=\\\"6\\\"\\n              keywordsFunction={userBaro => userBaro.id + ' ' + userBaro.name + ' ' + userBaro.name}\\n              class=\\\"header-search-input z-depth-2 autocomplete\\\"\\n            />\\n\\n          {:catch error}\\n            <AutoComplete\\n              class=\\\"header-search-input z-depth-2 autocomplete disabled\\\"\\n            />\\n          {/await}\\n\\n          <!--\\n          <input\\n            id=\\\"search_autocomplete\\\"\\n            class=\\\"header-search-input z-depth-2 autocomplete\\\"\\n            type=\\\"search\\\"\\n            name=\\\"Search\\\"\\n            placeholder=\\\"Search for requests by company name...\\\"\\n            data-search=\\\"template-list\\\"\\n            bind:value={search_query}\\n            on:click={searchHandle} />\\n            -->\\n          <ul class=\\\"search-list collection display-none\\\" />\\n        </div>\\n        <ul class=\\\"navbar-list right\\\">\\n          <li class=\\\"hide-on-large-only search-input-wrapper\\\">\\n            <a\\n              class=\\\"waves-effect waves-block waves-light search-button\\\"\\n              href=\\\"javascript:void(0);\\\"\\n            >\\n              <i class=\\\"material-icons\\\">search</i>\\n            </a>\\n          </li>\\n\\n          <li>\\n            <a\\n              class=\\\"waves-effect waves-block waves-light notification-button\\\"\\n              href=\\\"javascript:void(0);\\\"\\n              on:click={collapse_notifications}\\n              on:load={refresh}\\n            >\\n\\n              <i class=\\\"material-icons\\\">\\n                notifications_none\\n                {#if $session.todo}\\n                  {#if $session.todo.length != 0}\\n                    <small class=\\\"notification-badge\\\">\\n                      {$session.todo.length}\\n                    </small>\\n                  {/if}\\n                {/if}\\n\\n              </i>\\n\\n            </a>\\n          </li>\\n\\n          <li>\\n            <a\\n              class=\\\"waves-effect waves-block waves-light \\\"\\n              href=\\\"javascript:void(0);\\\"\\n              on:click={collapse_profile}\\n            >\\n              <span class=\\\"avatar-status {connectivity_status}\\\">\\n  \\n        \\n                  <img src=\\\"avatar-0.png\\\" alt=\\\"avatar\\\" />\\n          \\n                <i />\\n              </span>\\n            </a>\\n          </li>\\n\\n        </ul>\\n\\n        <!-- notifications-dropdown-->\\n\\n        {#if $session.notifications_on}\\n          <ul\\n            class=\\\"dropdown-menu dropdown-menu-left\\\"\\n            id=\\\"notifications-dropdown\\\"\\n            transition:slide\\n          >\\n\\n            <li class=\\\"notifications-item\\\" style=\\\" padding-right: 140px; \\\">\\n              <h7>\\n                NOTIFICATIONS\\n                {#if $session.todo && $session.todo.length != 0}\\n                  <span class=\\\"new badge\\\" data-badge-caption=\\\"new\\\">\\n                    {$session.todo.length}\\n                  </span>\\n                {/if}\\n\\n              </h7>\\n            </li>\\n\\n            {#if !$session.todo || $session.todo.length == 0}\\n              <li class=\\\"notifications-item\\\" style=\\\" padding-right: 140px; \\\">\\n\\n                <a\\n                  class=\\\"grey-text text-darken-1\\\"\\n                  on:click={reset_dropdowns}\\n                  href=\\\"javascript:void(0);\\\"\\n                >\\n                  <i class=\\\"material-icons\\\">info</i>\\n                  <small>No notifications</small>\\n                </a>\\n                <!--<time\\n                class=\\\"media-meta grey-text darken-2\\\"\\n                datetime=\\\"2015-06-12T20:50:48+08:00\\\"\\n              >\\n                2 hours ago\\n              </time>-->\\n              </li>\\n            {:else if $session.todo}\\n              {#each $session.todo as notification}\\n                <li class=\\\"notifications-item\\\" style=\\\" padding-right: 140px; \\\">\\n                  <a\\n                    class=\\\"grey-text text-darken-1\\\"\\n                    on:click={notify_delete}\\n                    href=\\\"/request/{notification.request_key}\\\"\\n                  >\\n                    <i class=\\\"material-icons\\\">info</i>\\n\\n                    <small>{notification.text}</small>\\n                  </a>\\n                  <!--<time\\n                class=\\\"media-meta grey-text darken-2\\\"\\n                datetime=\\\"2015-06-12T20:50:48+08:00\\\"\\n              >\\n                2 hours ago\\n              </time>-->\\n                </li>\\n              {/each}\\n            {/if}\\n\\n          </ul>\\n        {/if}\\n\\n        <!-- profile-dropdown-->\\n        {#if $session.profile_on}\\n          <ul\\n            class=\\\"dropdown-menu dropdown-menu-left\\\"\\n            id=\\\"profile-dropdown\\\"\\n            transition:slide\\n            style=\\\"width: 130px !important;\\\"\\n          >\\n\\n            <li class=\\\"divider\\\" />\\n            <li>\\n              <a\\n                class=\\\"grey-text text-darken-1\\\"\\n                href=\\\"javascript:void(0);\\\"\\n                on:click={logout}\\n                style=\\\"font-size: 0.8em; line-height: 3em; height: 2em;\\n                padding-left: 2em !important;\\\"\\n              >\\n                <i\\n                  class=\\\"material-icons\\\"\\n                  style=\\\"font-size: 1.5em; line-height: 1em;\\\"\\n                >\\n                  keyboard_tab\\n                </i>\\n                Logout\\n              </a>\\n            </li>\\n          </ul>\\n        {/if}\\n      </div>\\n      <nav class=\\\"display-none search-sm\\\">\\n        <div class=\\\"nav-wrapper\\\">\\n          <form id=\\\"navbarForm\\\">\\n            <div class=\\\"input-field search-input-sm\\\">\\n              <input\\n                class=\\\"search-box-sm mb-0\\\"\\n                type=\\\"search\\\"\\n                required=\\\"\\\"\\n                id=\\\"search\\\"\\n                placeholder=\\\"Search\\\"\\n                data-search=\\\"template-list\\\"\\n                on:click={searchHandle}\\n              />\\n              <label class=\\\"label-icon\\\" for=\\\"search\\\">\\n                <i class=\\\"material-icons search-sm-icon\\\">search</i>\\n              </label>\\n              <i class=\\\"material-icons search-sm-close\\\">close</i>\\n              <ul class=\\\"search-list collection search-list-sm display-none\\\" />\\n            </div>\\n          </form>\\n        </div>\\n      </nav>\\n    </nav>\\n  </div>\\n</header>\\n\\n<style>\\n  .dropdown-menu {\\n    position: absolute;\\n    top: 100%;\\n    left: 0;\\n    z-index: 1000;\\n    float: left;\\n    min-width: 6rem;\\n    padding: 0.5rem 0;\\n    margin: 0.125rem 0 0;\\n    font-size: 1rem;\\n    color: #212529;\\n    text-align: left;\\n    list-style: none;\\n    background-color: #fff;\\n    background-clip: padding-box;\\n    border: 1px solid rgba(0, 0, 0, 0.15);\\n    border-radius: 0.25rem;\\n  }\\n\\n  .dropdown-menu-left {\\n    right: 0;\\n    left: auto;\\n  }\\n\\n  .notifications-item {\\n    padding-right: 140px;\\n  }\\n</style>\\n\"],\"names\":[],\"mappings\":\"AA+ZE,cAAc,eAAC,CAAC,AACd,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,IAAI,CACT,IAAI,CAAE,CAAC,CACP,OAAO,CAAE,IAAI,CACb,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,IAAI,CACf,OAAO,CAAE,MAAM,CAAC,CAAC,CACjB,MAAM,CAAE,QAAQ,CAAC,CAAC,CAAC,CAAC,CACpB,SAAS,CAAE,IAAI,CACf,KAAK,CAAE,OAAO,CACd,UAAU,CAAE,IAAI,CAChB,UAAU,CAAE,IAAI,CAChB,gBAAgB,CAAE,IAAI,CACtB,eAAe,CAAE,WAAW,CAC5B,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CACrC,aAAa,CAAE,OAAO,AACxB,CAAC,AAED,mBAAmB,eAAC,CAAC,AACnB,KAAK,CAAE,CAAC,CACR,IAAI,CAAE,IAAI,AACZ,CAAC,AAED,mBAAmB,eAAC,CAAC,AACnB,aAAa,CAAE,KAAK,AACtB,CAAC\"}"
};

const Navbar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $session;
	const { page, session } = stores$1();
	$session = get_store_value(session);

	// AUTOCOMPLETE DATA
	let selected_user;

	let selected_user_key;
	let user_list;

	get_users().then(function (result) {
		user_list = result;
	});

	$session.profile_on = false;

	let user = {
		user_name: "Test User",
		user_country: "all",
		user_region: "all",
		user_picture: "avatar-0.png",
		isRa: true
	};

	if ($session.user) {
		user = $session.user;
	}
	let wrapper_class = "header-search-wrapper";

	let connectivity_status = "avatar-online";

	async function refresh() {

		try {
			user = $session.user;
			const response = "await post(`auth/login`, { user, password })";

			if (response.user) {
				$session.user = response.user;
				connectivity_status = "avatar-online";
			}
		} catch(err) {
			throw err;
		}
	}
	onMount(refresh);

	$$result.css.add(css$1);
	let $$settled;
	let $$rendered;

	do {
		$$settled = true;
		$session = get_store_value(session);

		$$rendered = `

<header class="${"page-topbar"}" id="${"header"}"><div class="${"navbar navbar-fixed"}"><nav class="${"navbar-main navbar-color nav-collapsible sideNav-lock navbar-light\n      white"}" style="${""}"><div class="${"nav-wrapper"}" style="${"border-radius: 0px; background: #ffffff; box-shadow: 5px 5px 10px\n        #9c9c9c, -5px -5px 10px #ffffff;"}"><div class="${escape(wrapper_class) + " hide-on-med-and-down" + " svelte-1m76dk4"}"><i class="${"material-icons"}">search</i>

          ${(function (__value) {
			if (is_promise(__value)) return `
            <p>Loading Users...</p>
            <div class="${"progress"}"><div class="${"indeterminate"}"></div></div>
          `;

			return (function (user_list) {
				return `

            ${validate_component(SimpleAutocomplete, "AutoComplete").$$render(
					$$result,
					{
						items: user_list,
						labelFieldName: "location_company_name",
						valueFieldName: "id",
						placeholder: "Search for people who might feel just like me...",
						maxItemsToShowInList: "6",
						keywordsFunction: userBaro => userBaro.id + " " + userBaro.name + " " + userBaro.name,
						class: "header-search-input z-depth-2 autocomplete",
						selectedItem: selected_user,
						value: selected_user_key
					},
					{
						selectedItem: $$value => {
							selected_user = $$value;
							$$settled = false;
						},
						value: $$value => {
							selected_user_key = $$value;
							$$settled = false;
						}
					},
					{}
				)}

          `;
			})(__value);
		})(user_list)}

          
          <ul class="${"search-list collection display-none"}"></ul></div>
        <ul class="${"navbar-list right"}"><li class="${"hide-on-large-only search-input-wrapper"}"><a class="${"waves-effect waves-block waves-light search-button"}" href="${"javascript:void(0);"}"><i class="${"material-icons"}">search</i></a></li>

          <li><a class="${"waves-effect waves-block waves-light notification-button"}" href="${"javascript:void(0);"}"><i class="${"material-icons"}">notifications_none
                ${$session.todo
		? `${$session.todo.length != 0
			? `<small class="${"notification-badge"}">${escape($session.todo.length)}</small>`
			: ``}`
		: ``}</i></a></li>

          <li><a class="${"waves-effect waves-block waves-light "}" href="${"javascript:void(0);"}"><span class="${"avatar-status " + escape(connectivity_status) + " svelte-1m76dk4"}"><img src="${"avatar-0.png"}" alt="${"avatar"}">
          
                <i></i></span></a></li></ul>

        

        ${$session.notifications_on
		? `<ul class="${"dropdown-menu dropdown-menu-left svelte-1m76dk4"}" id="${"notifications-dropdown"}"><li class="${"notifications-item svelte-1m76dk4"}" style="${" padding-right: 140px; "}"><h7>NOTIFICATIONS
                ${$session.todo && $session.todo.length != 0
			? `<span class="${"new badge"}" data-badge-caption="${"new"}">${escape($session.todo.length)}</span>`
			: ``}</h7></li>

            ${!$session.todo || $session.todo.length == 0
			? `<li class="${"notifications-item svelte-1m76dk4"}" style="${" padding-right: 140px; "}"><a class="${"grey-text text-darken-1"}" href="${"javascript:void(0);"}"><i class="${"material-icons"}">info</i>
                  <small>No notifications</small></a>
                </li>`
			: `${$session.todo
				? `${each($session.todo, notification => `<li class="${"notifications-item svelte-1m76dk4"}" style="${" padding-right: 140px; "}"><a class="${"grey-text text-darken-1"}" href="${"/request/" + escape(notification.request_key)}"><i class="${"material-icons"}">info</i>

                    <small>${escape(notification.text)}</small></a>
                  
                </li>`)}`
				: ``}`}</ul>`
		: ``}

        
        ${$session.profile_on
		? `<ul class="${"dropdown-menu dropdown-menu-left svelte-1m76dk4"}" id="${"profile-dropdown"}" style="${"width: 130px !important;"}"><li class="${"divider"}"></li>
            <li><a class="${"grey-text text-darken-1"}" href="${"javascript:void(0);"}" style="${"font-size: 0.8em; line-height: 3em; height: 2em;\n                padding-left: 2em !important;"}"><i class="${"material-icons"}" style="${"font-size: 1.5em; line-height: 1em;"}">keyboard_tab
                </i>
                Logout
              </a></li></ul>`
		: ``}</div>
      <nav class="${"display-none search-sm"}"><div class="${"nav-wrapper"}"><form id="${"navbarForm"}"><div class="${"input-field search-input-sm"}"><input class="${"search-box-sm mb-0"}" type="${"search"}" required="${""}" id="${"search"}" placeholder="${"Search"}" data-search="${"template-list"}">
              <label class="${"label-icon"}" for="${"search"}"><i class="${"material-icons search-sm-icon"}">search</i></label>
              <i class="${"material-icons search-sm-close"}">close</i>
              <ul class="${"search-list collection search-list-sm display-none"}"></ul></div></form></div></nav></nav></div>
</header>`;
	} while (!$$settled);

	return $$rendered;
});

/* src/components/Sidebar.svelte generated by Svelte v3.29.4 */

const css$2 = {
	code: ".sidenav.svelte-j2v3og li.svelte-j2v3og{line-height:35px !important}.glowing-circle.svelte-j2v3og.svelte-j2v3og{width:100px;height:100px;border-radius:50%;background-color:#fff;-webkit-animation:svelte-j2v3og-glowing 1s ease-in-out infinite alternate;-moz-animation:svelte-j2v3og-glowing 1s ease-in-out infinite alternate;animation:svelte-j2v3og-glowing 1s ease-in-out infinite alternate}@-webkit-keyframes svelte-j2v3og-glowing{from{box-shadow:0 0 10px #fff, 0 0 20px #fff, 0 0 30px #f0f, 0 0 40px #0ff, 0 0 50px #e60073, 0 0 60px #e60073, 0 0 70px #e60073}to{box-shadow:0 0 20px #fff, 0 0 30px #ff4da6, 0 0 40px #ff4da6, 0 0 50px #ff4da6, 0 0 60px #ff4da6, 0 0 70px #ff4da6, 0 0 80px #ff4da6}}",
	map: "{\"version\":3,\"file\":\"Sidebar.svelte\",\"sources\":[\"Sidebar.svelte\"],\"sourcesContent\":[\"<script>\\n  import {  stores } from \\\"@sapper/app\\\";\\n\\n\\n\\n  const { session } = stores();\\n\\n  let user = {\\n    user_name: \\\"Test User\\\",\\n    user_country: \\\"all\\\",\\n    user_region: \\\"all\\\",\\n    user_picture: \\\"avatar-0.png\\\",\\n    isRa: true\\n  };\\n\\n  if ($session.user) {\\n    user = $session;\\n  }\\n\\n\\n</script>\\n\\n<style>\\n  .sidenav li {\\n    line-height: 35px !important;\\n  }\\n\\n  .divider-ns {\\n    height: 10px !important;\\n  }\\n\\n\\n\\n\\n.glowing-circle {\\n  width: 100px;\\n  height: 100px;\\n  border-radius:50%;\\n  background-color: #fff;\\n  -webkit-animation: glowing 1s ease-in-out infinite alternate;\\n  -moz-animation: glowing 1s ease-in-out infinite alternate;\\n  animation: glowing 1s ease-in-out infinite alternate;\\n}\\n@-webkit-keyframes glowing {\\n  from {\\n    box-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #f0f, 0 0 40px #0ff, 0 0 50px #e60073, 0 0 60px #e60073, 0 0 70px #e60073;\\n  }\\n  to {\\n    box-shadow: 0 0 20px #fff, 0 0 30px #ff4da6, 0 0 40px #ff4da6, 0 0 50px #ff4da6, 0 0 60px #ff4da6, 0 0 70px #ff4da6, 0 0 80px #ff4da6;\\n  }\\n}\\n</style>\\n\\n<aside\\n  class=\\\"sidenav-main nav-expanded nav-lock nav-collapsible sidenav-light\\n  sidenav-active-square\\\" style=\\\"border-radius: 0px;\\n  background: linear-gradient(145deg, #ffffff, #dedede);\\n  box-shadow:  5px 5px 10px #ededed,\\n               -5px -5px 10px #ffffff;\\\">\\n  <div class=\\\"brand-sidebar\\\">\\n    <h1 class=\\\"logo-wrapper\\\">\\n      <a class=\\\"brand-logo darken-1\\\" href=\\\"/profile/dashboard\\\">\\n    <img class=\\\"hide-on-med-and-down\\\" src=\\\"logo2.png\\\" alt=\\\"logo\\\" />\\n\\n    \\n        <img\\n          class=\\\"show-on-medium-and-down hide-on-med-and-up\\\"\\n          src=\\\"logo2.png\\\"\\n          alt=\\\"logo\\\" />\\n       \\n\\n        <span class=\\\"logo-text hide-on-med-and-down blue-text\\\" >\\n          ALGEDONIC\\n        </span>\\n      </a>\\n\\n    </h1>\\n  </div>\\n\\n  <ul\\n    class=\\\"sidenav sidenav-collapsible leftside-navigation collapsible\\n    sidenav-fixed menu-shadow\\\"\\n    id=\\\"slide-out\\\"\\n    data-menu=\\\"menu-navigation\\\"\\n    data-collapsible=\\\"menu-accordion\\\"\\n    style=\\\"border-radius: 0px;\\n    background: linear-gradient(145deg, #ffffff, #dedede);\\n    box-shadow:  5px 5px 10px #ededed,\\n                 -5px -5px 10px #ffffff;\\\">\\n\\n    <li class=\\\"navigation-header\\\">\\n      <small style=\\\"font-size: 0.5rem;\\\">\\n        Logged as\\n        <b>\\n          {#if $session.user}\\n           Test User\\n          {:else}None{/if}\\n      \\n        </b>\\n\\n      </small>\\n\\n    </li>\\n\\n    <li class=\\\"navigation-header\\\">\\n      <a href=\\\"javascript:void(0);\\\" class=\\\"navigation-header-text\\\">\\n        Menu\\n      </a>\\n      <i class=\\\"navigation-header-icon material-icons\\\">more_horiz</i>\\n    </li>\\n\\n    \\n\\n\\n    <li class=\\\"bold\\\">\\n      <a\\n        class=\\\"waves-effect waves-grey \\\"\\n        class:active={$session.current_page == 'moods'}\\n        rel=\\\"prefetch\\\"\\n        href=\\\"/moods\\\">\\n        <i class=\\\"material-icons\\\">dashboard</i>\\n        <span class=\\\"menu-title\\\" data-i18n=\\\"User Profile\\\"><b>1.</b> Moods</span>\\n      </a>\\n\\n    </li>\\n\\n    <li class=\\\"bold\\\">\\n      <a\\n        class=\\\"waves-effect waves-grey \\n        \\\"\\n        class:active={$session.current_page == 'pains'}\\n        href=\\\"/pains\\\">\\n        <i class=\\\"material-icons\\\">account_circle</i>\\n        <span class=\\\"menu-title\\\">2. Pain Points</span>\\n      </a>\\n\\n    </li>\\n\\n    <li class=\\\"bold\\\">\\n      <a\\n        class=\\\"waves-effect waves-grey disabled\\n        \\\"\\n        class:active={$session.current_page == 'limits'}\\n        href=\\\"/\\\">\\n        <i class=\\\"material-icons\\\">av_timer</i>\\n        <span class=\\\"menu-title\\\">3. Limitations (todo)</span>\\n      </a>\\n\\n    </li>\\n\\n    <li class=\\\"bold\\\">\\n      <a disabled\\n        class=\\\"waves-effect waves-grey disabled\\n        \\\"\\n        class:active={$session.current_page == 'opportunities'}\\n        href=\\\"/moods\\\">\\n        <i class=\\\"material-icons\\\">check_circle</i>\\n        <span class=\\\"menu-title\\\">4. Opportunities (todo)</span>\\n      </a>\\n\\n    </li>\\n\\n    <li class=\\\"bold\\\">\\n      <a disabled\\n        class=\\\"waves-effect waves-grey disabled\\n        \\\"\\n        class:active={$session.current_page == 'actions'}\\n        href=\\\"/moods\\\">\\n        <i class=\\\"material-icons\\\">assignment_ind</i>\\n        <span class=\\\"menu-title\\\">5. Community Action (todo)</span>\\n      </a>\\n\\n    </li>\\n\\n\\n\\n\\n\\n\\n  \\n\\n  \\n\\n\\n\\n   \\n    <li class=\\\"navigation-header\\\"  style=\\\"margin-top: 150px\\\">\\n      <span>Average Community Mood:</span>\\n      <div class=\\\"glowing-circle\\\" style=\\\"margin-top: 45px !important; margin-left: 55px;\\\"></div>\\n    </li>\\n\\n \\n\\n  </ul>\\n  <div class=\\\"navigation-background\\\" />\\n  <a\\n    class=\\\"sidenav-trigger btn-sidenav-toggle btn-floating btn-medium\\n    waves-effect waves-light hide-on-large-only\\\"\\n    href=\\\"javascript:void(0);\\\"\\n    data-target=\\\"slide-out\\\">\\n    <i class=\\\"material-icons\\\">menu</i>\\n  </a>\\n</aside>\\n\"],\"names\":[],\"mappings\":\"AAuBE,sBAAQ,CAAC,EAAE,cAAC,CAAC,AACX,WAAW,CAAE,IAAI,CAAC,UAAU,AAC9B,CAAC,AASH,eAAe,4BAAC,CAAC,AACf,KAAK,CAAE,KAAK,CACZ,MAAM,CAAE,KAAK,CACb,cAAc,GAAG,CACjB,gBAAgB,CAAE,IAAI,CACtB,iBAAiB,CAAE,qBAAO,CAAC,EAAE,CAAC,WAAW,CAAC,QAAQ,CAAC,SAAS,CAC5D,cAAc,CAAE,qBAAO,CAAC,EAAE,CAAC,WAAW,CAAC,QAAQ,CAAC,SAAS,CACzD,SAAS,CAAE,qBAAO,CAAC,EAAE,CAAC,WAAW,CAAC,QAAQ,CAAC,SAAS,AACtD,CAAC,AACD,mBAAmB,qBAAQ,CAAC,AAC1B,IAAI,AAAC,CAAC,AACJ,UAAU,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,IAAI,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,IAAI,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,IAAI,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,IAAI,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,OAAO,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,OAAO,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,OAAO,AAC9H,CAAC,AACD,EAAE,AAAC,CAAC,AACF,UAAU,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,IAAI,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,OAAO,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,OAAO,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,OAAO,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,OAAO,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,OAAO,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,OAAO,AACvI,CAAC,AACH,CAAC\"}"
};

const Sidebar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $session;
	const { session } = stores$1();
	$session = get_store_value(session);

	if ($session.user) ;

	$$result.css.add(css$2);
	$session = get_store_value(session);

	return `<aside class="${"sidenav-main nav-expanded nav-lock nav-collapsible sidenav-light\n  sidenav-active-square"}" style="${"border-radius: 0px;\n  background: linear-gradient(145deg, #ffffff, #dedede);\n  box-shadow:  5px 5px 10px #ededed,\n               -5px -5px 10px #ffffff;"}"><div class="${"brand-sidebar"}"><h1 class="${"logo-wrapper"}"><a class="${"brand-logo darken-1"}" href="${"/profile/dashboard"}"><img class="${"hide-on-med-and-down"}" src="${"logo2.png"}" alt="${"logo"}">

    
        <img class="${"show-on-medium-and-down hide-on-med-and-up"}" src="${"logo2.png"}" alt="${"logo"}">
       

        <span class="${"logo-text hide-on-med-and-down blue-text"}">ALGEDONIC
        </span></a></h1></div>

  <ul class="${"sidenav sidenav-collapsible leftside-navigation collapsible\n    sidenav-fixed menu-shadow svelte-j2v3og"}" id="${"slide-out"}" data-menu="${"menu-navigation"}" data-collapsible="${"menu-accordion"}" style="${"border-radius: 0px;\n    background: linear-gradient(145deg, #ffffff, #dedede);\n    box-shadow:  5px 5px 10px #ededed,\n                 -5px -5px 10px #ffffff;"}"><li class="${"navigation-header svelte-j2v3og"}"><small style="${"font-size: 0.5rem;"}">Logged as
        <b>${$session.user ? `Test User` : `None`}</b></small></li>

    <li class="${"navigation-header svelte-j2v3og"}"><a href="${"javascript:void(0);"}" class="${"navigation-header-text"}">Menu
      </a>
      <i class="${"navigation-header-icon material-icons"}">more_horiz</i></li>

    


    <li class="${"bold svelte-j2v3og"}"><a class="${["waves-effect waves-grey ", $session.current_page == "moods" ? "active" : ""].join(" ").trim()}" rel="${"prefetch"}" href="${"/moods"}"><i class="${"material-icons"}">dashboard</i>
        <span class="${"menu-title"}" data-i18n="${"User Profile"}"><b>1.</b> Moods</span></a></li>

    <li class="${"bold svelte-j2v3og"}"><a class="${[
		"waves-effect waves-grey \n        ",
		$session.current_page == "pains" ? "active" : ""
	].join(" ").trim()}" href="${"/pains"}"><i class="${"material-icons"}">account_circle</i>
        <span class="${"menu-title"}">2. Pain Points</span></a></li>

    <li class="${"bold svelte-j2v3og"}"><a class="${[
		"waves-effect waves-grey disabled\n        ",
		$session.current_page == "limits" ? "active" : ""
	].join(" ").trim()}" href="${"/"}"><i class="${"material-icons"}">av_timer</i>
        <span class="${"menu-title"}">3. Limitations (todo)</span></a></li>

    <li class="${"bold svelte-j2v3og"}"><a disabled class="${[
		"waves-effect waves-grey disabled\n        ",
		$session.current_page == "opportunities" ? "active" : ""
	].join(" ").trim()}" href="${"/moods"}"><i class="${"material-icons"}">check_circle</i>
        <span class="${"menu-title"}">4. Opportunities (todo)</span></a></li>

    <li class="${"bold svelte-j2v3og"}"><a disabled class="${[
		"waves-effect waves-grey disabled\n        ",
		$session.current_page == "actions" ? "active" : ""
	].join(" ").trim()}" href="${"/moods"}"><i class="${"material-icons"}">assignment_ind</i>
        <span class="${"menu-title"}">5. Community Action (todo)</span></a></li>






  

  



   
    <li class="${"navigation-header svelte-j2v3og"}" style="${"margin-top: 150px"}"><span>Average Community Mood:</span>
      <div class="${"glowing-circle svelte-j2v3og"}" style="${"margin-top: 45px !important; margin-left: 55px;"}"></div></li></ul>
  <div class="${"navigation-background"}"></div>
  <a class="${"sidenav-trigger btn-sidenav-toggle btn-floating btn-medium\n    waves-effect waves-light hide-on-large-only"}" href="${"javascript:void(0);"}" data-target="${"slide-out"}"><i class="${"material-icons"}">menu</i></a></aside>`;
});

/* src/routes/_layout.svelte generated by Svelte v3.29.4 */
let title = "Algedonic";

const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $session;
	const { session } = stores$1();
	$session = get_store_value(session);
	let { segment } = $$props;

	if ($$props.segment === void 0 && $$bindings.segment && segment !== void 0) $$bindings.segment(segment);
	$session = get_store_value(session);

	return `${($$result.head += `${($$result.title = `<title>${escape(title)}</title>`, "")}`, "")}

${segment == "auth"
	? `${slots.default ? slots.default({}) : ``}`
	: `${segment == "pages"
		? `${slots.default ? slots.default({}) : ``}`
		: `${validate_component(Navbar, "Navbar").$$render($$result, {}, {}, {})}

  ${validate_component(Sidebar, "Sidebar").$$render($$result, {}, {}, {})}

  <div id="${"main"}">${slots.default ? slots.default({}) : ``}</div>`}`}`;
});

/* src/routes/_error.svelte generated by Svelte v3.29.4 */

const css$3 = {
	code: "nav{display:block}aside{display:block}",
	map: "{\"version\":3,\"file\":\"_error.svelte\",\"sources\":[\"_error.svelte\"],\"sourcesContent\":[\"<script>\\n  export let status;\\n  export let error;\\n  const dev = undefined === \\\"development\\\";\\n\\n</script>\\n\\n<style>\\n  :global(nav) {\\n    display: block;\\n  }\\n\\n  :global(aside) {\\n    display: block;\\n  }\\n</style>\\n\\n<svelte:head>\\n  <title>{status}</title>\\n  <link rel=\\\"stylesheet\\\" type=\\\"text/css\\\" href=\\\"page-404.css\\\" />\\n</svelte:head>\\n\\n<div class=\\\"row\\\">\\n  <div class=\\\"col s12\\\">\\n    <div class=\\\"container\\\">\\n      <div class=\\\"section section-404 p-0 m-0 height-100vh\\\">\\n        <div class=\\\"row\\\">\\n          <!-- 404 -->\\n          <div class=\\\"col s12 center-align white\\\">\\n            <img src=\\\"error-404.png\\\" class=\\\"bg-image-404\\\" alt=\\\"\\\" />\\n            <h1 class=\\\"error-code m-0\\\">{status}</h1>\\n\\n            <h6>Details: {error.message}</h6>\\n            <a\\n              class=\\\"btn waves-effect waves-light\\n              gradient-45deg-deep-purple-blue gradient-shadow mb-4\\\"\\n              href=\\\"javascript:history.back()\\\">\\n              Go back\\n            </a>\\n          </div>\\n        </div>\\n      </div>\\n    </div>\\n    <div class=\\\"content-overlay\\\" />\\n  </div>\\n</div>\\n\\n{#if dev && error.stack}\\n  <pre>{error.stack}</pre>\\n{/if}\\n\"],\"names\":[],\"mappings\":\"AAQU,GAAG,AAAE,CAAC,AACZ,OAAO,CAAE,KAAK,AAChB,CAAC,AAEO,KAAK,AAAE,CAAC,AACd,OAAO,CAAE,KAAK,AAChB,CAAC\"}"
};

const Error$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { status } = $$props;
	let { error } = $$props;
	if ($$props.status === void 0 && $$bindings.status && status !== void 0) $$bindings.status(status);
	if ($$props.error === void 0 && $$bindings.error && error !== void 0) $$bindings.error(error);
	$$result.css.add(css$3);

	return `${($$result.head += `${($$result.title = `<title>${escape(status)}</title>`, "")}<link rel="${"stylesheet"}" type="${"text/css"}" href="${"page-404.css"}">`, "")}

<div class="${"row"}"><div class="${"col s12"}"><div class="${"container"}"><div class="${"section section-404 p-0 m-0 height-100vh"}"><div class="${"row"}">
          <div class="${"col s12 center-align white"}"><img src="${"error-404.png"}" class="${"bg-image-404"}" alt="${""}">
            <h1 class="${"error-code m-0"}">${escape(status)}</h1>

            <h6>Details: ${escape(error.message)}</h6>
            <a class="${"btn waves-effect waves-light\n              gradient-45deg-deep-purple-blue gradient-shadow mb-4"}" href="${"javascript:history.back()"}">Go back
            </a></div></div></div></div>
    <div class="${"content-overlay"}"></div></div></div>

${ ``}`;
});

/* src/node_modules/@sapper/internal/App.svelte generated by Svelte v3.29.4 */

const App = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { stores } = $$props;
	let { error } = $$props;
	let { status } = $$props;
	let { segments } = $$props;
	let { level0 } = $$props;
	let { level1 = null } = $$props;
	let { level2 = null } = $$props;
	let { level3 = null } = $$props;
	let { notify } = $$props;
	afterUpdate(notify);
	setContext(CONTEXT_KEY, stores);
	if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0) $$bindings.stores(stores);
	if ($$props.error === void 0 && $$bindings.error && error !== void 0) $$bindings.error(error);
	if ($$props.status === void 0 && $$bindings.status && status !== void 0) $$bindings.status(status);
	if ($$props.segments === void 0 && $$bindings.segments && segments !== void 0) $$bindings.segments(segments);
	if ($$props.level0 === void 0 && $$bindings.level0 && level0 !== void 0) $$bindings.level0(level0);
	if ($$props.level1 === void 0 && $$bindings.level1 && level1 !== void 0) $$bindings.level1(level1);
	if ($$props.level2 === void 0 && $$bindings.level2 && level2 !== void 0) $$bindings.level2(level2);
	if ($$props.level3 === void 0 && $$bindings.level3 && level3 !== void 0) $$bindings.level3(level3);
	if ($$props.notify === void 0 && $$bindings.notify && notify !== void 0) $$bindings.notify(notify);

	return `


${validate_component(Layout, "Layout").$$render($$result, Object.assign({ segment: segments[0] }, level0.props), {}, {
		default: () => `${error
		? `${validate_component(Error$1, "Error").$$render($$result, { error, status }, {}, {})}`
		: `${validate_component(level1.component || missing_component, "svelte:component").$$render($$result, Object.assign({ segment: segments[1] }, level1.props), {}, {
				default: () => `${level2
				? `${validate_component(level2.component || missing_component, "svelte:component").$$render($$result, Object.assign({ segment: segments[2] }, level2.props), {}, {
						default: () => `${level3
						? `${validate_component(level3.component || missing_component, "svelte:component").$$render($$result, Object.assign(level3.props), {}, {})}`
						: ``}`
					})}`
				: ``}`
			})}`}`
	})}`;
});

/** Callback to inform of a value updates. */



















function page_store(value) {
	const store = writable(value);
	let ready = true;

	function notify() {
		ready = true;
		store.update(val => val);
	}

	function set(new_value) {
		ready = false;
		store.set(new_value);
	}

	function subscribe(run) {
		let old_value;
		return store.subscribe((value) => {
			if (old_value === undefined || (ready && value !== old_value)) {
				run(old_value = value);
			}
		});
	}

	return { notify, set, subscribe };
}

const initial_data = typeof __SAPPER__ !== 'undefined' && __SAPPER__;

const stores = {
	page: page_store({}),
	preloading: writable(null),
	session: writable(initial_data && initial_data.session)
};

stores.session.subscribe(async value => {

	return;
});

const stores$1 = () => getContext(CONTEXT_KEY);

/* src/routes/index.svelte generated by Svelte v3.29.4 */

async function preload(session) {
	try {
		const user = session.user;
		return this.redirect(302, "/auth/login"); // More efficient with goto
	} catch(err) {
		
	}
}

let title$1 = "Algedonic";

const Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	const { session } = stores$1();
	return `${($$result.head += `${($$result.title = `<title>${escape(title$1)}</title>`, "")}`, "")}`;
});

/* src/routes/moods/index.svelte generated by Svelte v3.29.4 */

const Moods = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $session;
	const { session } = stores$1();
	$session = get_store_value(session);
	$session.current_page = "moods";
	$session = get_store_value(session);
	let moods;
	moods = get(`mood`);

	return `<div></div>

<div class="${"row"}"><div class="${"content-wrapper-before"}"></div>
    <div class="${"breadcrumbs-light pb-0 pt-4"}" id="${"breadcrumbs-wrapper"}"><div class="${"container"}"><div class="${"row"}"><div class="${"col s10 m6 l6"}"><h5 class="${"breadcrumbs-title mt-0 mb-0"}"><span>How is our community feeling?</span></h5></div>
                <div class="${"row right"}"></div></div></div></div>
    

    <div class="${"col s12"}"><div class="${"container"}"><div class="${"section section-data-tables"}">${(function (__value) {
		if (is_promise(__value)) return `
                    Loading moods...
                `;

		return (function (ms) {
			return `
                    ${each(ms, (m, i) => `${m.label == "desolate"
			? `<div class="${"card-alert card red lighten-5"}"><div class="${"card-content red-text"}"><div class="${"row"}"><div class="${"col m4"}"><div class="${"chip\n                                                gradient-45deg-purple-deep-orange\n                                                white-text"}"><img src="${"avatar-8.png"}" alt="${"ava"}">
                                                ${escape(m.label)}
                                            </div></div>
                                        <div class="${"col m4"}"><div class="${"chip"}">(${escape(moment(m.updatedAt).format("DD/MM/YYYY HH:mm:ss"))})
                                            </div></div>
                                        <div class="${"col m4"}"><img src="${"state1.png"}" style="${"width: 64px; height:\n                                                64px;"}" alt="${"state"}">
                                        </div></div>
                                </div></div>
                            `
			: `${m.label == "dispirited" || m.label == "hysterical"
				? `<div class="${"card-alert card orange lighten-5"}"><div class="${"card-content orange-text"}"><div class="${"row"}"><div class="${"col m4"}"><div class="${"chip\n                                                gradient-45deg-purple-deep-orange\n                                                white-text"}"><img src="${"avatar-8.png"}" alt="${"ava"}">
                                                ${escape(m.label)}
                                            </div></div>
                                        <div class="${"col m4"}"><div class="${"chip"}">(${escape(moment(m.updatedAt).format("DD/MM/YYYY HH:mm:ss"))})
                                            </div></div>
                                        <div class="${"col m4"}"><img src="${"state2.png"}" style="${"width: 64px; height:\n                                                64px;"}" alt="${"state"}">
                                        </div></div>
                                </div></div>
                            `
				: `${m.label == "dispirited" || m.label == "sad"
					? `<div class="${"card-alert card orange lighten-5"}"><div class="${"card-content orange-text"}"><div class="${"row"}"><div class="${"col m4"}"><div class="${"chip\n                                                gradient-45deg-purple-deep-orange\n                                                white-text"}"><img src="${"avatar-8.png"}" alt="${"ava"}">
                                                ${escape(m.label)}
                                            </div></div>
                                        <div class="${"col m4"}"><div class="${"chip"}">(${escape(moment(m.updatedAt).format("DD/MM/YYYY HH:mm:ss"))})
                                            </div></div>
                                        <div class="${"col m4"}"><img src="${"state2.png"}" style="${"width: 64px; height:\n                                                64px;"}" alt="${"state"}">
                                        </div></div>
                                </div></div>
                            `
					: `${m.label == "quiet" || m.label == "ok"
						? `<div class="${"card-alert card yellow lighten-5"}"><div class="${"card-content yellow-text"}"><div class="${"row"}"><div class="${"col m4"}"><div class="${"chip\n                                                gradient-45deg-purple-deep-orange\n                                                white-text"}"><img src="${"avatar-8.png"}" alt="${"ava"}">
                                                ${escape(m.label)}
                                            </div></div>
                                        <div class="${"col m4"}"><div class="${"chip"}">(${escape(moment(m.updatedAt).format("DD/MM/YYYY HH:mm:ss"))})
                                            </div></div>
                                        <div class="${"col m4"}"><img src="${"state3.png"}" style="${"width: 64px; height:\n                                                64px;"}" alt="${"state"}">
                                        </div></div>
                                </div></div>
                            `
						: `${m.label == "energized"
							? `<div class="${"card-alert card green lighten-5"}"><div class="${"card-content green-text"}"><div class="${"row"}"><div class="${"col m4"}"><div class="${"chip cyan white-text"}"><img src="${"avatar-8.png"}" alt="${"ava"}">
                                                ${escape(m.label)}
                                            </div></div>
                                        <div class="${"col m4"}"><div class="${"chip"}">(${escape(moment(m.updatedAt).format("DD/MM/YYYY HH:mm:ss"))})
                                            </div></div>
                                        <div class="${"col m4"}"><img src="${"state4.png"}" style="${"width: 64px; height:\n                                                64px;"}" alt="${"state"}">
                                        </div></div>
                                </div></div>
                            `
							: `${m.label == "lively"
								? `<div class="${"card-alert card green lighten-4"}"><div class="${"card-content green-text"}"><div class="${"row"}"><div class="${"col m4"}"><div class="${"chip cyan white-text"}"><img src="${"avatar-8.png"}" alt="${"ava"}">
                                                ${escape(m.label)}
                                            </div></div>
                                        <div class="${"col m4"}"><div class="${"chip"}">(${escape(moment(m.updatedAt).format("DD/MM/YYYY HH:mm:ss"))})
                                            </div></div>
                                        <div class="${"col m4"}"><img src="${"state5.png"}" style="${"width: 64px; height:\n                                                64px;"}" alt="${"state"}">
                                        </div></div>
                                </div></div>
                            `
								: ``}`}`}`}`}`}`)}
                `;
		})(__value);
	})(moods)}</div></div></div></div>`;
});

function toClassName(value) {
  let result = '';

  if (typeof value === 'string' || typeof value === 'number') {
    result += value;
  } else if (typeof value === 'object') {
    if (Array.isArray(value)) {
      result = value.map(toClassName).filter(Boolean).join(' ');
    } else {
      for (let key in value) {
        if (value[key]) {
          result && (result += ' ');
          result += key;
        }
      }
    }
  }

  return result;
}

function classnames(...args) {
  return args.map(toClassName).filter(Boolean).join(' ');
}

/* node_modules/sveltestrap/src/Row.svelte generated by Svelte v3.29.4 */

function getCols(cols) {
	const colsValue = parseInt(cols);

	if (!isNaN(colsValue)) {
		if (colsValue > 0) {
			return [`row-cols-${colsValue}`];
		}
	} else if (typeof cols === "object") {
		return ["xs", "sm", "md", "lg", "xl"].map(colWidth => {
			const isXs = colWidth === "xs";
			const colSizeInterfix = isXs ? "-" : `-${colWidth}-`;
			const value = cols[colWidth];

			if (typeof value === "number" && value > 0) {
				return `row-cols${colSizeInterfix}${value}`;
			}

			return null;
		}).filter(value => !!value);
	}

	return [];
}

const Row = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $$restProps = compute_rest_props($$props, ["class","noGutters","form","cols"]);
	let { class: className = "" } = $$props;
	let { noGutters = false } = $$props;
	let { form = false } = $$props;
	let { cols = 0 } = $$props;
	if ($$props.class === void 0 && $$bindings.class && className !== void 0) $$bindings.class(className);
	if ($$props.noGutters === void 0 && $$bindings.noGutters && noGutters !== void 0) $$bindings.noGutters(noGutters);
	if ($$props.form === void 0 && $$bindings.form && form !== void 0) $$bindings.form(form);
	if ($$props.cols === void 0 && $$bindings.cols && cols !== void 0) $$bindings.cols(cols);
	let classes;
	classes = classnames(className, noGutters ? "no-gutters" : null, form ? "form-row" : "row", ...getCols(cols));
	return `<div${spread([$$restProps, { class: escape(classes) }])}>${slots.default ? slots.default({}) : ``}</div>`;
});

/* node_modules/sveltestrap/src/Container.svelte generated by Svelte v3.29.4 */

const Container = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $$restProps = compute_rest_props($$props, ["class","fluid"]);
	let { class: className = "" } = $$props;
	let { fluid = false } = $$props;
	if ($$props.class === void 0 && $$bindings.class && className !== void 0) $$bindings.class(className);
	if ($$props.fluid === void 0 && $$bindings.fluid && fluid !== void 0) $$bindings.fluid(fluid);
	let classes;
	classes = classnames(className, fluid ? "container-fluid" : "container");
	return `<div${spread([$$restProps, { class: escape(classes) }])}>${slots.default ? slots.default({}) : ``}</div>`;
});

/* src/routes/pages/_layout.svelte generated by Svelte v3.29.4 */

const Layout$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { segment } = $$props;
	if ($$props.segment === void 0 && $$bindings.segment && segment !== void 0) $$bindings.segment(segment);

	return `${segment === "authentication"
	? `<div id="${"layoutAuthentication"}" class="${"bg-primary"}"><div id="${"layoutAuthentication_content"}"><main>${validate_component(Container, "Container").$$render($$result, {}, {}, {
			default: () => `${validate_component(Row, "Row").$$render($$result, { class: "justify-content-center" }, {}, {
				default: () => `${slots.default ? slots.default({}) : ``}`
			})}`
		})}</main></div></div>`
	: `<div id="${"layoutError"}"><div id="${"layoutError_content"}"><main>${validate_component(Container, "Container").$$render($$result, {}, {}, {
			default: () => `<div class="${"row justify-content-center"}"><div class="${"col-lg-6"}"><div class="${"text-center mt-4"}">${slots.default ? slots.default({}) : ``}</div></div></div>`
		})}</main></div></div>`}`;
});

/* src/routes/pages/error/error_401.svelte generated by Svelte v3.29.4 */

let error;

async function preload$1(page, session) {
	error = page.query.error;
	console.log(error);
}

const Error_401 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	return `${($$result.head += `${($$result.title = `<title>500</title>`, "")}<link rel="${"stylesheet"}" type="${"text/css"}" href="${"page-404.css"}">`, "")}

<div class="${"row"}"><div class="${"col s12"}"><div class="${"container"}"><div class="${"section section-404 p-0 m-0 height-100vh"}"><div class="${"row"}">
          <div class="${"col s12 center-align white"}"><img src="${"error-404.png"}" class="${"bg-image-404"}" alt="${""}">
            <h1 class="${"error-code m-0"}">error</h1>
            <h6 class="${"mb-2"}">text</h6>
            <a class="${"btn waves-effect waves-light\n              gradient-45deg-deep-purple-blue gradient-shadow mb-4"}" href="${"/pages/authentication/login"}">Back TO Login
            </a></div></div></div></div>
    <div class="${"content-overlay"}"></div></div></div>`;
});

/* src/routes/pages/error/error_404.svelte generated by Svelte v3.29.4 */

let error$1;

async function preload$2(page, session) {
	error$1 = page.query.error;
	console.log(error$1);
}

const Error_404 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	return `${($$result.head += `${($$result.title = `<title>500</title>`, "")}<link rel="${"stylesheet"}" type="${"text/css"}" href="${"page-404.css"}">`, "")}

<div class="${"row"}"><div class="${"col s12"}"><div class="${"container"}"><div class="${"section section-404 p-0 m-0 height-100vh"}"><div class="${"row"}">
          <div class="${"col s12 center-align white"}"><img src="${"error-404.png"}" class="${"bg-image-404"}" alt="${""}">
            <h1 class="${"error-code m-0"}">error</h1>
            <h6 class="${"mb-2"}">text</h6>
            <a class="${"btn waves-effect waves-light\n              gradient-45deg-deep-purple-blue gradient-shadow mb-4"}" href="${"/auth/login"}">Back TO Login
            </a></div></div></div></div>
    <div class="${"content-overlay"}"></div></div></div>`;
});

/* src/routes/pages/error/error_500.svelte generated by Svelte v3.29.4 */

let error$2;

async function preload$3(page, session) {
	error$2 = page.query.error;
	console.log(error$2);
}

const Error_500 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	return `${($$result.head += `${($$result.title = `<title>500</title>`, "")}<link rel="${"stylesheet"}" type="${"text/css"}" href="${"page-404.css"}">`, "")}

<div class="${"row"}"><div class="${"col s12"}"><div class="${"container"}"><div class="${"section section-404 p-0 m-0 height-100vh"}"><div class="${"row"}">
          <div class="${"col s12 center-align white"}"><img src="${"error-404.png"}" class="${"bg-image-404"}" alt="${""}">
            <h1 class="${"error-code m-0"}">500</h1>
            <h6 class="${"mb-2"}">Login does match any user in our database</h6>
            <a class="${"btn waves-effect waves-light\n              gradient-45deg-deep-purple-blue gradient-shadow mb-4"}" href="${"/auth/login"}">Back TO Login
            </a></div></div></div></div>
    <div class="${"content-overlay"}"></div></div></div>`;
});

/* src/routes/pages/error/_layout.svelte generated by Svelte v3.29.4 */

const Layout$2 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { segment } = $$props;
	if ($$props.segment === void 0 && $$bindings.segment && segment !== void 0) $$bindings.segment(segment);

	return `${segment === "error_401"
	? `${validate_component(Error_401, "Error401").$$render($$result, {}, {}, {})}`
	: `${segment === "error_404"
		? `${validate_component(Error_404, "Error404").$$render($$result, {}, {}, {})}`
		: `${segment === "error_500"
			? `${validate_component(Error_500, "Error500").$$render($$result, {}, {}, {})}`
			: ``}`}`}`;
});

/* src/routes/pains/index.svelte generated by Svelte v3.29.4 */

const Pains = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $session;
	const { session } = stores$1();
	$session = get_store_value(session);
	$session.current_page = "pains";

	const items = [
		"When I get to see I cannot pay rent I feel desesperated.",
		"I feel really awful when I cannot take time for myself."
	];

	$session = get_store_value(session);

	return `<div></div>

<div class="${"row"}"><div class="${"content-wrapper-before"}"></div>
    <div class="${"breadcrumbs-light pb-0 pt-4"}" id="${"breadcrumbs-wrapper"}"><div class="${"container"}"><div class="${"row"}"><div class="${"col s10 m6 l6"}"><h5 class="${"breadcrumbs-title mt-0 mb-0"}"><span>What could be triggering what we feel?</span></h5></div>
                <div class="${"row right"}"></div></div></div></div>
    

    <div class="${"col s12"}"><div class="${"container"}"><div class="${"section section-data-tables"}">${each(items, (m, i) => `<div class="${"card-alert card red lighten-5"}"><div class="${"card-content red-text"}"><div class="${"row"}"><div class="${"col m4"}"><div class="${"chip\n                                                gradient-45deg-purple-deep-orange\n                                                white-text"}"><img src="${"avatar-8.png"}" alt="${"ava"}">
                                                ${escape(m)}</div>
                                        </div></div>
                                </div></div>
                            `)}</div></div></div></div>`;
});

/* src/components/ListErrors.svelte generated by Svelte v3.29.4 */

const ListErrors = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { errors } = $$props;
	if ($$props.errors === void 0 && $$bindings.errors && errors !== void 0) $$bindings.errors(errors);

	return `${errors
	? `${each(Object.keys(errors), key => `<div class="${"card-alert card red lighten-5"}"><div class="${"card-content red-text"}"><small><i class="${"material-icons"}">error</i>
          ${escape(errors[key])}
        </small></div>
    </div>`)}`
	: ``}`;
});

/* src/routes/auth/login.svelte generated by Svelte v3.29.4 */

const css$4 = {
	code: "#login-page.svelte-1lz7m8l.svelte-1lz7m8l{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;height:100vh}#login-page.svelte-1lz7m8l .card-panel.border-radius-6.login-card.svelte-1lz7m8l{margin-left:0 !important}@media screen and (max-width: 9000px){}@media screen and (max-width: 1921px){}@media screen and (max-width: 1751px){}@media screen and (max-width: 1601px){}@media screen and (max-width: 1537px){}@media screen and (max-width: 1441px){}@media screen and (max-width: 1281px){h5.svelte-1lz7m8l.svelte-1lz7m8l{font-size:1.64rem !important}}@media screen and (max-width: 1025px){h5.svelte-1lz7m8l.svelte-1lz7m8l{font-size:1.2rem !important}}@media screen and (max-width: 801px){h5.svelte-1lz7m8l.svelte-1lz7m8l{font-size:1.15rem !important}}@media screen and (max-width: 769px){h5.svelte-1lz7m8l.svelte-1lz7m8l{font-size:1.1rem !important}}@media screen and (max-width: 721px){h5.svelte-1lz7m8l.svelte-1lz7m8l{font-size:1.05rem !important}}@media screen and (max-width: 641px){h5.svelte-1lz7m8l.svelte-1lz7m8l{font-size:1.04rem !important}}",
	map: "{\"version\":3,\"file\":\"login.svelte\",\"sources\":[\"login.svelte\"],\"sourcesContent\":[\"<script context=\\\"module\\\">\\n  export async function preload(page, session) {\\n    try {\\n      const user = session.user;\\n\\n      if (user != undefined && session.ok == true) {\\n        //return this.redirect(302, '/profile/dashboard');\\n      }\\n\\n      return user;\\n    } catch (err) {\\n      return this.error(\\\"500\\\", err);\\n    }\\n  }\\n</script>\\n\\n<script>\\n  import { goto, stores } from \\\"@sapper/app\\\";\\n\\n\\n  import ListErrors from \\\"../../components/ListErrors.svelte\\\";\\n\\n  const { session } = stores();\\n\\n\\n\\n  let user = \\\"\\\";\\n  let password = \\\"\\\";\\n  let errors = [];\\n\\n  let not_loading = true;\\n  let inputs_state = \\\" \\\";\\n\\n\\n\\n  async function submit(event) {\\n    try {\\n      not_loading = false;\\n      goto(\\\"/moods\\\");\\n        history.go(0);\\n    \\n   \\n    } catch (err) {\\n      errors = ['Error going to site.']\\n    \\n    }\\n  }\\n</script>\\n\\n<svelte:head>\\n\\n  <title>Algedonic - LogIn</title>\\n\\n</svelte:head>\\n\\n<div class=\\\"row\\\">\\n  <div class=\\\"col s12\\\">\\n    <div class=\\\"container\\\">\\n      <div id=\\\"login-page\\\" class=\\\"row\\\">\\n\\n        <div\\n          class=\\\"col s12 m6 l4 z-depth-4 card-panel border-radius-6 login-card\\n          bg-opacity-8\\\"\\n          style=\\\"border-radius: 22px; background: #ededed; box-shadow: 11px 11px\\n          22px #c7c7c7, -11px -11px 22px #ffffff;\\\"\\n        >\\n          {#if not_loading}\\n            <form class=\\\"login-form\\\" on:submit|preventDefault={submit}>\\n              <div class=\\\"row\\\">\\n                <div class=\\\"input-field col s12\\\">\\n                  <h5 class=\\\"ml-4\\\">\\n                    <img src=\\\"logo2.png\\\" style=\\\"width: 13vh;\\\" alt=\\\"logo\\\" />\\n                    Welcome to Algedonic Demo!\\n                  </h5>\\n\\n                  <small>\\n                    While we're more connected than ever in history thanks to\\n                    technology. More often than not, we can see people\\n                    struggling with complex emotions and moods. They/We're coping with\\n                    such emotions alone, and they/we might think they/we're the only ones\\n                    experiencing such hardships. Now, as working-class people,\\n                    while we keep our minds busy over the 5/9 routine, sometimes\\n                    we lose perspective on how common and pandemic this issue really is. Not to mention how\\n                    shared those emotions are with your peers. Widespread depression and anxiety is, in fact, nowadays a\\n                    global public health issue. But, what if we, collectively, can help each other to make something out this reality?\\n                    The fact that people starting experincing loniness don't know about each other and their coping strategies,\\n                    undermines opportunities for mutual-aid and collective\\n                    action. Algedonic use cybernetic technology (an algedometer) to collect data about affective states\\n                    from working people. Algedonic not only shows you that you're not the only one fealing that way but encourages you and connect with people from the community to actually brainstorm structural strategies of mutual-aid and collection action to tackle such issues shared by the community.\\n                    <on class=\\\"\\\" />\\n                  </small>\\n\\n                  <ListErrors {errors} />\\n                </div>\\n\\n              </div>\\n              \\n             \\n              <div class=\\\"row\\\">\\n                <div class=\\\"col s12 m12 l12 ml-2 mt-1\\\" />\\n              </div>\\n\\n              <div class=\\\"row\\\">\\n                <div class=\\\"input-field col s12\\\">\\n                  <button\\n                    type=\\\"submit\\\"\\n                    class=\\\"btn waves-effect waves-light border-round blue col\\n                    s12\\\"\\n      \\n                  >\\n                    Let's Start!\\n                  </button>\\n                </div>\\n              </div>\\n\\n              \\n            </form>\\n          {:else}\\n            <p>\\n              Loading...\\n              <small>Please wait.</small>\\n            </p>\\n            <div class=\\\"progress\\\" style=\\\"background-color: #ede7f3 !important;\\\">\\n              <div\\n                class=\\\"indeterminate\\\"\\n                style=\\\"background-color: #0099cc !important;\\\"\\n              />\\n            </div>\\n          {/if}\\n        </div>\\n        <!--End CARD Panel -->\\n        {#if not_loading}\\n          <div />\\n        {/if}\\n      </div>\\n    </div>\\n    <div class=\\\"content-overlay\\\" />\\n  </div>\\n</div>\\n\\n<style>\\n  /*----------------------------------------\\n    Login Page\\n------------------------------------------*/\\n  #login-page {\\n    display: -webkit-box;\\n    display: -webkit-flex;\\n    display: -ms-flexbox;\\n    display: flex;\\n    -webkit-box-pack: center;\\n    -webkit-justify-content: center;\\n    -ms-flex-pack: center;\\n    justify-content: center;\\n    -webkit-box-align: center;\\n    -webkit-align-items: center;\\n    -ms-flex-align: center;\\n    align-items: center;\\n    height: 100vh;\\n  }\\n\\n  #login-page .card-panel.border-radius-6.login-card {\\n    margin-left: 0 !important;\\n  }\\n\\n  @media screen and (max-width: 9000px) {\\n    .card-adjust {\\n      height: 353px !important;\\n    }\\n  }\\n\\n  @media screen and (max-width: 1921px) {\\n    .card-adjust {\\n      height: 246.5px !important;\\n    }\\n  }\\n\\n  @media screen and (max-width: 1751px) {\\n    .card-adjust {\\n      height: 216px !important;\\n    }\\n  }\\n\\n  @media screen and (max-width: 1601px) {\\n    .card-adjust {\\n      height: 187.5px !important;\\n    }\\n  }\\n\\n  @media screen and (max-width: 1537px) {\\n    .card-adjust {\\n      height: 178px !important;\\n    }\\n  }\\n\\n  @media screen and (max-width: 1441px) {\\n    .card-adjust {\\n      height: 159px !important;\\n    }\\n  }\\n\\n  @media screen and (max-width: 1281px) {\\n    h5 {\\n      font-size: 1.64rem !important;\\n    }\\n  }\\n\\n  @media screen and (max-width: 1025px) {\\n    h5 {\\n      font-size: 1.2rem !important;\\n    }\\n  }\\n\\n  @media screen and (max-width: 801px) {\\n    h5 {\\n      font-size: 1.15rem !important;\\n    }\\n  }\\n\\n  @media screen and (max-width: 769px) {\\n    h5 {\\n      font-size: 1.1rem !important;\\n    }\\n  }\\n\\n  @media screen and (max-width: 721px) {\\n    h5 {\\n      font-size: 1.05rem !important;\\n    }\\n  }\\n\\n  @media screen and (max-width: 641px) {\\n    h5 {\\n      font-size: 1.04rem !important;\\n    }\\n  }\\n\\n  input:-internal-autofill-selected {\\n    background-color: transparent !important;\\n  }\\n\\n  label {\\n    margin-top: -5px;\\n  }\\n</style>\\n\"],\"names\":[],\"mappings\":\"AAgJE,WAAW,8BAAC,CAAC,AACX,OAAO,CAAE,WAAW,CACpB,OAAO,CAAE,YAAY,CACrB,OAAO,CAAE,WAAW,CACpB,OAAO,CAAE,IAAI,CACb,gBAAgB,CAAE,MAAM,CACxB,uBAAuB,CAAE,MAAM,CAC/B,aAAa,CAAE,MAAM,CACrB,eAAe,CAAE,MAAM,CACvB,iBAAiB,CAAE,MAAM,CACzB,mBAAmB,CAAE,MAAM,CAC3B,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,MAAM,CACnB,MAAM,CAAE,KAAK,AACf,CAAC,AAED,0BAAW,CAAC,WAAW,gBAAgB,WAAW,eAAC,CAAC,AAClD,WAAW,CAAE,CAAC,CAAC,UAAU,AAC3B,CAAC,AAED,OAAO,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAIvC,CAAC,AAED,OAAO,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAIvC,CAAC,AAED,OAAO,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAIvC,CAAC,AAED,OAAO,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAIvC,CAAC,AAED,OAAO,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAIvC,CAAC,AAED,OAAO,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAIvC,CAAC,AAED,OAAO,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AACrC,EAAE,8BAAC,CAAC,AACF,SAAS,CAAE,OAAO,CAAC,UAAU,AAC/B,CAAC,AACH,CAAC,AAED,OAAO,MAAM,CAAC,GAAG,CAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AACrC,EAAE,8BAAC,CAAC,AACF,SAAS,CAAE,MAAM,CAAC,UAAU,AAC9B,CAAC,AACH,CAAC,AAED,OAAO,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACpC,EAAE,8BAAC,CAAC,AACF,SAAS,CAAE,OAAO,CAAC,UAAU,AAC/B,CAAC,AACH,CAAC,AAED,OAAO,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACpC,EAAE,8BAAC,CAAC,AACF,SAAS,CAAE,MAAM,CAAC,UAAU,AAC9B,CAAC,AACH,CAAC,AAED,OAAO,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACpC,EAAE,8BAAC,CAAC,AACF,SAAS,CAAE,OAAO,CAAC,UAAU,AAC/B,CAAC,AACH,CAAC,AAED,OAAO,MAAM,CAAC,GAAG,CAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACpC,EAAE,8BAAC,CAAC,AACF,SAAS,CAAE,OAAO,CAAC,UAAU,AAC/B,CAAC,AACH,CAAC\"}"
};

async function preload$4(page, session) {
	try {
		const user = session.user;

		if (user != undefined && session.ok == true) {
			
		} //return this.redirect(302, '/profile/dashboard');

		return user;
	} catch(err) {
		return this.error("500", err);
	}
}

const Login = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	const { session } = stores$1();
	let errors = [];

	$$result.css.add(css$4);

	return `${($$result.head += `${($$result.title = `<title>Algedonic - LogIn</title>`, "")}`, "")}

<div class="${"row"}"><div class="${"col s12"}"><div class="${"container"}"><div id="${"login-page"}" class="${"row svelte-1lz7m8l"}"><div class="${"col s12 m6 l4 z-depth-4 card-panel border-radius-6 login-card\n          bg-opacity-8 svelte-1lz7m8l"}" style="${"border-radius: 22px; background: #ededed; box-shadow: 11px 11px\n          22px #c7c7c7, -11px -11px 22px #ffffff;"}">${ `<form class="${"login-form"}"><div class="${"row"}"><div class="${"input-field col s12"}"><h5 class="${"ml-4 svelte-1lz7m8l"}"><img src="${"logo2.png"}" style="${"width: 13vh;"}" alt="${"logo"}">
                    Welcome to Algedonic Demo!
                  </h5>

                  <small>While we&#39;re more connected than ever in history thanks to
                    technology. More often than not, we can see people
                    struggling with complex emotions and moods. They/We&#39;re coping with
                    such emotions alone, and they/we might think they/we&#39;re the only ones
                    experiencing such hardships. Now, as working-class people,
                    while we keep our minds busy over the 5/9 routine, sometimes
                    we lose perspective on how common and pandemic this issue really is. Not to mention how
                    shared those emotions are with your peers. Widespread depression and anxiety is, in fact, nowadays a
                    global public health issue. But, what if we, collectively, can help each other to make something out this reality?
                    The fact that people starting experincing loniness don&#39;t know about each other and their coping strategies,
                    undermines opportunities for mutual-aid and collective
                    action. Algedonic use cybernetic technology (an algedometer) to collect data about affective states
                    from working people. Algedonic not only shows you that you&#39;re not the only one fealing that way but encourages you and connect with people from the community to actually brainstorm structural strategies of mutual-aid and collection action to tackle such issues shared by the community.
                    <on class="${""}"></on></small>

                  ${validate_component(ListErrors, "ListErrors").$$render($$result, { errors }, {}, {})}</div></div>
              
             
              <div class="${"row"}"><div class="${"col s12 m12 l12 ml-2 mt-1"}"></div></div>

              <div class="${"row"}"><div class="${"input-field col s12"}"><button type="${"submit"}" class="${"btn waves-effect waves-light border-round blue col\n                    s12"}">Let&#39;s Start!
                  </button></div></div></form>`
	}</div>
        
        ${ `<div></div>` }</div></div>
    <div class="${"content-overlay"}"></div></div>
</div>`;
});

/* src/routes/auth/_layout.svelte generated by Svelte v3.29.4 */

const Layout$3 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { segment } = $$props;
	if ($$props.segment === void 0 && $$bindings.segment && segment !== void 0) $$bindings.segment(segment);

	return `<div id="${"layoutAuthentication"}" class="${"bg-primary"}"><div id="${"layoutAuthentication_content"}"><main>${validate_component(Container, "Container").$$render($$result, {}, {}, {
		default: () => `${validate_component(Row, "Row").$$render($$result, { class: "justify-content-center" }, {}, {
			default: () => `${segment === "login"
			? `${validate_component(Login, "Login").$$render($$result, {}, {}, {})}`
			: ``}`
		})}
        <div class="${"row"}"><div class="${"col m4 s4"}"></div>
          <div class="${"col m4 s4"}"><small>Created by <b>Patricio J. Gerpe</b></small></div>
          <div class="${"col m4 s4"}"></div></div>`
	})}</main></div></div>`;
});

// This file is generated by Sapper — do not edit it!

const manifest = {
	server_routes: [
		{
			// auth/logout.js
			pattern: /^\/auth\/logout\/?$/,
			handlers: route_0,
			params: () => ({})
		}
	],

	pages: [
		{
			// index.svelte
			pattern: /^\/$/,
			parts: [
				{ name: "index", file: "index.svelte", component: Routes, preload: preload }
			]
		},

		{
			// moods/index.svelte
			pattern: /^\/moods\/?$/,
			parts: [
				{ name: "moods", file: "moods/index.svelte", component: Moods }
			]
		},

		{
			// pages/error/error_401.svelte
			pattern: /^\/pages\/error\/error_401\/?$/,
			parts: [
				{ name: "pages__layout", file: "pages/_layout.svelte", component: Layout$1 },
				{ name: "pages_error__layout", file: "pages/error/_layout.svelte", component: Layout$2 },
				{ name: "pages_error_error_401", file: "pages/error/error_401.svelte", component: Error_401, preload: preload$1 }
			]
		},

		{
			// pages/error/error_404.svelte
			pattern: /^\/pages\/error\/error_404\/?$/,
			parts: [
				{ name: "pages__layout", file: "pages/_layout.svelte", component: Layout$1 },
				{ name: "pages_error__layout", file: "pages/error/_layout.svelte", component: Layout$2 },
				{ name: "pages_error_error_404", file: "pages/error/error_404.svelte", component: Error_404, preload: preload$2 }
			]
		},

		{
			// pages/error/error_500.svelte
			pattern: /^\/pages\/error\/error_500\/?$/,
			parts: [
				{ name: "pages__layout", file: "pages/_layout.svelte", component: Layout$1 },
				{ name: "pages_error__layout", file: "pages/error/_layout.svelte", component: Layout$2 },
				{ name: "pages_error_error_500", file: "pages/error/error_500.svelte", component: Error_500, preload: preload$3 }
			]
		},

		{
			// pains/index.svelte
			pattern: /^\/pains\/?$/,
			parts: [
				{ name: "pains", file: "pains/index.svelte", component: Pains }
			]
		},

		{
			// auth/login.svelte
			pattern: /^\/auth\/login\/?$/,
			parts: [
				{ name: "auth__layout", file: "auth/_layout.svelte", component: Layout$3 },
				{ name: "auth_login", file: "auth/login.svelte", component: Login, preload: preload$4 }
			]
		}
	],

	root: Layout,
	root_preload: () => {},
	error: Error$1
};

const build_dir = "__sapper__/build";

/**
 * @param typeMap [Object] Map of MIME type -> Array[extensions]
 * @param ...
 */
function Mime() {
  this._types = Object.create(null);
  this._extensions = Object.create(null);

  for (var i = 0; i < arguments.length; i++) {
    this.define(arguments[i]);
  }

  this.define = this.define.bind(this);
  this.getType = this.getType.bind(this);
  this.getExtension = this.getExtension.bind(this);
}

/**
 * Define mimetype -> extension mappings.  Each key is a mime-type that maps
 * to an array of extensions associated with the type.  The first extension is
 * used as the default extension for the type.
 *
 * e.g. mime.define({'audio/ogg', ['oga', 'ogg', 'spx']});
 *
 * If a type declares an extension that has already been defined, an error will
 * be thrown.  To suppress this error and force the extension to be associated
 * with the new type, pass `force`=true.  Alternatively, you may prefix the
 * extension with "*" to map the type to extension, without mapping the
 * extension to the type.
 *
 * e.g. mime.define({'audio/wav', ['wav']}, {'audio/x-wav', ['*wav']});
 *
 *
 * @param map (Object) type definitions
 * @param force (Boolean) if true, force overriding of existing definitions
 */
Mime.prototype.define = function(typeMap, force) {
  for (var type in typeMap) {
    var extensions = typeMap[type].map(function(t) {return t.toLowerCase()});
    type = type.toLowerCase();

    for (var i = 0; i < extensions.length; i++) {
      var ext = extensions[i];

      // '*' prefix = not the preferred type for this extension.  So fixup the
      // extension, and skip it.
      if (ext[0] == '*') {
        continue;
      }

      if (!force && (ext in this._types)) {
        throw new Error(
          'Attempt to change mapping for "' + ext +
          '" extension from "' + this._types[ext] + '" to "' + type +
          '". Pass `force=true` to allow this, otherwise remove "' + ext +
          '" from the list of extensions for "' + type + '".'
        );
      }

      this._types[ext] = type;
    }

    // Use first extension as default
    if (force || !this._extensions[type]) {
      var ext = extensions[0];
      this._extensions[type] = (ext[0] != '*') ? ext : ext.substr(1);
    }
  }
};

/**
 * Lookup a mime type based on extension
 */
Mime.prototype.getType = function(path) {
  path = String(path);
  var last = path.replace(/^.*[/\\]/, '').toLowerCase();
  var ext = last.replace(/^.*\./, '').toLowerCase();

  var hasPath = last.length < path.length;
  var hasDot = ext.length < last.length - 1;

  return (hasDot || !hasPath) && this._types[ext] || null;
};

/**
 * Return file extension associated with a mime type
 */
Mime.prototype.getExtension = function(type) {
  type = /^\s*([^;\s]*)/.test(type) && RegExp.$1;
  return type && this._extensions[type.toLowerCase()] || null;
};

var Mime_1 = Mime;

var standard = {"application/andrew-inset":["ez"],"application/applixware":["aw"],"application/atom+xml":["atom"],"application/atomcat+xml":["atomcat"],"application/atomsvc+xml":["atomsvc"],"application/bdoc":["bdoc"],"application/ccxml+xml":["ccxml"],"application/cdmi-capability":["cdmia"],"application/cdmi-container":["cdmic"],"application/cdmi-domain":["cdmid"],"application/cdmi-object":["cdmio"],"application/cdmi-queue":["cdmiq"],"application/cu-seeme":["cu"],"application/dash+xml":["mpd"],"application/davmount+xml":["davmount"],"application/docbook+xml":["dbk"],"application/dssc+der":["dssc"],"application/dssc+xml":["xdssc"],"application/ecmascript":["ecma","es"],"application/emma+xml":["emma"],"application/epub+zip":["epub"],"application/exi":["exi"],"application/font-tdpfr":["pfr"],"application/geo+json":["geojson"],"application/gml+xml":["gml"],"application/gpx+xml":["gpx"],"application/gxf":["gxf"],"application/gzip":["gz"],"application/hjson":["hjson"],"application/hyperstudio":["stk"],"application/inkml+xml":["ink","inkml"],"application/ipfix":["ipfix"],"application/java-archive":["jar","war","ear"],"application/java-serialized-object":["ser"],"application/java-vm":["class"],"application/javascript":["js","mjs"],"application/json":["json","map"],"application/json5":["json5"],"application/jsonml+json":["jsonml"],"application/ld+json":["jsonld"],"application/lost+xml":["lostxml"],"application/mac-binhex40":["hqx"],"application/mac-compactpro":["cpt"],"application/mads+xml":["mads"],"application/manifest+json":["webmanifest"],"application/marc":["mrc"],"application/marcxml+xml":["mrcx"],"application/mathematica":["ma","nb","mb"],"application/mathml+xml":["mathml"],"application/mbox":["mbox"],"application/mediaservercontrol+xml":["mscml"],"application/metalink+xml":["metalink"],"application/metalink4+xml":["meta4"],"application/mets+xml":["mets"],"application/mods+xml":["mods"],"application/mp21":["m21","mp21"],"application/mp4":["mp4s","m4p"],"application/msword":["doc","dot"],"application/mxf":["mxf"],"application/n-quads":["nq"],"application/n-triples":["nt"],"application/octet-stream":["bin","dms","lrf","mar","so","dist","distz","pkg","bpk","dump","elc","deploy","exe","dll","deb","dmg","iso","img","msi","msp","msm","buffer"],"application/oda":["oda"],"application/oebps-package+xml":["opf"],"application/ogg":["ogx"],"application/omdoc+xml":["omdoc"],"application/onenote":["onetoc","onetoc2","onetmp","onepkg"],"application/oxps":["oxps"],"application/patch-ops-error+xml":["xer"],"application/pdf":["pdf"],"application/pgp-encrypted":["pgp"],"application/pgp-signature":["asc","sig"],"application/pics-rules":["prf"],"application/pkcs10":["p10"],"application/pkcs7-mime":["p7m","p7c"],"application/pkcs7-signature":["p7s"],"application/pkcs8":["p8"],"application/pkix-attr-cert":["ac"],"application/pkix-cert":["cer"],"application/pkix-crl":["crl"],"application/pkix-pkipath":["pkipath"],"application/pkixcmp":["pki"],"application/pls+xml":["pls"],"application/postscript":["ai","eps","ps"],"application/pskc+xml":["pskcxml"],"application/raml+yaml":["raml"],"application/rdf+xml":["rdf","owl"],"application/reginfo+xml":["rif"],"application/relax-ng-compact-syntax":["rnc"],"application/resource-lists+xml":["rl"],"application/resource-lists-diff+xml":["rld"],"application/rls-services+xml":["rs"],"application/rpki-ghostbusters":["gbr"],"application/rpki-manifest":["mft"],"application/rpki-roa":["roa"],"application/rsd+xml":["rsd"],"application/rss+xml":["rss"],"application/rtf":["rtf"],"application/sbml+xml":["sbml"],"application/scvp-cv-request":["scq"],"application/scvp-cv-response":["scs"],"application/scvp-vp-request":["spq"],"application/scvp-vp-response":["spp"],"application/sdp":["sdp"],"application/set-payment-initiation":["setpay"],"application/set-registration-initiation":["setreg"],"application/shf+xml":["shf"],"application/sieve":["siv","sieve"],"application/smil+xml":["smi","smil"],"application/sparql-query":["rq"],"application/sparql-results+xml":["srx"],"application/srgs":["gram"],"application/srgs+xml":["grxml"],"application/sru+xml":["sru"],"application/ssdl+xml":["ssdl"],"application/ssml+xml":["ssml"],"application/tei+xml":["tei","teicorpus"],"application/thraud+xml":["tfi"],"application/timestamped-data":["tsd"],"application/voicexml+xml":["vxml"],"application/wasm":["wasm"],"application/widget":["wgt"],"application/winhlp":["hlp"],"application/wsdl+xml":["wsdl"],"application/wspolicy+xml":["wspolicy"],"application/xaml+xml":["xaml"],"application/xcap-diff+xml":["xdf"],"application/xenc+xml":["xenc"],"application/xhtml+xml":["xhtml","xht"],"application/xml":["xml","xsl","xsd","rng"],"application/xml-dtd":["dtd"],"application/xop+xml":["xop"],"application/xproc+xml":["xpl"],"application/xslt+xml":["xslt"],"application/xspf+xml":["xspf"],"application/xv+xml":["mxml","xhvml","xvml","xvm"],"application/yang":["yang"],"application/yin+xml":["yin"],"application/zip":["zip"],"audio/3gpp":["*3gpp"],"audio/adpcm":["adp"],"audio/basic":["au","snd"],"audio/midi":["mid","midi","kar","rmi"],"audio/mp3":["*mp3"],"audio/mp4":["m4a","mp4a"],"audio/mpeg":["mpga","mp2","mp2a","mp3","m2a","m3a"],"audio/ogg":["oga","ogg","spx"],"audio/s3m":["s3m"],"audio/silk":["sil"],"audio/wav":["wav"],"audio/wave":["*wav"],"audio/webm":["weba"],"audio/xm":["xm"],"font/collection":["ttc"],"font/otf":["otf"],"font/ttf":["ttf"],"font/woff":["woff"],"font/woff2":["woff2"],"image/aces":["exr"],"image/apng":["apng"],"image/bmp":["bmp"],"image/cgm":["cgm"],"image/dicom-rle":["drle"],"image/emf":["emf"],"image/fits":["fits"],"image/g3fax":["g3"],"image/gif":["gif"],"image/heic":["heic"],"image/heic-sequence":["heics"],"image/heif":["heif"],"image/heif-sequence":["heifs"],"image/ief":["ief"],"image/jls":["jls"],"image/jp2":["jp2","jpg2"],"image/jpeg":["jpeg","jpg","jpe"],"image/jpm":["jpm"],"image/jpx":["jpx","jpf"],"image/jxr":["jxr"],"image/ktx":["ktx"],"image/png":["png"],"image/sgi":["sgi"],"image/svg+xml":["svg","svgz"],"image/t38":["t38"],"image/tiff":["tif","tiff"],"image/tiff-fx":["tfx"],"image/webp":["webp"],"image/wmf":["wmf"],"message/disposition-notification":["disposition-notification"],"message/global":["u8msg"],"message/global-delivery-status":["u8dsn"],"message/global-disposition-notification":["u8mdn"],"message/global-headers":["u8hdr"],"message/rfc822":["eml","mime"],"model/3mf":["3mf"],"model/gltf+json":["gltf"],"model/gltf-binary":["glb"],"model/iges":["igs","iges"],"model/mesh":["msh","mesh","silo"],"model/stl":["stl"],"model/vrml":["wrl","vrml"],"model/x3d+binary":["*x3db","x3dbz"],"model/x3d+fastinfoset":["x3db"],"model/x3d+vrml":["*x3dv","x3dvz"],"model/x3d+xml":["x3d","x3dz"],"model/x3d-vrml":["x3dv"],"text/cache-manifest":["appcache","manifest"],"text/calendar":["ics","ifb"],"text/coffeescript":["coffee","litcoffee"],"text/css":["css"],"text/csv":["csv"],"text/html":["html","htm","shtml"],"text/jade":["jade"],"text/jsx":["jsx"],"text/less":["less"],"text/markdown":["markdown","md"],"text/mathml":["mml"],"text/mdx":["mdx"],"text/n3":["n3"],"text/plain":["txt","text","conf","def","list","log","in","ini"],"text/richtext":["rtx"],"text/rtf":["*rtf"],"text/sgml":["sgml","sgm"],"text/shex":["shex"],"text/slim":["slim","slm"],"text/stylus":["stylus","styl"],"text/tab-separated-values":["tsv"],"text/troff":["t","tr","roff","man","me","ms"],"text/turtle":["ttl"],"text/uri-list":["uri","uris","urls"],"text/vcard":["vcard"],"text/vtt":["vtt"],"text/xml":["*xml"],"text/yaml":["yaml","yml"],"video/3gpp":["3gp","3gpp"],"video/3gpp2":["3g2"],"video/h261":["h261"],"video/h263":["h263"],"video/h264":["h264"],"video/jpeg":["jpgv"],"video/jpm":["*jpm","jpgm"],"video/mj2":["mj2","mjp2"],"video/mp2t":["ts"],"video/mp4":["mp4","mp4v","mpg4"],"video/mpeg":["mpeg","mpg","mpe","m1v","m2v"],"video/ogg":["ogv"],"video/quicktime":["qt","mov"],"video/webm":["webm"]};

var lite = new Mime_1(standard);

function get_server_route_handler(routes) {
	async function handle_route(route, req, res, next) {
		req.params = route.params(route.pattern.exec(req.path));

		const method = req.method.toLowerCase();
		// 'delete' cannot be exported from a module because it is a keyword,
		// so check for 'del' instead
		const method_export = method === 'delete' ? 'del' : method;
		const handle_method = route.handlers[method_export];
		if (handle_method) {
			if (process.env.SAPPER_EXPORT) {
				const { write, end, setHeader } = res;
				const chunks = [];
				const headers = {};

				// intercept data so that it can be exported
				res.write = function(chunk) {
					chunks.push(Buffer.from(chunk));
					write.apply(res, arguments);
				};

				res.setHeader = function(name, value) {
					headers[name.toLowerCase()] = value;
					setHeader.apply(res, arguments);
				};

				res.end = function(chunk) {
					if (chunk) chunks.push(Buffer.from(chunk));
					end.apply(res, arguments);

					process.send({
						__sapper__: true,
						event: 'file',
						url: req.url,
						method: req.method,
						status: res.statusCode,
						type: headers['content-type'],
						body: Buffer.concat(chunks).toString()
					});
				};
			}

			const handle_next = (err) => {
				if (err) {
					res.statusCode = 500;
					res.end(err.message);
				} else {
					process.nextTick(next);
				}
			};

			try {
				await handle_method(req, res, handle_next);
			} catch (err) {
				console.error(err);
				handle_next(err);
			}
		} else {
			// no matching handler for method
			process.nextTick(next);
		}
	}

	return function find_route(req, res, next) {
		for (const route of routes) {
			if (route.pattern.test(req.path)) {
				handle_route(route, req, res, next);
				return;
			}
		}

		next();
	};
}

/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module exports.
 * @public
 */

var parse_1 = parse;
var serialize_1 = serialize;

/**
 * Module variables.
 * @private
 */

var decode = decodeURIComponent;
var encode = encodeURIComponent;
var pairSplitRegExp = /; */;

/**
 * RegExp to match field-content in RFC 7230 sec 3.2
 *
 * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
 * field-vchar   = VCHAR / obs-text
 * obs-text      = %x80-FF
 */

var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

/**
 * Parse a cookie header.
 *
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 *
 * @param {string} str
 * @param {object} [options]
 * @return {object}
 * @public
 */

function parse(str, options) {
  if (typeof str !== 'string') {
    throw new TypeError('argument str must be a string');
  }

  var obj = {};
  var opt = options || {};
  var pairs = str.split(pairSplitRegExp);
  var dec = opt.decode || decode;

  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i];
    var eq_idx = pair.indexOf('=');

    // skip things that don't look like key=value
    if (eq_idx < 0) {
      continue;
    }

    var key = pair.substr(0, eq_idx).trim();
    var val = pair.substr(++eq_idx, pair.length).trim();

    // quoted values
    if ('"' == val[0]) {
      val = val.slice(1, -1);
    }

    // only assign once
    if (undefined == obj[key]) {
      obj[key] = tryDecode(val, dec);
    }
  }

  return obj;
}

/**
 * Serialize data into a cookie header.
 *
 * Serialize the a name value pair into a cookie string suitable for
 * http headers. An optional options object specified cookie parameters.
 *
 * serialize('foo', 'bar', { httpOnly: true })
 *   => "foo=bar; httpOnly"
 *
 * @param {string} name
 * @param {string} val
 * @param {object} [options]
 * @return {string}
 * @public
 */

function serialize(name, val, options) {
  var opt = options || {};
  var enc = opt.encode || encode;

  if (typeof enc !== 'function') {
    throw new TypeError('option encode is invalid');
  }

  if (!fieldContentRegExp.test(name)) {
    throw new TypeError('argument name is invalid');
  }

  var value = enc(val);

  if (value && !fieldContentRegExp.test(value)) {
    throw new TypeError('argument val is invalid');
  }

  var str = name + '=' + value;

  if (null != opt.maxAge) {
    var maxAge = opt.maxAge - 0;
    if (isNaN(maxAge)) throw new Error('maxAge should be a Number');
    str += '; Max-Age=' + Math.floor(maxAge);
  }

  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new TypeError('option domain is invalid');
    }

    str += '; Domain=' + opt.domain;
  }

  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new TypeError('option path is invalid');
    }

    str += '; Path=' + opt.path;
  }

  if (opt.expires) {
    if (typeof opt.expires.toUTCString !== 'function') {
      throw new TypeError('option expires is invalid');
    }

    str += '; Expires=' + opt.expires.toUTCString();
  }

  if (opt.httpOnly) {
    str += '; HttpOnly';
  }

  if (opt.secure) {
    str += '; Secure';
  }

  if (opt.sameSite) {
    var sameSite = typeof opt.sameSite === 'string'
      ? opt.sameSite.toLowerCase() : opt.sameSite;

    switch (sameSite) {
      case true:
        str += '; SameSite=Strict';
        break;
      case 'lax':
        str += '; SameSite=Lax';
        break;
      case 'strict':
        str += '; SameSite=Strict';
        break;
      case 'none':
        str += '; SameSite=None';
        break;
      default:
        throw new TypeError('option sameSite is invalid');
    }
  }

  return str;
}

/**
 * Try decoding a string using a decoding function.
 *
 * @param {string} str
 * @param {function} decode
 * @private
 */

function tryDecode(str, decode) {
  try {
    return decode(str);
  } catch (e) {
    return str;
  }
}

var cookie = {
	parse: parse_1,
	serialize: serialize_1
};

var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$';
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
    '<': '\\u003C',
    '>': '\\u003E',
    '/': '\\u002F',
    '\\': '\\\\',
    '\b': '\\b',
    '\f': '\\f',
    '\n': '\\n',
    '\r': '\\r',
    '\t': '\\t',
    '\0': '\\0',
    '\u2028': '\\u2028',
    '\u2029': '\\u2029'
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join('\0');
function devalue(value) {
    var counts = new Map();
    function walk(thing) {
        if (typeof thing === 'function') {
            throw new Error("Cannot stringify a function");
        }
        if (counts.has(thing)) {
            counts.set(thing, counts.get(thing) + 1);
            return;
        }
        counts.set(thing, 1);
        if (!isPrimitive(thing)) {
            var type = getType(thing);
            switch (type) {
                case 'Number':
                case 'String':
                case 'Boolean':
                case 'Date':
                case 'RegExp':
                    return;
                case 'Array':
                    thing.forEach(walk);
                    break;
                case 'Set':
                case 'Map':
                    Array.from(thing).forEach(walk);
                    break;
                default:
                    var proto = Object.getPrototypeOf(thing);
                    if (proto !== Object.prototype &&
                        proto !== null &&
                        Object.getOwnPropertyNames(proto).sort().join('\0') !== objectProtoOwnPropertyNames) {
                        throw new Error("Cannot stringify arbitrary non-POJOs");
                    }
                    if (Object.getOwnPropertySymbols(thing).length > 0) {
                        throw new Error("Cannot stringify POJOs with symbolic keys");
                    }
                    Object.keys(thing).forEach(function (key) { return walk(thing[key]); });
            }
        }
    }
    walk(value);
    var names = new Map();
    Array.from(counts)
        .filter(function (entry) { return entry[1] > 1; })
        .sort(function (a, b) { return b[1] - a[1]; })
        .forEach(function (entry, i) {
        names.set(entry[0], getName(i));
    });
    function stringify(thing) {
        if (names.has(thing)) {
            return names.get(thing);
        }
        if (isPrimitive(thing)) {
            return stringifyPrimitive(thing);
        }
        var type = getType(thing);
        switch (type) {
            case 'Number':
            case 'String':
            case 'Boolean':
                return "Object(" + stringify(thing.valueOf()) + ")";
            case 'RegExp':
                return thing.toString();
            case 'Date':
                return "new Date(" + thing.getTime() + ")";
            case 'Array':
                var members = thing.map(function (v, i) { return i in thing ? stringify(v) : ''; });
                var tail = thing.length === 0 || (thing.length - 1 in thing) ? '' : ',';
                return "[" + members.join(',') + tail + "]";
            case 'Set':
            case 'Map':
                return "new " + type + "([" + Array.from(thing).map(stringify).join(',') + "])";
            default:
                var obj = "{" + Object.keys(thing).map(function (key) { return safeKey(key) + ":" + stringify(thing[key]); }).join(',') + "}";
                var proto = Object.getPrototypeOf(thing);
                if (proto === null) {
                    return Object.keys(thing).length > 0
                        ? "Object.assign(Object.create(null)," + obj + ")"
                        : "Object.create(null)";
                }
                return obj;
        }
    }
    var str = stringify(value);
    if (names.size) {
        var params_1 = [];
        var statements_1 = [];
        var values_1 = [];
        names.forEach(function (name, thing) {
            params_1.push(name);
            if (isPrimitive(thing)) {
                values_1.push(stringifyPrimitive(thing));
                return;
            }
            var type = getType(thing);
            switch (type) {
                case 'Number':
                case 'String':
                case 'Boolean':
                    values_1.push("Object(" + stringify(thing.valueOf()) + ")");
                    break;
                case 'RegExp':
                    values_1.push(thing.toString());
                    break;
                case 'Date':
                    values_1.push("new Date(" + thing.getTime() + ")");
                    break;
                case 'Array':
                    values_1.push("Array(" + thing.length + ")");
                    thing.forEach(function (v, i) {
                        statements_1.push(name + "[" + i + "]=" + stringify(v));
                    });
                    break;
                case 'Set':
                    values_1.push("new Set");
                    statements_1.push(name + "." + Array.from(thing).map(function (v) { return "add(" + stringify(v) + ")"; }).join('.'));
                    break;
                case 'Map':
                    values_1.push("new Map");
                    statements_1.push(name + "." + Array.from(thing).map(function (_a) {
                        var k = _a[0], v = _a[1];
                        return "set(" + stringify(k) + ", " + stringify(v) + ")";
                    }).join('.'));
                    break;
                default:
                    values_1.push(Object.getPrototypeOf(thing) === null ? 'Object.create(null)' : '{}');
                    Object.keys(thing).forEach(function (key) {
                        statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
                    });
            }
        });
        statements_1.push("return " + str);
        return "(function(" + params_1.join(',') + "){" + statements_1.join(';') + "}(" + values_1.join(',') + "))";
    }
    else {
        return str;
    }
}
function getName(num) {
    var name = '';
    do {
        name = chars[num % chars.length] + name;
        num = ~~(num / chars.length) - 1;
    } while (num >= 0);
    return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
    return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
    if (typeof thing === 'string')
        return stringifyString(thing);
    if (thing === void 0)
        return 'void 0';
    if (thing === 0 && 1 / thing < 0)
        return '-0';
    var str = String(thing);
    if (typeof thing === 'number')
        return str.replace(/^(-)?0\./, '$1.');
    return str;
}
function getType(thing) {
    return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
    return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
    return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
    return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
    return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
    var result = '"';
    for (var i = 0; i < str.length; i += 1) {
        var char = str.charAt(i);
        var code = char.charCodeAt(0);
        if (char === '"') {
            result += '\\"';
        }
        else if (char in escaped$1) {
            result += escaped$1[char];
        }
        else if (code >= 0xd800 && code <= 0xdfff) {
            var next = str.charCodeAt(i + 1);
            // If this is the beginning of a [high, low] surrogate pair,
            // add the next two characters, otherwise escape
            if (code <= 0xdbff && (next >= 0xdc00 && next <= 0xdfff)) {
                result += char + str[++i];
            }
            else {
                result += "\\u" + code.toString(16).toUpperCase();
            }
        }
        else {
            result += char;
        }
    }
    result += '"';
    return result;
}

// Based on https://github.com/tmpvar/jsdom/blob/aa85b2abf07766ff7bf5c1f6daafb3726f2f2db5/lib/jsdom/living/blob.js

// fix for "Readable" isn't a named export issue
const Readable = Stream$1.Readable;

const BUFFER = Symbol('buffer');
const TYPE = Symbol('type');

class Blob {
	constructor() {
		this[TYPE] = '';

		const blobParts = arguments[0];
		const options = arguments[1];

		const buffers = [];
		let size = 0;

		if (blobParts) {
			const a = blobParts;
			const length = Number(a.length);
			for (let i = 0; i < length; i++) {
				const element = a[i];
				let buffer;
				if (element instanceof Buffer) {
					buffer = element;
				} else if (ArrayBuffer.isView(element)) {
					buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
				} else if (element instanceof ArrayBuffer) {
					buffer = Buffer.from(element);
				} else if (element instanceof Blob) {
					buffer = element[BUFFER];
				} else {
					buffer = Buffer.from(typeof element === 'string' ? element : String(element));
				}
				size += buffer.length;
				buffers.push(buffer);
			}
		}

		this[BUFFER] = Buffer.concat(buffers);

		let type = options && options.type !== undefined && String(options.type).toLowerCase();
		if (type && !/[^\u0020-\u007E]/.test(type)) {
			this[TYPE] = type;
		}
	}
	get size() {
		return this[BUFFER].length;
	}
	get type() {
		return this[TYPE];
	}
	text() {
		return Promise.resolve(this[BUFFER].toString());
	}
	arrayBuffer() {
		const buf = this[BUFFER];
		const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		return Promise.resolve(ab);
	}
	stream() {
		const readable = new Readable();
		readable._read = function () {};
		readable.push(this[BUFFER]);
		readable.push(null);
		return readable;
	}
	toString() {
		return '[object Blob]';
	}
	slice() {
		const size = this.size;

		const start = arguments[0];
		const end = arguments[1];
		let relativeStart, relativeEnd;
		if (start === undefined) {
			relativeStart = 0;
		} else if (start < 0) {
			relativeStart = Math.max(size + start, 0);
		} else {
			relativeStart = Math.min(start, size);
		}
		if (end === undefined) {
			relativeEnd = size;
		} else if (end < 0) {
			relativeEnd = Math.max(size + end, 0);
		} else {
			relativeEnd = Math.min(end, size);
		}
		const span = Math.max(relativeEnd - relativeStart, 0);

		const buffer = this[BUFFER];
		const slicedBuffer = buffer.slice(relativeStart, relativeStart + span);
		const blob = new Blob([], { type: arguments[2] });
		blob[BUFFER] = slicedBuffer;
		return blob;
	}
}

Object.defineProperties(Blob.prototype, {
	size: { enumerable: true },
	type: { enumerable: true },
	slice: { enumerable: true }
});

Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
	value: 'Blob',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * fetch-error.js
 *
 * FetchError interface for operational errors
 */

/**
 * Create FetchError instance
 *
 * @param   String      message      Error message for human
 * @param   String      type         Error type for machine
 * @param   String      systemError  For Node.js system error
 * @return  FetchError
 */
function FetchError(message, type, systemError) {
  Error.call(this, message);

  this.message = message;
  this.type = type;

  // when err.type is `system`, err.code contains system error code
  if (systemError) {
    this.code = this.errno = systemError.code;
  }

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

FetchError.prototype = Object.create(Error.prototype);
FetchError.prototype.constructor = FetchError;
FetchError.prototype.name = 'FetchError';

let convert;
try {
	convert = require('encoding').convert;
} catch (e) {}

const INTERNALS = Symbol('Body internals');

// fix an issue where "PassThrough" isn't a named export for node <10
const PassThrough = Stream$1.PassThrough;

/**
 * Body mixin
 *
 * Ref: https://fetch.spec.whatwg.org/#body
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
function Body(body) {
	var _this = this;

	var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    _ref$size = _ref.size;

	let size = _ref$size === undefined ? 0 : _ref$size;
	var _ref$timeout = _ref.timeout;
	let timeout = _ref$timeout === undefined ? 0 : _ref$timeout;

	if (body == null) {
		// body is undefined or null
		body = null;
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		body = Buffer.from(body.toString());
	} else if (isBlob(body)) ; else if (Buffer.isBuffer(body)) ; else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		body = Buffer.from(body);
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
	} else if (body instanceof Stream$1) ; else {
		// none of the above
		// coerce to string then buffer
		body = Buffer.from(String(body));
	}
	this[INTERNALS] = {
		body,
		disturbed: false,
		error: null
	};
	this.size = size;
	this.timeout = timeout;

	if (body instanceof Stream$1) {
		body.on('error', function (err) {
			const error = err.name === 'AbortError' ? err : new FetchError(`Invalid response body while trying to fetch ${_this.url}: ${err.message}`, 'system', err);
			_this[INTERNALS].error = error;
		});
	}
}

Body.prototype = {
	get body() {
		return this[INTERNALS].body;
	},

	get bodyUsed() {
		return this[INTERNALS].disturbed;
	},

	/**
  * Decode response as ArrayBuffer
  *
  * @return  Promise
  */
	arrayBuffer() {
		return consumeBody.call(this).then(function (buf) {
			return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		});
	},

	/**
  * Return raw response as Blob
  *
  * @return Promise
  */
	blob() {
		let ct = this.headers && this.headers.get('content-type') || '';
		return consumeBody.call(this).then(function (buf) {
			return Object.assign(
			// Prevent copying
			new Blob([], {
				type: ct.toLowerCase()
			}), {
				[BUFFER]: buf
			});
		});
	},

	/**
  * Decode response as json
  *
  * @return  Promise
  */
	json() {
		var _this2 = this;

		return consumeBody.call(this).then(function (buffer) {
			try {
				return JSON.parse(buffer.toString());
			} catch (err) {
				return Body.Promise.reject(new FetchError(`invalid json response body at ${_this2.url} reason: ${err.message}`, 'invalid-json'));
			}
		});
	},

	/**
  * Decode response as text
  *
  * @return  Promise
  */
	text() {
		return consumeBody.call(this).then(function (buffer) {
			return buffer.toString();
		});
	},

	/**
  * Decode response as buffer (non-spec api)
  *
  * @return  Promise
  */
	buffer() {
		return consumeBody.call(this);
	},

	/**
  * Decode response as text, while automatically detecting the encoding and
  * trying to decode to UTF-8 (non-spec api)
  *
  * @return  Promise
  */
	textConverted() {
		var _this3 = this;

		return consumeBody.call(this).then(function (buffer) {
			return convertBody(buffer, _this3.headers);
		});
	}
};

// In browsers, all properties are enumerable.
Object.defineProperties(Body.prototype, {
	body: { enumerable: true },
	bodyUsed: { enumerable: true },
	arrayBuffer: { enumerable: true },
	blob: { enumerable: true },
	json: { enumerable: true },
	text: { enumerable: true }
});

Body.mixIn = function (proto) {
	for (const name of Object.getOwnPropertyNames(Body.prototype)) {
		// istanbul ignore else: future proof
		if (!(name in proto)) {
			const desc = Object.getOwnPropertyDescriptor(Body.prototype, name);
			Object.defineProperty(proto, name, desc);
		}
	}
};

/**
 * Consume and convert an entire Body to a Buffer.
 *
 * Ref: https://fetch.spec.whatwg.org/#concept-body-consume-body
 *
 * @return  Promise
 */
function consumeBody() {
	var _this4 = this;

	if (this[INTERNALS].disturbed) {
		return Body.Promise.reject(new TypeError(`body used already for: ${this.url}`));
	}

	this[INTERNALS].disturbed = true;

	if (this[INTERNALS].error) {
		return Body.Promise.reject(this[INTERNALS].error);
	}

	let body = this.body;

	// body is null
	if (body === null) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is blob
	if (isBlob(body)) {
		body = body.stream();
	}

	// body is buffer
	if (Buffer.isBuffer(body)) {
		return Body.Promise.resolve(body);
	}

	// istanbul ignore if: should never happen
	if (!(body instanceof Stream$1)) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is stream
	// get ready to actually consume the body
	let accum = [];
	let accumBytes = 0;
	let abort = false;

	return new Body.Promise(function (resolve, reject) {
		let resTimeout;

		// allow timeout on slow response body
		if (_this4.timeout) {
			resTimeout = setTimeout(function () {
				abort = true;
				reject(new FetchError(`Response timeout while trying to fetch ${_this4.url} (over ${_this4.timeout}ms)`, 'body-timeout'));
			}, _this4.timeout);
		}

		// handle stream errors
		body.on('error', function (err) {
			if (err.name === 'AbortError') {
				// if the request was aborted, reject with this Error
				abort = true;
				reject(err);
			} else {
				// other errors, such as incorrect content-encoding
				reject(new FetchError(`Invalid response body while trying to fetch ${_this4.url}: ${err.message}`, 'system', err));
			}
		});

		body.on('data', function (chunk) {
			if (abort || chunk === null) {
				return;
			}

			if (_this4.size && accumBytes + chunk.length > _this4.size) {
				abort = true;
				reject(new FetchError(`content size at ${_this4.url} over limit: ${_this4.size}`, 'max-size'));
				return;
			}

			accumBytes += chunk.length;
			accum.push(chunk);
		});

		body.on('end', function () {
			if (abort) {
				return;
			}

			clearTimeout(resTimeout);

			try {
				resolve(Buffer.concat(accum, accumBytes));
			} catch (err) {
				// handle streams that have accumulated too much data (issue #414)
				reject(new FetchError(`Could not create Buffer from response body for ${_this4.url}: ${err.message}`, 'system', err));
			}
		});
	});
}

/**
 * Detect buffer encoding and convert to target encoding
 * ref: http://www.w3.org/TR/2011/WD-html5-20110113/parsing.html#determining-the-character-encoding
 *
 * @param   Buffer  buffer    Incoming buffer
 * @param   String  encoding  Target encoding
 * @return  String
 */
function convertBody(buffer, headers) {
	if (typeof convert !== 'function') {
		throw new Error('The package `encoding` must be installed to use the textConverted() function');
	}

	const ct = headers.get('content-type');
	let charset = 'utf-8';
	let res, str;

	// header
	if (ct) {
		res = /charset=([^;]*)/i.exec(ct);
	}

	// no charset in content type, peek at response body for at most 1024 bytes
	str = buffer.slice(0, 1024).toString();

	// html5
	if (!res && str) {
		res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
	}

	// html4
	if (!res && str) {
		res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str);

		if (res) {
			res = /charset=(.*)/i.exec(res.pop());
		}
	}

	// xml
	if (!res && str) {
		res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
	}

	// found charset
	if (res) {
		charset = res.pop();

		// prevent decode issues when sites use incorrect encoding
		// ref: https://hsivonen.fi/encoding-menu/
		if (charset === 'gb2312' || charset === 'gbk') {
			charset = 'gb18030';
		}
	}

	// turn raw buffers into a single utf-8 buffer
	return convert(buffer, 'UTF-8', charset).toString();
}

/**
 * Detect a URLSearchParams object
 * ref: https://github.com/bitinn/node-fetch/issues/296#issuecomment-307598143
 *
 * @param   Object  obj     Object to detect by type or brand
 * @return  String
 */
function isURLSearchParams(obj) {
	// Duck-typing as a necessary condition.
	if (typeof obj !== 'object' || typeof obj.append !== 'function' || typeof obj.delete !== 'function' || typeof obj.get !== 'function' || typeof obj.getAll !== 'function' || typeof obj.has !== 'function' || typeof obj.set !== 'function') {
		return false;
	}

	// Brand-checking and more duck-typing as optional condition.
	return obj.constructor.name === 'URLSearchParams' || Object.prototype.toString.call(obj) === '[object URLSearchParams]' || typeof obj.sort === 'function';
}

/**
 * Check if `obj` is a W3C `Blob` object (which `File` inherits from)
 * @param  {*} obj
 * @return {boolean}
 */
function isBlob(obj) {
	return typeof obj === 'object' && typeof obj.arrayBuffer === 'function' && typeof obj.type === 'string' && typeof obj.stream === 'function' && typeof obj.constructor === 'function' && typeof obj.constructor.name === 'string' && /^(Blob|File)$/.test(obj.constructor.name) && /^(Blob|File)$/.test(obj[Symbol.toStringTag]);
}

/**
 * Clone body given Res/Req instance
 *
 * @param   Mixed  instance  Response or Request instance
 * @return  Mixed
 */
function clone(instance) {
	let p1, p2;
	let body = instance.body;

	// don't allow cloning a used body
	if (instance.bodyUsed) {
		throw new Error('cannot clone body after it is used');
	}

	// check that body is a stream and not form-data object
	// note: we can't clone the form-data object without having it as a dependency
	if (body instanceof Stream$1 && typeof body.getBoundary !== 'function') {
		// tee instance body
		p1 = new PassThrough();
		p2 = new PassThrough();
		body.pipe(p1);
		body.pipe(p2);
		// set instance body to teed body and return the other teed body
		instance[INTERNALS].body = p1;
		body = p2;
	}

	return body;
}

/**
 * Performs the operation "extract a `Content-Type` value from |object|" as
 * specified in the specification:
 * https://fetch.spec.whatwg.org/#concept-bodyinit-extract
 *
 * This function assumes that instance.body is present.
 *
 * @param   Mixed  instance  Any options.body input
 */
function extractContentType(body) {
	if (body === null) {
		// body is null
		return null;
	} else if (typeof body === 'string') {
		// body is string
		return 'text/plain;charset=UTF-8';
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		return 'application/x-www-form-urlencoded;charset=UTF-8';
	} else if (isBlob(body)) {
		// body is blob
		return body.type || null;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return null;
	} else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		return null;
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		return null;
	} else if (typeof body.getBoundary === 'function') {
		// detect form data input from form-data module
		return `multipart/form-data;boundary=${body.getBoundary()}`;
	} else if (body instanceof Stream$1) {
		// body is stream
		// can't really do much about this
		return null;
	} else {
		// Body constructor defaults other things to string
		return 'text/plain;charset=UTF-8';
	}
}

/**
 * The Fetch Standard treats this as if "total bytes" is a property on the body.
 * For us, we have to explicitly get it with a function.
 *
 * ref: https://fetch.spec.whatwg.org/#concept-body-total-bytes
 *
 * @param   Body    instance   Instance of Body
 * @return  Number?            Number of bytes, or null if not possible
 */
function getTotalBytes(instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		return 0;
	} else if (isBlob(body)) {
		return body.size;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return body.length;
	} else if (body && typeof body.getLengthSync === 'function') {
		// detect form data input from form-data module
		if (body._lengthRetrievers && body._lengthRetrievers.length == 0 || // 1.x
		body.hasKnownLength && body.hasKnownLength()) {
			// 2.x
			return body.getLengthSync();
		}
		return null;
	} else {
		// body is stream
		return null;
	}
}

/**
 * Write a Body to a Node.js WritableStream (e.g. http.Request) object.
 *
 * @param   Body    instance   Instance of Body
 * @return  Void
 */
function writeToStream(dest, instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		dest.end();
	} else if (isBlob(body)) {
		body.stream().pipe(dest);
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		dest.write(body);
		dest.end();
	} else {
		// body is stream
		body.pipe(dest);
	}
}

// expose Promise
Body.Promise = global.Promise;

/**
 * headers.js
 *
 * Headers class offers convenient helpers
 */

const invalidTokenRegex = /[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/;
const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/;

function validateName(name) {
	name = `${name}`;
	if (invalidTokenRegex.test(name) || name === '') {
		throw new TypeError(`${name} is not a legal HTTP header name`);
	}
}

function validateValue(value) {
	value = `${value}`;
	if (invalidHeaderCharRegex.test(value)) {
		throw new TypeError(`${value} is not a legal HTTP header value`);
	}
}

/**
 * Find the key in the map object given a header name.
 *
 * Returns undefined if not found.
 *
 * @param   String  name  Header name
 * @return  String|Undefined
 */
function find(map, name) {
	name = name.toLowerCase();
	for (const key in map) {
		if (key.toLowerCase() === name) {
			return key;
		}
	}
	return undefined;
}

const MAP = Symbol('map');
class Headers {
	/**
  * Headers class
  *
  * @param   Object  headers  Response headers
  * @return  Void
  */
	constructor() {
		let init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

		this[MAP] = Object.create(null);

		if (init instanceof Headers) {
			const rawHeaders = init.raw();
			const headerNames = Object.keys(rawHeaders);

			for (const headerName of headerNames) {
				for (const value of rawHeaders[headerName]) {
					this.append(headerName, value);
				}
			}

			return;
		}

		// We don't worry about converting prop to ByteString here as append()
		// will handle it.
		if (init == null) ; else if (typeof init === 'object') {
			const method = init[Symbol.iterator];
			if (method != null) {
				if (typeof method !== 'function') {
					throw new TypeError('Header pairs must be iterable');
				}

				// sequence<sequence<ByteString>>
				// Note: per spec we have to first exhaust the lists then process them
				const pairs = [];
				for (const pair of init) {
					if (typeof pair !== 'object' || typeof pair[Symbol.iterator] !== 'function') {
						throw new TypeError('Each header pair must be iterable');
					}
					pairs.push(Array.from(pair));
				}

				for (const pair of pairs) {
					if (pair.length !== 2) {
						throw new TypeError('Each header pair must be a name/value tuple');
					}
					this.append(pair[0], pair[1]);
				}
			} else {
				// record<ByteString, ByteString>
				for (const key of Object.keys(init)) {
					const value = init[key];
					this.append(key, value);
				}
			}
		} else {
			throw new TypeError('Provided initializer must be an object');
		}
	}

	/**
  * Return combined header value given name
  *
  * @param   String  name  Header name
  * @return  Mixed
  */
	get(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key === undefined) {
			return null;
		}

		return this[MAP][key].join(', ');
	}

	/**
  * Iterate over all headers
  *
  * @param   Function  callback  Executed for each item with parameters (value, name, thisArg)
  * @param   Boolean   thisArg   `this` context for callback function
  * @return  Void
  */
	forEach(callback) {
		let thisArg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

		let pairs = getHeaders(this);
		let i = 0;
		while (i < pairs.length) {
			var _pairs$i = pairs[i];
			const name = _pairs$i[0],
			      value = _pairs$i[1];

			callback.call(thisArg, value, name, this);
			pairs = getHeaders(this);
			i++;
		}
	}

	/**
  * Overwrite header values given name
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	set(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		this[MAP][key !== undefined ? key : name] = [value];
	}

	/**
  * Append a value onto existing header
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	append(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			this[MAP][key].push(value);
		} else {
			this[MAP][name] = [value];
		}
	}

	/**
  * Check for header name existence
  *
  * @param   String   name  Header name
  * @return  Boolean
  */
	has(name) {
		name = `${name}`;
		validateName(name);
		return find(this[MAP], name) !== undefined;
	}

	/**
  * Delete all header values given name
  *
  * @param   String  name  Header name
  * @return  Void
  */
	delete(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			delete this[MAP][key];
		}
	}

	/**
  * Return raw headers (non-spec api)
  *
  * @return  Object
  */
	raw() {
		return this[MAP];
	}

	/**
  * Get an iterator on keys.
  *
  * @return  Iterator
  */
	keys() {
		return createHeadersIterator(this, 'key');
	}

	/**
  * Get an iterator on values.
  *
  * @return  Iterator
  */
	values() {
		return createHeadersIterator(this, 'value');
	}

	/**
  * Get an iterator on entries.
  *
  * This is the default iterator of the Headers object.
  *
  * @return  Iterator
  */
	[Symbol.iterator]() {
		return createHeadersIterator(this, 'key+value');
	}
}
Headers.prototype.entries = Headers.prototype[Symbol.iterator];

Object.defineProperty(Headers.prototype, Symbol.toStringTag, {
	value: 'Headers',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Headers.prototype, {
	get: { enumerable: true },
	forEach: { enumerable: true },
	set: { enumerable: true },
	append: { enumerable: true },
	has: { enumerable: true },
	delete: { enumerable: true },
	keys: { enumerable: true },
	values: { enumerable: true },
	entries: { enumerable: true }
});

function getHeaders(headers) {
	let kind = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'key+value';

	const keys = Object.keys(headers[MAP]).sort();
	return keys.map(kind === 'key' ? function (k) {
		return k.toLowerCase();
	} : kind === 'value' ? function (k) {
		return headers[MAP][k].join(', ');
	} : function (k) {
		return [k.toLowerCase(), headers[MAP][k].join(', ')];
	});
}

const INTERNAL = Symbol('internal');

function createHeadersIterator(target, kind) {
	const iterator = Object.create(HeadersIteratorPrototype);
	iterator[INTERNAL] = {
		target,
		kind,
		index: 0
	};
	return iterator;
}

const HeadersIteratorPrototype = Object.setPrototypeOf({
	next() {
		// istanbul ignore if
		if (!this || Object.getPrototypeOf(this) !== HeadersIteratorPrototype) {
			throw new TypeError('Value of `this` is not a HeadersIterator');
		}

		var _INTERNAL = this[INTERNAL];
		const target = _INTERNAL.target,
		      kind = _INTERNAL.kind,
		      index = _INTERNAL.index;

		const values = getHeaders(target, kind);
		const len = values.length;
		if (index >= len) {
			return {
				value: undefined,
				done: true
			};
		}

		this[INTERNAL].index = index + 1;

		return {
			value: values[index],
			done: false
		};
	}
}, Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));

Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
	value: 'HeadersIterator',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * Export the Headers object in a form that Node.js can consume.
 *
 * @param   Headers  headers
 * @return  Object
 */
function exportNodeCompatibleHeaders(headers) {
	const obj = Object.assign({ __proto__: null }, headers[MAP]);

	// http.request() only supports string as Host header. This hack makes
	// specifying custom Host header possible.
	const hostHeaderKey = find(headers[MAP], 'Host');
	if (hostHeaderKey !== undefined) {
		obj[hostHeaderKey] = obj[hostHeaderKey][0];
	}

	return obj;
}

/**
 * Create a Headers object from an object of headers, ignoring those that do
 * not conform to HTTP grammar productions.
 *
 * @param   Object  obj  Object of headers
 * @return  Headers
 */
function createHeadersLenient(obj) {
	const headers = new Headers();
	for (const name of Object.keys(obj)) {
		if (invalidTokenRegex.test(name)) {
			continue;
		}
		if (Array.isArray(obj[name])) {
			for (const val of obj[name]) {
				if (invalidHeaderCharRegex.test(val)) {
					continue;
				}
				if (headers[MAP][name] === undefined) {
					headers[MAP][name] = [val];
				} else {
					headers[MAP][name].push(val);
				}
			}
		} else if (!invalidHeaderCharRegex.test(obj[name])) {
			headers[MAP][name] = [obj[name]];
		}
	}
	return headers;
}

const INTERNALS$1 = Symbol('Response internals');

// fix an issue where "STATUS_CODES" aren't a named export for node <10
const STATUS_CODES = http.STATUS_CODES;

/**
 * Response class
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
class Response {
	constructor() {
		let body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
		let opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		Body.call(this, body, opts);

		const status = opts.status || 200;
		const headers = new Headers(opts.headers);

		if (body != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(body);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		this[INTERNALS$1] = {
			url: opts.url,
			status,
			statusText: opts.statusText || STATUS_CODES[status],
			headers,
			counter: opts.counter
		};
	}

	get url() {
		return this[INTERNALS$1].url || '';
	}

	get status() {
		return this[INTERNALS$1].status;
	}

	/**
  * Convenience property representing if the request ended normally
  */
	get ok() {
		return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
	}

	get redirected() {
		return this[INTERNALS$1].counter > 0;
	}

	get statusText() {
		return this[INTERNALS$1].statusText;
	}

	get headers() {
		return this[INTERNALS$1].headers;
	}

	/**
  * Clone this response
  *
  * @return  Response
  */
	clone() {
		return new Response(clone(this), {
			url: this.url,
			status: this.status,
			statusText: this.statusText,
			headers: this.headers,
			ok: this.ok,
			redirected: this.redirected
		});
	}
}

Body.mixIn(Response.prototype);

Object.defineProperties(Response.prototype, {
	url: { enumerable: true },
	status: { enumerable: true },
	ok: { enumerable: true },
	redirected: { enumerable: true },
	statusText: { enumerable: true },
	headers: { enumerable: true },
	clone: { enumerable: true }
});

Object.defineProperty(Response.prototype, Symbol.toStringTag, {
	value: 'Response',
	writable: false,
	enumerable: false,
	configurable: true
});

const INTERNALS$2 = Symbol('Request internals');

// fix an issue where "format", "parse" aren't a named export for node <10
const parse_url = Url$1.parse;
const format_url = Url$1.format;

const streamDestructionSupported = 'destroy' in Stream$1.Readable.prototype;

/**
 * Check if a value is an instance of Request.
 *
 * @param   Mixed   input
 * @return  Boolean
 */
function isRequest(input) {
	return typeof input === 'object' && typeof input[INTERNALS$2] === 'object';
}

function isAbortSignal(signal) {
	const proto = signal && typeof signal === 'object' && Object.getPrototypeOf(signal);
	return !!(proto && proto.constructor.name === 'AbortSignal');
}

/**
 * Request class
 *
 * @param   Mixed   input  Url or Request instance
 * @param   Object  init   Custom options
 * @return  Void
 */
class Request {
	constructor(input) {
		let init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		let parsedURL;

		// normalize input
		if (!isRequest(input)) {
			if (input && input.href) {
				// in order to support Node.js' Url objects; though WHATWG's URL objects
				// will fall into this branch also (since their `toString()` will return
				// `href` property anyway)
				parsedURL = parse_url(input.href);
			} else {
				// coerce input to a string before attempting to parse
				parsedURL = parse_url(`${input}`);
			}
			input = {};
		} else {
			parsedURL = parse_url(input.url);
		}

		let method = init.method || input.method || 'GET';
		method = method.toUpperCase();

		if ((init.body != null || isRequest(input) && input.body !== null) && (method === 'GET' || method === 'HEAD')) {
			throw new TypeError('Request with GET/HEAD method cannot have body');
		}

		let inputBody = init.body != null ? init.body : isRequest(input) && input.body !== null ? clone(input) : null;

		Body.call(this, inputBody, {
			timeout: init.timeout || input.timeout || 0,
			size: init.size || input.size || 0
		});

		const headers = new Headers(init.headers || input.headers || {});

		if (inputBody != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(inputBody);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		let signal = isRequest(input) ? input.signal : null;
		if ('signal' in init) signal = init.signal;

		if (signal != null && !isAbortSignal(signal)) {
			throw new TypeError('Expected signal to be an instanceof AbortSignal');
		}

		this[INTERNALS$2] = {
			method,
			redirect: init.redirect || input.redirect || 'follow',
			headers,
			parsedURL,
			signal
		};

		// node-fetch-only options
		this.follow = init.follow !== undefined ? init.follow : input.follow !== undefined ? input.follow : 20;
		this.compress = init.compress !== undefined ? init.compress : input.compress !== undefined ? input.compress : true;
		this.counter = init.counter || input.counter || 0;
		this.agent = init.agent || input.agent;
	}

	get method() {
		return this[INTERNALS$2].method;
	}

	get url() {
		return format_url(this[INTERNALS$2].parsedURL);
	}

	get headers() {
		return this[INTERNALS$2].headers;
	}

	get redirect() {
		return this[INTERNALS$2].redirect;
	}

	get signal() {
		return this[INTERNALS$2].signal;
	}

	/**
  * Clone this request
  *
  * @return  Request
  */
	clone() {
		return new Request(this);
	}
}

Body.mixIn(Request.prototype);

Object.defineProperty(Request.prototype, Symbol.toStringTag, {
	value: 'Request',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Request.prototype, {
	method: { enumerable: true },
	url: { enumerable: true },
	headers: { enumerable: true },
	redirect: { enumerable: true },
	clone: { enumerable: true },
	signal: { enumerable: true }
});

/**
 * Convert a Request to Node.js http request options.
 *
 * @param   Request  A Request instance
 * @return  Object   The options object to be passed to http.request
 */
function getNodeRequestOptions(request) {
	const parsedURL = request[INTERNALS$2].parsedURL;
	const headers = new Headers(request[INTERNALS$2].headers);

	// fetch step 1.3
	if (!headers.has('Accept')) {
		headers.set('Accept', '*/*');
	}

	// Basic fetch
	if (!parsedURL.protocol || !parsedURL.hostname) {
		throw new TypeError('Only absolute URLs are supported');
	}

	if (!/^https?:$/.test(parsedURL.protocol)) {
		throw new TypeError('Only HTTP(S) protocols are supported');
	}

	if (request.signal && request.body instanceof Stream$1.Readable && !streamDestructionSupported) {
		throw new Error('Cancellation of streamed requests with AbortSignal is not supported in node < 8');
	}

	// HTTP-network-or-cache fetch steps 2.4-2.7
	let contentLengthValue = null;
	if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
		contentLengthValue = '0';
	}
	if (request.body != null) {
		const totalBytes = getTotalBytes(request);
		if (typeof totalBytes === 'number') {
			contentLengthValue = String(totalBytes);
		}
	}
	if (contentLengthValue) {
		headers.set('Content-Length', contentLengthValue);
	}

	// HTTP-network-or-cache fetch step 2.11
	if (!headers.has('User-Agent')) {
		headers.set('User-Agent', 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)');
	}

	// HTTP-network-or-cache fetch step 2.15
	if (request.compress && !headers.has('Accept-Encoding')) {
		headers.set('Accept-Encoding', 'gzip,deflate');
	}

	let agent = request.agent;
	if (typeof agent === 'function') {
		agent = agent(parsedURL);
	}

	if (!headers.has('Connection') && !agent) {
		headers.set('Connection', 'close');
	}

	// HTTP-network fetch step 4.2
	// chunked encoding is handled by Node.js

	return Object.assign({}, parsedURL, {
		method: request.method,
		headers: exportNodeCompatibleHeaders(headers),
		agent
	});
}

/**
 * abort-error.js
 *
 * AbortError interface for cancelled requests
 */

/**
 * Create AbortError instance
 *
 * @param   String      message      Error message for human
 * @return  AbortError
 */
function AbortError(message) {
  Error.call(this, message);

  this.type = 'aborted';
  this.message = message;

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

AbortError.prototype = Object.create(Error.prototype);
AbortError.prototype.constructor = AbortError;
AbortError.prototype.name = 'AbortError';

// fix an issue where "PassThrough", "resolve" aren't a named export for node <10
const PassThrough$1 = Stream$1.PassThrough;
const resolve_url = Url$1.resolve;

/**
 * Fetch function
 *
 * @param   Mixed    url   Absolute url or Request instance
 * @param   Object   opts  Fetch options
 * @return  Promise
 */
function fetch(url, opts) {

	// allow custom promise
	if (!fetch.Promise) {
		throw new Error('native promise missing, set fetch.Promise to your favorite alternative');
	}

	Body.Promise = fetch.Promise;

	// wrap http.request into fetch
	return new fetch.Promise(function (resolve, reject) {
		// build request object
		const request = new Request(url, opts);
		const options = getNodeRequestOptions(request);

		const send = (options.protocol === 'https:' ? https : http).request;
		const signal = request.signal;

		let response = null;

		const abort = function abort() {
			let error = new AbortError('The user aborted a request.');
			reject(error);
			if (request.body && request.body instanceof Stream$1.Readable) {
				request.body.destroy(error);
			}
			if (!response || !response.body) return;
			response.body.emit('error', error);
		};

		if (signal && signal.aborted) {
			abort();
			return;
		}

		const abortAndFinalize = function abortAndFinalize() {
			abort();
			finalize();
		};

		// send request
		const req = send(options);
		let reqTimeout;

		if (signal) {
			signal.addEventListener('abort', abortAndFinalize);
		}

		function finalize() {
			req.abort();
			if (signal) signal.removeEventListener('abort', abortAndFinalize);
			clearTimeout(reqTimeout);
		}

		if (request.timeout) {
			req.once('socket', function (socket) {
				reqTimeout = setTimeout(function () {
					reject(new FetchError(`network timeout at: ${request.url}`, 'request-timeout'));
					finalize();
				}, request.timeout);
			});
		}

		req.on('error', function (err) {
			reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, 'system', err));
			finalize();
		});

		req.on('response', function (res) {
			clearTimeout(reqTimeout);

			const headers = createHeadersLenient(res.headers);

			// HTTP fetch step 5
			if (fetch.isRedirect(res.statusCode)) {
				// HTTP fetch step 5.2
				const location = headers.get('Location');

				// HTTP fetch step 5.3
				const locationURL = location === null ? null : resolve_url(request.url, location);

				// HTTP fetch step 5.5
				switch (request.redirect) {
					case 'error':
						reject(new FetchError(`redirect mode is set to error: ${request.url}`, 'no-redirect'));
						finalize();
						return;
					case 'manual':
						// node-fetch-specific step: make manual redirect a bit easier to use by setting the Location header value to the resolved URL.
						if (locationURL !== null) {
							// handle corrupted header
							try {
								headers.set('Location', locationURL);
							} catch (err) {
								// istanbul ignore next: nodejs server prevent invalid response headers, we can't test this through normal request
								reject(err);
							}
						}
						break;
					case 'follow':
						// HTTP-redirect fetch step 2
						if (locationURL === null) {
							break;
						}

						// HTTP-redirect fetch step 5
						if (request.counter >= request.follow) {
							reject(new FetchError(`maximum redirect reached at: ${request.url}`, 'max-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 6 (counter increment)
						// Create a new Request object.
						const requestOpts = {
							headers: new Headers(request.headers),
							follow: request.follow,
							counter: request.counter + 1,
							agent: request.agent,
							compress: request.compress,
							method: request.method,
							body: request.body,
							signal: request.signal,
							timeout: request.timeout
						};

						// HTTP-redirect fetch step 9
						if (res.statusCode !== 303 && request.body && getTotalBytes(request) === null) {
							reject(new FetchError('Cannot follow redirect with body being a readable stream', 'unsupported-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 11
						if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && request.method === 'POST') {
							requestOpts.method = 'GET';
							requestOpts.body = undefined;
							requestOpts.headers.delete('content-length');
						}

						// HTTP-redirect fetch step 15
						resolve(fetch(new Request(locationURL, requestOpts)));
						finalize();
						return;
				}
			}

			// prepare response
			res.once('end', function () {
				if (signal) signal.removeEventListener('abort', abortAndFinalize);
			});
			let body = res.pipe(new PassThrough$1());

			const response_options = {
				url: request.url,
				status: res.statusCode,
				statusText: res.statusMessage,
				headers: headers,
				size: request.size,
				timeout: request.timeout,
				counter: request.counter
			};

			// HTTP-network fetch step 12.1.1.3
			const codings = headers.get('Content-Encoding');

			// HTTP-network fetch step 12.1.1.4: handle content codings

			// in following scenarios we ignore compression support
			// 1. compression support is disabled
			// 2. HEAD request
			// 3. no Content-Encoding header
			// 4. no content response (204)
			// 5. content not modified response (304)
			if (!request.compress || request.method === 'HEAD' || codings === null || res.statusCode === 204 || res.statusCode === 304) {
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// For Node v6+
			// Be less strict when decoding compressed responses, since sometimes
			// servers send slightly invalid responses that are still accepted
			// by common browsers.
			// Always using Z_SYNC_FLUSH is what cURL does.
			const zlibOptions = {
				flush: zlib.Z_SYNC_FLUSH,
				finishFlush: zlib.Z_SYNC_FLUSH
			};

			// for gzip
			if (codings == 'gzip' || codings == 'x-gzip') {
				body = body.pipe(zlib.createGunzip(zlibOptions));
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// for deflate
			if (codings == 'deflate' || codings == 'x-deflate') {
				// handle the infamous raw deflate response from old servers
				// a hack for old IIS and Apache servers
				const raw = res.pipe(new PassThrough$1());
				raw.once('data', function (chunk) {
					// see http://stackoverflow.com/questions/37519828
					if ((chunk[0] & 0x0F) === 0x08) {
						body = body.pipe(zlib.createInflate());
					} else {
						body = body.pipe(zlib.createInflateRaw());
					}
					response = new Response(body, response_options);
					resolve(response);
				});
				return;
			}

			// for br
			if (codings == 'br' && typeof zlib.createBrotliDecompress === 'function') {
				body = body.pipe(zlib.createBrotliDecompress());
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// otherwise, use response as-is
			response = new Response(body, response_options);
			resolve(response);
		});

		writeToStream(req, request);
	});
}
/**
 * Redirect code matching
 *
 * @param   Number   code  Status code
 * @return  Boolean
 */
fetch.isRedirect = function (code) {
	return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
};

// expose Promise
fetch.Promise = global.Promise;

function get_page_handler(
	manifest,
	session_getter
) {
	const get_build_info =  (assets => () => assets)(JSON.parse(fs.readFileSync(path.join(build_dir, 'build.json'), 'utf-8')));

	const template =  (str => () => str)(read_template(build_dir));

	const has_service_worker = fs.existsSync(path.join(build_dir, 'service-worker.js'));

	const { server_routes, pages } = manifest;
	const error_route = manifest.error;

	function bail(req, res, err) {
		console.error(err);

		const message =  'Internal server error';

		res.statusCode = 500;
		res.end(`<pre>${message}</pre>`);
	}

	function handle_error(req, res, statusCode, error) {
		handle_page({
			pattern: null,
			parts: [
				{ name: null, component: error_route }
			]
		}, req, res, statusCode, error || new Error('Unknown error in preload function'));
	}

	async function handle_page(page, req, res, status = 200, error = null) {
		const is_service_worker_index = req.path === '/service-worker-index.html';
		const build_info




 = get_build_info();

		res.setHeader('Content-Type', 'text/html');
		res.setHeader('Cache-Control',  'max-age=600');

		// preload main.js and current route
		// TODO detect other stuff we can preload? images, CSS, fonts?
		let preloaded_chunks = Array.isArray(build_info.assets.main) ? build_info.assets.main : [build_info.assets.main];
		if (!error && !is_service_worker_index) {
			page.parts.forEach(part => {
				if (!part) return;

				// using concat because it could be a string or an array. thanks webpack!
				preloaded_chunks = preloaded_chunks.concat(build_info.assets[part.name]);
			});
		}

		if (build_info.bundler === 'rollup') {
			// TODO add dependencies and CSS
			const link = preloaded_chunks
				.filter(file => file && !file.match(/\.map$/))
				.map(file => `<${req.baseUrl}/client/${file}>;rel="modulepreload"`)
				.join(', ');

			res.setHeader('Link', link);
		} else {
			const link = preloaded_chunks
				.filter(file => file && !file.match(/\.map$/))
				.map((file) => {
					const as = /\.css$/.test(file) ? 'style' : 'script';
					return `<${req.baseUrl}/client/${file}>;rel="preload";as="${as}"`;
				})
				.join(', ');

			res.setHeader('Link', link);
		}

		let session;
		try {
			session = await session_getter(req, res);
		} catch (err) {
			return bail(req, res, err);
		}

		let redirect;
		let preload_error;

		const preload_context = {
			redirect: (statusCode, location) => {
				if (redirect && (redirect.statusCode !== statusCode || redirect.location !== location)) {
					throw new Error(`Conflicting redirects`);
				}
				location = location.replace(/^\//g, ''); // leading slash (only)
				redirect = { statusCode, location };
			},
			error: (statusCode, message) => {
				preload_error = { statusCode, message };
			},
			fetch: (url, opts) => {
				const parsed = new Url$1.URL(url, `http://127.0.0.1:${process.env.PORT}${req.baseUrl ? req.baseUrl + '/' :''}`);

				opts = Object.assign({}, opts);

				const include_credentials = (
					opts.credentials === 'include' ||
					opts.credentials !== 'omit' && parsed.origin === `http://127.0.0.1:${process.env.PORT}`
				);

				if (include_credentials) {
					opts.headers = Object.assign({}, opts.headers);

					const cookies = Object.assign(
						{},
						cookie.parse(req.headers.cookie || ''),
						cookie.parse(opts.headers.cookie || '')
					);

					const set_cookie = res.getHeader('Set-Cookie');
					(Array.isArray(set_cookie) ? set_cookie : [set_cookie]).forEach(str => {
						const match = /([^=]+)=([^;]+)/.exec(str);
						if (match) cookies[match[1]] = match[2];
					});

					const str = Object.keys(cookies)
						.map(key => `${key}=${cookies[key]}`)
						.join('; ');

					opts.headers.cookie = str;

					if (!opts.headers.authorization && req.headers.authorization) {
						opts.headers.authorization = req.headers.authorization;
					}
				}

				return fetch(parsed.href, opts);
			}
		};

		let preloaded;
		let match;
		let params;

		try {
			const root_preloaded = manifest.root_preload
				? manifest.root_preload.call(preload_context, {
					host: req.headers.host,
					path: req.path,
					query: req.query,
					params: {}
				}, session)
				: {};

			match = error ? null : page.pattern.exec(req.path);


			let toPreload = [root_preloaded];
			if (!is_service_worker_index) {
				toPreload = toPreload.concat(page.parts.map(part => {
					if (!part) return null;

					// the deepest level is used below, to initialise the store
					params = part.params ? part.params(match) : {};

					return part.preload
						? part.preload.call(preload_context, {
							host: req.headers.host,
							path: req.path,
							query: req.query,
							params
						}, session)
						: {};
				}));
			}

			preloaded = await Promise.all(toPreload);
		} catch (err) {
			if (error) {
				return bail(req, res, err)
			}

			preload_error = { statusCode: 500, message: err };
			preloaded = []; // appease TypeScript
		}

		try {
			if (redirect) {
				const location = Url$1.resolve((req.baseUrl || '') + '/', redirect.location);

				res.statusCode = redirect.statusCode;
				res.setHeader('Location', location);
				res.end();

				return;
			}

			if (preload_error) {
				handle_error(req, res, preload_error.statusCode, preload_error.message);
				return;
			}

			const segments = req.path.split('/').filter(Boolean);

			// TODO make this less confusing
			const layout_segments = [segments[0]];
			let l = 1;

			page.parts.forEach((part, i) => {
				layout_segments[l] = segments[i + 1];
				if (!part) return null;
				l++;
			});

			const props = {
				stores: {
					page: {
						subscribe: writable({
							host: req.headers.host,
							path: req.path,
							query: req.query,
							params
						}).subscribe
					},
					preloading: {
						subscribe: writable(null).subscribe
					},
					session: writable(session)
				},
				segments: layout_segments,
				status: error ? status : 200,
				error: error ? error instanceof Error ? error : { message: error } : null,
				level0: {
					props: preloaded[0]
				},
				level1: {
					segment: segments[0],
					props: {}
				}
			};

			if (!is_service_worker_index) {
				let l = 1;
				for (let i = 0; i < page.parts.length; i += 1) {
					const part = page.parts[i];
					if (!part) continue;

					props[`level${l++}`] = {
						component: part.component,
						props: preloaded[i + 1] || {},
						segment: segments[i]
					};
				}
			}

			const { html, head, css } = App.render(props);

			const serialized = {
				preloaded: `[${preloaded.map(data => try_serialize(data)).join(',')}]`,
				session: session && try_serialize(session, err => {
					throw new Error(`Failed to serialize session data: ${err.message}`);
				}),
				error: error && serialize_error(props.error)
			};

			let script = `__SAPPER__={${[
				error && `error:${serialized.error},status:${status}`,
				`baseUrl:"${req.baseUrl}"`,
				serialized.preloaded && `preloaded:${serialized.preloaded}`,
				serialized.session && `session:${serialized.session}`
			].filter(Boolean).join(',')}};`;

			if (has_service_worker) {
				script += `if('serviceWorker' in navigator)navigator.serviceWorker.register('${req.baseUrl}/service-worker.js');`;
			}

			const file = [].concat(build_info.assets.main).filter(file => file && /\.js$/.test(file))[0];
			const main = `${req.baseUrl}/client/${file}`;

			if (build_info.bundler === 'rollup') {
				if (build_info.legacy_assets) {
					const legacy_main = `${req.baseUrl}/client/legacy/${build_info.legacy_assets.main}`;
					script += `(function(){try{eval("async function x(){}");var main="${main}"}catch(e){main="${legacy_main}"};var s=document.createElement("script");try{new Function("if(0)import('')")();s.src=main;s.type="module";s.crossOrigin="use-credentials";}catch(e){s.src="${req.baseUrl}/client/shimport@${build_info.shimport}.js";s.setAttribute("data-main",main);}document.head.appendChild(s);}());`;
				} else {
					script += `var s=document.createElement("script");try{new Function("if(0)import('')")();s.src="${main}";s.type="module";s.crossOrigin="use-credentials";}catch(e){s.src="${req.baseUrl}/client/shimport@${build_info.shimport}.js";s.setAttribute("data-main","${main}")}document.head.appendChild(s)`;
				}
			} else {
				script += `</script><script src="${main}">`;
			}

			let styles;

			// TODO make this consistent across apps
			// TODO embed build_info in placeholder.ts
			if (build_info.css && build_info.css.main) {
				const css_chunks = new Set();
				if (build_info.css.main) css_chunks.add(build_info.css.main);
				page.parts.forEach(part => {
					if (!part) return;
					const css_chunks_for_part = build_info.css.chunks[part.file];

					if (css_chunks_for_part) {
						css_chunks_for_part.forEach(file => {
							css_chunks.add(file);
						});
					}
				});

				styles = Array.from(css_chunks)
					.map(href => `<link rel="stylesheet" href="client/${href}">`)
					.join('');
			} else {
				styles = (css && css.code ? `<style>${css.code}</style>` : '');
			}

			// users can set a CSP nonce using res.locals.nonce
			const nonce_attr = (res.locals && res.locals.nonce) ? ` nonce="${res.locals.nonce}"` : '';

			const body = template()
				.replace('%sapper.base%', () => `<base href="${req.baseUrl}/">`)
				.replace('%sapper.scripts%', () => `<script${nonce_attr}>${script}</script>`)
				.replace('%sapper.html%', () => html)
				.replace('%sapper.head%', () => `<noscript id='sapper-head-start'></noscript>${head}<noscript id='sapper-head-end'></noscript>`)
				.replace('%sapper.styles%', () => styles);

			res.statusCode = status;
			res.end(body);
		} catch(err) {
			if (error) {
				bail(req, res, err);
			} else {
				handle_error(req, res, 500, err);
			}
		}
	}

	return function find_route(req, res, next) {
		if (req.path === '/service-worker-index.html') {
			const homePage = pages.find(page => page.pattern.test('/'));
			handle_page(homePage, req, res);
			return;
		}

		for (const page of pages) {
			if (page.pattern.test(req.path)) {
				handle_page(page, req, res);
				return;
			}
		}

		handle_error(req, res, 404, 'Not found');
	};
}

function read_template(dir = build_dir) {
	return fs.readFileSync(`${dir}/template.html`, 'utf-8');
}

function try_serialize(data, fail) {
	try {
		return devalue(data);
	} catch (err) {
		if (fail) fail(err);
		return null;
	}
}

// Ensure we return something truthy so the client will not re-render the page over the error
function serialize_error(error) {
	if (!error) return null;
	let serialized = try_serialize(error);
	if (!serialized) {
		const { name, message, stack } = error ;
		serialized = try_serialize({ name, message, stack });
	}
	if (!serialized) {
		serialized = '{}';
	}
	return serialized;
}

function middleware(opts


 = {}) {
	const { session, ignore } = opts;

	let emitted_basepath = false;

	return compose_handlers(ignore, [
		(req, res, next) => {
			if (req.baseUrl === undefined) {
				let { originalUrl } = req;
				if (req.url === '/' && originalUrl[originalUrl.length - 1] !== '/') {
					originalUrl += '/';
				}

				req.baseUrl = originalUrl
					? originalUrl.slice(0, -req.url.length)
					: '';
			}

			if (!emitted_basepath && process.send) {
				process.send({
					__sapper__: true,
					event: 'basepath',
					basepath: req.baseUrl
				});

				emitted_basepath = true;
			}

			if (req.path === undefined) {
				req.path = req.url.replace(/\?.*/, '');
			}

			next();
		},

		fs.existsSync(path.join(build_dir, 'service-worker.js')) && serve({
			pathname: '/service-worker.js',
			cache_control: 'no-cache, no-store, must-revalidate'
		}),

		fs.existsSync(path.join(build_dir, 'service-worker.js.map')) && serve({
			pathname: '/service-worker.js.map',
			cache_control: 'no-cache, no-store, must-revalidate'
		}),

		serve({
			prefix: '/client/',
			cache_control:  'max-age=31536000, immutable'
		}),

		get_server_route_handler(manifest.server_routes),

		get_page_handler(manifest, session || noop$1)
	].filter(Boolean));
}

function compose_handlers(ignore, handlers) {
	const total = handlers.length;

	function nth_handler(n, req, res, next) {
		if (n >= total) {
			return next();
		}

		handlers[n](req, res, () => nth_handler(n+1, req, res, next));
	}

	return !ignore
		? (req, res, next) => nth_handler(0, req, res, next)
		: (req, res, next) => {
			if (should_ignore(req.path, ignore)) {
				next();
			} else {
				nth_handler(0, req, res, next);
			}
		};
}

function should_ignore(uri, val) {
	if (Array.isArray(val)) return val.some(x => should_ignore(uri, x));
	if (val instanceof RegExp) return val.test(uri);
	if (typeof val === 'function') return val(uri);
	return uri.startsWith(val.charCodeAt(0) === 47 ? val : `/${val}`);
}

function serve({ prefix, pathname, cache_control }



) {
	const filter = pathname
		? (req) => req.path === pathname
		: (req) => req.path.startsWith(prefix);

	const cache = new Map();

	const read =  (file) => (cache.has(file) ? cache : cache.set(file, fs.readFileSync(path.join(build_dir, file)))).get(file);

	return (req, res, next) => {
		if (filter(req)) {
			const type = lite.getType(req.path);

			try {
				const file = path.posix.normalize(decodeURIComponent(req.path));
				const data = read(file);

				res.setHeader('Content-Type', type);
				res.setHeader('Cache-Control', cache_control);
				res.end(data);
			} catch (err) {
				res.statusCode = 404;
				res.end('not found');
			}
		} else {
			next();
		}
	};
}

function noop$1(){}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var safeBuffer = createCommonjsModule(function (module, exports) {
/* eslint-disable node/no-deprecated-api */

var Buffer = buffer$1.Buffer;

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key];
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer$1;
} else {
  // Copy properties from require('buffer')
  copyProps(buffer$1, exports);
  exports.Buffer = SafeBuffer;
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.prototype = Object.create(Buffer.prototype);

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer);

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
};

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size);
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding);
    } else {
      buf.fill(fill);
    }
  } else {
    buf.fill(0);
  }
  return buf
};

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
};

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer$1.SlowBuffer(size)
};
});
var safeBuffer_1 = safeBuffer.Buffer;

/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module exports.
 * @public
 */

var parse_1$1 = parse$1;
var serialize_1$1 = serialize$1;

/**
 * Module variables.
 * @private
 */

var decode$1 = decodeURIComponent;
var encode$1 = encodeURIComponent;
var pairSplitRegExp$1 = /; */;

/**
 * RegExp to match field-content in RFC 7230 sec 3.2
 *
 * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
 * field-vchar   = VCHAR / obs-text
 * obs-text      = %x80-FF
 */

var fieldContentRegExp$1 = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

/**
 * Parse a cookie header.
 *
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 *
 * @param {string} str
 * @param {object} [options]
 * @return {object}
 * @public
 */

function parse$1(str, options) {
  if (typeof str !== 'string') {
    throw new TypeError('argument str must be a string');
  }

  var obj = {};
  var opt = options || {};
  var pairs = str.split(pairSplitRegExp$1);
  var dec = opt.decode || decode$1;

  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i];
    var eq_idx = pair.indexOf('=');

    // skip things that don't look like key=value
    if (eq_idx < 0) {
      continue;
    }

    var key = pair.substr(0, eq_idx).trim();
    var val = pair.substr(++eq_idx, pair.length).trim();

    // quoted values
    if ('"' == val[0]) {
      val = val.slice(1, -1);
    }

    // only assign once
    if (undefined == obj[key]) {
      obj[key] = tryDecode$1(val, dec);
    }
  }

  return obj;
}

/**
 * Serialize data into a cookie header.
 *
 * Serialize the a name value pair into a cookie string suitable for
 * http headers. An optional options object specified cookie parameters.
 *
 * serialize('foo', 'bar', { httpOnly: true })
 *   => "foo=bar; httpOnly"
 *
 * @param {string} name
 * @param {string} val
 * @param {object} [options]
 * @return {string}
 * @public
 */

function serialize$1(name, val, options) {
  var opt = options || {};
  var enc = opt.encode || encode$1;

  if (typeof enc !== 'function') {
    throw new TypeError('option encode is invalid');
  }

  if (!fieldContentRegExp$1.test(name)) {
    throw new TypeError('argument name is invalid');
  }

  var value = enc(val);

  if (value && !fieldContentRegExp$1.test(value)) {
    throw new TypeError('argument val is invalid');
  }

  var str = name + '=' + value;

  if (null != opt.maxAge) {
    var maxAge = opt.maxAge - 0;
    if (isNaN(maxAge)) throw new Error('maxAge should be a Number');
    str += '; Max-Age=' + Math.floor(maxAge);
  }

  if (opt.domain) {
    if (!fieldContentRegExp$1.test(opt.domain)) {
      throw new TypeError('option domain is invalid');
    }

    str += '; Domain=' + opt.domain;
  }

  if (opt.path) {
    if (!fieldContentRegExp$1.test(opt.path)) {
      throw new TypeError('option path is invalid');
    }

    str += '; Path=' + opt.path;
  }

  if (opt.expires) {
    if (typeof opt.expires.toUTCString !== 'function') {
      throw new TypeError('option expires is invalid');
    }

    str += '; Expires=' + opt.expires.toUTCString();
  }

  if (opt.httpOnly) {
    str += '; HttpOnly';
  }

  if (opt.secure) {
    str += '; Secure';
  }

  if (opt.sameSite) {
    var sameSite = typeof opt.sameSite === 'string'
      ? opt.sameSite.toLowerCase() : opt.sameSite;

    switch (sameSite) {
      case true:
        str += '; SameSite=Strict';
        break;
      case 'lax':
        str += '; SameSite=Lax';
        break;
      case 'strict':
        str += '; SameSite=Strict';
        break;
      case 'none':
        str += '; SameSite=None';
        break;
      default:
        throw new TypeError('option sameSite is invalid');
    }
  }

  return str;
}

/**
 * Try decoding a string using a decoding function.
 *
 * @param {string} str
 * @param {function} decode
 * @private
 */

function tryDecode$1(str, decode) {
  try {
    return decode(str);
  } catch (e) {
    return str;
  }
}

var cookie$1 = {
	parse: parse_1$1,
	serialize: serialize_1$1
};

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

var ms = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse$2(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse$2(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}

var debug = createCommonjsModule(function (module, exports) {
/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = ms;

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}
});
var debug_1 = debug.coerce;
var debug_2 = debug.disable;
var debug_3 = debug.enable;
var debug_4 = debug.enabled;
var debug_5 = debug.humanize;
var debug_6 = debug.names;
var debug_7 = debug.skips;
var debug_8 = debug.formatters;

var browser = createCommonjsModule(function (module, exports) {
/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit');

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}
});
var browser_1 = browser.log;
var browser_2 = browser.formatArgs;
var browser_3 = browser.save;
var browser_4 = browser.load;
var browser_5 = browser.useColors;
var browser_6 = browser.storage;
var browser_7 = browser.colors;

var node = createCommonjsModule(function (module, exports) {
/**
 * Module dependencies.
 */




/**
 * This is the Node.js implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */

exports.inspectOpts = Object.keys(process.env).filter(function (key) {
  return /^debug_/i.test(key);
}).reduce(function (obj, key) {
  // camel-case
  var prop = key
    .substring(6)
    .toLowerCase()
    .replace(/_([a-z])/g, function (_, k) { return k.toUpperCase() });

  // coerce string value into JS value
  var val = process.env[key];
  if (/^(yes|on|true|enabled)$/i.test(val)) val = true;
  else if (/^(no|off|false|disabled)$/i.test(val)) val = false;
  else if (val === 'null') val = null;
  else val = Number(val);

  obj[prop] = val;
  return obj;
}, {});

/**
 * The file descriptor to write the `debug()` calls to.
 * Set the `DEBUG_FD` env variable to override with another value. i.e.:
 *
 *   $ DEBUG_FD=3 node script.js 3>debug.log
 */

var fd = parseInt(process.env.DEBUG_FD, 10) || 2;

if (1 !== fd && 2 !== fd) {
  util.deprecate(function(){}, 'except for stderr(2) and stdout(1), any other usage of DEBUG_FD is deprecated. Override debug.log if you want to use a different log function (https://git.io/debug_fd)')();
}

var stream = 1 === fd ? process.stdout :
             2 === fd ? process.stderr :
             createWritableStdioStream(fd);

/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
  return 'colors' in exports.inspectOpts
    ? Boolean(exports.inspectOpts.colors)
    : tty.isatty(fd);
}

/**
 * Map %o to `util.inspect()`, all on a single line.
 */

exports.formatters.o = function(v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts)
    .split('\n').map(function(str) {
      return str.trim()
    }).join(' ');
};

/**
 * Map %o to `util.inspect()`, allowing multiple lines if needed.
 */

exports.formatters.O = function(v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts);
};

/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var name = this.namespace;
  var useColors = this.useColors;

  if (useColors) {
    var c = this.color;
    var prefix = '  \u001b[3' + c + ';1m' + name + ' ' + '\u001b[0m';

    args[0] = prefix + args[0].split('\n').join('\n' + prefix);
    args.push('\u001b[3' + c + 'm+' + exports.humanize(this.diff) + '\u001b[0m');
  } else {
    args[0] = new Date().toUTCString()
      + ' ' + name + ' ' + args[0];
  }
}

/**
 * Invokes `util.format()` with the specified arguments and writes to `stream`.
 */

function log() {
  return stream.write(util.format.apply(util, arguments) + '\n');
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  if (null == namespaces) {
    // If you set a process.env field to null or undefined, it gets cast to the
    // string 'null' or 'undefined'. Just delete instead.
    delete process.env.DEBUG;
  } else {
    process.env.DEBUG = namespaces;
  }
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  return process.env.DEBUG;
}

/**
 * Copied from `node/src/node.js`.
 *
 * XXX: It's lame that node doesn't expose this API out-of-the-box. It also
 * relies on the undocumented `tty_wrap.guessHandleType()` which is also lame.
 */

function createWritableStdioStream (fd) {
  var stream;
  var tty_wrap = process.binding('tty_wrap');

  // Note stream._type is used for test-module-load-list.js

  switch (tty_wrap.guessHandleType(fd)) {
    case 'TTY':
      stream = new tty.WriteStream(fd);
      stream._type = 'tty';

      // Hack to have stream not keep the event loop alive.
      // See https://github.com/joyent/node/issues/1726
      if (stream._handle && stream._handle.unref) {
        stream._handle.unref();
      }
      break;

    case 'FILE':
      var fs$1 = fs;
      stream = new fs$1.SyncWriteStream(fd, { autoClose: false });
      stream._type = 'fs';
      break;

    case 'PIPE':
    case 'TCP':
      var net$1 = net;
      stream = new net$1.Socket({
        fd: fd,
        readable: false,
        writable: true
      });

      // FIXME Should probably have an option in net.Socket to create a
      // stream from an existing fd which is writable only. But for now
      // we'll just add this hack and set the `readable` member to false.
      // Test: ./node test/fixtures/echo.js < /etc/passwd
      stream.readable = false;
      stream.read = null;
      stream._type = 'pipe';

      // FIXME Hack to have stream not keep the event loop alive.
      // See https://github.com/joyent/node/issues/1726
      if (stream._handle && stream._handle.unref) {
        stream._handle.unref();
      }
      break;

    default:
      // Probably an error on in uv_guess_handle()
      throw new Error('Implement me. Unknown stream file type!');
  }

  // For supporting legacy API we put the FD here.
  stream.fd = fd;

  stream._isStdio = true;

  return stream;
}

/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */

function init (debug) {
  debug.inspectOpts = {};

  var keys = Object.keys(exports.inspectOpts);
  for (var i = 0; i < keys.length; i++) {
    debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
  }
}

/**
 * Enable namespaces listed in `process.env.DEBUG` initially.
 */

exports.enable(load());
});
var node_1 = node.init;
var node_2 = node.log;
var node_3 = node.formatArgs;
var node_4 = node.save;
var node_5 = node.load;
var node_6 = node.useColors;
var node_7 = node.colors;
var node_8 = node.inspectOpts;

var src = createCommonjsModule(function (module) {
/**
 * Detect Electron renderer process, which is node, but we should
 * treat as a browser.
 */

if (typeof process !== 'undefined' && process.type === 'renderer') {
  module.exports = browser;
} else {
  module.exports = node;
}
});

/*!
 * depd
 * Copyright(c) 2014-2018 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var relative = path.relative;

/**
 * Module exports.
 */

var depd_1 = depd;

/**
 * Get the path to base files on.
 */

var basePath = process.cwd();

/**
 * Determine if namespace is contained in the string.
 */

function containsNamespace (str, namespace) {
  var vals = str.split(/[ ,]+/);
  var ns = String(namespace).toLowerCase();

  for (var i = 0; i < vals.length; i++) {
    var val = vals[i];

    // namespace contained
    if (val && (val === '*' || val.toLowerCase() === ns)) {
      return true
    }
  }

  return false
}

/**
 * Convert a data descriptor to accessor descriptor.
 */

function convertDataDescriptorToAccessor (obj, prop, message) {
  var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
  var value = descriptor.value;

  descriptor.get = function getter () { return value };

  if (descriptor.writable) {
    descriptor.set = function setter (val) { return (value = val) };
  }

  delete descriptor.value;
  delete descriptor.writable;

  Object.defineProperty(obj, prop, descriptor);

  return descriptor
}

/**
 * Create arguments string to keep arity.
 */

function createArgumentsString (arity) {
  var str = '';

  for (var i = 0; i < arity; i++) {
    str += ', arg' + i;
  }

  return str.substr(2)
}

/**
 * Create stack string from stack.
 */

function createStackString (stack) {
  var str = this.name + ': ' + this.namespace;

  if (this.message) {
    str += ' deprecated ' + this.message;
  }

  for (var i = 0; i < stack.length; i++) {
    str += '\n    at ' + stack[i].toString();
  }

  return str
}

/**
 * Create deprecate for namespace in caller.
 */

function depd (namespace) {
  if (!namespace) {
    throw new TypeError('argument namespace is required')
  }

  var stack = getStack();
  var site = callSiteLocation(stack[1]);
  var file = site[0];

  function deprecate (message) {
    // call to self as log
    log.call(deprecate, message);
  }

  deprecate._file = file;
  deprecate._ignored = isignored(namespace);
  deprecate._namespace = namespace;
  deprecate._traced = istraced(namespace);
  deprecate._warned = Object.create(null);

  deprecate.function = wrapfunction;
  deprecate.property = wrapproperty;

  return deprecate
}

/**
 * Determine if event emitter has listeners of a given type.
 *
 * The way to do this check is done three different ways in Node.js >= 0.8
 * so this consolidates them into a minimal set using instance methods.
 *
 * @param {EventEmitter} emitter
 * @param {string} type
 * @returns {boolean}
 * @private
 */

function eehaslisteners (emitter, type) {
  var count = typeof emitter.listenerCount !== 'function'
    ? emitter.listeners(type).length
    : emitter.listenerCount(type);

  return count > 0
}

/**
 * Determine if namespace is ignored.
 */

function isignored (namespace) {
  if (process.noDeprecation) {
    // --no-deprecation support
    return true
  }

  var str = process.env.NO_DEPRECATION || '';

  // namespace ignored
  return containsNamespace(str, namespace)
}

/**
 * Determine if namespace is traced.
 */

function istraced (namespace) {
  if (process.traceDeprecation) {
    // --trace-deprecation support
    return true
  }

  var str = process.env.TRACE_DEPRECATION || '';

  // namespace traced
  return containsNamespace(str, namespace)
}

/**
 * Display deprecation message.
 */

function log (message, site) {
  var haslisteners = eehaslisteners(process, 'deprecation');

  // abort early if no destination
  if (!haslisteners && this._ignored) {
    return
  }

  var caller;
  var callFile;
  var callSite;
  var depSite;
  var i = 0;
  var seen = false;
  var stack = getStack();
  var file = this._file;

  if (site) {
    // provided site
    depSite = site;
    callSite = callSiteLocation(stack[1]);
    callSite.name = depSite.name;
    file = callSite[0];
  } else {
    // get call site
    i = 2;
    depSite = callSiteLocation(stack[i]);
    callSite = depSite;
  }

  // get caller of deprecated thing in relation to file
  for (; i < stack.length; i++) {
    caller = callSiteLocation(stack[i]);
    callFile = caller[0];

    if (callFile === file) {
      seen = true;
    } else if (callFile === this._file) {
      file = this._file;
    } else if (seen) {
      break
    }
  }

  var key = caller
    ? depSite.join(':') + '__' + caller.join(':')
    : undefined;

  if (key !== undefined && key in this._warned) {
    // already warned
    return
  }

  this._warned[key] = true;

  // generate automatic message from call site
  var msg = message;
  if (!msg) {
    msg = callSite === depSite || !callSite.name
      ? defaultMessage(depSite)
      : defaultMessage(callSite);
  }

  // emit deprecation if listeners exist
  if (haslisteners) {
    var err = DeprecationError(this._namespace, msg, stack.slice(i));
    process.emit('deprecation', err);
    return
  }

  // format and write message
  var format = process.stderr.isTTY
    ? formatColor
    : formatPlain;
  var output = format.call(this, msg, caller, stack.slice(i));
  process.stderr.write(output + '\n', 'utf8');
}

/**
 * Get call site location as array.
 */

function callSiteLocation (callSite) {
  var file = callSite.getFileName() || '<anonymous>';
  var line = callSite.getLineNumber();
  var colm = callSite.getColumnNumber();

  if (callSite.isEval()) {
    file = callSite.getEvalOrigin() + ', ' + file;
  }

  var site = [file, line, colm];

  site.callSite = callSite;
  site.name = callSite.getFunctionName();

  return site
}

/**
 * Generate a default message from the site.
 */

function defaultMessage (site) {
  var callSite = site.callSite;
  var funcName = site.name;

  // make useful anonymous name
  if (!funcName) {
    funcName = '<anonymous@' + formatLocation(site) + '>';
  }

  var context = callSite.getThis();
  var typeName = context && callSite.getTypeName();

  // ignore useless type name
  if (typeName === 'Object') {
    typeName = undefined;
  }

  // make useful type name
  if (typeName === 'Function') {
    typeName = context.name || typeName;
  }

  return typeName && callSite.getMethodName()
    ? typeName + '.' + funcName
    : funcName
}

/**
 * Format deprecation message without color.
 */

function formatPlain (msg, caller, stack) {
  var timestamp = new Date().toUTCString();

  var formatted = timestamp +
    ' ' + this._namespace +
    ' deprecated ' + msg;

  // add stack trace
  if (this._traced) {
    for (var i = 0; i < stack.length; i++) {
      formatted += '\n    at ' + stack[i].toString();
    }

    return formatted
  }

  if (caller) {
    formatted += ' at ' + formatLocation(caller);
  }

  return formatted
}

/**
 * Format deprecation message with color.
 */

function formatColor (msg, caller, stack) {
  var formatted = '\x1b[36;1m' + this._namespace + '\x1b[22;39m' + // bold cyan
    ' \x1b[33;1mdeprecated\x1b[22;39m' + // bold yellow
    ' \x1b[0m' + msg + '\x1b[39m'; // reset

  // add stack trace
  if (this._traced) {
    for (var i = 0; i < stack.length; i++) {
      formatted += '\n    \x1b[36mat ' + stack[i].toString() + '\x1b[39m'; // cyan
    }

    return formatted
  }

  if (caller) {
    formatted += ' \x1b[36m' + formatLocation(caller) + '\x1b[39m'; // cyan
  }

  return formatted
}

/**
 * Format call site location.
 */

function formatLocation (callSite) {
  return relative(basePath, callSite[0]) +
    ':' + callSite[1] +
    ':' + callSite[2]
}

/**
 * Get the stack as array of call sites.
 */

function getStack () {
  var limit = Error.stackTraceLimit;
  var obj = {};
  var prep = Error.prepareStackTrace;

  Error.prepareStackTrace = prepareObjectStackTrace;
  Error.stackTraceLimit = Math.max(10, limit);

  // capture the stack
  Error.captureStackTrace(obj);

  // slice this function off the top
  var stack = obj.stack.slice(1);

  Error.prepareStackTrace = prep;
  Error.stackTraceLimit = limit;

  return stack
}

/**
 * Capture call site stack from v8.
 */

function prepareObjectStackTrace (obj, stack) {
  return stack
}

/**
 * Return a wrapped function in a deprecation message.
 */

function wrapfunction (fn, message) {
  if (typeof fn !== 'function') {
    throw new TypeError('argument fn must be a function')
  }

  var args = createArgumentsString(fn.length);
  var stack = getStack();
  var site = callSiteLocation(stack[1]);

  site.name = fn.name;

  // eslint-disable-next-line no-new-func
  var deprecatedfn = new Function('fn', 'log', 'deprecate', 'message', 'site',
    '"use strict"\n' +
    'return function (' + args + ') {' +
    'log.call(deprecate, message, site)\n' +
    'return fn.apply(this, arguments)\n' +
    '}')(fn, log, this, message, site);

  return deprecatedfn
}

/**
 * Wrap property in a deprecation message.
 */

function wrapproperty (obj, prop, message) {
  if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) {
    throw new TypeError('argument obj must be object')
  }

  var descriptor = Object.getOwnPropertyDescriptor(obj, prop);

  if (!descriptor) {
    throw new TypeError('must call property on owner object')
  }

  if (!descriptor.configurable) {
    throw new TypeError('property must be configurable')
  }

  var deprecate = this;
  var stack = getStack();
  var site = callSiteLocation(stack[1]);

  // set site name
  site.name = prop;

  // convert data descriptor
  if ('value' in descriptor) {
    descriptor = convertDataDescriptorToAccessor(obj, prop);
  }

  var get = descriptor.get;
  var set = descriptor.set;

  // wrap getter
  if (typeof get === 'function') {
    descriptor.get = function getter () {
      log.call(deprecate, message, site);
      return get.apply(this, arguments)
    };
  }

  // wrap setter
  if (typeof set === 'function') {
    descriptor.set = function setter () {
      log.call(deprecate, message, site);
      return set.apply(this, arguments)
    };
  }

  Object.defineProperty(obj, prop, descriptor);
}

/**
 * Create DeprecationError for deprecation
 */

function DeprecationError (namespace, message, stack) {
  var error = new Error();
  var stackString;

  Object.defineProperty(error, 'constructor', {
    value: DeprecationError
  });

  Object.defineProperty(error, 'message', {
    configurable: true,
    enumerable: false,
    value: message,
    writable: true
  });

  Object.defineProperty(error, 'name', {
    enumerable: false,
    configurable: true,
    value: 'DeprecationError',
    writable: true
  });

  Object.defineProperty(error, 'namespace', {
    configurable: true,
    enumerable: false,
    value: namespace,
    writable: true
  });

  Object.defineProperty(error, 'stack', {
    configurable: true,
    enumerable: false,
    get: function () {
      if (stackString !== undefined) {
        return stackString
      }

      // prepare stack trace
      return (stackString = createStackString.call(this, stack))
    },
    set: function setter (val) {
      stackString = val;
    }
  });

  return error
}

/*!
 * on-headers
 * Copyright(c) 2014 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module exports.
 * @public
 */

var onHeaders_1 = onHeaders;

/**
 * Create a replacement writeHead method.
 *
 * @param {function} prevWriteHead
 * @param {function} listener
 * @private
 */

function createWriteHead (prevWriteHead, listener) {
  var fired = false;

  // return function with core name and argument list
  return function writeHead (statusCode) {
    // set headers from arguments
    var args = setWriteHeadHeaders.apply(this, arguments);

    // fire listener
    if (!fired) {
      fired = true;
      listener.call(this);

      // pass-along an updated status code
      if (typeof args[0] === 'number' && this.statusCode !== args[0]) {
        args[0] = this.statusCode;
        args.length = 1;
      }
    }

    return prevWriteHead.apply(this, args)
  }
}

/**
 * Execute a listener when a response is about to write headers.
 *
 * @param {object} res
 * @return {function} listener
 * @public
 */

function onHeaders (res, listener) {
  if (!res) {
    throw new TypeError('argument res is required')
  }

  if (typeof listener !== 'function') {
    throw new TypeError('argument listener must be a function')
  }

  res.writeHead = createWriteHead(res.writeHead, listener);
}

/**
 * Set headers contained in array on the response object.
 *
 * @param {object} res
 * @param {array} headers
 * @private
 */

function setHeadersFromArray (res, headers) {
  for (var i = 0; i < headers.length; i++) {
    res.setHeader(headers[i][0], headers[i][1]);
  }
}

/**
 * Set headers contained in object on the response object.
 *
 * @param {object} res
 * @param {object} headers
 * @private
 */

function setHeadersFromObject (res, headers) {
  var keys = Object.keys(headers);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (k) res.setHeader(k, headers[k]);
  }
}

/**
 * Set headers and other properties on the response object.
 *
 * @param {number} statusCode
 * @private
 */

function setWriteHeadHeaders (statusCode) {
  var length = arguments.length;
  var headerIndex = length > 1 && typeof arguments[1] === 'string'
    ? 2
    : 1;

  var headers = length >= headerIndex + 1
    ? arguments[headerIndex]
    : undefined;

  this.statusCode = statusCode;

  if (Array.isArray(headers)) {
    // handle array case
    setHeadersFromArray(this, headers);
  } else if (headers) {
    // handle object case
    setHeadersFromObject(this, headers);
  }

  // copy leading arguments
  var args = new Array(Math.min(length, headerIndex));
  for (var i = 0; i < args.length; i++) {
    args[i] = arguments[i];
  }

  return args
}

/**
 * Module dependencies.
 * @private
 */


var parse$3 = Url$1.parse;
var Url = Url$1.Url;

/**
 * Module exports.
 * @public
 */

var parseurl_1 = parseurl;
var original = originalurl;

/**
 * Parse the `req` url with memoization.
 *
 * @param {ServerRequest} req
 * @return {Object}
 * @public
 */

function parseurl (req) {
  var url = req.url;

  if (url === undefined) {
    // URL is undefined
    return undefined
  }

  var parsed = req._parsedUrl;

  if (fresh(url, parsed)) {
    // Return cached URL parse
    return parsed
  }

  // Parse the URL
  parsed = fastparse(url);
  parsed._raw = url;

  return (req._parsedUrl = parsed)
}
/**
 * Parse the `req` original url with fallback and memoization.
 *
 * @param {ServerRequest} req
 * @return {Object}
 * @public
 */

function originalurl (req) {
  var url = req.originalUrl;

  if (typeof url !== 'string') {
    // Fallback
    return parseurl(req)
  }

  var parsed = req._parsedOriginalUrl;

  if (fresh(url, parsed)) {
    // Return cached URL parse
    return parsed
  }

  // Parse the URL
  parsed = fastparse(url);
  parsed._raw = url;

  return (req._parsedOriginalUrl = parsed)
}
/**
 * Parse the `str` url with fast-path short-cut.
 *
 * @param {string} str
 * @return {Object}
 * @private
 */

function fastparse (str) {
  if (typeof str !== 'string' || str.charCodeAt(0) !== 0x2f /* / */) {
    return parse$3(str)
  }

  var pathname = str;
  var query = null;
  var search = null;

  // This takes the regexp from https://github.com/joyent/node/pull/7878
  // Which is /^(\/[^?#\s]*)(\?[^#\s]*)?$/
  // And unrolls it into a for loop
  for (var i = 1; i < str.length; i++) {
    switch (str.charCodeAt(i)) {
      case 0x3f: /* ?  */
        if (search === null) {
          pathname = str.substring(0, i);
          query = str.substring(i + 1);
          search = str.substring(i);
        }
        break
      case 0x09: /* \t */
      case 0x0a: /* \n */
      case 0x0c: /* \f */
      case 0x0d: /* \r */
      case 0x20: /*    */
      case 0x23: /* #  */
      case 0xa0:
      case 0xfeff:
        return parse$3(str)
    }
  }

  var url = Url !== undefined
    ? new Url()
    : {};

  url.path = str;
  url.href = str;
  url.pathname = pathname;

  if (search !== null) {
    url.query = query;
    url.search = search;
  }

  return url
}

/**
 * Determine if parsed is still fresh for url.
 *
 * @param {string} url
 * @param {object} parsedUrl
 * @return {boolean}
 * @private
 */

function fresh (url, parsedUrl) {
  return typeof parsedUrl === 'object' &&
    parsedUrl !== null &&
    (Url === undefined || parsedUrl instanceof Url) &&
    parsedUrl._raw === url
}
parseurl_1.original = original;

var cookieSignature = createCommonjsModule(function (module, exports) {
/**
 * Module dependencies.
 */



/**
 * Sign the given `val` with `secret`.
 *
 * @param {String} val
 * @param {String} secret
 * @return {String}
 * @api private
 */

exports.sign = function(val, secret){
  if ('string' != typeof val) throw new TypeError("Cookie value must be provided as a string.");
  if ('string' != typeof secret) throw new TypeError("Secret string must be provided.");
  return val + '.' + crypto
    .createHmac('sha256', secret)
    .update(val)
    .digest('base64')
    .replace(/\=+$/, '');
};

/**
 * Unsign and decode the given `val` with `secret`,
 * returning `false` if the signature is invalid.
 *
 * @param {String} val
 * @param {String} secret
 * @return {String|Boolean}
 * @api private
 */

exports.unsign = function(val, secret){
  if ('string' != typeof val) throw new TypeError("Signed cookie string must be provided.");
  if ('string' != typeof secret) throw new TypeError("Secret string must be provided.");
  var str = val.slice(0, val.lastIndexOf('.'))
    , mac = exports.sign(str, secret);
  
  return sha1(mac) == sha1(val) ? str : false;
};

/**
 * Private
 */

function sha1(str){
  return crypto.createHash('sha1').update(str).digest('hex');
}
});
var cookieSignature_1 = cookieSignature.sign;
var cookieSignature_2 = cookieSignature.unsign;

/**
 * Module dependencies.
 * @private
 */



/**
 * Module variables.
 * @private
 */

var generateAttempts = crypto.randomBytes === crypto.pseudoRandomBytes ? 1 : 3;

/**
 * Module exports.
 * @public
 */

var randomBytes_1 = randomBytes;
var sync = randomBytesSync;

/**
 * Generates strong pseudo-random bytes.
 *
 * @param {number} size
 * @param {function} [callback]
 * @return {Promise}
 * @public
 */

function randomBytes(size, callback) {
  // validate callback is a function, if provided
  if (callback !== undefined && typeof callback !== 'function') {
    throw new TypeError('argument callback must be a function')
  }

  // require the callback without promises
  if (!callback && !commonjsGlobal.Promise) {
    throw new TypeError('argument callback is required')
  }

  if (callback) {
    // classic callback style
    return generateRandomBytes(size, generateAttempts, callback)
  }

  return new Promise(function executor(resolve, reject) {
    generateRandomBytes(size, generateAttempts, function onRandomBytes(err, str) {
      if (err) return reject(err)
      resolve(str);
    });
  })
}

/**
 * Generates strong pseudo-random bytes sync.
 *
 * @param {number} size
 * @return {Buffer}
 * @public
 */

function randomBytesSync(size) {
  var err = null;

  for (var i = 0; i < generateAttempts; i++) {
    try {
      return crypto.randomBytes(size)
    } catch (e) {
      err = e;
    }
  }

  throw err
}

/**
 * Generates strong pseudo-random bytes.
 *
 * @param {number} size
 * @param {number} attempts
 * @param {function} callback
 * @private
 */

function generateRandomBytes(size, attempts, callback) {
  crypto.randomBytes(size, function onRandomBytes(err, buf) {
    if (!err) return callback(null, buf)
    if (!--attempts) return callback(err)
    setTimeout(generateRandomBytes.bind(null, size, attempts, callback), 10);
  });
}
randomBytes_1.sync = sync;

/**
 * Module dependencies.
 * @private
 */



/**
 * Module variables.
 * @private
 */

var EQUAL_END_REGEXP = /=+$/;
var PLUS_GLOBAL_REGEXP = /\+/g;
var SLASH_GLOBAL_REGEXP = /\//g;

/**
 * Module exports.
 * @public
 */

var uidSafe = uid;
var sync$1 = uidSync;

/**
 * Create a unique ID.
 *
 * @param {number} length
 * @param {function} [callback]
 * @return {Promise}
 * @public
 */

function uid (length, callback) {
  // validate callback is a function, if provided
  if (callback !== undefined && typeof callback !== 'function') {
    throw new TypeError('argument callback must be a function')
  }

  // require the callback without promises
  if (!callback && !commonjsGlobal.Promise) {
    throw new TypeError('argument callback is required')
  }

  if (callback) {
    // classic callback style
    return generateUid(length, callback)
  }

  return new Promise(function executor (resolve, reject) {
    generateUid(length, function onUid (err, str) {
      if (err) return reject(err)
      resolve(str);
    });
  })
}

/**
 * Create a unique ID sync.
 *
 * @param {number} length
 * @return {string}
 * @public
 */

function uidSync (length) {
  return toString(randomBytes_1.sync(length))
}

/**
 * Generate a unique ID string.
 *
 * @param {number} length
 * @param {function} callback
 * @private
 */

function generateUid (length, callback) {
  randomBytes_1(length, function (err, buf) {
    if (err) return callback(err)
    callback(null, toString(buf));
  });
}

/**
 * Change a Buffer into a string.
 *
 * @param {Buffer} buf
 * @return {string}
 * @private
 */

function toString (buf) {
  return buf.toString('base64')
    .replace(EQUAL_END_REGEXP, '')
    .replace(PLUS_GLOBAL_REGEXP, '-')
    .replace(SLASH_GLOBAL_REGEXP, '_')
}
uidSafe.sync = sync$1;

var cookie_1 = createCommonjsModule(function (module) {

/**
 * Module dependencies.
 */


var deprecate = depd_1('express-session');

/**
 * Initialize a new `Cookie` with the given `options`.
 *
 * @param {IncomingMessage} req
 * @param {Object} options
 * @api private
 */

var Cookie = module.exports = function Cookie(options) {
  this.path = '/';
  this.maxAge = null;
  this.httpOnly = true;

  if (options) {
    if (typeof options !== 'object') {
      throw new TypeError('argument options must be a object')
    }

    for (var key in options) {
      if (key !== 'data') {
        this[key] = options[key];
      }
    }
  }

  if (this.originalMaxAge === undefined || this.originalMaxAge === null) {
    this.originalMaxAge = this.maxAge;
  }
};

/*!
 * Prototype.
 */

Cookie.prototype = {

  /**
   * Set expires `date`.
   *
   * @param {Date} date
   * @api public
   */

  set expires(date) {
    this._expires = date;
    this.originalMaxAge = this.maxAge;
  },

  /**
   * Get expires `date`.
   *
   * @return {Date}
   * @api public
   */

  get expires() {
    return this._expires;
  },

  /**
   * Set expires via max-age in `ms`.
   *
   * @param {Number} ms
   * @api public
   */

  set maxAge(ms) {
    if (ms && typeof ms !== 'number' && !(ms instanceof Date)) {
      throw new TypeError('maxAge must be a number or Date')
    }

    if (ms instanceof Date) {
      deprecate('maxAge as Date; pass number of milliseconds instead');
    }

    this.expires = typeof ms === 'number'
      ? new Date(Date.now() + ms)
      : ms;
  },

  /**
   * Get expires max-age in `ms`.
   *
   * @return {Number}
   * @api public
   */

  get maxAge() {
    return this.expires instanceof Date
      ? this.expires.valueOf() - Date.now()
      : this.expires;
  },

  /**
   * Return cookie data object.
   *
   * @return {Object}
   * @api private
   */

  get data() {
    return {
      originalMaxAge: this.originalMaxAge
      , expires: this._expires
      , secure: this.secure
      , httpOnly: this.httpOnly
      , domain: this.domain
      , path: this.path
      , sameSite: this.sameSite
    }
  },

  /**
   * Return a serialized cookie string.
   *
   * @return {String}
   * @api public
   */

  serialize: function(name, val){
    return cookie$1.serialize(name, val, this.data);
  },

  /**
   * Return JSON representation of this cookie.
   *
   * @return {Object}
   * @api private
   */

  toJSON: function(){
    return this.data;
  }
};
});

/*!
 * Connect - session - Session
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Expose Session.
 */

var session = Session;

/**
 * Create a new `Session` with the given request and `data`.
 *
 * @param {IncomingRequest} req
 * @param {Object} data
 * @api private
 */

function Session(req, data) {
  Object.defineProperty(this, 'req', { value: req });
  Object.defineProperty(this, 'id', { value: req.sessionID });

  if (typeof data === 'object' && data !== null) {
    // merge data into this, ignoring prototype properties
    for (var prop in data) {
      if (!(prop in this)) {
        this[prop] = data[prop];
      }
    }
  }
}

/**
 * Update reset `.cookie.maxAge` to prevent
 * the cookie from expiring when the
 * session is still active.
 *
 * @return {Session} for chaining
 * @api public
 */

defineMethod(Session.prototype, 'touch', function touch() {
  return this.resetMaxAge();
});

/**
 * Reset `.maxAge` to `.originalMaxAge`.
 *
 * @return {Session} for chaining
 * @api public
 */

defineMethod(Session.prototype, 'resetMaxAge', function resetMaxAge() {
  this.cookie.maxAge = this.cookie.originalMaxAge;
  return this;
});

/**
 * Save the session data with optional callback `fn(err)`.
 *
 * @param {Function} fn
 * @return {Session} for chaining
 * @api public
 */

defineMethod(Session.prototype, 'save', function save(fn) {
  this.req.sessionStore.set(this.id, this, fn || function(){});
  return this;
});

/**
 * Re-loads the session data _without_ altering
 * the maxAge properties. Invokes the callback `fn(err)`,
 * after which time if no exception has occurred the
 * `req.session` property will be a new `Session` object,
 * although representing the same session.
 *
 * @param {Function} fn
 * @return {Session} for chaining
 * @api public
 */

defineMethod(Session.prototype, 'reload', function reload(fn) {
  var req = this.req;
  var store = this.req.sessionStore;

  store.get(this.id, function(err, sess){
    if (err) return fn(err);
    if (!sess) return fn(new Error('failed to load session'));
    store.createSession(req, sess);
    fn();
  });
  return this;
});

/**
 * Destroy `this` session.
 *
 * @param {Function} fn
 * @return {Session} for chaining
 * @api public
 */

defineMethod(Session.prototype, 'destroy', function destroy(fn) {
  delete this.req.session;
  this.req.sessionStore.destroy(this.id, fn);
  return this;
});

/**
 * Regenerate this request's session.
 *
 * @param {Function} fn
 * @return {Session} for chaining
 * @api public
 */

defineMethod(Session.prototype, 'regenerate', function regenerate(fn) {
  this.req.sessionStore.regenerate(this.req, fn);
  return this;
});

/**
 * Helper function for creating a method on a prototype.
 *
 * @param {Object} obj
 * @param {String} name
 * @param {Function} fn
 * @private
 */
function defineMethod(obj, name, fn) {
  Object.defineProperty(obj, name, {
    configurable: true,
    enumerable: false,
    value: fn,
    writable: true
  });
}

/**
 * Module dependencies.
 * @private
 */


var EventEmitter = events.EventEmitter;



/**
 * Module exports.
 * @public
 */

var store = Store;

/**
 * Abstract base class for session stores.
 * @public
 */

function Store () {
  EventEmitter.call(this);
}

/**
 * Inherit from EventEmitter.
 */

util.inherits(Store, EventEmitter);

/**
 * Re-generate the given requests's session.
 *
 * @param {IncomingRequest} req
 * @return {Function} fn
 * @api public
 */

Store.prototype.regenerate = function(req, fn){
  var self = this;
  this.destroy(req.sessionID, function(err){
    self.generate(req);
    fn(err);
  });
};

/**
 * Load a `Session` instance via the given `sid`
 * and invoke the callback `fn(err, sess)`.
 *
 * @param {String} sid
 * @param {Function} fn
 * @api public
 */

Store.prototype.load = function(sid, fn){
  var self = this;
  this.get(sid, function(err, sess){
    if (err) return fn(err);
    if (!sess) return fn();
    var req = { sessionID: sid, sessionStore: self };
    fn(null, self.createSession(req, sess));
  });
};

/**
 * Create session from JSON `sess` data.
 *
 * @param {IncomingRequest} req
 * @param {Object} sess
 * @return {Session}
 * @api private
 */

Store.prototype.createSession = function(req, sess){
  var expires = sess.cookie.expires;
  var originalMaxAge = sess.cookie.originalMaxAge;

  sess.cookie = new cookie_1(sess.cookie);

  if (typeof expires === 'string') {
    // convert expires to a Date object
    sess.cookie.expires = new Date(expires);
  }

  // keep originalMaxAge intact
  sess.cookie.originalMaxAge = originalMaxAge;

  req.session = new session(req, sess);
  return req.session;
};

/**
 * Module dependencies.
 * @private
 */




/**
 * Shim setImmediate for node.js < 0.10
 * @private
 */

/* istanbul ignore next */
var defer = typeof setImmediate === 'function'
  ? setImmediate
  : function(fn){ process.nextTick(fn.bind.apply(fn, arguments)); };

/**
 * Module exports.
 */

var memory = MemoryStore;

/**
 * A session store in memory.
 * @public
 */

function MemoryStore() {
  store.call(this);
  this.sessions = Object.create(null);
}

/**
 * Inherit from Store.
 */

util.inherits(MemoryStore, store);

/**
 * Get all active sessions.
 *
 * @param {function} callback
 * @public
 */

MemoryStore.prototype.all = function all(callback) {
  var sessionIds = Object.keys(this.sessions);
  var sessions = Object.create(null);

  for (var i = 0; i < sessionIds.length; i++) {
    var sessionId = sessionIds[i];
    var session = getSession.call(this, sessionId);

    if (session) {
      sessions[sessionId] = session;
    }
  }

  callback && defer(callback, null, sessions);
};

/**
 * Clear all sessions.
 *
 * @param {function} callback
 * @public
 */

MemoryStore.prototype.clear = function clear(callback) {
  this.sessions = Object.create(null);
  callback && defer(callback);
};

/**
 * Destroy the session associated with the given session ID.
 *
 * @param {string} sessionId
 * @public
 */

MemoryStore.prototype.destroy = function destroy(sessionId, callback) {
  delete this.sessions[sessionId];
  callback && defer(callback);
};

/**
 * Fetch session by the given session ID.
 *
 * @param {string} sessionId
 * @param {function} callback
 * @public
 */

MemoryStore.prototype.get = function get(sessionId, callback) {
  defer(callback, null, getSession.call(this, sessionId));
};

/**
 * Commit the given session associated with the given sessionId to the store.
 *
 * @param {string} sessionId
 * @param {object} session
 * @param {function} callback
 * @public
 */

MemoryStore.prototype.set = function set(sessionId, session, callback) {
  this.sessions[sessionId] = JSON.stringify(session);
  callback && defer(callback);
};

/**
 * Get number of active sessions.
 *
 * @param {function} callback
 * @public
 */

MemoryStore.prototype.length = function length(callback) {
  this.all(function (err, sessions) {
    if (err) return callback(err)
    callback(null, Object.keys(sessions).length);
  });
};

/**
 * Touch the given session object associated with the given session ID.
 *
 * @param {string} sessionId
 * @param {object} session
 * @param {function} callback
 * @public
 */

MemoryStore.prototype.touch = function touch(sessionId, session, callback) {
  var currentSession = getSession.call(this, sessionId);

  if (currentSession) {
    // update expiration
    currentSession.cookie = session.cookie;
    this.sessions[sessionId] = JSON.stringify(currentSession);
  }

  callback && defer(callback);
};

/**
 * Get session from the store.
 * @private
 */

function getSession(sessionId) {
  var sess = this.sessions[sessionId];

  if (!sess) {
    return
  }

  // parse
  sess = JSON.parse(sess);

  if (sess.cookie) {
    var expires = typeof sess.cookie.expires === 'string'
      ? new Date(sess.cookie.expires)
      : sess.cookie.expires;

    // destroy expired session
    if (expires && expires <= Date.now()) {
      delete this.sessions[sessionId];
      return
    }
  }

  return sess
}

var expressSession = createCommonjsModule(function (module, exports) {

/**
 * Module dependencies.
 * @private
 */

var Buffer = safeBuffer.Buffer;


var debug = src('express-session');
var deprecate = depd_1('express-session');



var uid = uidSafe.sync;

/**
 * Expose the middleware.
 */

exports = module.exports = session$1;

/**
 * Expose constructors.
 */

exports.Store = store;
exports.Cookie = cookie_1;
exports.Session = session;
exports.MemoryStore = memory;

/**
 * Node.js 0.8+ async implementation.
 * @private
 */

/* istanbul ignore next */
var defer = typeof setImmediate === 'function'
  ? setImmediate
  : function(fn){ process.nextTick(fn.bind.apply(fn, arguments)); };

/**
 * Setup session store with the given `options`.
 *
 * @param {Object} [options]
 * @param {Object} [options.cookie] Options for cookie
 * @param {Function} [options.genid]
 * @param {String} [options.name=connect.sid] Session ID cookie name
 * @param {Boolean} [options.proxy]
 * @param {Boolean} [options.resave] Resave unmodified sessions back to the store
 * @param {Boolean} [options.rolling] Enable/disable rolling session expiration
 * @param {Boolean} [options.saveUninitialized] Save uninitialized sessions to the store
 * @param {String|Array} [options.secret] Secret for signing session ID
 * @param {Object} [options.store=MemoryStore] Session store
 * @param {String} [options.unset]
 * @return {Function} middleware
 * @public
 */

function session$1(options) {
  var opts = options || {};

  // get the cookie options
  var cookieOptions = opts.cookie || {};

  // get the session id generate function
  var generateId = opts.genid || generateSessionId;

  // get the session cookie name
  var name = opts.name || opts.key || 'connect.sid';

  // get the session store
  var store = opts.store || new memory();

  // get the trust proxy setting
  var trustProxy = opts.proxy;

  // get the resave session option
  var resaveSession = opts.resave;

  // get the rolling session option
  var rollingSessions = Boolean(opts.rolling);

  // get the save uninitialized session option
  var saveUninitializedSession = opts.saveUninitialized;

  // get the cookie signing secret
  var secret = opts.secret;

  if (typeof generateId !== 'function') {
    throw new TypeError('genid option must be a function');
  }

  if (resaveSession === undefined) {
    deprecate('undefined resave option; provide resave option');
    resaveSession = true;
  }

  if (saveUninitializedSession === undefined) {
    deprecate('undefined saveUninitialized option; provide saveUninitialized option');
    saveUninitializedSession = true;
  }

  if (opts.unset && opts.unset !== 'destroy' && opts.unset !== 'keep') {
    throw new TypeError('unset option must be "destroy" or "keep"');
  }

  // TODO: switch to "destroy" on next major
  var unsetDestroy = opts.unset === 'destroy';

  if (Array.isArray(secret) && secret.length === 0) {
    throw new TypeError('secret option array must contain one or more strings');
  }

  if (secret && !Array.isArray(secret)) {
    secret = [secret];
  }

  if (!secret) {
    deprecate('req.secret; provide secret option');
  }

  // generates the new session
  store.generate = function(req){
    req.sessionID = generateId(req);
    req.session = new session(req);
    req.session.cookie = new cookie_1(cookieOptions);

    if (cookieOptions.secure === 'auto') {
      req.session.cookie.secure = issecure(req, trustProxy);
    }
  };

  var storeImplementsTouch = typeof store.touch === 'function';

  // register event listeners for the store to track readiness
  var storeReady = true;
  store.on('disconnect', function ondisconnect() {
    storeReady = false;
  });
  store.on('connect', function onconnect() {
    storeReady = true;
  });

  return function session(req, res, next) {
    // self-awareness
    if (req.session) {
      next();
      return
    }

    // Handle connection as if there is no session if
    // the store has temporarily disconnected etc
    if (!storeReady) {
      debug('store is disconnected');
      next();
      return
    }

    // pathname mismatch
    var originalPath = parseurl_1.original(req).pathname || '/';
    if (originalPath.indexOf(cookieOptions.path || '/') !== 0) return next();

    // ensure a secret is available or bail
    if (!secret && !req.secret) {
      next(new Error('secret option required for sessions'));
      return;
    }

    // backwards compatibility for signed cookies
    // req.secret is passed from the cookie parser middleware
    var secrets = secret || [req.secret];

    var originalHash;
    var originalId;
    var savedHash;
    var touched = false;

    // expose store
    req.sessionStore = store;

    // get the session ID from the cookie
    var cookieId = req.sessionID = getcookie(req, name, secrets);

    // set-cookie
    onHeaders_1(res, function(){
      if (!req.session) {
        debug('no session');
        return;
      }

      if (!shouldSetCookie(req)) {
        return;
      }

      // only send secure cookies via https
      if (req.session.cookie.secure && !issecure(req, trustProxy)) {
        debug('not secured');
        return;
      }

      if (!touched) {
        // touch session
        req.session.touch();
        touched = true;
      }

      // set cookie
      setcookie(res, name, req.sessionID, secrets[0], req.session.cookie.data);
    });

    // proxy end() to commit the session
    var _end = res.end;
    var _write = res.write;
    var ended = false;
    res.end = function end(chunk, encoding) {
      if (ended) {
        return false;
      }

      ended = true;

      var ret;
      var sync = true;

      function writeend() {
        if (sync) {
          ret = _end.call(res, chunk, encoding);
          sync = false;
          return;
        }

        _end.call(res);
      }

      function writetop() {
        if (!sync) {
          return ret;
        }

        if (chunk == null) {
          ret = true;
          return ret;
        }

        var contentLength = Number(res.getHeader('Content-Length'));

        if (!isNaN(contentLength) && contentLength > 0) {
          // measure chunk
          chunk = !Buffer.isBuffer(chunk)
            ? Buffer.from(chunk, encoding)
            : chunk;
          encoding = undefined;

          if (chunk.length !== 0) {
            debug('split response');
            ret = _write.call(res, chunk.slice(0, chunk.length - 1));
            chunk = chunk.slice(chunk.length - 1, chunk.length);
            return ret;
          }
        }

        ret = _write.call(res, chunk, encoding);
        sync = false;

        return ret;
      }

      if (shouldDestroy(req)) {
        // destroy session
        debug('destroying');
        store.destroy(req.sessionID, function ondestroy(err) {
          if (err) {
            defer(next, err);
          }

          debug('destroyed');
          writeend();
        });

        return writetop();
      }

      // no session to save
      if (!req.session) {
        debug('no session');
        return _end.call(res, chunk, encoding);
      }

      if (!touched) {
        // touch session
        req.session.touch();
        touched = true;
      }

      if (shouldSave(req)) {
        req.session.save(function onsave(err) {
          if (err) {
            defer(next, err);
          }

          writeend();
        });

        return writetop();
      } else if (storeImplementsTouch && shouldTouch(req)) {
        // store implements touch method
        debug('touching');
        store.touch(req.sessionID, req.session, function ontouch(err) {
          if (err) {
            defer(next, err);
          }

          debug('touched');
          writeend();
        });

        return writetop();
      }

      return _end.call(res, chunk, encoding);
    };

    // generate the session
    function generate() {
      store.generate(req);
      originalId = req.sessionID;
      originalHash = hash(req.session);
      wrapmethods(req.session);
    }

    // inflate the session
    function inflate (req, sess) {
      store.createSession(req, sess);
      originalId = req.sessionID;
      originalHash = hash(sess);

      if (!resaveSession) {
        savedHash = originalHash;
      }

      wrapmethods(req.session);
    }

    // wrap session methods
    function wrapmethods(sess) {
      var _reload = sess.reload;
      var _save = sess.save;

      function reload(callback) {
        debug('reloading %s', this.id);
        _reload.call(this, function () {
          wrapmethods(req.session);
          callback.apply(this, arguments);
        });
      }

      function save() {
        debug('saving %s', this.id);
        savedHash = hash(this);
        _save.apply(this, arguments);
      }

      Object.defineProperty(sess, 'reload', {
        configurable: true,
        enumerable: false,
        value: reload,
        writable: true
      });

      Object.defineProperty(sess, 'save', {
        configurable: true,
        enumerable: false,
        value: save,
        writable: true
      });
    }

    // check if session has been modified
    function isModified(sess) {
      return originalId !== sess.id || originalHash !== hash(sess);
    }

    // check if session has been saved
    function isSaved(sess) {
      return originalId === sess.id && savedHash === hash(sess);
    }

    // determine if session should be destroyed
    function shouldDestroy(req) {
      return req.sessionID && unsetDestroy && req.session == null;
    }

    // determine if session should be saved to store
    function shouldSave(req) {
      // cannot set cookie without a session ID
      if (typeof req.sessionID !== 'string') {
        debug('session ignored because of bogus req.sessionID %o', req.sessionID);
        return false;
      }

      return !saveUninitializedSession && cookieId !== req.sessionID
        ? isModified(req.session)
        : !isSaved(req.session)
    }

    // determine if session should be touched
    function shouldTouch(req) {
      // cannot set cookie without a session ID
      if (typeof req.sessionID !== 'string') {
        debug('session ignored because of bogus req.sessionID %o', req.sessionID);
        return false;
      }

      return cookieId === req.sessionID && !shouldSave(req);
    }

    // determine if cookie should be set on response
    function shouldSetCookie(req) {
      // cannot set cookie without a session ID
      if (typeof req.sessionID !== 'string') {
        return false;
      }

      return cookieId !== req.sessionID
        ? saveUninitializedSession || isModified(req.session)
        : rollingSessions || req.session.cookie.expires != null && isModified(req.session);
    }

    // generate a session if the browser doesn't send a sessionID
    if (!req.sessionID) {
      debug('no SID sent, generating session');
      generate();
      next();
      return;
    }

    // generate the session object
    debug('fetching %s', req.sessionID);
    store.get(req.sessionID, function(err, sess){
      // error handling
      if (err && err.code !== 'ENOENT') {
        debug('error %j', err);
        next(err);
        return
      }

      try {
        if (err || !sess) {
          debug('no session found');
          generate();
        } else {
          debug('session found');
          inflate(req, sess);
        }
      } catch (e) {
        next(e);
        return
      }

      next();
    });
  };
}
/**
 * Generate a session ID for a new session.
 *
 * @return {String}
 * @private
 */

function generateSessionId(sess) {
  return uid(24);
}

/**
 * Get the session ID cookie from request.
 *
 * @return {string}
 * @private
 */

function getcookie(req, name, secrets) {
  var header = req.headers.cookie;
  var raw;
  var val;

  // read from cookie header
  if (header) {
    var cookies = cookie$1.parse(header);

    raw = cookies[name];

    if (raw) {
      if (raw.substr(0, 2) === 's:') {
        val = unsigncookie(raw.slice(2), secrets);

        if (val === false) {
          debug('cookie signature invalid');
          val = undefined;
        }
      } else {
        debug('cookie unsigned');
      }
    }
  }

  // back-compat read from cookieParser() signedCookies data
  if (!val && req.signedCookies) {
    val = req.signedCookies[name];

    if (val) {
      deprecate('cookie should be available in req.headers.cookie');
    }
  }

  // back-compat read from cookieParser() cookies data
  if (!val && req.cookies) {
    raw = req.cookies[name];

    if (raw) {
      if (raw.substr(0, 2) === 's:') {
        val = unsigncookie(raw.slice(2), secrets);

        if (val) {
          deprecate('cookie should be available in req.headers.cookie');
        }

        if (val === false) {
          debug('cookie signature invalid');
          val = undefined;
        }
      } else {
        debug('cookie unsigned');
      }
    }
  }

  return val;
}

/**
 * Hash the given `sess` object omitting changes to `.cookie`.
 *
 * @param {Object} sess
 * @return {String}
 * @private
 */

function hash(sess) {
  // serialize
  var str = JSON.stringify(sess, function (key, val) {
    // ignore sess.cookie property
    if (this === sess && key === 'cookie') {
      return
    }

    return val
  });

  // hash
  return crypto
    .createHash('sha1')
    .update(str, 'utf8')
    .digest('hex')
}

/**
 * Determine if request is secure.
 *
 * @param {Object} req
 * @param {Boolean} [trustProxy]
 * @return {Boolean}
 * @private
 */

function issecure(req, trustProxy) {
  // socket is https server
  if (req.connection && req.connection.encrypted) {
    return true;
  }

  // do not trust proxy
  if (trustProxy === false) {
    return false;
  }

  // no explicit trust; try req.secure from express
  if (trustProxy !== true) {
    return req.secure === true
  }

  // read the proto from x-forwarded-proto header
  var header = req.headers['x-forwarded-proto'] || '';
  var index = header.indexOf(',');
  var proto = index !== -1
    ? header.substr(0, index).toLowerCase().trim()
    : header.toLowerCase().trim();

  return proto === 'https';
}

/**
 * Set cookie on response.
 *
 * @private
 */

function setcookie(res, name, val, secret, options) {
  var signed = 's:' + cookieSignature.sign(val, secret);
  var data = cookie$1.serialize(name, signed, options);

  debug('set-cookie %s', data);

  var prev = res.getHeader('Set-Cookie') || [];
  var header = Array.isArray(prev) ? prev.concat(data) : [prev, data];

  res.setHeader('Set-Cookie', header);
}

/**
 * Verify and decode the given `val` with `secrets`.
 *
 * @param {String} val
 * @param {Array} secrets
 * @returns {String|Boolean}
 * @private
 */
function unsigncookie(val, secrets) {
  for (var i = 0; i < secrets.length; i++) {
    var result = cookieSignature.unsign(val, secrets[i]);

    if (result !== false) {
      return result;
    }
  }

  return false;
}
});
var expressSession_1 = expressSession.Store;
var expressSession_2 = expressSession.Cookie;
var expressSession_3 = expressSession.Session;
var expressSession_4 = expressSession.MemoryStore;

var fromCallback = function (fn) {
  return Object.defineProperty(function () {
    if (typeof arguments[arguments.length - 1] === 'function') fn.apply(this, arguments);
    else {
      return new Promise((resolve, reject) => {
        arguments[arguments.length] = (err, res) => {
          if (err) return reject(err)
          resolve(res);
        };
        arguments.length++;
        fn.apply(this, arguments);
      })
    }
  }, 'name', { value: fn.name })
};

var fromPromise = function (fn) {
  return Object.defineProperty(function () {
    const cb = arguments[arguments.length - 1];
    if (typeof cb !== 'function') return fn.apply(this, arguments)
    else fn.apply(this, arguments).then(r => cb(null, r), cb);
  }, 'name', { value: fn.name })
};

var universalify = {
	fromCallback: fromCallback,
	fromPromise: fromPromise
};

var origCwd = process.cwd;
var cwd = null;

var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;

process.cwd = function() {
  if (!cwd)
    cwd = origCwd.call(process);
  return cwd
};
try {
  process.cwd();
} catch (er) {}

var chdir = process.chdir;
process.chdir = function(d) {
  cwd = null;
  chdir.call(process, d);
};

var polyfills = patch;

function patch (fs) {
  // (re-)implement some things that are known busted or missing.

  // lchmod, broken prior to 0.6.2
  // back-port the fix here.
  if (constants.hasOwnProperty('O_SYMLINK') &&
      process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
    patchLchmod(fs);
  }

  // lutimes implementation, or no-op
  if (!fs.lutimes) {
    patchLutimes(fs);
  }

  // https://github.com/isaacs/node-graceful-fs/issues/4
  // Chown should not fail on einval or eperm if non-root.
  // It should not fail on enosys ever, as this just indicates
  // that a fs doesn't support the intended operation.

  fs.chown = chownFix(fs.chown);
  fs.fchown = chownFix(fs.fchown);
  fs.lchown = chownFix(fs.lchown);

  fs.chmod = chmodFix(fs.chmod);
  fs.fchmod = chmodFix(fs.fchmod);
  fs.lchmod = chmodFix(fs.lchmod);

  fs.chownSync = chownFixSync(fs.chownSync);
  fs.fchownSync = chownFixSync(fs.fchownSync);
  fs.lchownSync = chownFixSync(fs.lchownSync);

  fs.chmodSync = chmodFixSync(fs.chmodSync);
  fs.fchmodSync = chmodFixSync(fs.fchmodSync);
  fs.lchmodSync = chmodFixSync(fs.lchmodSync);

  fs.stat = statFix(fs.stat);
  fs.fstat = statFix(fs.fstat);
  fs.lstat = statFix(fs.lstat);

  fs.statSync = statFixSync(fs.statSync);
  fs.fstatSync = statFixSync(fs.fstatSync);
  fs.lstatSync = statFixSync(fs.lstatSync);

  // if lchmod/lchown do not exist, then make them no-ops
  if (!fs.lchmod) {
    fs.lchmod = function (path, mode, cb) {
      if (cb) process.nextTick(cb);
    };
    fs.lchmodSync = function () {};
  }
  if (!fs.lchown) {
    fs.lchown = function (path, uid, gid, cb) {
      if (cb) process.nextTick(cb);
    };
    fs.lchownSync = function () {};
  }

  // on Windows, A/V software can lock the directory, causing this
  // to fail with an EACCES or EPERM if the directory contains newly
  // created files.  Try again on failure, for up to 60 seconds.

  // Set the timeout this long because some Windows Anti-Virus, such as Parity
  // bit9, may lock files for up to a minute, causing npm package install
  // failures. Also, take care to yield the scheduler. Windows scheduling gives
  // CPU to a busy looping process, which can cause the program causing the lock
  // contention to be starved of CPU by node, so the contention doesn't resolve.
  if (platform === "win32") {
    fs.rename = (function (fs$rename) { return function (from, to, cb) {
      var start = Date.now();
      var backoff = 0;
      fs$rename(from, to, function CB (er) {
        if (er
            && (er.code === "EACCES" || er.code === "EPERM")
            && Date.now() - start < 60000) {
          setTimeout(function() {
            fs.stat(to, function (stater, st) {
              if (stater && stater.code === "ENOENT")
                fs$rename(from, to, CB);
              else
                cb(er);
            });
          }, backoff);
          if (backoff < 100)
            backoff += 10;
          return;
        }
        if (cb) cb(er);
      });
    }})(fs.rename);
  }

  // if read() returns EAGAIN, then just try it again.
  fs.read = (function (fs$read) {
    function read (fd, buffer, offset, length, position, callback_) {
      var callback;
      if (callback_ && typeof callback_ === 'function') {
        var eagCounter = 0;
        callback = function (er, _, __) {
          if (er && er.code === 'EAGAIN' && eagCounter < 10) {
            eagCounter ++;
            return fs$read.call(fs, fd, buffer, offset, length, position, callback)
          }
          callback_.apply(this, arguments);
        };
      }
      return fs$read.call(fs, fd, buffer, offset, length, position, callback)
    }

    // This ensures `util.promisify` works as it does for native `fs.read`.
    read.__proto__ = fs$read;
    return read
  })(fs.read);

  fs.readSync = (function (fs$readSync) { return function (fd, buffer, offset, length, position) {
    var eagCounter = 0;
    while (true) {
      try {
        return fs$readSync.call(fs, fd, buffer, offset, length, position)
      } catch (er) {
        if (er.code === 'EAGAIN' && eagCounter < 10) {
          eagCounter ++;
          continue
        }
        throw er
      }
    }
  }})(fs.readSync);

  function patchLchmod (fs) {
    fs.lchmod = function (path, mode, callback) {
      fs.open( path
             , constants.O_WRONLY | constants.O_SYMLINK
             , mode
             , function (err, fd) {
        if (err) {
          if (callback) callback(err);
          return
        }
        // prefer to return the chmod error, if one occurs,
        // but still try to close, and report closing errors if they occur.
        fs.fchmod(fd, mode, function (err) {
          fs.close(fd, function(err2) {
            if (callback) callback(err || err2);
          });
        });
      });
    };

    fs.lchmodSync = function (path, mode) {
      var fd = fs.openSync(path, constants.O_WRONLY | constants.O_SYMLINK, mode);

      // prefer to return the chmod error, if one occurs,
      // but still try to close, and report closing errors if they occur.
      var threw = true;
      var ret;
      try {
        ret = fs.fchmodSync(fd, mode);
        threw = false;
      } finally {
        if (threw) {
          try {
            fs.closeSync(fd);
          } catch (er) {}
        } else {
          fs.closeSync(fd);
        }
      }
      return ret
    };
  }

  function patchLutimes (fs) {
    if (constants.hasOwnProperty("O_SYMLINK")) {
      fs.lutimes = function (path, at, mt, cb) {
        fs.open(path, constants.O_SYMLINK, function (er, fd) {
          if (er) {
            if (cb) cb(er);
            return
          }
          fs.futimes(fd, at, mt, function (er) {
            fs.close(fd, function (er2) {
              if (cb) cb(er || er2);
            });
          });
        });
      };

      fs.lutimesSync = function (path, at, mt) {
        var fd = fs.openSync(path, constants.O_SYMLINK);
        var ret;
        var threw = true;
        try {
          ret = fs.futimesSync(fd, at, mt);
          threw = false;
        } finally {
          if (threw) {
            try {
              fs.closeSync(fd);
            } catch (er) {}
          } else {
            fs.closeSync(fd);
          }
        }
        return ret
      };

    } else {
      fs.lutimes = function (_a, _b, _c, cb) { if (cb) process.nextTick(cb); };
      fs.lutimesSync = function () {};
    }
  }

  function chmodFix (orig) {
    if (!orig) return orig
    return function (target, mode, cb) {
      return orig.call(fs, target, mode, function (er) {
        if (chownErOk(er)) er = null;
        if (cb) cb.apply(this, arguments);
      })
    }
  }

  function chmodFixSync (orig) {
    if (!orig) return orig
    return function (target, mode) {
      try {
        return orig.call(fs, target, mode)
      } catch (er) {
        if (!chownErOk(er)) throw er
      }
    }
  }


  function chownFix (orig) {
    if (!orig) return orig
    return function (target, uid, gid, cb) {
      return orig.call(fs, target, uid, gid, function (er) {
        if (chownErOk(er)) er = null;
        if (cb) cb.apply(this, arguments);
      })
    }
  }

  function chownFixSync (orig) {
    if (!orig) return orig
    return function (target, uid, gid) {
      try {
        return orig.call(fs, target, uid, gid)
      } catch (er) {
        if (!chownErOk(er)) throw er
      }
    }
  }

  function statFix (orig) {
    if (!orig) return orig
    // Older versions of Node erroneously returned signed integers for
    // uid + gid.
    return function (target, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = null;
      }
      function callback (er, stats) {
        if (stats) {
          if (stats.uid < 0) stats.uid += 0x100000000;
          if (stats.gid < 0) stats.gid += 0x100000000;
        }
        if (cb) cb.apply(this, arguments);
      }
      return options ? orig.call(fs, target, options, callback)
        : orig.call(fs, target, callback)
    }
  }

  function statFixSync (orig) {
    if (!orig) return orig
    // Older versions of Node erroneously returned signed integers for
    // uid + gid.
    return function (target, options) {
      var stats = options ? orig.call(fs, target, options)
        : orig.call(fs, target);
      if (stats.uid < 0) stats.uid += 0x100000000;
      if (stats.gid < 0) stats.gid += 0x100000000;
      return stats;
    }
  }

  // ENOSYS means that the fs doesn't support the op. Just ignore
  // that, because it doesn't matter.
  //
  // if there's no getuid, or if getuid() is something other
  // than 0, and the error is EINVAL or EPERM, then just ignore
  // it.
  //
  // This specific case is a silent failure in cp, install, tar,
  // and most other unix tools that manage permissions.
  //
  // When running as root, or if other types of errors are
  // encountered, then it's strict.
  function chownErOk (er) {
    if (!er)
      return true

    if (er.code === "ENOSYS")
      return true

    var nonroot = !process.getuid || process.getuid() !== 0;
    if (nonroot) {
      if (er.code === "EINVAL" || er.code === "EPERM")
        return true
    }

    return false
  }
}

var Stream = Stream$1.Stream;

var legacyStreams = legacy;

function legacy (fs) {
  return {
    ReadStream: ReadStream,
    WriteStream: WriteStream
  }

  function ReadStream (path, options) {
    if (!(this instanceof ReadStream)) return new ReadStream(path, options);

    Stream.call(this);

    var self = this;

    this.path = path;
    this.fd = null;
    this.readable = true;
    this.paused = false;

    this.flags = 'r';
    this.mode = 438; /*=0666*/
    this.bufferSize = 64 * 1024;

    options = options || {};

    // Mixin options into this
    var keys = Object.keys(options);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options[key];
    }

    if (this.encoding) this.setEncoding(this.encoding);

    if (this.start !== undefined) {
      if ('number' !== typeof this.start) {
        throw TypeError('start must be a Number');
      }
      if (this.end === undefined) {
        this.end = Infinity;
      } else if ('number' !== typeof this.end) {
        throw TypeError('end must be a Number');
      }

      if (this.start > this.end) {
        throw new Error('start must be <= end');
      }

      this.pos = this.start;
    }

    if (this.fd !== null) {
      process.nextTick(function() {
        self._read();
      });
      return;
    }

    fs.open(this.path, this.flags, this.mode, function (err, fd) {
      if (err) {
        self.emit('error', err);
        self.readable = false;
        return;
      }

      self.fd = fd;
      self.emit('open', fd);
      self._read();
    });
  }

  function WriteStream (path, options) {
    if (!(this instanceof WriteStream)) return new WriteStream(path, options);

    Stream.call(this);

    this.path = path;
    this.fd = null;
    this.writable = true;

    this.flags = 'w';
    this.encoding = 'binary';
    this.mode = 438; /*=0666*/
    this.bytesWritten = 0;

    options = options || {};

    // Mixin options into this
    var keys = Object.keys(options);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options[key];
    }

    if (this.start !== undefined) {
      if ('number' !== typeof this.start) {
        throw TypeError('start must be a Number');
      }
      if (this.start < 0) {
        throw new Error('start must be >= zero');
      }

      this.pos = this.start;
    }

    this.busy = false;
    this._queue = [];

    if (this.fd === null) {
      this._open = fs.open;
      this._queue.push([this._open, this.path, this.flags, this.mode, undefined]);
      this.flush();
    }
  }
}

var clone_1 = clone$1;

function clone$1 (obj) {
  if (obj === null || typeof obj !== 'object')
    return obj

  if (obj instanceof Object)
    var copy = { __proto__: obj.__proto__ };
  else
    var copy = Object.create(null);

  Object.getOwnPropertyNames(obj).forEach(function (key) {
    Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key));
  });

  return copy
}

var gracefulFs = createCommonjsModule(function (module) {
/* istanbul ignore next - node 0.x polyfill */
var gracefulQueue;
var previousSymbol;

/* istanbul ignore else - node 0.x polyfill */
if (typeof Symbol === 'function' && typeof Symbol.for === 'function') {
  gracefulQueue = Symbol.for('graceful-fs.queue');
  // This is used in testing by future versions
  previousSymbol = Symbol.for('graceful-fs.previous');
} else {
  gracefulQueue = '___graceful-fs.queue';
  previousSymbol = '___graceful-fs.previous';
}

function noop () {}

var debug = noop;
if (util.debuglog)
  debug = util.debuglog('gfs4');
else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ''))
  debug = function() {
    var m = util.format.apply(util, arguments);
    m = 'GFS4: ' + m.split(/\n/).join('\nGFS4: ');
    console.error(m);
  };

// Once time initialization
if (!commonjsGlobal[gracefulQueue]) {
  // This queue can be shared by multiple loaded instances
  var queue = [];
  Object.defineProperty(commonjsGlobal, gracefulQueue, {
    get: function() {
      return queue
    }
  });

  // Patch fs.close/closeSync to shared queue version, because we need
  // to retry() whenever a close happens *anywhere* in the program.
  // This is essential when multiple graceful-fs instances are
  // in play at the same time.
  fs.close = (function (fs$close) {
    function close (fd, cb) {
      return fs$close.call(fs, fd, function (err) {
        // This function uses the graceful-fs shared queue
        if (!err) {
          retry();
        }

        if (typeof cb === 'function')
          cb.apply(this, arguments);
      })
    }

    Object.defineProperty(close, previousSymbol, {
      value: fs$close
    });
    return close
  })(fs.close);

  fs.closeSync = (function (fs$closeSync) {
    function closeSync (fd) {
      // This function uses the graceful-fs shared queue
      fs$closeSync.apply(fs, arguments);
      retry();
    }

    Object.defineProperty(closeSync, previousSymbol, {
      value: fs$closeSync
    });
    return closeSync
  })(fs.closeSync);

  if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || '')) {
    process.on('exit', function() {
      debug(commonjsGlobal[gracefulQueue]);
      assert.equal(commonjsGlobal[gracefulQueue].length, 0);
    });
  }
}

module.exports = patch(clone_1(fs));
if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs.__patched) {
    module.exports = patch(fs);
    fs.__patched = true;
}

function patch (fs) {
  // Everything that references the open() function needs to be in here
  polyfills(fs);
  fs.gracefulify = patch;

  fs.createReadStream = createReadStream;
  fs.createWriteStream = createWriteStream;
  var fs$readFile = fs.readFile;
  fs.readFile = readFile;
  function readFile (path, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null;

    return go$readFile(path, options, cb)

    function go$readFile (path, options, cb) {
      return fs$readFile(path, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$readFile, [path, options, cb]]);
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments);
          retry();
        }
      })
    }
  }

  var fs$writeFile = fs.writeFile;
  fs.writeFile = writeFile;
  function writeFile (path, data, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null;

    return go$writeFile(path, data, options, cb)

    function go$writeFile (path, data, options, cb) {
      return fs$writeFile(path, data, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$writeFile, [path, data, options, cb]]);
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments);
          retry();
        }
      })
    }
  }

  var fs$appendFile = fs.appendFile;
  if (fs$appendFile)
    fs.appendFile = appendFile;
  function appendFile (path, data, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null;

    return go$appendFile(path, data, options, cb)

    function go$appendFile (path, data, options, cb) {
      return fs$appendFile(path, data, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$appendFile, [path, data, options, cb]]);
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments);
          retry();
        }
      })
    }
  }

  var fs$readdir = fs.readdir;
  fs.readdir = readdir;
  function readdir (path, options, cb) {
    var args = [path];
    if (typeof options !== 'function') {
      args.push(options);
    } else {
      cb = options;
    }
    args.push(go$readdir$cb);

    return go$readdir(args)

    function go$readdir$cb (err, files) {
      if (files && files.sort)
        files.sort();

      if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
        enqueue([go$readdir, [args]]);

      else {
        if (typeof cb === 'function')
          cb.apply(this, arguments);
        retry();
      }
    }
  }

  function go$readdir (args) {
    return fs$readdir.apply(fs, args)
  }

  if (process.version.substr(0, 4) === 'v0.8') {
    var legStreams = legacyStreams(fs);
    ReadStream = legStreams.ReadStream;
    WriteStream = legStreams.WriteStream;
  }

  var fs$ReadStream = fs.ReadStream;
  if (fs$ReadStream) {
    ReadStream.prototype = Object.create(fs$ReadStream.prototype);
    ReadStream.prototype.open = ReadStream$open;
  }

  var fs$WriteStream = fs.WriteStream;
  if (fs$WriteStream) {
    WriteStream.prototype = Object.create(fs$WriteStream.prototype);
    WriteStream.prototype.open = WriteStream$open;
  }

  Object.defineProperty(fs, 'ReadStream', {
    get: function () {
      return ReadStream
    },
    set: function (val) {
      ReadStream = val;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(fs, 'WriteStream', {
    get: function () {
      return WriteStream
    },
    set: function (val) {
      WriteStream = val;
    },
    enumerable: true,
    configurable: true
  });

  // legacy names
  var FileReadStream = ReadStream;
  Object.defineProperty(fs, 'FileReadStream', {
    get: function () {
      return FileReadStream
    },
    set: function (val) {
      FileReadStream = val;
    },
    enumerable: true,
    configurable: true
  });
  var FileWriteStream = WriteStream;
  Object.defineProperty(fs, 'FileWriteStream', {
    get: function () {
      return FileWriteStream
    },
    set: function (val) {
      FileWriteStream = val;
    },
    enumerable: true,
    configurable: true
  });

  function ReadStream (path, options) {
    if (this instanceof ReadStream)
      return fs$ReadStream.apply(this, arguments), this
    else
      return ReadStream.apply(Object.create(ReadStream.prototype), arguments)
  }

  function ReadStream$open () {
    var that = this;
    open(that.path, that.flags, that.mode, function (err, fd) {
      if (err) {
        if (that.autoClose)
          that.destroy();

        that.emit('error', err);
      } else {
        that.fd = fd;
        that.emit('open', fd);
        that.read();
      }
    });
  }

  function WriteStream (path, options) {
    if (this instanceof WriteStream)
      return fs$WriteStream.apply(this, arguments), this
    else
      return WriteStream.apply(Object.create(WriteStream.prototype), arguments)
  }

  function WriteStream$open () {
    var that = this;
    open(that.path, that.flags, that.mode, function (err, fd) {
      if (err) {
        that.destroy();
        that.emit('error', err);
      } else {
        that.fd = fd;
        that.emit('open', fd);
      }
    });
  }

  function createReadStream (path, options) {
    return new fs.ReadStream(path, options)
  }

  function createWriteStream (path, options) {
    return new fs.WriteStream(path, options)
  }

  var fs$open = fs.open;
  fs.open = open;
  function open (path, flags, mode, cb) {
    if (typeof mode === 'function')
      cb = mode, mode = null;

    return go$open(path, flags, mode, cb)

    function go$open (path, flags, mode, cb) {
      return fs$open(path, flags, mode, function (err, fd) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$open, [path, flags, mode, cb]]);
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments);
          retry();
        }
      })
    }
  }

  return fs
}

function enqueue (elem) {
  debug('ENQUEUE', elem[0].name, elem[1]);
  commonjsGlobal[gracefulQueue].push(elem);
}

function retry () {
  var elem = commonjsGlobal[gracefulQueue].shift();
  if (elem) {
    debug('RETRY', elem[0].name, elem[1]);
    elem[0].apply(null, elem[1]);
  }
}
});

var fs_1 = createCommonjsModule(function (module, exports) {
// This is adapted from https://github.com/normalize/mz
// Copyright (c) 2014-2016 Jonathan Ong me@jongleberry.com and Contributors
const u = universalify.fromCallback;


const api = [
  'access',
  'appendFile',
  'chmod',
  'chown',
  'close',
  'copyFile',
  'fchmod',
  'fchown',
  'fdatasync',
  'fstat',
  'fsync',
  'ftruncate',
  'futimes',
  'lchown',
  'lchmod',
  'link',
  'lstat',
  'mkdir',
  'mkdtemp',
  'open',
  'readFile',
  'readdir',
  'readlink',
  'realpath',
  'rename',
  'rmdir',
  'stat',
  'symlink',
  'truncate',
  'unlink',
  'utimes',
  'writeFile'
].filter(key => {
  // Some commands are not available on some systems. Ex:
  // fs.copyFile was added in Node.js v8.5.0
  // fs.mkdtemp was added in Node.js v5.10.0
  // fs.lchown is not available on at least some Linux
  return typeof gracefulFs[key] === 'function'
});

// Export all keys:
Object.keys(gracefulFs).forEach(key => {
  if (key === 'promises') {
    // fs.promises is a getter property that triggers ExperimentalWarning
    // Don't re-export it here, the getter is defined in "lib/index.js"
    return
  }
  exports[key] = gracefulFs[key];
});

// Universalify async methods:
api.forEach(method => {
  exports[method] = u(gracefulFs[method]);
});

// We differ from mz/fs in that we still ship the old, broken, fs.exists()
// since we are a drop-in replacement for the native module
exports.exists = function (filename, callback) {
  if (typeof callback === 'function') {
    return gracefulFs.exists(filename, callback)
  }
  return new Promise(resolve => {
    return gracefulFs.exists(filename, resolve)
  })
};

// fs.read() & fs.write need special treatment due to multiple callback args

exports.read = function (fd, buffer, offset, length, position, callback) {
  if (typeof callback === 'function') {
    return gracefulFs.read(fd, buffer, offset, length, position, callback)
  }
  return new Promise((resolve, reject) => {
    gracefulFs.read(fd, buffer, offset, length, position, (err, bytesRead, buffer) => {
      if (err) return reject(err)
      resolve({ bytesRead, buffer });
    });
  })
};

// Function signature can be
// fs.write(fd, buffer[, offset[, length[, position]]], callback)
// OR
// fs.write(fd, string[, position[, encoding]], callback)
// We need to handle both cases, so we use ...args
exports.write = function (fd, buffer, ...args) {
  if (typeof args[args.length - 1] === 'function') {
    return gracefulFs.write(fd, buffer, ...args)
  }

  return new Promise((resolve, reject) => {
    gracefulFs.write(fd, buffer, ...args, (err, bytesWritten, buffer) => {
      if (err) return reject(err)
      resolve({ bytesWritten, buffer });
    });
  })
};

// fs.realpath.native only available in Node v9.2+
if (typeof gracefulFs.realpath.native === 'function') {
  exports.realpath.native = u(gracefulFs.realpath.native);
}
});
var fs_2 = fs_1.exists;
var fs_3 = fs_1.read;
var fs_4 = fs_1.write;

// get drive on windows
function getRootPath (p) {
  p = path.normalize(path.resolve(p)).split(path.sep);
  if (p.length > 0) return p[0]
  return null
}

// http://stackoverflow.com/a/62888/10333 contains more accurate
// TODO: expand to include the rest
const INVALID_PATH_CHARS = /[<>:"|?*]/;

function invalidWin32Path (p) {
  const rp = getRootPath(p);
  p = p.replace(rp, '');
  return INVALID_PATH_CHARS.test(p)
}

var win32 = {
  getRootPath,
  invalidWin32Path
};

const invalidWin32Path$1 = win32.invalidWin32Path;

const o777 = parseInt('0777', 8);

function mkdirs (p, opts, callback, made) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  } else if (!opts || typeof opts !== 'object') {
    opts = { mode: opts };
  }

  if (process.platform === 'win32' && invalidWin32Path$1(p)) {
    const errInval = new Error(p + ' contains invalid WIN32 path characters.');
    errInval.code = 'EINVAL';
    return callback(errInval)
  }

  let mode = opts.mode;
  const xfs = opts.fs || gracefulFs;

  if (mode === undefined) {
    mode = o777 & (~process.umask());
  }
  if (!made) made = null;

  callback = callback || function () {};
  p = path.resolve(p);

  xfs.mkdir(p, mode, er => {
    if (!er) {
      made = made || p;
      return callback(null, made)
    }
    switch (er.code) {
      case 'ENOENT':
        if (path.dirname(p) === p) return callback(er)
        mkdirs(path.dirname(p), opts, (er, made) => {
          if (er) callback(er, made);
          else mkdirs(p, opts, callback, made);
        });
        break

      // In the case of any other error, just see if there's a dir
      // there already.  If so, then hooray!  If not, then something
      // is borked.
      default:
        xfs.stat(p, (er2, stat) => {
          // if the stat fails, then that's super weird.
          // let the original error be the failure reason.
          if (er2 || !stat.isDirectory()) callback(er, made);
          else callback(null, made);
        });
        break
    }
  });
}

var mkdirs_1 = mkdirs;

const invalidWin32Path$2 = win32.invalidWin32Path;

const o777$1 = parseInt('0777', 8);

function mkdirsSync (p, opts, made) {
  if (!opts || typeof opts !== 'object') {
    opts = { mode: opts };
  }

  let mode = opts.mode;
  const xfs = opts.fs || gracefulFs;

  if (process.platform === 'win32' && invalidWin32Path$2(p)) {
    const errInval = new Error(p + ' contains invalid WIN32 path characters.');
    errInval.code = 'EINVAL';
    throw errInval
  }

  if (mode === undefined) {
    mode = o777$1 & (~process.umask());
  }
  if (!made) made = null;

  p = path.resolve(p);

  try {
    xfs.mkdirSync(p, mode);
    made = made || p;
  } catch (err0) {
    if (err0.code === 'ENOENT') {
      if (path.dirname(p) === p) throw err0
      made = mkdirsSync(path.dirname(p), opts, made);
      mkdirsSync(p, opts, made);
    } else {
      // In the case of any other error, just see if there's a dir there
      // already. If so, then hooray!  If not, then something is borked.
      let stat;
      try {
        stat = xfs.statSync(p);
      } catch (err1) {
        throw err0
      }
      if (!stat.isDirectory()) throw err0
    }
  }

  return made
}

var mkdirsSync_1 = mkdirsSync;

const u = universalify.fromCallback;
const mkdirs$1 = u(mkdirs_1);


var mkdirs_1$1 = {
  mkdirs: mkdirs$1,
  mkdirsSync: mkdirsSync_1,
  // alias
  mkdirp: mkdirs$1,
  mkdirpSync: mkdirsSync_1,
  ensureDir: mkdirs$1,
  ensureDirSync: mkdirsSync_1
};

// HFS, ext{2,3}, FAT do not, Node.js v0.10 does not
function hasMillisResSync () {
  let tmpfile = path.join('millis-test-sync' + Date.now().toString() + Math.random().toString().slice(2));
  tmpfile = path.join(os.tmpdir(), tmpfile);

  // 550 millis past UNIX epoch
  const d = new Date(1435410243862);
  gracefulFs.writeFileSync(tmpfile, 'https://github.com/jprichardson/node-fs-extra/pull/141');
  const fd = gracefulFs.openSync(tmpfile, 'r+');
  gracefulFs.futimesSync(fd, d, d);
  gracefulFs.closeSync(fd);
  return gracefulFs.statSync(tmpfile).mtime > 1435410243000
}

function hasMillisRes (callback) {
  let tmpfile = path.join('millis-test' + Date.now().toString() + Math.random().toString().slice(2));
  tmpfile = path.join(os.tmpdir(), tmpfile);

  // 550 millis past UNIX epoch
  const d = new Date(1435410243862);
  gracefulFs.writeFile(tmpfile, 'https://github.com/jprichardson/node-fs-extra/pull/141', err => {
    if (err) return callback(err)
    gracefulFs.open(tmpfile, 'r+', (err, fd) => {
      if (err) return callback(err)
      gracefulFs.futimes(fd, d, d, err => {
        if (err) return callback(err)
        gracefulFs.close(fd, err => {
          if (err) return callback(err)
          gracefulFs.stat(tmpfile, (err, stats) => {
            if (err) return callback(err)
            callback(null, stats.mtime > 1435410243000);
          });
        });
      });
    });
  });
}

function timeRemoveMillis (timestamp) {
  if (typeof timestamp === 'number') {
    return Math.floor(timestamp / 1000) * 1000
  } else if (timestamp instanceof Date) {
    return new Date(Math.floor(timestamp.getTime() / 1000) * 1000)
  } else {
    throw new Error('fs-extra: timeRemoveMillis() unknown parameter type')
  }
}

function utimesMillis (path, atime, mtime, callback) {
  // if (!HAS_MILLIS_RES) return fs.utimes(path, atime, mtime, callback)
  gracefulFs.open(path, 'r+', (err, fd) => {
    if (err) return callback(err)
    gracefulFs.futimes(fd, atime, mtime, futimesErr => {
      gracefulFs.close(fd, closeErr => {
        if (callback) callback(futimesErr || closeErr);
      });
    });
  });
}

function utimesMillisSync (path, atime, mtime) {
  const fd = gracefulFs.openSync(path, 'r+');
  gracefulFs.futimesSync(fd, atime, mtime);
  return gracefulFs.closeSync(fd)
}

var utimes = {
  hasMillisRes,
  hasMillisResSync,
  timeRemoveMillis,
  utimesMillis,
  utimesMillisSync
};

const NODE_VERSION_MAJOR_WITH_BIGINT = 10;
const NODE_VERSION_MINOR_WITH_BIGINT = 5;
const NODE_VERSION_PATCH_WITH_BIGINT = 0;
const nodeVersion = process.versions.node.split('.');
const nodeVersionMajor = Number.parseInt(nodeVersion[0], 10);
const nodeVersionMinor = Number.parseInt(nodeVersion[1], 10);
const nodeVersionPatch = Number.parseInt(nodeVersion[2], 10);

function nodeSupportsBigInt () {
  if (nodeVersionMajor > NODE_VERSION_MAJOR_WITH_BIGINT) {
    return true
  } else if (nodeVersionMajor === NODE_VERSION_MAJOR_WITH_BIGINT) {
    if (nodeVersionMinor > NODE_VERSION_MINOR_WITH_BIGINT) {
      return true
    } else if (nodeVersionMinor === NODE_VERSION_MINOR_WITH_BIGINT) {
      if (nodeVersionPatch >= NODE_VERSION_PATCH_WITH_BIGINT) {
        return true
      }
    }
  }
  return false
}

function getStats (src, dest, cb) {
  if (nodeSupportsBigInt()) {
    gracefulFs.stat(src, { bigint: true }, (err, srcStat) => {
      if (err) return cb(err)
      gracefulFs.stat(dest, { bigint: true }, (err, destStat) => {
        if (err) {
          if (err.code === 'ENOENT') return cb(null, { srcStat, destStat: null })
          return cb(err)
        }
        return cb(null, { srcStat, destStat })
      });
    });
  } else {
    gracefulFs.stat(src, (err, srcStat) => {
      if (err) return cb(err)
      gracefulFs.stat(dest, (err, destStat) => {
        if (err) {
          if (err.code === 'ENOENT') return cb(null, { srcStat, destStat: null })
          return cb(err)
        }
        return cb(null, { srcStat, destStat })
      });
    });
  }
}

function getStatsSync (src, dest) {
  let srcStat, destStat;
  if (nodeSupportsBigInt()) {
    srcStat = gracefulFs.statSync(src, { bigint: true });
  } else {
    srcStat = gracefulFs.statSync(src);
  }
  try {
    if (nodeSupportsBigInt()) {
      destStat = gracefulFs.statSync(dest, { bigint: true });
    } else {
      destStat = gracefulFs.statSync(dest);
    }
  } catch (err) {
    if (err.code === 'ENOENT') return { srcStat, destStat: null }
    throw err
  }
  return { srcStat, destStat }
}

function checkPaths (src, dest, funcName, cb) {
  getStats(src, dest, (err, stats) => {
    if (err) return cb(err)
    const { srcStat, destStat } = stats;
    if (destStat && destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev) {
      return cb(new Error('Source and destination must not be the same.'))
    }
    if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
      return cb(new Error(errMsg(src, dest, funcName)))
    }
    return cb(null, { srcStat, destStat })
  });
}

function checkPathsSync (src, dest, funcName) {
  const { srcStat, destStat } = getStatsSync(src, dest);
  if (destStat && destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev) {
    throw new Error('Source and destination must not be the same.')
  }
  if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
    throw new Error(errMsg(src, dest, funcName))
  }
  return { srcStat, destStat }
}

// recursively check if dest parent is a subdirectory of src.
// It works for all file types including symlinks since it
// checks the src and dest inodes. It starts from the deepest
// parent and stops once it reaches the src parent or the root path.
function checkParentPaths (src, srcStat, dest, funcName, cb) {
  const srcParent = path.resolve(path.dirname(src));
  const destParent = path.resolve(path.dirname(dest));
  if (destParent === srcParent || destParent === path.parse(destParent).root) return cb()
  if (nodeSupportsBigInt()) {
    gracefulFs.stat(destParent, { bigint: true }, (err, destStat) => {
      if (err) {
        if (err.code === 'ENOENT') return cb()
        return cb(err)
      }
      if (destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev) {
        return cb(new Error(errMsg(src, dest, funcName)))
      }
      return checkParentPaths(src, srcStat, destParent, funcName, cb)
    });
  } else {
    gracefulFs.stat(destParent, (err, destStat) => {
      if (err) {
        if (err.code === 'ENOENT') return cb()
        return cb(err)
      }
      if (destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev) {
        return cb(new Error(errMsg(src, dest, funcName)))
      }
      return checkParentPaths(src, srcStat, destParent, funcName, cb)
    });
  }
}

function checkParentPathsSync (src, srcStat, dest, funcName) {
  const srcParent = path.resolve(path.dirname(src));
  const destParent = path.resolve(path.dirname(dest));
  if (destParent === srcParent || destParent === path.parse(destParent).root) return
  let destStat;
  try {
    if (nodeSupportsBigInt()) {
      destStat = gracefulFs.statSync(destParent, { bigint: true });
    } else {
      destStat = gracefulFs.statSync(destParent);
    }
  } catch (err) {
    if (err.code === 'ENOENT') return
    throw err
  }
  if (destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev) {
    throw new Error(errMsg(src, dest, funcName))
  }
  return checkParentPathsSync(src, srcStat, destParent, funcName)
}

// return true if dest is a subdir of src, otherwise false.
// It only checks the path strings.
function isSrcSubdir (src, dest) {
  const srcArr = path.resolve(src).split(path.sep).filter(i => i);
  const destArr = path.resolve(dest).split(path.sep).filter(i => i);
  return srcArr.reduce((acc, cur, i) => acc && destArr[i] === cur, true)
}

function errMsg (src, dest, funcName) {
  return `Cannot ${funcName} '${src}' to a subdirectory of itself, '${dest}'.`
}

var stat = {
  checkPaths,
  checkPathsSync,
  checkParentPaths,
  checkParentPathsSync,
  isSrcSubdir
};

/* eslint-disable node/no-deprecated-api */
var buffer = function (size) {
  if (typeof Buffer.allocUnsafe === 'function') {
    try {
      return Buffer.allocUnsafe(size)
    } catch (e) {
      return new Buffer(size)
    }
  }
  return new Buffer(size)
};

const mkdirpSync = mkdirs_1$1.mkdirsSync;
const utimesSync = utimes.utimesMillisSync;


function copySync (src, dest, opts) {
  if (typeof opts === 'function') {
    opts = { filter: opts };
  }

  opts = opts || {};
  opts.clobber = 'clobber' in opts ? !!opts.clobber : true; // default to true for now
  opts.overwrite = 'overwrite' in opts ? !!opts.overwrite : opts.clobber; // overwrite falls back to clobber

  // Warn about using preserveTimestamps on 32-bit node
  if (opts.preserveTimestamps && process.arch === 'ia32') {
    console.warn(`fs-extra: Using the preserveTimestamps option in 32-bit node is not recommended;\n
    see https://github.com/jprichardson/node-fs-extra/issues/269`);
  }

  const { srcStat, destStat } = stat.checkPathsSync(src, dest, 'copy');
  stat.checkParentPathsSync(src, srcStat, dest, 'copy');
  return handleFilterAndCopy(destStat, src, dest, opts)
}

function handleFilterAndCopy (destStat, src, dest, opts) {
  if (opts.filter && !opts.filter(src, dest)) return
  const destParent = path.dirname(dest);
  if (!gracefulFs.existsSync(destParent)) mkdirpSync(destParent);
  return startCopy(destStat, src, dest, opts)
}

function startCopy (destStat, src, dest, opts) {
  if (opts.filter && !opts.filter(src, dest)) return
  return getStats$1(destStat, src, dest, opts)
}

function getStats$1 (destStat, src, dest, opts) {
  const statSync = opts.dereference ? gracefulFs.statSync : gracefulFs.lstatSync;
  const srcStat = statSync(src);

  if (srcStat.isDirectory()) return onDir(srcStat, destStat, src, dest, opts)
  else if (srcStat.isFile() ||
           srcStat.isCharacterDevice() ||
           srcStat.isBlockDevice()) return onFile(srcStat, destStat, src, dest, opts)
  else if (srcStat.isSymbolicLink()) return onLink(destStat, src, dest, opts)
}

function onFile (srcStat, destStat, src, dest, opts) {
  if (!destStat) return copyFile(srcStat, src, dest, opts)
  return mayCopyFile(srcStat, src, dest, opts)
}

function mayCopyFile (srcStat, src, dest, opts) {
  if (opts.overwrite) {
    gracefulFs.unlinkSync(dest);
    return copyFile(srcStat, src, dest, opts)
  } else if (opts.errorOnExist) {
    throw new Error(`'${dest}' already exists`)
  }
}

function copyFile (srcStat, src, dest, opts) {
  if (typeof gracefulFs.copyFileSync === 'function') {
    gracefulFs.copyFileSync(src, dest);
    gracefulFs.chmodSync(dest, srcStat.mode);
    if (opts.preserveTimestamps) {
      return utimesSync(dest, srcStat.atime, srcStat.mtime)
    }
    return
  }
  return copyFileFallback(srcStat, src, dest, opts)
}

function copyFileFallback (srcStat, src, dest, opts) {
  const BUF_LENGTH = 64 * 1024;
  const _buff = buffer(BUF_LENGTH);

  const fdr = gracefulFs.openSync(src, 'r');
  const fdw = gracefulFs.openSync(dest, 'w', srcStat.mode);
  let pos = 0;

  while (pos < srcStat.size) {
    const bytesRead = gracefulFs.readSync(fdr, _buff, 0, BUF_LENGTH, pos);
    gracefulFs.writeSync(fdw, _buff, 0, bytesRead);
    pos += bytesRead;
  }

  if (opts.preserveTimestamps) gracefulFs.futimesSync(fdw, srcStat.atime, srcStat.mtime);

  gracefulFs.closeSync(fdr);
  gracefulFs.closeSync(fdw);
}

function onDir (srcStat, destStat, src, dest, opts) {
  if (!destStat) return mkDirAndCopy(srcStat, src, dest, opts)
  if (destStat && !destStat.isDirectory()) {
    throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`)
  }
  return copyDir(src, dest, opts)
}

function mkDirAndCopy (srcStat, src, dest, opts) {
  gracefulFs.mkdirSync(dest);
  copyDir(src, dest, opts);
  return gracefulFs.chmodSync(dest, srcStat.mode)
}

function copyDir (src, dest, opts) {
  gracefulFs.readdirSync(src).forEach(item => copyDirItem(item, src, dest, opts));
}

function copyDirItem (item, src, dest, opts) {
  const srcItem = path.join(src, item);
  const destItem = path.join(dest, item);
  const { destStat } = stat.checkPathsSync(srcItem, destItem, 'copy');
  return startCopy(destStat, srcItem, destItem, opts)
}

function onLink (destStat, src, dest, opts) {
  let resolvedSrc = gracefulFs.readlinkSync(src);
  if (opts.dereference) {
    resolvedSrc = path.resolve(process.cwd(), resolvedSrc);
  }

  if (!destStat) {
    return gracefulFs.symlinkSync(resolvedSrc, dest)
  } else {
    let resolvedDest;
    try {
      resolvedDest = gracefulFs.readlinkSync(dest);
    } catch (err) {
      // dest exists and is a regular file or directory,
      // Windows may throw UNKNOWN error. If dest already exists,
      // fs throws error anyway, so no need to guard against it here.
      if (err.code === 'EINVAL' || err.code === 'UNKNOWN') return gracefulFs.symlinkSync(resolvedSrc, dest)
      throw err
    }
    if (opts.dereference) {
      resolvedDest = path.resolve(process.cwd(), resolvedDest);
    }
    if (stat.isSrcSubdir(resolvedSrc, resolvedDest)) {
      throw new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`)
    }

    // prevent copy if src is a subdir of dest since unlinking
    // dest in this case would result in removing src contents
    // and therefore a broken symlink would be created.
    if (gracefulFs.statSync(dest).isDirectory() && stat.isSrcSubdir(resolvedDest, resolvedSrc)) {
      throw new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`)
    }
    return copyLink(resolvedSrc, dest)
  }
}

function copyLink (resolvedSrc, dest) {
  gracefulFs.unlinkSync(dest);
  return gracefulFs.symlinkSync(resolvedSrc, dest)
}

var copySync_1 = copySync;

var copySync$1 = {
  copySync: copySync_1
};

const u$1 = universalify.fromPromise;


function pathExists (path) {
  return fs_1.access(path).then(() => true).catch(() => false)
}

var pathExists_1 = {
  pathExists: u$1(pathExists),
  pathExistsSync: fs_1.existsSync
};

const mkdirp = mkdirs_1$1.mkdirs;
const pathExists$1 = pathExists_1.pathExists;
const utimes$1 = utimes.utimesMillis;


function copy (src, dest, opts, cb) {
  if (typeof opts === 'function' && !cb) {
    cb = opts;
    opts = {};
  } else if (typeof opts === 'function') {
    opts = { filter: opts };
  }

  cb = cb || function () {};
  opts = opts || {};

  opts.clobber = 'clobber' in opts ? !!opts.clobber : true; // default to true for now
  opts.overwrite = 'overwrite' in opts ? !!opts.overwrite : opts.clobber; // overwrite falls back to clobber

  // Warn about using preserveTimestamps on 32-bit node
  if (opts.preserveTimestamps && process.arch === 'ia32') {
    console.warn(`fs-extra: Using the preserveTimestamps option in 32-bit node is not recommended;\n
    see https://github.com/jprichardson/node-fs-extra/issues/269`);
  }

  stat.checkPaths(src, dest, 'copy', (err, stats) => {
    if (err) return cb(err)
    const { srcStat, destStat } = stats;
    stat.checkParentPaths(src, srcStat, dest, 'copy', err => {
      if (err) return cb(err)
      if (opts.filter) return handleFilter(checkParentDir, destStat, src, dest, opts, cb)
      return checkParentDir(destStat, src, dest, opts, cb)
    });
  });
}

function checkParentDir (destStat, src, dest, opts, cb) {
  const destParent = path.dirname(dest);
  pathExists$1(destParent, (err, dirExists) => {
    if (err) return cb(err)
    if (dirExists) return startCopy$1(destStat, src, dest, opts, cb)
    mkdirp(destParent, err => {
      if (err) return cb(err)
      return startCopy$1(destStat, src, dest, opts, cb)
    });
  });
}

function handleFilter (onInclude, destStat, src, dest, opts, cb) {
  Promise.resolve(opts.filter(src, dest)).then(include => {
    if (include) return onInclude(destStat, src, dest, opts, cb)
    return cb()
  }, error => cb(error));
}

function startCopy$1 (destStat, src, dest, opts, cb) {
  if (opts.filter) return handleFilter(getStats$2, destStat, src, dest, opts, cb)
  return getStats$2(destStat, src, dest, opts, cb)
}

function getStats$2 (destStat, src, dest, opts, cb) {
  const stat = opts.dereference ? gracefulFs.stat : gracefulFs.lstat;
  stat(src, (err, srcStat) => {
    if (err) return cb(err)

    if (srcStat.isDirectory()) return onDir$1(srcStat, destStat, src, dest, opts, cb)
    else if (srcStat.isFile() ||
             srcStat.isCharacterDevice() ||
             srcStat.isBlockDevice()) return onFile$1(srcStat, destStat, src, dest, opts, cb)
    else if (srcStat.isSymbolicLink()) return onLink$1(destStat, src, dest, opts, cb)
  });
}

function onFile$1 (srcStat, destStat, src, dest, opts, cb) {
  if (!destStat) return copyFile$1(srcStat, src, dest, opts, cb)
  return mayCopyFile$1(srcStat, src, dest, opts, cb)
}

function mayCopyFile$1 (srcStat, src, dest, opts, cb) {
  if (opts.overwrite) {
    gracefulFs.unlink(dest, err => {
      if (err) return cb(err)
      return copyFile$1(srcStat, src, dest, opts, cb)
    });
  } else if (opts.errorOnExist) {
    return cb(new Error(`'${dest}' already exists`))
  } else return cb()
}

function copyFile$1 (srcStat, src, dest, opts, cb) {
  if (typeof gracefulFs.copyFile === 'function') {
    return gracefulFs.copyFile(src, dest, err => {
      if (err) return cb(err)
      return setDestModeAndTimestamps(srcStat, dest, opts, cb)
    })
  }
  return copyFileFallback$1(srcStat, src, dest, opts, cb)
}

function copyFileFallback$1 (srcStat, src, dest, opts, cb) {
  const rs = gracefulFs.createReadStream(src);
  rs.on('error', err => cb(err)).once('open', () => {
    const ws = gracefulFs.createWriteStream(dest, { mode: srcStat.mode });
    ws.on('error', err => cb(err))
      .on('open', () => rs.pipe(ws))
      .once('close', () => setDestModeAndTimestamps(srcStat, dest, opts, cb));
  });
}

function setDestModeAndTimestamps (srcStat, dest, opts, cb) {
  gracefulFs.chmod(dest, srcStat.mode, err => {
    if (err) return cb(err)
    if (opts.preserveTimestamps) {
      return utimes$1(dest, srcStat.atime, srcStat.mtime, cb)
    }
    return cb()
  });
}

function onDir$1 (srcStat, destStat, src, dest, opts, cb) {
  if (!destStat) return mkDirAndCopy$1(srcStat, src, dest, opts, cb)
  if (destStat && !destStat.isDirectory()) {
    return cb(new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`))
  }
  return copyDir$1(src, dest, opts, cb)
}

function mkDirAndCopy$1 (srcStat, src, dest, opts, cb) {
  gracefulFs.mkdir(dest, err => {
    if (err) return cb(err)
    copyDir$1(src, dest, opts, err => {
      if (err) return cb(err)
      return gracefulFs.chmod(dest, srcStat.mode, cb)
    });
  });
}

function copyDir$1 (src, dest, opts, cb) {
  gracefulFs.readdir(src, (err, items) => {
    if (err) return cb(err)
    return copyDirItems(items, src, dest, opts, cb)
  });
}

function copyDirItems (items, src, dest, opts, cb) {
  const item = items.pop();
  if (!item) return cb()
  return copyDirItem$1(items, item, src, dest, opts, cb)
}

function copyDirItem$1 (items, item, src, dest, opts, cb) {
  const srcItem = path.join(src, item);
  const destItem = path.join(dest, item);
  stat.checkPaths(srcItem, destItem, 'copy', (err, stats) => {
    if (err) return cb(err)
    const { destStat } = stats;
    startCopy$1(destStat, srcItem, destItem, opts, err => {
      if (err) return cb(err)
      return copyDirItems(items, src, dest, opts, cb)
    });
  });
}

function onLink$1 (destStat, src, dest, opts, cb) {
  gracefulFs.readlink(src, (err, resolvedSrc) => {
    if (err) return cb(err)
    if (opts.dereference) {
      resolvedSrc = path.resolve(process.cwd(), resolvedSrc);
    }

    if (!destStat) {
      return gracefulFs.symlink(resolvedSrc, dest, cb)
    } else {
      gracefulFs.readlink(dest, (err, resolvedDest) => {
        if (err) {
          // dest exists and is a regular file or directory,
          // Windows may throw UNKNOWN error. If dest already exists,
          // fs throws error anyway, so no need to guard against it here.
          if (err.code === 'EINVAL' || err.code === 'UNKNOWN') return gracefulFs.symlink(resolvedSrc, dest, cb)
          return cb(err)
        }
        if (opts.dereference) {
          resolvedDest = path.resolve(process.cwd(), resolvedDest);
        }
        if (stat.isSrcSubdir(resolvedSrc, resolvedDest)) {
          return cb(new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`))
        }

        // do not copy if src is a subdir of dest since unlinking
        // dest in this case would result in removing src contents
        // and therefore a broken symlink would be created.
        if (destStat.isDirectory() && stat.isSrcSubdir(resolvedDest, resolvedSrc)) {
          return cb(new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`))
        }
        return copyLink$1(resolvedSrc, dest, cb)
      });
    }
  });
}

function copyLink$1 (resolvedSrc, dest, cb) {
  gracefulFs.unlink(dest, err => {
    if (err) return cb(err)
    return gracefulFs.symlink(resolvedSrc, dest, cb)
  });
}

var copy_1 = copy;

const u$2 = universalify.fromCallback;
var copy$1 = {
  copy: u$2(copy_1)
};

const isWindows = (process.platform === 'win32');

function defaults (options) {
  const methods = [
    'unlink',
    'chmod',
    'stat',
    'lstat',
    'rmdir',
    'readdir'
  ];
  methods.forEach(m => {
    options[m] = options[m] || gracefulFs[m];
    m = m + 'Sync';
    options[m] = options[m] || gracefulFs[m];
  });

  options.maxBusyTries = options.maxBusyTries || 3;
}

function rimraf (p, options, cb) {
  let busyTries = 0;

  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  assert(p, 'rimraf: missing path');
  assert.strictEqual(typeof p, 'string', 'rimraf: path should be a string');
  assert.strictEqual(typeof cb, 'function', 'rimraf: callback function required');
  assert(options, 'rimraf: invalid options argument provided');
  assert.strictEqual(typeof options, 'object', 'rimraf: options should be object');

  defaults(options);

  rimraf_(p, options, function CB (er) {
    if (er) {
      if ((er.code === 'EBUSY' || er.code === 'ENOTEMPTY' || er.code === 'EPERM') &&
          busyTries < options.maxBusyTries) {
        busyTries++;
        const time = busyTries * 100;
        // try again, with the same exact callback as this one.
        return setTimeout(() => rimraf_(p, options, CB), time)
      }

      // already gone
      if (er.code === 'ENOENT') er = null;
    }

    cb(er);
  });
}

// Two possible strategies.
// 1. Assume it's a file.  unlink it, then do the dir stuff on EPERM or EISDIR
// 2. Assume it's a directory.  readdir, then do the file stuff on ENOTDIR
//
// Both result in an extra syscall when you guess wrong.  However, there
// are likely far more normal files in the world than directories.  This
// is based on the assumption that a the average number of files per
// directory is >= 1.
//
// If anyone ever complains about this, then I guess the strategy could
// be made configurable somehow.  But until then, YAGNI.
function rimraf_ (p, options, cb) {
  assert(p);
  assert(options);
  assert(typeof cb === 'function');

  // sunos lets the root user unlink directories, which is... weird.
  // so we have to lstat here and make sure it's not a dir.
  options.lstat(p, (er, st) => {
    if (er && er.code === 'ENOENT') {
      return cb(null)
    }

    // Windows can EPERM on stat.  Life is suffering.
    if (er && er.code === 'EPERM' && isWindows) {
      return fixWinEPERM(p, options, er, cb)
    }

    if (st && st.isDirectory()) {
      return rmdir(p, options, er, cb)
    }

    options.unlink(p, er => {
      if (er) {
        if (er.code === 'ENOENT') {
          return cb(null)
        }
        if (er.code === 'EPERM') {
          return (isWindows)
            ? fixWinEPERM(p, options, er, cb)
            : rmdir(p, options, er, cb)
        }
        if (er.code === 'EISDIR') {
          return rmdir(p, options, er, cb)
        }
      }
      return cb(er)
    });
  });
}

function fixWinEPERM (p, options, er, cb) {
  assert(p);
  assert(options);
  assert(typeof cb === 'function');
  if (er) {
    assert(er instanceof Error);
  }

  options.chmod(p, 0o666, er2 => {
    if (er2) {
      cb(er2.code === 'ENOENT' ? null : er);
    } else {
      options.stat(p, (er3, stats) => {
        if (er3) {
          cb(er3.code === 'ENOENT' ? null : er);
        } else if (stats.isDirectory()) {
          rmdir(p, options, er, cb);
        } else {
          options.unlink(p, cb);
        }
      });
    }
  });
}

function fixWinEPERMSync (p, options, er) {
  let stats;

  assert(p);
  assert(options);
  if (er) {
    assert(er instanceof Error);
  }

  try {
    options.chmodSync(p, 0o666);
  } catch (er2) {
    if (er2.code === 'ENOENT') {
      return
    } else {
      throw er
    }
  }

  try {
    stats = options.statSync(p);
  } catch (er3) {
    if (er3.code === 'ENOENT') {
      return
    } else {
      throw er
    }
  }

  if (stats.isDirectory()) {
    rmdirSync(p, options, er);
  } else {
    options.unlinkSync(p);
  }
}

function rmdir (p, options, originalEr, cb) {
  assert(p);
  assert(options);
  if (originalEr) {
    assert(originalEr instanceof Error);
  }
  assert(typeof cb === 'function');

  // try to rmdir first, and only readdir on ENOTEMPTY or EEXIST (SunOS)
  // if we guessed wrong, and it's not a directory, then
  // raise the original error.
  options.rmdir(p, er => {
    if (er && (er.code === 'ENOTEMPTY' || er.code === 'EEXIST' || er.code === 'EPERM')) {
      rmkids(p, options, cb);
    } else if (er && er.code === 'ENOTDIR') {
      cb(originalEr);
    } else {
      cb(er);
    }
  });
}

function rmkids (p, options, cb) {
  assert(p);
  assert(options);
  assert(typeof cb === 'function');

  options.readdir(p, (er, files) => {
    if (er) return cb(er)

    let n = files.length;
    let errState;

    if (n === 0) return options.rmdir(p, cb)

    files.forEach(f => {
      rimraf(path.join(p, f), options, er => {
        if (errState) {
          return
        }
        if (er) return cb(errState = er)
        if (--n === 0) {
          options.rmdir(p, cb);
        }
      });
    });
  });
}

// this looks simpler, and is strictly *faster*, but will
// tie up the JavaScript thread and fail on excessively
// deep directory trees.
function rimrafSync (p, options) {
  let st;

  options = options || {};
  defaults(options);

  assert(p, 'rimraf: missing path');
  assert.strictEqual(typeof p, 'string', 'rimraf: path should be a string');
  assert(options, 'rimraf: missing options');
  assert.strictEqual(typeof options, 'object', 'rimraf: options should be object');

  try {
    st = options.lstatSync(p);
  } catch (er) {
    if (er.code === 'ENOENT') {
      return
    }

    // Windows can EPERM on stat.  Life is suffering.
    if (er.code === 'EPERM' && isWindows) {
      fixWinEPERMSync(p, options, er);
    }
  }

  try {
    // sunos lets the root user unlink directories, which is... weird.
    if (st && st.isDirectory()) {
      rmdirSync(p, options, null);
    } else {
      options.unlinkSync(p);
    }
  } catch (er) {
    if (er.code === 'ENOENT') {
      return
    } else if (er.code === 'EPERM') {
      return isWindows ? fixWinEPERMSync(p, options, er) : rmdirSync(p, options, er)
    } else if (er.code !== 'EISDIR') {
      throw er
    }
    rmdirSync(p, options, er);
  }
}

function rmdirSync (p, options, originalEr) {
  assert(p);
  assert(options);
  if (originalEr) {
    assert(originalEr instanceof Error);
  }

  try {
    options.rmdirSync(p);
  } catch (er) {
    if (er.code === 'ENOTDIR') {
      throw originalEr
    } else if (er.code === 'ENOTEMPTY' || er.code === 'EEXIST' || er.code === 'EPERM') {
      rmkidsSync(p, options);
    } else if (er.code !== 'ENOENT') {
      throw er
    }
  }
}

function rmkidsSync (p, options) {
  assert(p);
  assert(options);
  options.readdirSync(p).forEach(f => rimrafSync(path.join(p, f), options));

  if (isWindows) {
    // We only end up here once we got ENOTEMPTY at least once, and
    // at this point, we are guaranteed to have removed all the kids.
    // So, we know that it won't be ENOENT or ENOTDIR or anything else.
    // try really hard to delete stuff on windows, because it has a
    // PROFOUNDLY annoying habit of not closing handles promptly when
    // files are deleted, resulting in spurious ENOTEMPTY errors.
    const startTime = Date.now();
    do {
      try {
        const ret = options.rmdirSync(p, options);
        return ret
      } catch (er) { }
    } while (Date.now() - startTime < 500) // give up after 500ms
  } else {
    const ret = options.rmdirSync(p, options);
    return ret
  }
}

var rimraf_1 = rimraf;
rimraf.sync = rimrafSync;

const u$3 = universalify.fromCallback;


var remove = {
  remove: u$3(rimraf_1),
  removeSync: rimraf_1.sync
};

const u$4 = universalify.fromCallback;





const emptyDir = u$4(function emptyDir (dir, callback) {
  callback = callback || function () {};
  gracefulFs.readdir(dir, (err, items) => {
    if (err) return mkdirs_1$1.mkdirs(dir, callback)

    items = items.map(item => path.join(dir, item));

    deleteItem();

    function deleteItem () {
      const item = items.pop();
      if (!item) return callback()
      remove.remove(item, err => {
        if (err) return callback(err)
        deleteItem();
      });
    }
  });
});

function emptyDirSync (dir) {
  let items;
  try {
    items = gracefulFs.readdirSync(dir);
  } catch (err) {
    return mkdirs_1$1.mkdirsSync(dir)
  }

  items.forEach(item => {
    item = path.join(dir, item);
    remove.removeSync(item);
  });
}

var empty = {
  emptyDirSync,
  emptydirSync: emptyDirSync,
  emptyDir,
  emptydir: emptyDir
};

const u$5 = universalify.fromCallback;



const pathExists$2 = pathExists_1.pathExists;

function createFile (file, callback) {
  function makeFile () {
    gracefulFs.writeFile(file, '', err => {
      if (err) return callback(err)
      callback();
    });
  }

  gracefulFs.stat(file, (err, stats) => { // eslint-disable-line handle-callback-err
    if (!err && stats.isFile()) return callback()
    const dir = path.dirname(file);
    pathExists$2(dir, (err, dirExists) => {
      if (err) return callback(err)
      if (dirExists) return makeFile()
      mkdirs_1$1.mkdirs(dir, err => {
        if (err) return callback(err)
        makeFile();
      });
    });
  });
}

function createFileSync (file) {
  let stats;
  try {
    stats = gracefulFs.statSync(file);
  } catch (e) {}
  if (stats && stats.isFile()) return

  const dir = path.dirname(file);
  if (!gracefulFs.existsSync(dir)) {
    mkdirs_1$1.mkdirsSync(dir);
  }

  gracefulFs.writeFileSync(file, '');
}

var file = {
  createFile: u$5(createFile),
  createFileSync
};

const u$6 = universalify.fromCallback;



const pathExists$3 = pathExists_1.pathExists;

function createLink (srcpath, dstpath, callback) {
  function makeLink (srcpath, dstpath) {
    gracefulFs.link(srcpath, dstpath, err => {
      if (err) return callback(err)
      callback(null);
    });
  }

  pathExists$3(dstpath, (err, destinationExists) => {
    if (err) return callback(err)
    if (destinationExists) return callback(null)
    gracefulFs.lstat(srcpath, (err) => {
      if (err) {
        err.message = err.message.replace('lstat', 'ensureLink');
        return callback(err)
      }

      const dir = path.dirname(dstpath);
      pathExists$3(dir, (err, dirExists) => {
        if (err) return callback(err)
        if (dirExists) return makeLink(srcpath, dstpath)
        mkdirs_1$1.mkdirs(dir, err => {
          if (err) return callback(err)
          makeLink(srcpath, dstpath);
        });
      });
    });
  });
}

function createLinkSync (srcpath, dstpath) {
  const destinationExists = gracefulFs.existsSync(dstpath);
  if (destinationExists) return undefined

  try {
    gracefulFs.lstatSync(srcpath);
  } catch (err) {
    err.message = err.message.replace('lstat', 'ensureLink');
    throw err
  }

  const dir = path.dirname(dstpath);
  const dirExists = gracefulFs.existsSync(dir);
  if (dirExists) return gracefulFs.linkSync(srcpath, dstpath)
  mkdirs_1$1.mkdirsSync(dir);

  return gracefulFs.linkSync(srcpath, dstpath)
}

var link = {
  createLink: u$6(createLink),
  createLinkSync
};

const pathExists$4 = pathExists_1.pathExists;

/**
 * Function that returns two types of paths, one relative to symlink, and one
 * relative to the current working directory. Checks if path is absolute or
 * relative. If the path is relative, this function checks if the path is
 * relative to symlink or relative to current working directory. This is an
 * initiative to find a smarter `srcpath` to supply when building symlinks.
 * This allows you to determine which path to use out of one of three possible
 * types of source paths. The first is an absolute path. This is detected by
 * `path.isAbsolute()`. When an absolute path is provided, it is checked to
 * see if it exists. If it does it's used, if not an error is returned
 * (callback)/ thrown (sync). The other two options for `srcpath` are a
 * relative url. By default Node's `fs.symlink` works by creating a symlink
 * using `dstpath` and expects the `srcpath` to be relative to the newly
 * created symlink. If you provide a `srcpath` that does not exist on the file
 * system it results in a broken symlink. To minimize this, the function
 * checks to see if the 'relative to symlink' source file exists, and if it
 * does it will use it. If it does not, it checks if there's a file that
 * exists that is relative to the current working directory, if does its used.
 * This preserves the expectations of the original fs.symlink spec and adds
 * the ability to pass in `relative to current working direcotry` paths.
 */

function symlinkPaths (srcpath, dstpath, callback) {
  if (path.isAbsolute(srcpath)) {
    return gracefulFs.lstat(srcpath, (err) => {
      if (err) {
        err.message = err.message.replace('lstat', 'ensureSymlink');
        return callback(err)
      }
      return callback(null, {
        'toCwd': srcpath,
        'toDst': srcpath
      })
    })
  } else {
    const dstdir = path.dirname(dstpath);
    const relativeToDst = path.join(dstdir, srcpath);
    return pathExists$4(relativeToDst, (err, exists) => {
      if (err) return callback(err)
      if (exists) {
        return callback(null, {
          'toCwd': relativeToDst,
          'toDst': srcpath
        })
      } else {
        return gracefulFs.lstat(srcpath, (err) => {
          if (err) {
            err.message = err.message.replace('lstat', 'ensureSymlink');
            return callback(err)
          }
          return callback(null, {
            'toCwd': srcpath,
            'toDst': path.relative(dstdir, srcpath)
          })
        })
      }
    })
  }
}

function symlinkPathsSync (srcpath, dstpath) {
  let exists;
  if (path.isAbsolute(srcpath)) {
    exists = gracefulFs.existsSync(srcpath);
    if (!exists) throw new Error('absolute srcpath does not exist')
    return {
      'toCwd': srcpath,
      'toDst': srcpath
    }
  } else {
    const dstdir = path.dirname(dstpath);
    const relativeToDst = path.join(dstdir, srcpath);
    exists = gracefulFs.existsSync(relativeToDst);
    if (exists) {
      return {
        'toCwd': relativeToDst,
        'toDst': srcpath
      }
    } else {
      exists = gracefulFs.existsSync(srcpath);
      if (!exists) throw new Error('relative srcpath does not exist')
      return {
        'toCwd': srcpath,
        'toDst': path.relative(dstdir, srcpath)
      }
    }
  }
}

var symlinkPaths_1 = {
  symlinkPaths,
  symlinkPathsSync
};

function symlinkType (srcpath, type, callback) {
  callback = (typeof type === 'function') ? type : callback;
  type = (typeof type === 'function') ? false : type;
  if (type) return callback(null, type)
  gracefulFs.lstat(srcpath, (err, stats) => {
    if (err) return callback(null, 'file')
    type = (stats && stats.isDirectory()) ? 'dir' : 'file';
    callback(null, type);
  });
}

function symlinkTypeSync (srcpath, type) {
  let stats;

  if (type) return type
  try {
    stats = gracefulFs.lstatSync(srcpath);
  } catch (e) {
    return 'file'
  }
  return (stats && stats.isDirectory()) ? 'dir' : 'file'
}

var symlinkType_1 = {
  symlinkType,
  symlinkTypeSync
};

const u$7 = universalify.fromCallback;



const mkdirs$2 = mkdirs_1$1.mkdirs;
const mkdirsSync$1 = mkdirs_1$1.mkdirsSync;


const symlinkPaths$1 = symlinkPaths_1.symlinkPaths;
const symlinkPathsSync$1 = symlinkPaths_1.symlinkPathsSync;


const symlinkType$1 = symlinkType_1.symlinkType;
const symlinkTypeSync$1 = symlinkType_1.symlinkTypeSync;

const pathExists$5 = pathExists_1.pathExists;

function createSymlink (srcpath, dstpath, type, callback) {
  callback = (typeof type === 'function') ? type : callback;
  type = (typeof type === 'function') ? false : type;

  pathExists$5(dstpath, (err, destinationExists) => {
    if (err) return callback(err)
    if (destinationExists) return callback(null)
    symlinkPaths$1(srcpath, dstpath, (err, relative) => {
      if (err) return callback(err)
      srcpath = relative.toDst;
      symlinkType$1(relative.toCwd, type, (err, type) => {
        if (err) return callback(err)
        const dir = path.dirname(dstpath);
        pathExists$5(dir, (err, dirExists) => {
          if (err) return callback(err)
          if (dirExists) return gracefulFs.symlink(srcpath, dstpath, type, callback)
          mkdirs$2(dir, err => {
            if (err) return callback(err)
            gracefulFs.symlink(srcpath, dstpath, type, callback);
          });
        });
      });
    });
  });
}

function createSymlinkSync (srcpath, dstpath, type) {
  const destinationExists = gracefulFs.existsSync(dstpath);
  if (destinationExists) return undefined

  const relative = symlinkPathsSync$1(srcpath, dstpath);
  srcpath = relative.toDst;
  type = symlinkTypeSync$1(relative.toCwd, type);
  const dir = path.dirname(dstpath);
  const exists = gracefulFs.existsSync(dir);
  if (exists) return gracefulFs.symlinkSync(srcpath, dstpath, type)
  mkdirsSync$1(dir);
  return gracefulFs.symlinkSync(srcpath, dstpath, type)
}

var symlink = {
  createSymlink: u$7(createSymlink),
  createSymlinkSync
};

var ensure = {
  // file
  createFile: file.createFile,
  createFileSync: file.createFileSync,
  ensureFile: file.createFile,
  ensureFileSync: file.createFileSync,
  // link
  createLink: link.createLink,
  createLinkSync: link.createLinkSync,
  ensureLink: link.createLink,
  ensureLinkSync: link.createLinkSync,
  // symlink
  createSymlink: symlink.createSymlink,
  createSymlinkSync: symlink.createSymlinkSync,
  ensureSymlink: symlink.createSymlink,
  ensureSymlinkSync: symlink.createSymlinkSync
};

var _fs;
try {
  _fs = gracefulFs;
} catch (_) {
  _fs = fs;
}

function readFile (file, options, callback) {
  if (callback == null) {
    callback = options;
    options = {};
  }

  if (typeof options === 'string') {
    options = {encoding: options};
  }

  options = options || {};
  var fs = options.fs || _fs;

  var shouldThrow = true;
  if ('throws' in options) {
    shouldThrow = options.throws;
  }

  fs.readFile(file, options, function (err, data) {
    if (err) return callback(err)

    data = stripBom(data);

    var obj;
    try {
      obj = JSON.parse(data, options ? options.reviver : null);
    } catch (err2) {
      if (shouldThrow) {
        err2.message = file + ': ' + err2.message;
        return callback(err2)
      } else {
        return callback(null, null)
      }
    }

    callback(null, obj);
  });
}

function readFileSync (file, options) {
  options = options || {};
  if (typeof options === 'string') {
    options = {encoding: options};
  }

  var fs = options.fs || _fs;

  var shouldThrow = true;
  if ('throws' in options) {
    shouldThrow = options.throws;
  }

  try {
    var content = fs.readFileSync(file, options);
    content = stripBom(content);
    return JSON.parse(content, options.reviver)
  } catch (err) {
    if (shouldThrow) {
      err.message = file + ': ' + err.message;
      throw err
    } else {
      return null
    }
  }
}

function stringify (obj, options) {
  var spaces;
  var EOL = '\n';
  if (typeof options === 'object' && options !== null) {
    if (options.spaces) {
      spaces = options.spaces;
    }
    if (options.EOL) {
      EOL = options.EOL;
    }
  }

  var str = JSON.stringify(obj, options ? options.replacer : null, spaces);

  return str.replace(/\n/g, EOL) + EOL
}

function writeFile (file, obj, options, callback) {
  if (callback == null) {
    callback = options;
    options = {};
  }
  options = options || {};
  var fs = options.fs || _fs;

  var str = '';
  try {
    str = stringify(obj, options);
  } catch (err) {
    // Need to return whether a callback was passed or not
    if (callback) callback(err, null);
    return
  }

  fs.writeFile(file, str, options, callback);
}

function writeFileSync (file, obj, options) {
  options = options || {};
  var fs = options.fs || _fs;

  var str = stringify(obj, options);
  // not sure if fs.writeFileSync returns anything, but just in case
  return fs.writeFileSync(file, str, options)
}

function stripBom (content) {
  // we do this because JSON.parse would convert it to a utf8 string if encoding wasn't specified
  if (Buffer.isBuffer(content)) content = content.toString('utf8');
  content = content.replace(/^\uFEFF/, '');
  return content
}

var jsonfile = {
  readFile: readFile,
  readFileSync: readFileSync,
  writeFile: writeFile,
  writeFileSync: writeFileSync
};

var jsonfile_1 = jsonfile;

const u$8 = universalify.fromCallback;


var jsonfile$1 = {
  // jsonfile exports
  readJson: u$8(jsonfile_1.readFile),
  readJsonSync: jsonfile_1.readFileSync,
  writeJson: u$8(jsonfile_1.writeFile),
  writeJsonSync: jsonfile_1.writeFileSync
};

const pathExists$6 = pathExists_1.pathExists;


function outputJson (file, data, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  const dir = path.dirname(file);

  pathExists$6(dir, (err, itDoes) => {
    if (err) return callback(err)
    if (itDoes) return jsonfile$1.writeJson(file, data, options, callback)

    mkdirs_1$1.mkdirs(dir, err => {
      if (err) return callback(err)
      jsonfile$1.writeJson(file, data, options, callback);
    });
  });
}

var outputJson_1 = outputJson;

function outputJsonSync (file, data, options) {
  const dir = path.dirname(file);

  if (!gracefulFs.existsSync(dir)) {
    mkdirs_1$1.mkdirsSync(dir);
  }

  jsonfile$1.writeJsonSync(file, data, options);
}

var outputJsonSync_1 = outputJsonSync;

const u$9 = universalify.fromCallback;


jsonfile$1.outputJson = u$9(outputJson_1);
jsonfile$1.outputJsonSync = outputJsonSync_1;
// aliases
jsonfile$1.outputJSON = jsonfile$1.outputJson;
jsonfile$1.outputJSONSync = jsonfile$1.outputJsonSync;
jsonfile$1.writeJSON = jsonfile$1.writeJson;
jsonfile$1.writeJSONSync = jsonfile$1.writeJsonSync;
jsonfile$1.readJSON = jsonfile$1.readJson;
jsonfile$1.readJSONSync = jsonfile$1.readJsonSync;

var json = jsonfile$1;

const copySync$2 = copySync$1.copySync;
const removeSync = remove.removeSync;
const mkdirpSync$1 = mkdirs_1$1.mkdirpSync;


function moveSync (src, dest, opts) {
  opts = opts || {};
  const overwrite = opts.overwrite || opts.clobber || false;

  const { srcStat } = stat.checkPathsSync(src, dest, 'move');
  stat.checkParentPathsSync(src, srcStat, dest, 'move');
  mkdirpSync$1(path.dirname(dest));
  return doRename(src, dest, overwrite)
}

function doRename (src, dest, overwrite) {
  if (overwrite) {
    removeSync(dest);
    return rename(src, dest, overwrite)
  }
  if (gracefulFs.existsSync(dest)) throw new Error('dest already exists.')
  return rename(src, dest, overwrite)
}

function rename (src, dest, overwrite) {
  try {
    gracefulFs.renameSync(src, dest);
  } catch (err) {
    if (err.code !== 'EXDEV') throw err
    return moveAcrossDevice(src, dest, overwrite)
  }
}

function moveAcrossDevice (src, dest, overwrite) {
  const opts = {
    overwrite,
    errorOnExist: true
  };
  copySync$2(src, dest, opts);
  return removeSync(src)
}

var moveSync_1 = moveSync;

var moveSync$1 = {
  moveSync: moveSync_1
};

const copy$2 = copy$1.copy;
const remove$1 = remove.remove;
const mkdirp$1 = mkdirs_1$1.mkdirp;
const pathExists$7 = pathExists_1.pathExists;


function move (src, dest, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }

  const overwrite = opts.overwrite || opts.clobber || false;

  stat.checkPaths(src, dest, 'move', (err, stats) => {
    if (err) return cb(err)
    const { srcStat } = stats;
    stat.checkParentPaths(src, srcStat, dest, 'move', err => {
      if (err) return cb(err)
      mkdirp$1(path.dirname(dest), err => {
        if (err) return cb(err)
        return doRename$1(src, dest, overwrite, cb)
      });
    });
  });
}

function doRename$1 (src, dest, overwrite, cb) {
  if (overwrite) {
    return remove$1(dest, err => {
      if (err) return cb(err)
      return rename$1(src, dest, overwrite, cb)
    })
  }
  pathExists$7(dest, (err, destExists) => {
    if (err) return cb(err)
    if (destExists) return cb(new Error('dest already exists.'))
    return rename$1(src, dest, overwrite, cb)
  });
}

function rename$1 (src, dest, overwrite, cb) {
  gracefulFs.rename(src, dest, err => {
    if (!err) return cb()
    if (err.code !== 'EXDEV') return cb(err)
    return moveAcrossDevice$1(src, dest, overwrite, cb)
  });
}

function moveAcrossDevice$1 (src, dest, overwrite, cb) {
  const opts = {
    overwrite,
    errorOnExist: true
  };
  copy$2(src, dest, opts, err => {
    if (err) return cb(err)
    return remove$1(src, cb)
  });
}

var move_1 = move;

const u$a = universalify.fromCallback;
var move$1 = {
  move: u$a(move_1)
};

const u$b = universalify.fromCallback;



const pathExists$8 = pathExists_1.pathExists;

function outputFile (file, data, encoding, callback) {
  if (typeof encoding === 'function') {
    callback = encoding;
    encoding = 'utf8';
  }

  const dir = path.dirname(file);
  pathExists$8(dir, (err, itDoes) => {
    if (err) return callback(err)
    if (itDoes) return gracefulFs.writeFile(file, data, encoding, callback)

    mkdirs_1$1.mkdirs(dir, err => {
      if (err) return callback(err)

      gracefulFs.writeFile(file, data, encoding, callback);
    });
  });
}

function outputFileSync (file, ...args) {
  const dir = path.dirname(file);
  if (gracefulFs.existsSync(dir)) {
    return gracefulFs.writeFileSync(file, ...args)
  }
  mkdirs_1$1.mkdirsSync(dir);
  gracefulFs.writeFileSync(file, ...args);
}

var output = {
  outputFile: u$b(outputFile),
  outputFileSync
};

var lib = createCommonjsModule(function (module) {

module.exports = Object.assign(
  {},
  // Export promiseified graceful-fs:
  fs_1,
  // Export extra methods:
  copySync$1,
  copy$1,
  empty,
  ensure,
  json,
  mkdirs_1$1,
  moveSync$1,
  move$1,
  output,
  pathExists_1,
  remove
);

// Export fs.promises as a getter property so that we don't trigger
// ExperimentalWarning before fs.promises is actually accessed.

if (Object.getOwnPropertyDescriptor(fs, 'promises')) {
  Object.defineProperty(module.exports, 'promises', {
    get () { return fs.promises }
  });
}
});

/*
usage:

// do something to a list of things
asyncMap(myListOfStuff, function (thing, cb) { doSomething(thing.foo, cb) }, cb)
// do more than one thing to each item
asyncMap(list, fooFn, barFn, cb)

*/

var asyncMap_1 = asyncMap;

function asyncMap () {
  var steps = Array.prototype.slice.call(arguments)
    , list = steps.shift() || []
    , cb_ = steps.pop();
  if (typeof cb_ !== "function") throw new Error(
    "No callback provided to asyncMap")
  if (!list) return cb_(null, [])
  if (!Array.isArray(list)) list = [list];
  var n = steps.length
    , data = [] // 2d array
    , errState = null
    , l = list.length
    , a = l * n;
  if (!a) return cb_(null, [])
  function cb (er) {
    if (er && !errState) errState = er;

    var argLen = arguments.length;
    for (var i = 1; i < argLen; i ++) if (arguments[i] !== undefined) {
      data[i - 1] = (data[i - 1] || []).concat(arguments[i]);
    }
    // see if any new things have been added.
    if (list.length > l) {
      var newList = list.slice(l);
      a += (list.length - l) * n;
      l = list.length;
      process.nextTick(function () {
        newList.forEach(function (ar) {
          steps.forEach(function (fn) { fn(ar, cb); });
        });
      });
    }

    if (--a === 0) cb_.apply(null, [errState].concat(data));
  }
  // expect the supplied cb function to be called
  // "n" times for each thing in the array.
  list.forEach(function (ar) {
    steps.forEach(function (fn) { fn(ar, cb); });
  });
}

var bindActor_1 = bindActor;
function bindActor () {
  var args = 
        Array.prototype.slice.call
        (arguments) // jswtf.
    , obj = null
    , fn;
  if (typeof args[0] === "object") {
    obj = args.shift();
    fn = args.shift();
    if (typeof fn === "string")
      fn = obj[ fn ];
  } else fn = args.shift();
  return function (cb) {
    fn.apply(obj, args.concat(cb)); }
}

var chain_1 = chain;

chain.first = {} ; chain.last = {};
function chain (things, cb) {
  var res = []
  ;(function LOOP (i, len) {
    if (i >= len) return cb(null,res)
    if (Array.isArray(things[i]))
      things[i] = bindActor_1.apply(null,
        things[i].map(function(i){
          return (i===chain.first) ? res[0]
           : (i===chain.last)
             ? res[res.length - 1] : i }));
    if (!things[i]) return LOOP(i + 1, len)
    things[i](function (er, data) {
      if (er) return cb(er, res)
      if (data !== undefined) res = res.concat(data);
      LOOP(i + 1, len);
    });
  })(0, things.length); }

var asyncMap$1 = asyncMap_1;
var bindActor$1 = bindActor_1;
var chain$1 = chain_1;

var slide = {
	asyncMap: asyncMap$1,
	bindActor: bindActor$1,
	chain: chain$1
};

var imurmurhash = createCommonjsModule(function (module) {
/**
 * @preserve
 * JS Implementation of incremental MurmurHash3 (r150) (as of May 10, 2013)
 *
 * @author <a href="mailto:jensyt@gmail.com">Jens Taylor</a>
 * @see http://github.com/homebrewing/brauhaus-diff
 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
 * @see http://github.com/garycourt/murmurhash-js
 * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
 * @see http://sites.google.com/site/murmurhash/
 */
(function(){
    var cache;

    // Call this function without `new` to use the cached object (good for
    // single-threaded environments), or with `new` to create a new object.
    //
    // @param {string} key A UTF-16 or ASCII string
    // @param {number} seed An optional positive integer
    // @return {object} A MurmurHash3 object for incremental hashing
    function MurmurHash3(key, seed) {
        var m = this instanceof MurmurHash3 ? this : cache;
        m.reset(seed);
        if (typeof key === 'string' && key.length > 0) {
            m.hash(key);
        }

        if (m !== this) {
            return m;
        }
    }
    // Incrementally add a string to this hash
    //
    // @param {string} key A UTF-16 or ASCII string
    // @return {object} this
    MurmurHash3.prototype.hash = function(key) {
        var h1, k1, i, top, len;

        len = key.length;
        this.len += len;

        k1 = this.k1;
        i = 0;
        switch (this.rem) {
            case 0: k1 ^= len > i ? (key.charCodeAt(i++) & 0xffff) : 0;
            case 1: k1 ^= len > i ? (key.charCodeAt(i++) & 0xffff) << 8 : 0;
            case 2: k1 ^= len > i ? (key.charCodeAt(i++) & 0xffff) << 16 : 0;
            case 3:
                k1 ^= len > i ? (key.charCodeAt(i) & 0xff) << 24 : 0;
                k1 ^= len > i ? (key.charCodeAt(i++) & 0xff00) >> 8 : 0;
        }

        this.rem = (len + this.rem) & 3; // & 3 is same as % 4
        len -= this.rem;
        if (len > 0) {
            h1 = this.h1;
            while (1) {
                k1 = (k1 * 0x2d51 + (k1 & 0xffff) * 0xcc9e0000) & 0xffffffff;
                k1 = (k1 << 15) | (k1 >>> 17);
                k1 = (k1 * 0x3593 + (k1 & 0xffff) * 0x1b870000) & 0xffffffff;

                h1 ^= k1;
                h1 = (h1 << 13) | (h1 >>> 19);
                h1 = (h1 * 5 + 0xe6546b64) & 0xffffffff;

                if (i >= len) {
                    break;
                }

                k1 = ((key.charCodeAt(i++) & 0xffff)) ^
                     ((key.charCodeAt(i++) & 0xffff) << 8) ^
                     ((key.charCodeAt(i++) & 0xffff) << 16);
                top = key.charCodeAt(i++);
                k1 ^= ((top & 0xff) << 24) ^
                      ((top & 0xff00) >> 8);
            }

            k1 = 0;
            switch (this.rem) {
                case 3: k1 ^= (key.charCodeAt(i + 2) & 0xffff) << 16;
                case 2: k1 ^= (key.charCodeAt(i + 1) & 0xffff) << 8;
                case 1: k1 ^= (key.charCodeAt(i) & 0xffff);
            }

            this.h1 = h1;
        }

        this.k1 = k1;
        return this;
    };

    // Get the result of this hash
    //
    // @return {number} The 32-bit hash
    MurmurHash3.prototype.result = function() {
        var k1, h1;
        
        k1 = this.k1;
        h1 = this.h1;

        if (k1 > 0) {
            k1 = (k1 * 0x2d51 + (k1 & 0xffff) * 0xcc9e0000) & 0xffffffff;
            k1 = (k1 << 15) | (k1 >>> 17);
            k1 = (k1 * 0x3593 + (k1 & 0xffff) * 0x1b870000) & 0xffffffff;
            h1 ^= k1;
        }

        h1 ^= this.len;

        h1 ^= h1 >>> 16;
        h1 = (h1 * 0xca6b + (h1 & 0xffff) * 0x85eb0000) & 0xffffffff;
        h1 ^= h1 >>> 13;
        h1 = (h1 * 0xae35 + (h1 & 0xffff) * 0xc2b20000) & 0xffffffff;
        h1 ^= h1 >>> 16;

        return h1 >>> 0;
    };

    // Reset the hash object for reuse
    //
    // @param {number} seed An optional positive integer
    MurmurHash3.prototype.reset = function(seed) {
        this.h1 = typeof seed === 'number' ? seed : 0;
        this.rem = this.k1 = this.len = 0;
        return this;
    };

    // A cached object to use. This can be safely used if you're in a single-
    // threaded environment, otherwise you need to create new hashes to use.
    cache = new MurmurHash3();

    {
        module.exports = MurmurHash3;
    }
}());
});

var writeFileAtomic = writeFile$1;
var sync$2 = writeFileSync$1;
var _getTmpname = getTmpname; // for testing


var chain$2 = slide.chain;

var extend = Object.assign || util._extend;

var invocations = 0;
function getTmpname (filename) {
  return filename + '.' +
    imurmurhash(__filename)
      .hash(String(process.pid))
      .hash(String(++invocations))
      .result()
}

function writeFile$1 (filename, data, options, callback) {
  if (options instanceof Function) {
    callback = options;
    options = null;
  }
  if (!options) options = {};
  gracefulFs.realpath(filename, function (_, realname) {
    _writeFile(realname || filename, data, options, callback);
  });
}
function _writeFile (filename, data, options, callback) {
  var tmpfile = getTmpname(filename);

  if (options.mode && options.chown) {
    return thenWriteFile()
  } else {
    // Either mode or chown is not explicitly set
    // Default behavior is to copy it from original file
    return gracefulFs.stat(filename, function (err, stats) {
      if (err || !stats) return thenWriteFile()

      options = extend({}, options);
      if (!options.mode) {
        options.mode = stats.mode;
      }
      if (!options.chown && process.getuid) {
        options.chown = { uid: stats.uid, gid: stats.gid };
      }
      return thenWriteFile()
    })
  }

  function thenWriteFile () {
    chain$2([
      [gracefulFs, gracefulFs.writeFile, tmpfile, data, options.encoding || 'utf8'],
      options.mode && [gracefulFs, gracefulFs.chmod, tmpfile, options.mode],
      options.chown && [gracefulFs, gracefulFs.chown, tmpfile, options.chown.uid, options.chown.gid],
      [gracefulFs, gracefulFs.rename, tmpfile, filename]
    ], function (err) {
      err ? gracefulFs.unlink(tmpfile, function () { callback(err); })
        : callback();
    });
  }
}

function writeFileSync$1 (filename, data, options) {
  if (!options) options = {};
  try {
    filename = gracefulFs.realpathSync(filename);
  } catch (ex) {
    // it's ok, it'll happen on a not yet existing file
  }
  var tmpfile = getTmpname(filename);

  try {
    if (!options.mode || !options.chown) {
      // Either mode or chown is not explicitly set
      // Default behavior is to copy it from original file
      try {
        var stats = gracefulFs.statSync(filename);
        options = extend({}, options);
        if (!options.mode) {
          options.mode = stats.mode;
        }
        if (!options.chown && process.getuid) {
          options.chown = { uid: stats.uid, gid: stats.gid };
        }
      } catch (ex) {
        // ignore stat errors
      }
    }

    gracefulFs.writeFileSync(tmpfile, data, options.encoding || 'utf8');
    if (options.chown) gracefulFs.chownSync(tmpfile, options.chown.uid, options.chown.gid);
    if (options.mode) gracefulFs.chmodSync(tmpfile, options.mode);
    gracefulFs.renameSync(tmpfile, filename);
  } catch (err) {
    try { gracefulFs.unlinkSync(tmpfile); } catch (e) {}
    throw err
  }
}
writeFileAtomic.sync = sync$2;
writeFileAtomic._getTmpname = _getTmpname;

function RetryOperation(timeouts, options) {
  // Compatibility for the old (timeouts, retryForever) signature
  if (typeof options === 'boolean') {
    options = { forever: options };
  }

  this._originalTimeouts = JSON.parse(JSON.stringify(timeouts));
  this._timeouts = timeouts;
  this._options = options || {};
  this._maxRetryTime = options && options.maxRetryTime || Infinity;
  this._fn = null;
  this._errors = [];
  this._attempts = 1;
  this._operationTimeout = null;
  this._operationTimeoutCb = null;
  this._timeout = null;
  this._operationStart = null;

  if (this._options.forever) {
    this._cachedTimeouts = this._timeouts.slice(0);
  }
}
var retry_operation = RetryOperation;

RetryOperation.prototype.reset = function() {
  this._attempts = 1;
  this._timeouts = this._originalTimeouts;
};

RetryOperation.prototype.stop = function() {
  if (this._timeout) {
    clearTimeout(this._timeout);
  }

  this._timeouts       = [];
  this._cachedTimeouts = null;
};

RetryOperation.prototype.retry = function(err) {
  if (this._timeout) {
    clearTimeout(this._timeout);
  }

  if (!err) {
    return false;
  }
  var currentTime = new Date().getTime();
  if (err && currentTime - this._operationStart >= this._maxRetryTime) {
    this._errors.unshift(new Error('RetryOperation timeout occurred'));
    return false;
  }

  this._errors.push(err);

  var timeout = this._timeouts.shift();
  if (timeout === undefined) {
    if (this._cachedTimeouts) {
      // retry forever, only keep last error
      this._errors.splice(this._errors.length - 1, this._errors.length);
      this._timeouts = this._cachedTimeouts.slice(0);
      timeout = this._timeouts.shift();
    } else {
      return false;
    }
  }

  var self = this;
  var timer = setTimeout(function() {
    self._attempts++;

    if (self._operationTimeoutCb) {
      self._timeout = setTimeout(function() {
        self._operationTimeoutCb(self._attempts);
      }, self._operationTimeout);

      if (self._options.unref) {
          self._timeout.unref();
      }
    }

    self._fn(self._attempts);
  }, timeout);

  if (this._options.unref) {
      timer.unref();
  }

  return true;
};

RetryOperation.prototype.attempt = function(fn, timeoutOps) {
  this._fn = fn;

  if (timeoutOps) {
    if (timeoutOps.timeout) {
      this._operationTimeout = timeoutOps.timeout;
    }
    if (timeoutOps.cb) {
      this._operationTimeoutCb = timeoutOps.cb;
    }
  }

  var self = this;
  if (this._operationTimeoutCb) {
    this._timeout = setTimeout(function() {
      self._operationTimeoutCb();
    }, self._operationTimeout);
  }

  this._operationStart = new Date().getTime();

  this._fn(this._attempts);
};

RetryOperation.prototype.try = function(fn) {
  console.log('Using RetryOperation.try() is deprecated');
  this.attempt(fn);
};

RetryOperation.prototype.start = function(fn) {
  console.log('Using RetryOperation.start() is deprecated');
  this.attempt(fn);
};

RetryOperation.prototype.start = RetryOperation.prototype.try;

RetryOperation.prototype.errors = function() {
  return this._errors;
};

RetryOperation.prototype.attempts = function() {
  return this._attempts;
};

RetryOperation.prototype.mainError = function() {
  if (this._errors.length === 0) {
    return null;
  }

  var counts = {};
  var mainError = null;
  var mainErrorCount = 0;

  for (var i = 0; i < this._errors.length; i++) {
    var error = this._errors[i];
    var message = error.message;
    var count = (counts[message] || 0) + 1;

    counts[message] = count;

    if (count >= mainErrorCount) {
      mainError = error;
      mainErrorCount = count;
    }
  }

  return mainError;
};

var retry = createCommonjsModule(function (module, exports) {
exports.operation = function(options) {
  var timeouts = exports.timeouts(options);
  return new retry_operation(timeouts, {
      forever: options && options.forever,
      unref: options && options.unref,
      maxRetryTime: options && options.maxRetryTime
  });
};

exports.timeouts = function(options) {
  if (options instanceof Array) {
    return [].concat(options);
  }

  var opts = {
    retries: 10,
    factor: 2,
    minTimeout: 1 * 1000,
    maxTimeout: Infinity,
    randomize: false
  };
  for (var key in options) {
    opts[key] = options[key];
  }

  if (opts.minTimeout > opts.maxTimeout) {
    throw new Error('minTimeout is greater than maxTimeout');
  }

  var timeouts = [];
  for (var i = 0; i < opts.retries; i++) {
    timeouts.push(this.createTimeout(i, opts));
  }

  if (options && options.forever && !timeouts.length) {
    timeouts.push(this.createTimeout(i, opts));
  }

  // sort the array numerically ascending
  timeouts.sort(function(a,b) {
    return a - b;
  });

  return timeouts;
};

exports.createTimeout = function(attempt, opts) {
  var random = (opts.randomize)
    ? (Math.random() + 1)
    : 1;

  var timeout = Math.round(random * opts.minTimeout * Math.pow(opts.factor, attempt));
  timeout = Math.min(timeout, opts.maxTimeout);

  return timeout;
};

exports.wrap = function(obj, options, methods) {
  if (options instanceof Array) {
    methods = options;
    options = null;
  }

  if (!methods) {
    methods = [];
    for (var key in obj) {
      if (typeof obj[key] === 'function') {
        methods.push(key);
      }
    }
  }

  for (var i = 0; i < methods.length; i++) {
    var method   = methods[i];
    var original = obj[method];

    obj[method] = function retryWrapper(original) {
      var op       = exports.operation(options);
      var args     = Array.prototype.slice.call(arguments, 1);
      var callback = args.pop();

      args.push(function(err) {
        if (op.retry(err)) {
          return;
        }
        if (err) {
          arguments[0] = op.mainError();
        }
        callback.apply(this, arguments);
      });

      op.attempt(function() {
        original.apply(obj, args);
      });
    }.bind(obj, original);
    obj[method].options = options;
  }
};
});
var retry_1 = retry.operation;
var retry_2 = retry.timeouts;
var retry_3 = retry.createTimeout;
var retry_4 = retry.wrap;

var retry$1 = retry;

/**
 * 构造器，传入限流值，设置异步调用最大并发数
 * Examples:
 * ```
 * var bagpipe = new Bagpipe(100);
 * bagpipe.push(fs.readFile, 'path', 'utf-8', function (err, data) {
 *   // TODO
 * });
 * ```
 * Events:
 * - `full`, 当活动异步达到限制值时，后续异步调用将被暂存于队列中。当队列的长度大于限制值的2倍或100的时候时候，触发`full`事件。事件传递队列长度值。
 * - `outdated`, 超时后的异步调用异常返回。
 * Options:
 * - `disabled`, 禁用限流，测试时用
 * - `refuse`, 拒绝模式，排队超过限制值时，新来的调用将会得到`TooMuchAsyncCallError`异常
 * - `timeout`, 设置异步调用的时间上线，保证异步调用能够恒定的结束，不至于花费太长时间
 * @param {Number} limit 并发数限制值
 * @param {Object} options Options
 */
var Bagpipe = function (limit, options) {
  events.EventEmitter.call(this);
  this.limit = limit;
  this.active = 0;
  this.queue = [];
  this.options = {
    disabled: false,
    refuse: false,
    ratio: 1,
    timeout: null
  };
  if (typeof options === 'boolean') {
    options = {
      disabled: options
    };
  }
  options = options || {};
  for (var key in this.options) {
    if (options.hasOwnProperty(key)) {
      this.options[key] = options[key];
    }
  }
  // queue length
  this.queueLength = Math.round(this.limit * (this.options.ratio || 1));
};
util.inherits(Bagpipe, events.EventEmitter);

/**
 * 推入方法，参数。最后一个参数为回调函数
 * @param {Function} method 异步方法
 * @param {Mix} args 参数列表，最后一个参数为回调函数。
 */
Bagpipe.prototype.push = function (method) {
  var args = [].slice.call(arguments, 1);
  var callback = args[args.length - 1];
  if (typeof callback !== 'function') {
    args.push(function () {});
  }
  if (this.options.disabled || this.limit < 1) {
    method.apply(null, args);
    return this;
  }

  // 队列长度也超过限制值时
  if (this.queue.length < this.queueLength || !this.options.refuse) {
    this.queue.push({
      method: method,
      args: args
    });
  } else {
    var err = new Error('Too much async call in queue');
    err.name = 'TooMuchAsyncCallError';
    callback(err);
  }

  if (this.queue.length > 1) {
    this.emit('full', this.queue.length);
  }

  this.next();
  return this;
};

/*!
 * 继续执行队列中的后续动作
 */
Bagpipe.prototype.next = function () {
  var that = this;
  if (that.active < that.limit && that.queue.length) {
    var req = that.queue.shift();
    that.run(req.method, req.args);
  }
};

Bagpipe.prototype._next = function () {
  this.active--;
  this.next();
};

/*!
 * 执行队列中的方法
 */
Bagpipe.prototype.run = function (method, args) {
  var that = this;
  that.active++;
  var callback = args[args.length - 1];
  var timer = null;
  var called = false;

  // inject logic
  args[args.length - 1] = function (err) {
    // anyway, clear the timer
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    // if timeout, don't execute
    if (!called) {
      that._next();
      callback.apply(null, arguments);
    } else {
      // pass the outdated error
      if (err) {
        that.emit('outdated', err);
      }
    }
  };

  var timeout = that.options.timeout;
  if (timeout) {
    timer = setTimeout(function () {
      // set called as true
      called = true;
      that._next();
      // pass the exception
      var err = new Error(timeout + 'ms timeout');
      err.name = 'BagpipeTimeoutError';
      err.data = {
        name: method.name,
        method: method.toString(),
        args: args.slice(0, -1)
      };
      callback(err);
    }, timeout);
  }
  method.apply(null, args);
};

var bagpipe = Bagpipe;

var bagpipe$1 = bagpipe;

/*
object-assign
(c) Sindre Sorhus
@license MIT
*/
/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

class Kruptein {

  /**
   * Kruptein class constructor; sets private / public defaults
   * @param {object} options User supplied key / value object
   */
  constructor(options) {
    options = options || {};

    this.crypto = crypto;

    // Set defaults if the user didn't supply any
    //   References: SP 800-38A, 800-38B
    this.algorithm = options.algorithm || "aes-256-gcm";
    this.hashing = options.hashing || "sha512";
    this.encodeas = options.encodeas || "binary";
    this.debug = options.debug || false;

    // Are we using AEAD mode (authenticated ciphers)?
    //   References: SP 800-38A, 800-38B
    this._aead_mode = this.algorithm.match(/ccm|gcm|ocb/) ? true : false;

    // Set some defaults based on the algorithm used
    //   References: SP 800-38A, 800-38B, 800-107, 800-131A
    let defaults = this._matrix(this.algorithm);
    this._at_size = options._at_size || defaults._at_size;
    this._iv_size = options._iv_size || defaults._iv_size;
    this._key_size = options._key_size || defaults._key_size;

    // Replace pbkdf2 with scrypt for key derivation?
    //   References: SP 800-108 & 800-132
    this._use_scrypt = options.use_scrypt || false;
  }


  /**
   * Public interface for creating ciphertext from plaintext
   * @param {string} secret User supplied key material
   * @param {string} plaintext User supplied plaintext
   * @param {string} aad (optional) User supplied additional authentication data
   * @param {function} cb User supplied callback function
   * @returns {object}
   */
  set(secret, plaintext, aad, cb) {
    // If non-aead cipher then expect 3 vs. 4 args
    cb = cb || aad;

    // Initialize some defaults
    let iv, ct, hmac, obj, key;

    // Bail if using weak cipher algorithm modes
    //   References: SP 800-38A, 800-38B, 800-131A & 800-175B
    if (this._validator())
      return cb("Insecure cipher mode not supported!");

    // Bail if secret is not provided
    if (!secret)
      return cb("Must supply a secret!");

    // Derive a stronger key from secret;
    //   References: SP 800-57P1, 800-108, 800-132 & 800-175B
    this._derive_key(secret, (err, secret) => {
      if (err)
        return cb("Unable to derive key!");

      key = secret;
    });

    // Generate a random IV based on the algorithms IV size
    //   References: RFC 4086, SP 800-57P1, 800-132 & 800-175B
    iv = this._iv(this._iv_size);

    // If AEAD mode cipher used and an AAD not provided, create one
    //   References: SP 800-38A, 800-38B, 800-131A & 800-175B
    if (this._aead_mode && typeof aad === "function") {
      this._digest(iv + key.key, JSON.stringify(plaintext), this.hashing, this.encodeas, (err, res) => {
        if (err)
          return cb("Unable to generate AAD!");

        aad = res;
      });
    }

    // Create ciphertext from plaintext with derived key
    //   References: SP 800-38A, 800-38B, 800-131A, 800-175B, FIPS 197 & 198-1
    this._encrypt(key.key, JSON.stringify(plaintext), this.algorithm, this.encodeas, iv, aad, (err, ciphertext) => {
      if (err)
        return cb("Unable to create ciphertext!");

      ct = ciphertext;
    });

    // Create an HMAC from the resulting ciphertext
    //   References: FIPS 180-4, FIPS 198-1
    this._digest(key.key, ct.ct, this.hashing, this.encodeas, (err, digest) => {
      if (err)
        return cb("Unable to create digest!");

      hmac = digest;
    });

    // Create an object to pass back
    obj = {
      hmac: hmac,
      ct: ct.ct,
      iv: iv,
      salt: key.salt
    };

    // If AEAD mode include the AAD
    if (aad)
      obj.aad = aad;

    // If AEAD mode include the AT
    if (ct.at)
      obj.at = ct.at;

    return cb(null, JSON.stringify(obj));
  }


  /**
   * Public interface for decrypting plaintext
   * @param {string} secret User supplied key material
   * @param {string} ciphertext User supplied ciphertext
   * @param {object} opts (optional) User supplied AEAD mode data
   * @param {function} cb User supplied callback function
   * @returns {object}
   */
  get(secret, ciphertext, opts, cb) {
    // If non-aead cipher then expect 3 vs. 4 args
    cb = cb || opts;

    // Initialize some defaults
    let ct, hmac, pt, key;

    // Bail if using weak cipher algorithm modes
    //   References: SP 800-38A, 800-38B, 800-131A & 800-175B
    if (this._validator())
      return cb("Insecure cipher mode not supported!");

    // Bail if secret is not provided
    if (!secret)
      return cb("Must supply a secret!");

    // Parse the provided ciphertext object or bail
    try {
      ct = JSON.parse(ciphertext);
    } catch (err) {
      return cb("Unable to parse ciphertext object!");
    }

    // Derive a stronger key from secret;
    //   References: SP 800-57P1, 800-108, 800-132 & 800-175B
    this._derive_key(secret, ct.salt, (err, secret) => {
      if (err)
        return cb("Unable to derive key!");

      key = secret;
    });

    // Create an HMAC from the ciphertext HMAC value
    //   References: FIPS 180-4, FIPS 198-1
    this._digest(key.key, ct.ct, this.hashing, this.encodeas, (err, res) => {
      if (err)
        cb("Unable to generate HMAC!");

      hmac = res;
    });

    // Compare computed from included & bail if not identical
    //   References: Oracle padding attack, side channel attacks & malleable
    if (hmac !== ct.hmac)
      return cb("Encrypted session was tampered with!");

    // If provided get the AAD &/or AT values
    if (opts) {
      ct.aad = (opts.aad) ? opts.aad :
        (ct.aad) ? ct.aad : false;

      ct.at = (opts.at && !ct.at) ?
        opts.at : (ct.at) ?
        ct.at : false;
    }

    // Convert the AT to a buffers
    if (ct.at)
      ct.at = Buffer.from(ct.at, this.encodeas);

    // Create plaintext from ciphertext with derived key
    //   References: SP 800-38A, 800-38B, 800-131A, 800-175B, FIPS 197 & 198-1
    this._decrypt(key.key, ct.ct, this.algorithm, this.encodeas, Buffer.from(ct.iv, this.encodeas), ct.at, ct.aad, (err, res) => {
      if (err)
        return cb("Unable to decrypt ciphertext!");

      pt = res;
    });

    return cb(null, pt);
  }


  /**
   * Private function to encrypt plaintext
   * @param {buffer} key Derived key material
   * @param {string} pt User supplied plaintext
   * @param {string} algo Cipher to encrypt with
   * @param {string} encodeas Encoding output format
   * @param {buffer} iv Unique IV
   * @param {string} aad (optional) AAD for AEAD mode ciphers
   * @param {function} cb User supplied callback function
   * @returns {object}
   */
  _encrypt(key, pt, algo, encodeas, iv, aad, cb) {
    // If non-aead cipher then expect 6 vs. 7 args
    cb = cb || aad;

    // Initialize some defaults
    let cipher, ct, at;

    // Create a new cipher object using algorithm, derived key & iv
    //   References: SP 800-38A, 800-38B, 800-131A, 800-175B, FIPS 197 & 198-1
    cipher = this.crypto.createCipheriv(algo, key, iv, {
      authTagLength: this._at_size
    });

    // If an AEAD cipher is used & an AAD supplied, include it
    //   References: SP 800-38A, 800-38B, 800-131A, 800-175B, FIPS 197 & 198-1
    if (this._aead_mode && typeof aad !== "function") {
      try {
        cipher.setAAD(Buffer.from(aad, encodeas), {
          plaintextLength: Buffer.byteLength(pt)
        });
      } catch (err) {
        return cb("Unable to set AAD!");
      }
    }

    // Add our plaintext; encode & pad the resulting cipher text
    ct = cipher.update(Buffer.from(pt, this.encodeas), "utf8", encodeas);
    cipher.setAutoPadding(true);
    ct += cipher.final(encodeas);

    // If an AEAD cipher is used, retrieve the authentication tag
    //   References: SP 800-38A, 800-38B, 800-131A, 800-175B, FIPS 197 & 198-1
    if (this._aead_mode) {
      try {
        at = cipher.getAuthTag();
      } catch (err) {
        return cb("Unable to obtain authentication tag");
      }
    }

    // Return the object
    return cb(null, (at) ? { "ct": ct, "at": at } : { "ct": ct });
  }


  /**
   * Private function to decrypt ciphertext
   * @param {buffer} key Derived key material
   * @param {object} ct User supplied ciphertext object
   * @param {string} algo Cipher to encrypt with
   * @param {string} encodeas Encoding output format
   * @param {buffer} iv Unique IV
   * @param {string} at (optional) AT for AEAD mode ciphers
   * @param {string} aad (optional) AAD for AEAD mode ciphers
   * @param {function} cb User supplied callback function
   * @returns {object}
   */
  _decrypt(key, ct, algo, encodeas, iv, at, aad, cb) {
    // If non-aead cipher then expect 6 vs. 7 args
    cb = cb || aad;

    // Initialize some defaults
    let cipher, pt;

    // Create a new de-cipher object using algorithm, derived key & iv
    //   References: SP 800-38A, 800-38B, 800-131A, 800-175B, FIPS 197 & 198-1
    cipher = this.crypto.createDecipheriv(algo, key, iv, {
      authTagLength: this._at_size
    });

    // If an AEAD cipher is used & an AT supplied, include it
    //   References: SP 800-38A, 800-38B, 800-131A, 800-175B, FIPS 197 & 198-1
    if (this._aead_mode && at) {
      try {
        cipher.setAuthTag(Buffer.from(at, encodeas));
      } catch (err) {
        return cb("Unable to set authentication tag");
      }
    }

    // If an AEAD cipher is used & an AAD supplied, include it
    //   References: SP 800-38A, 800-38B, 800-131A, 800-175B, FIPS 197 & 198-1
    if (this._aead_mode && typeof aad !== "function") {
      try {
        cipher.setAAD(Buffer.from(aad, encodeas), {
          plaintextLength: ct.length
        });
      } catch (err) {
        return cb("Unable to set additional authentication data");
      }
    }

    // Add our ciphertext & encode
    try {
      pt = cipher.update(ct, encodeas, "utf8");
      pt += cipher.final("utf8");
    } catch(err) {
      return cb("Unable to decrypt ciphertext!");
    }

    // return the plaintext
    return cb(null, pt);
  }


  /**
   * Private function to derive a secret key
   * @param {string} secret User supplied key material
   * @param {buffer} salt Unique salt
   * @param {function} cb User supplied callback function
   * @returns {object}
   */
  _derive_key(secret, salt, cb) {
    // If salt not supplied then expect 2 vs. 3 args
    cb = cb || salt;

    // Initialize some defaults
    let key, opts = {};

    // If secret is an object then extract the parts; test harness only
    if (typeof secret === "object") {
      opts = secret.opts;
      secret = secret.secret;
    }

    // If a salt was NOT supplied, create one
    //   References: RFC 4086, 5084, SP 800-57P1, 800-108 & 800-132
    salt = (typeof salt !== "function") ?
      Buffer.from(salt) : this.crypto.randomBytes(128);

    // PBKDF2 or scrypt key derivation logic
    //   References: RFC 4086, 5084, SP 800-57P1, 800-108 & 800-132
    //   Compliance: If scrypt used does not conform to FIPS!
    try {
      if (!this._use_scrypt || typeof this.crypto.scryptSync !== "function") {
        key = this.crypto.pbkdf2Sync(secret, salt, 15000, this._key_size, this.hashing);
      } else {
        key = this.crypto.scryptSync(secret, salt, this._key_size, opts);
      }
    } catch (err) {
      return cb("Unable to derive key!");
    }

    // Return the derived key and salt
    return cb(null, {
      key: key,
      salt: salt
    });
  }


  /**
   * Private function to generate an HMAC
   * @param {string} key User supplied key material
   * @param {string} obj User supplied content to create HMAC from
   * @param {string} hashing Selected hashing algorithm
   * @param {string} encodeas Resulting encoding
   * @param {function} cb User supplied callback function
   * @returns {object}
   */
  _digest(key, obj, hashing, encodeas, cb) {

    // Initialize some defaults
    let hmac;

    // Create an HMAC from the supplied data
    //   References: SP 800-175B, FIPS 180-4 & FIPS 198-1
    try {
      hmac = this.crypto.createHmac(hashing, key);
      hmac.setEncoding(encodeas);
      hmac.write(obj);
      hmac.end();
    } catch (err) {
      return cb("Unable to generate digest!");
    }

    // Return digest
    return cb(null, hmac.read().toString(encodeas));
  }


  /**
   * Private function to generate a random value
   * @param {integer} iv_size The random buffer size
   * @returns {buffer}
   */
  _iv(iv_size) {
    return this.crypto.randomBytes(iv_size);
  }


  /**
   * Private function to generate object of algorithm key, iv & at sizes
   * @param {string} algo The cipher name
   * @returns {object}
   */
  _matrix(algo) {
    let obj = {
      _at_size: 16,
      _iv_size: 16,
      _key_size: 32
    };

    if (algo.match(/ccm|ocb|gcm/i))
      obj._iv_size = 12;

    if (algo.match(/aes/) && algo.match(/128/))
      obj._key_size = 16;

    if (algo.match(/aes/) && algo.match(/192/))
      obj._key_size = 24;

    if (algo.match(/aes/) && algo.match(/xts/))
      obj._key_size = 32;

    if (algo.match(/aes/) && algo.match(/xts/) && algo.match(/256/))
      obj._key_size = 64;

    return obj;
  }


  /**
   * Look for insecure modes
   * @returns {boolean}
   */
  _validator() {
    return (this.algorithm.match(/ccm|ecb/));
  }
}


/**
 * Robot, do work
 */
var kruptein = function(options) {
  return new Kruptein(options || {});
};

/*!
 * kruptein
 * Copyright(c) 2019 Jason Gerfen <jason.gerfen@gmail.com>
 * License: MIT
 */

var kruptein$1 = kruptein;

var isWindows$1 = process.platform === 'win32';

var helpers = {

  isSecret: function (secret) {
    return secret !== undefined && secret != null;
  },

  sessionPath: function (options, sessionId) {
    //return path.join(basepath, sessionId + '.json');
    return path.join(options.path, sessionId + options.fileExtension);
  },

  sessionId: function (options, file) {
    //return file.substring(0, file.lastIndexOf('.json'));
    if (options.fileExtension.length === 0) return file;
    var id = file.replace(options.filePattern, '');
    return id === file ? '' : id;
  },

  getLastAccess: function (session) {
    return session.__lastAccess;
  },

  setLastAccess: function (session) {
    session.__lastAccess = new Date().getTime();
  },

  escapeForRegExp: function (str) {
    return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
  },

  getFilePatternFromFileExtension: function (fileExtension) {
    return new RegExp(helpers.escapeForRegExp(fileExtension) + '$');
  },

  DEFAULTS: {
    path: './sessions',
    ttl: 3600,
    retries: 5,
    factor: 1,
    minTimeout: 50,
    maxTimeout: 100,
    reapInterval: 3600,
    reapMaxConcurrent: 10,
    reapAsync: false,
    reapSyncFallback: false,
    logFn: console.log || function () {
    },
    encoding: 'utf8',
    encoder: JSON.stringify,
    decoder: JSON.parse,
    encryptEncoding: 'hex',
    fileExtension: '.json',
    crypto: {
      algorithm: "aes-256-gcm",
      hashing: "sha512",
      use_scrypt: true
    },
    keyFunction: function (secret, sessionId) {
      return secret + sessionId;
    },
  },

  defaults: function (userOptions) {
    var options = objectAssign({}, helpers.DEFAULTS, userOptions);
    options.path = path.normalize(options.path);
    options.filePattern = helpers.getFilePatternFromFileExtension(options.fileExtension);

    if (helpers.isSecret(options.secret))
      options.kruptein = kruptein$1(options.crypto);

    return options;
  },

  destroyIfExpired: function (sessionId, options, callback) {
    helpers.expired(sessionId, options, function (err, expired) {
      if (err == null && expired) {
        helpers.destroy(sessionId, options, callback);
      } else if (callback) {
        err ? callback(err) : callback();
      }
    });
  },

  scheduleReap: function (options) {
    if (options.reapInterval !== -1) {
      options.reapIntervalObject = setInterval(function () {
        if (options.reapAsync) {
          options.logFn('[session-file-store] Starting reap worker thread');
          helpers.asyncReap(options);
        } else {
          options.logFn('[session-file-store] Deleting expired sessions');
          helpers.reap(options);
        }
      }, options.reapInterval * 1000).unref();
    }
  },

  asyncReap: function (options, callback) {
    callback || (callback = function () {
    });

    function execCallback(err) {
      if (err && options.reapSyncFallback) {
        helpers.reap(options, callback);
      } else {
        err ? callback(err) : callback();
      }
    }

    if (isWindows$1) {
      child_process.execFile('node', [path.join(__dirname, 'reap-worker.js'), options.path, options.ttl], execCallback);
    } else {
      child_process.execFile(path.join(__dirname, 'reap-worker.js'), [options.path, options.ttl], execCallback);
    }
  },

  reap: function (options, callback) {
    callback || (callback = function () {
    });
    helpers.list(options, function (err, files) {
      if (err) return callback(err);
      if (files.length === 0) return callback();

      var bagpipe = new bagpipe$1(options.reapMaxConcurrent);

      var errors = [];
      files.forEach(function (file, i) {
        bagpipe.push(helpers.destroyIfExpired,
          helpers.sessionId(options, file),
          options,
          function (err) {
            if (err) {
              errors.push(err);
            }
            if (i >= files.length - 1) {
              errors.length > 0 ? callback(errors) : callback();
            }
          });
      });
    });
  },

  /**
   * Attempts to fetch session from a session file by the given `sessionId`
   *
   * @param  {String}   sessionId
   * @param  {Object}   options
   * @param  {Function} callback
   *
   * @api public
   */
  get: function (sessionId, options, callback) {
    var sessionPath = helpers.sessionPath(options, sessionId);

    var operation = retry$1.operation({
      retries: options.retries,
      factor: options.factor,
      minTimeout: options.minTimeout,
      maxTimeout: options.maxTimeout
    });

    operation.attempt(function () {

      lib.readFile(sessionPath, helpers.isSecret(options.secret) && !options.encryptEncoding ? null : options.encoding, function readCallback(err, data) {

        if (!err) {
          var json;

          if (helpers.isSecret(options.secret))
            data = options.decoder(helpers.decrypt(options, data, sessionId));

          try {
            json = options.decoder(data);
          } catch (parseError) {
            return lib.remove(sessionPath, function (removeError) {
              if (removeError) {
                return callback(removeError);
              }

              callback(parseError);
            });
          }
          if (!err) {
            return callback(null, helpers.isExpired(json, options) ? null : json);
          }
        }

        if (operation.retry(err)) {
          options.logFn('[session-file-store] will retry, error on last attempt: ' + err);
        } else if (options.fallbackSessionFn) {
          var session = options.fallbackSessionFn(sessionId);
          helpers.setLastAccess(session);
          callback(null, session);
        } else {
          callback(err);
        }
      });
    });
  },

  /**
   * Attempts to commit the given `session` associated with the given `sessionId` to a session file
   *
   * @param {String}   sessionId
   * @param {Object}   session
   * @param  {Object}  options
   * @param {Function} callback (optional)
   *
   * @api public
   */
  set: function (sessionId, session, options, callback) {
    try {
      helpers.setLastAccess(session);

      var sessionPath = helpers.sessionPath(options, sessionId);
      var json = options.encoder(session);
      if (helpers.isSecret(options.secret)) {
        json = helpers.encrypt(options, json, sessionId);
      }
      writeFileAtomic(sessionPath, json, function (err) {
        if (callback) {
          err ? callback(err) : callback(null, session);
        }
      });
    } catch (err) {
      if (callback) callback(err);
    }
  },

  /**
   * Update the last access time and the cookie of given `session` associated with the given `sessionId` in session file.
   * Note: Do not change any other session data.
   *
   * @param {String}   sessionId
   * @param {Object}   session
   * @param {Object}   options
   * @param {Function} callback (optional)
   *
   * @api public
   */
  touch: function (sessionId, session, options, callback) {
    helpers.get(sessionId, options, function (err, originalSession) {
      if (err) {
        callback(err, null);
        return;
      }

      if (!originalSession) {
        originalSession = {};
      }

      if (session.cookie) {
        // Update cookie details
        originalSession.cookie = session.cookie;
      }
      // Update `__lastAccess` property and save to store 
      helpers.set(sessionId, originalSession, options, callback);
    });
  },

  /**
   * Attempts to unlink a given session by its id
   *
   * @param  {String}   sessionId   Files are serialized to disk by their sessionId
   * @param  {Object}   options
   * @param  {Function} callback
   *
   * @api public
   */
  destroy: function (sessionId, options, callback) {
    var sessionPath = helpers.sessionPath(options, sessionId);
    lib.remove(sessionPath, callback || function () {
    });
  },

  /**
   * Attempts to fetch number of the session files
   *
   * @param  {Object}   options
   * @param  {Function} callback
   *
   * @api public
   */
  length: function (options, callback) {
    lib.readdir(options.path, function (err, files) {
      if (err) return callback(err);

      var result = 0;
      files.forEach(function (file) {
        if (options.filePattern.exec(file)) {
          ++result;
        }
      });

      callback(null, result);
    });
  },

  /**
   * Attempts to clear out all of the existing session files
   *
   * @param  {Object}   options
   * @param  {Function} callback
   *
   * @api public
   */
  clear: function (options, callback) {
    lib.readdir(options.path, function (err, files) {
      if (err) return callback([err]);
      if (files.length <= 0) return callback();

      var errors = [];
      files.forEach(function (file, i) {
        if (options.filePattern.exec(file)) {
          lib.remove(path.join(options.path, file), function (err) {
            if (err) {
              errors.push(err);
            }
            // TODO: wrong call condition (call after all completed attempts to remove instead of after completed attempt with last index)
            if (i >= files.length - 1) {
              errors.length > 0 ? callback(errors) : callback();
            }
          });
        } else {
          // TODO: wrong call condition (call after all completed attempts to remove instead of after completed attempt with last index)
          if (i >= files.length - 1) {
            errors.length > 0 ? callback(errors) : callback();
          }
        }
      });
    });
  },

  /**
   * Attempts to find all of the session files
   *
   * @param  {Object}   options
   * @param  {Function} callback
   *
   * @api public
   */
  list: function (options, callback) {
    lib.readdir(options.path, function (err, files) {
      if (err) return callback(err);

      files = files.filter(function (file) {
        return options.filePattern.exec(file);
      });

      callback(null, files);
    });
  },

  /**
   * Attempts to detect whether a session file is already expired or not
   *
   * @param  {String}   sessionId
   * @param  {Object}   options
   * @param  {Function} callback
   *
   * @api public
   */
  expired: function (sessionId, options, callback) {
    helpers.get(sessionId, options, function (err, session) {
      if (err) return callback(err);

      err ? callback(err) : callback(null, helpers.isExpired(session, options));
    });
  },

  isExpired: function (session, options) {
    if (!session) return true;

    var ttl = session.cookie && session.cookie.originalMaxAge ? session.cookie.originalMaxAge : options.ttl * 1000;
    return !ttl || helpers.getLastAccess(session) + ttl < new Date().getTime();
  },

  encrypt: function (options, data, sessionId) {
    var ciphertext = null;

    options.kruptein.set(options.secret, data, function(err, ct) {
      if (err)
        throw err;

      ciphertext = ct;
    });

    return ciphertext;
  },

  decrypt: function (options, data, sessionId) {
    var plaintext = null;

    options.kruptein.get(options.secret, data, function(err, pt) {
      if (err)
        throw err;

      plaintext = pt;
    });
    
    return plaintext;
  }
};

var sessionFileHelpers = helpers;

/**
 * https://github.com/expressjs/session#session-store-implementation
 *
 * @param {object} session  express session
 * @return {Function} the `FileStore` extending `express`'s session Store
 *
 * @api public
 */
var sessionFileStore = function (session) {
  var Store = session.Store;

  /**
   * Initialize FileStore with the given `options`
   *
   * @param {Object} options (optional)
   *
   * @api public
   */
  function FileStore(options) {
    var self = this;

    options = options || {};
    Store.call(self, options);

    self.options = sessionFileHelpers.defaults(options);
    lib.mkdirsSync(self.options.path);
    sessionFileHelpers.scheduleReap(self.options);
    options.reapIntervalObject = self.options.reapIntervalObject;
  }

  /**
   * Inherit from Store
   */
  FileStore.prototype.__proto__ = Store.prototype;

  /**
   * Attempts to fetch session from a session file by the given `sessionId`
   *
   * @param  {String}   sessionId
   * @param  {Function} callback
   *
   * @api public
   */
  FileStore.prototype.get = function (sessionId, callback) {
    sessionFileHelpers.get(sessionId, this.options, callback);
  };

  /**
   * Attempts to commit the given session associated with the given `sessionId` to a session file
   *
   * @param {String}   sessionId
   * @param {Object}   session
   * @param {Function} callback (optional)
   *
   * @api public
   */
  FileStore.prototype.set = function (sessionId, session, callback) {
    sessionFileHelpers.set(sessionId, session, this.options, callback);
  };

  /**
   * Touch the given session object associated with the given `sessionId`
   *
   * @param {string} sessionId
   * @param {object} session
   * @param {function} callback
   *
   * @api public
   */
  FileStore.prototype.touch = function (sessionId, session, callback) {
    sessionFileHelpers.touch(sessionId, session, this.options, callback);
  };

  /**
   * Attempts to unlink a given session by its id
   *
   * @param  {String}   sessionId   Files are serialized to disk by their
   *                                sessionId
   * @param  {Function} callback
   *
   * @api public
   */
  FileStore.prototype.destroy = function (sessionId, callback) {
    sessionFileHelpers.destroy(sessionId, this.options, callback);
  };

  /**
   * Attempts to fetch number of the session files
   *
   * @param  {Function} callback
   *
   * @api public
   */
  FileStore.prototype.length = function (callback) {
    sessionFileHelpers.length(this.options, callback);
  };

  /**
   * Attempts to clear out all of the existing session files
   *
   * @param  {Function} callback
   *
   * @api public
   */
  FileStore.prototype.clear = function (callback) {
    sessionFileHelpers.clear(this.options, callback);
  };

  /**
   * Attempts to find all of the session files
   *
   * @param  {Function} callback
   *
   * @api public
   */
  FileStore.prototype.list = function (callback) {
    sessionFileHelpers.list(this.options, callback);
  };

  /**
   * Attempts to detect whether a session file is already expired or not
   *
   * @param  {String}   sessionId
   * @param  {Function} callback
   *
   * @api public
   */
  FileStore.prototype.expired = function (sessionId, callback) {
    sessionFileHelpers.expired(sessionId, this.options, callback);
  };

  return FileStore;
};

var sessionFileStore$1 = function(session) {
  return sessionFileStore(session);
};

const FileStore = sessionFileStore$1(expressSession);

console.log('port ', process.env.PORT);

let { PORT, HOST, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';


polka()
  .use(bodyParser.json())
  .use(
    expressSession({
      secret: 'orans',
      resave: false,
      saveUninitialized: true,
      cookie: {
        maxAge: 8 * 60 * 60 * 1000,
      },
      store: new FileStore({
        path: process.env.NOW ? '/tmp/sessions' : '.sessions',
      }),
    }),
  )

  .use(
    compression({ threshold: 0 }),
    sirv('static', { dev }),
    middleware({
      session: req => ({
        user: req.session.user,
        current_page: req.session.current_page,
        lgin_flg: req.session.lgin_flg
      }),
    }),
  )
  .listen(PORT, '0.0.0.0', (err) => {
    if (err) console.log('error', err);
  });
