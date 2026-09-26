import React from 'react';

export function DemoTag({ text = 'DEMO DATA' }) {
  return (
    <span className="demo-tag">
      {text}
    </span>
  );
}

export default DemoTag;
