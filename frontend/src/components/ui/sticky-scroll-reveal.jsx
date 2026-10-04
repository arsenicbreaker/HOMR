import React, { useRef, useSyncExternalStore } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react';
import './sticky-scroll-reveal.css';

const compactQuery = '(max-width: 700px) and (max-height: 740px), (max-height: 580px)';
function subscribeCompact(callback) {
  const query = window.matchMedia?.(compactQuery);
  if (!query) return () => {};
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

export function StickyScroll({ content, activeId, onActiveChange, children }) {
  const trackRef = useRef(null);
  const itemRefs = useRef([]);
  const reducedMotion = useReducedMotion();
  const compact = useSyncExternalStore(subscribeCompact, () => window.matchMedia?.(compactQuery).matches ?? false, () => false);
  const activeIndex = Math.max(0, content.findIndex((item) => item.id === activeId));
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start center', 'end center'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const index = Math.min(content.length - 1, Math.max(0, Math.floor(progress * content.length)));
    if (content[index] && content[index].id !== activeId) onActiveChange(content[index].id);
  });

  function selectItem(index, focus = false) {
    onActiveChange(content[index].id);
    itemRefs.current[index]?.scrollIntoView({ behavior: 'instant', block: compact ? 'start' : 'center' });
    if (focus) document.getElementById(`journey-tab-${content[index].id}`)?.focus({ preventScroll: true });
  }

  function handleKeys(event) {
    let nextIndex;
    if (event.key === 'ArrowRight') nextIndex = (activeIndex + 1) % content.length;
    if (event.key === 'ArrowLeft') nextIndex = (activeIndex - 1 + content.length) % content.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = content.length - 1;
    if (nextIndex === undefined) return;
    event.preventDefault();
    selectItem(nextIndex, true);
  }

  if (!content.length) return null;

  return (
    <div className={`sticky-scroll${compact ? ' sticky-scroll--compact' : ''}`}>
      <div className="sticky-scroll-tabs" role="tablist" aria-label="Choose a demo journey" onKeyDown={handleKeys}>
        {content.map((item, index) => (
          <button
            key={item.id}
            id={`journey-tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={activeIndex === index}
            aria-controls={compact ? `journey-detail-${item.id}` : 'journey-detail'}
            tabIndex={activeIndex === index ? 0 : -1}
            className={activeIndex === index ? 'sticky-scroll-tab is-active' : 'sticky-scroll-tab'}
            onClick={() => selectItem(index)}
          >
            {item.title}
          </button>
        ))}
      </div>
      <div className="sticky-scroll-layout">
        <div className="sticky-scroll-track" ref={trackRef}>
          {content.map((item, index) => (
            <article
              key={item.id}
              id={compact ? `journey-detail-${item.id}` : undefined}
              ref={(element) => { itemRefs.current[index] = element; }}
              className={`sticky-scroll-story${activeIndex === index ? ' is-active' : ''}`}
            >
              <motion.div
                animate={{ y: reducedMotion || activeIndex === index ? 0 : 12 }}
                transition={{ duration: reducedMotion ? 0 : 0.3 }}
              >
                <p className="sticky-scroll-position">0{index + 1} / 0{content.length}</p>
                <h2 className="sticky-scroll-title">{item.title}</h2>
                <p className="sticky-scroll-description">{item.description}</p>
                {compact && <div className="sticky-scroll-inline-detail">{item.content}{children}</div>}
              </motion.div>
            </article>
          ))}
        </div>
        {!compact && <div className="sticky-scroll-preview" id="journey-detail" role="tabpanel" aria-labelledby={`journey-tab-${content[activeIndex].id}`} tabIndex={0}>
          <motion.div
            key={activeId}
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.25 }}
          >
            {content[activeIndex].content}
          </motion.div>
          {children}
        </div>}
      </div>
    </div>
  );
}
