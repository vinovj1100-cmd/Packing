import { useRef, useCallback, useState } from 'react';

export function useCamera() {
  const streamRef = useRef(null);
  const [active, setActive] = useState(false);

  const startCamera = useCallback(async (mode = 'photo') => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      audio: mode === 'video'
    });
    streamRef.current = stream;
    setActive(true);
    return stream;
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setActive(false);
  }, []);

  return { startCamera, stopCamera, streamRef, active };
}