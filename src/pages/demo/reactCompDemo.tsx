import React, { useRef, useState, forwardRef, useImperativeHandle, ForwardRefExoticComponent } from 'react';
import { forwardRefWrap } from 'micro-app-tools/react18/utils';

const reactCompDemo = forwardRef(function Comp(props: {
  value: number
}, ref: any) {
  const [count, setCount] = useState(props.value || 99);

  useImperativeHandle(ref, () => {
    return {
      increaseDouble() {
        setCount(count + 2);
      },
    };
  });

  return (
    <>
      <div>
        <span>计数器: {count}</span>{' '}
        <button onClick={() => setCount(count + 1)}>点击+1</button>{' '}
      </div>
    </>
  );
})

export default forwardRefWrap(reactCompDemo);
