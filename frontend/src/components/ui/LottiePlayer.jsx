import { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

export default function LottiePlayer({ animationData, width = 120, height = 120, loop = true }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !animationData) return;
    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop,
      autoplay: true,
      animationData,
    });
    return () => anim.destroy();
  }, [animationData, loop]);

  return <div ref={containerRef} style={{ width, height }} />;
}
