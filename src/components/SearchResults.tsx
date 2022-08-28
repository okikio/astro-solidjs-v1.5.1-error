import { For, createResource, onMount, createEffect, on } from 'solid-js';

import { getQuery } from './store';
import { getPackages, toLocaleDateString } from './utils';

export interface SearchResultProps {
  type?: 'error';
  name?: string;
  description?: string;
  date?: string;
  publisher?: { username?: string };
  version?: string;
}

export function SearchResult(props?: SearchResultProps) {
  let _name = props?.name;
  let _description = props?.description;
  let _date = props?.date ? toLocaleDateString(props?.date) : null;
  let _author = props?.publisher?.username;
  let _version = props?.version ? '@' + props?.version : '';

  let _package = `${_name}${_version}`;
  let _packageHref = `https://www.npmjs.com/${_name}`;
  let _authorHref = `https://www.npmjs.com/~${_author}`;

  return (
    <div class="result">
      <div class="content">
        <h2 class="font-semibold text-lg">
          <a href={_packageHref}>{_name}</a>
        </h2>
        <div>
          <p>{_description}</p>
          <p class="updated-time">
            {_date && `Updated ${_date} `}
            {_author && (
              <>
                by <a href={_authorHref}>@{_author}</a>.
              </>
            )}
          </p>
        </div>
      </div>
      <div class="add">
        <button type="button" class="btn">
          <span class="btn-text">Add Module</span>
        </button>
      </div>
    </div>
  );
}

export function ErrorResult(props?: SearchResultProps) {
  let _name = props?.name ?? 'No results...';
  let _description = props?.description ?? '';

  return (
    <div class="result error">
      <div class="content">
        <h2 class="font-semibold text-lg">
          <div class="text-center">{_name}</div>
        </h2>

        <p class={'text-center' + (_description == '' ? ' hidden' : '')}>
          {_description}
        </p>
      </div>
    </div>
  );
}

export function SearchResults() {
  let ref: HTMLDivElement = null;
  let heightRef: HTMLDivElement = null;

  const opts: KeyframeAnimationOptions = {
    duration: 350,
    easing: 'ease',
    fill: 'both',
  };

  const [data] = createResource(getQuery, async (source) => {
    if (ref) {
      let anim = heightRef.animate({ opacity: '0' }, opts);
      await anim?.finished;
    }

    try {
      if (source.length == 0) return [];
      let { packages } = await getPackages(source);

      // @ts-ignore
      return packages.map(({ package: pkg }) => pkg) ?? [];
    } catch (err) {
      return [
        {
          type: 'error',
          name: 'Error...',
          description: err?.message,
        },
      ];
    }
  });

  onMount(() => {
    let last = heightRef?.getBoundingClientRect();
    heightRef.animate({ opacity: '1' }, opts);
    ref.animate({ height: `${last?.height}px` }, opts);
  });

  createEffect(
    on(data, (value) => {
      if (!value?.loading) {
        let last = heightRef?.getBoundingClientRect();
        heightRef.animate({ opacity: '1' }, opts);
        ref.animate({ height: `${last?.height}px` }, opts);
      }
    })
  );

  return (
    <div class="results-list relative" ref={ref}>
      <div
        class="divide-y divide-gray-200 dark:divide-quaternary"
        ref={heightRef}
      >
        <For each={data() as SearchResultProps[]} fallback={<ErrorResult />}>
          {(item) => {
            if (item?.type == 'error') return <ErrorResult {...item} />;
            return <SearchResult {...item} />;
          }}
        </For>
      </div>
    </div>
  );
}

export default SearchResults;
