import {
  ComponentProps,
  createEffect,
  createResource,
  createSignal,
  onCleanup,
  onMount,
  Show,
  splitProps,
} from 'solid-js';
import { SearchContainer } from './SearchContainer';

export function Tabs() {
  return (
    <div class="tab-bar">
      <div class="tab-container">
        <button class="active">Input</button>
        <button>Output</button>
        <button>Settings</button>
      </div>
    </div>
  );
}

export function Activity() {
  return (
    <div class="activity-section">
      <div class="activity-container">
        <div class="flex-grow"></div>

        <button aria-label="Build">Build</button>

        <button aria-label="Share">Share</button>
      </div>
    </div>
  );
}

export function Console() {
  return (
    <div class="console-container">
      <div class="console-head">
        <p>Console</p>
        {/* <ConsoleButtons /> */}
      </div>

      <pre>
        <code>
          <p>No logs...</p>
        </code>
      </pre>
    </div>
  );
}

export function Editor() {
  let ref: HTMLDivElement = null;
  let activeEditor = null;

  const [monaco] = createResource(() => import('./monaco'));

  createEffect(async () => {
    if (!monaco()) return;
    const { build } = monaco();
    const [editor] = build(ref);
    activeEditor = editor;
  });

  onCleanup(() => {
    activeEditor?.dispose?.();
  });

  return (
    <div class="editor-container">
      <div ref={ref} id="editor" custom-code-editor></div>
    </div>
  );
}

export function DragHandle(
  props?: ComponentProps<'button'> & {
    direction?: 'x' | 'y';
    constrain?: boolean;
  }
) {
  let ref: HTMLButtonElement = null;
  let targetEl: HTMLElement = null;
  let parentEl: HTMLElement = null;
  let observer: ResizeObserver = null;

  // The current position of mouse
  let position = 0;

  // Size of previous element
  let size = 0;

  // Size of parent element
  let parentSize = 0;

  let [dirIsX, setDirIsX] = createSignal(props?.direction == 'x');

  let [sizeProp, setSizeProp] = createSignal(dirIsX() ? 'width' : 'height');
  let [mouseDir, setMouseDir] = createSignal(dirIsX() ? 'clientX' : 'clientY');
  let [cursorProp, setCursorProp] = createSignal(
    dirIsX() ? 'col-resize' : 'row-resize'
  );

  function drag(e: MouseEvent) {
    // How far the mouse has been moved
    const diff = e[mouseDir()] - position;
    const newSize = props?.constrain
      ? ((size + diff) * 100) / parentSize
      : size + diff;
    const unit = props?.constrain ? '%' : 'px';

    targetEl.style[sizeProp()] = `${newSize}${unit}`;
    document.body.style.cursor = cursorProp();

    targetEl.style.userSelect = 'none';
    targetEl.style.pointerEvents = 'none';
  }

  function stopDrag() {
    ref.style.removeProperty('cursor');
    document.body.style.removeProperty('cursor');

    targetEl.style.removeProperty('user-select');
    targetEl.style.removeProperty('pointer-events');

    document.removeEventListener('pointermove', drag);
    document.removeEventListener('pointerup', stopDrag);

    if (props?.constrain) {
      observer?.unobserve?.(parentEl);
    }
  }

  onMount(() => {
    targetEl = (ref?.previousElementSibling ??
      ref?.parentElement?.previousElementSibling) as HTMLElement;
    parentEl = targetEl?.parentElement as HTMLElement;
  });

  createEffect(() => {
    targetEl?.style?.removeProperty?.(sizeProp());

    setDirIsX(props?.direction == 'x');

    setSizeProp(dirIsX() ? 'width' : 'height');
    setMouseDir(dirIsX() ? 'clientX' : 'clientY');
    setCursorProp(dirIsX() ? 'col-resize' : 'row-resize');

    if (props?.constrain && !observer) {
      observer = new ResizeObserver(() => {
        parentSize = parentEl.getBoundingClientRect()[sizeProp()];
      });
    }
  });

  onCleanup(() => {
    newProps.ref = ref = null;
    document.removeEventListener('pointermove', drag);
    document.removeEventListener('pointerup', stopDrag);

    if (props?.constrain) {
      observer?.unobserve?.(parentEl);
      observer?.disconnect?.();
      observer = null;
    }
  });

  // Handle the pointerdown event
  // that's triggered when user drags the resizer
  function pointerDown(e: MouseEvent) {
    // Get the current mouse position
    position = e[mouseDir()];
    size = targetEl.getBoundingClientRect()[sizeProp()];
    parentSize = parentEl.getBoundingClientRect()[sizeProp()];

    // Attach the listeners to `document`
    document.addEventListener('pointermove', drag);
    document.addEventListener('pointerup', stopDrag);

    if (props?.constrain) {
      observer?.observe?.(parentEl);
    }
  }

  let [newProps, attrs] = splitProps(props, ['ref']);

  return (
    <button
      custom-button
      {...attrs}
      title="Drag around to resz"
      custom-handle
      class="drag-handle"
      ref={(el: HTMLElement) => {
        ref = el as HTMLButtonElement;
        newProps.ref = ref;
      }}
      onPointerDown={pointerDown}
    >
      <div>
        <Show when={dirIsX()} fallback={<span>Drag Vert</span>}>
          <span>Drag Horz</span>
        </Show>
      </div>
    </button>
  );
}

export function MainComponent() {
  const [direction, setDirection] = createSignal<'x' | 'y'>('x');

  function onResize(e: MediaQueryListEvent | MediaQueryList) {
    setDirection(e?.matches ? 'x' : 'y');
  }

  onMount(() => {
    let mediaQuery = globalThis?.matchMedia?.('(min-width: 640px)');
    onResize(mediaQuery);
    mediaQuery?.addEventListener?.('change', onResize);

    onCleanup(() => {
      mediaQuery?.removeEventListener?.('change', onResize);
    });
  });

  return (
    <div class="contain md col">
      <SearchContainer />

      <div class="contain px-none lg editor-section">
        <Tabs />
        <Activity />

        <div class="core">
          <Editor />
          <DragHandle direction={direction()} constrain={direction() == 'x'} />
          <Console />
        </div>

        <DragHandle drag-height direction="y" />
      </div>
    </div>
  );
}

export default MainComponent;
