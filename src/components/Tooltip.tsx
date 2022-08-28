import type { ComponentProps } from 'solid-js';
import { mergeProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

export function Tooltip(props: ComponentProps<any>) {
  const mergedProps = mergeProps({ component: 'div' }, props);
  return <Dynamic {...mergedProps} />;
}

export default Tooltip;
