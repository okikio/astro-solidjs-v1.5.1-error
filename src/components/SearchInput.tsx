import { Tooltip } from './Tooltip';
import { setQuery } from './store';

export function SearchInput() {
  let ref: HTMLInputElement;

  function onClear() {
    ref.value = '';
    setQuery('');
  }

  function onKeyUp(e?: KeyboardEvent) {
    e?.stopPropagation?.();
    let { value } = ref;
    setQuery(value);
  }

  return (
    <div class="search">
      <div class="px-3 py-2 gap-3 flex flex-row justify-center">Search</div>

      <input
        id="input"
        type="text"
        autocomplete="off"
        placeholder="Type a package name..."
        onKeyUp={onKeyUp}
        ref={ref}
      />

      <Tooltip>
        <button
          id="clear"
          aria-label="Clear search input and results"
          onClick={onClear}
        >
          Clear
        </button>
      </Tooltip>
    </div>
  );
}

export default SearchInput;
