import { useImageProcessor } from './useImageProcessor';

export function useVideoProcessor() {
  const { processImage } = useImageProcessor();

  const processVideo = async (videoBlob, overlayText, duration) => {
    try {
      const direct = await attemptDirectOverlay(videoBlob, overlayText, duration);
      if (direct) return { blob: direct, path: buildVideoPath(), method: 'direct' };
    } catch (e) { console.log('Direct overlay failed', e); }

    try {
      const frame = await extractFrame(videoBlob, 0);
      const processed = await processImage(frame, overlayText);
      const watermarkVideo = await createVideoFromImage(processed.blob, duration);
      const final = await overlayVideo(videoBlob, watermarkVideo);
      return { blob: final, path: buildVideoPath(), method: 'frame-fallback' };
    } catch (e) {
      console.log('Frame fallback failed', e);
      return { blob: videoBlob, path: buildVideoPath(), method: 'original' };
    }
  };

  return { processVideo };
}

function buildVideoPath() {
  const date = new Date().toISOString().split('T')[0];
  return `/Shortcuts/ID/${date}.mp4`;
}

async function extractFrame(videoBlob, time) {
  const video = document.createElement('video');
  video.src = URL.createObjectURL(videoBlob);
  video.muted = true;
  await new Promise(r => video.addEventListener('loadeddata', r, { once: true }));
  video.currentTime = time;
  await new Promise(r => video.addEventListener('seeked', r, { once: true }));
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);
  URL.revokeObjectURL(video.src);
  return new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.92));
}

async function createVideoFromImage(imageBlob, duration) {
  const img = await createImageBitmap(imageBlob);
  const canvas = new OffscreenCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  const stream = canvas.captureStream(30);
  const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
  const recorder = new MediaRecorder(stream, { mimeType: mime });
  const chunks = [];
  recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
  return new Promise((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
    recorder.start(100);
    let frames = 0;
    const total = Math.max(1, Math.floor(duration * 30));
    const draw = () => {
      ctx.drawImage(img, 0, 0);
      frames++;
      if (frames < total) requestAnimationFrame(draw);
      else recorder.stop();
    };
    draw();
  });
}

async function overlayVideo(baseBlob, watermarkBlob) {
  const base = document.createElement('video');
  base.src = URL.createObjectURL(baseBlob);
  base.muted = true;
  const mark = document.createElement('video');
  mark.src = URL.createObjectURL(watermarkBlob);
  mark.muted = true;
  mark.loop = true;

  await Promise.all([
    new Promise(r => base.addEventListener('loadeddata', r, { once: true })),
    new Promise(r => mark.addEventListener('loadeddata', r, { once: true }))
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = base.videoWidth;
  canvas.height = base.videoHeight;
  const ctx = canvas.getContext('2d');
  const stream = canvas.captureStream(30);
  const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
  const recorder = new MediaRecorder(stream, { mimeType: mime });
  const chunks = [];
  recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };

  return new Promise((resolve) => {
    recorder.onstop = () => {
      URL.revokeObjectURL(base.src);
      URL.revokeObjectURL(mark.src);
      resolve(new Blob(chunks, { type: 'video/webm' }));
    };
    base.play();
    mark.play();
    recorder.start(100);

    const draw = () => {
      if (base.ended || base.paused) { recorder.stop(); return; }
      ctx.drawImage(base, 0, 0, canvas.width, canvas.height);
      const mw = canvas.width * 0.33;
      const mh = (mark.videoHeight / mark.videoWidth) * mw;
      const x = canvas.width - mw - 16;
      const y = canvas.height - mh - 16;
      ctx.globalAlpha = 0.95;
      ctx.drawImage(mark, x, y, mw, mh);
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    };
    draw();
  });
}

async function attemptDirectOverlay(videoBlob, overlayText, duration) {
  const video = document.createElement('video');
  video.src = URL.createObjectURL(videoBlob);
  video.muted = true;
  await new Promise(r => video.addEventListener('loadeddata', r, { once: true }));
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  const stream = canvas.captureStream(30);
  const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
  const recorder = new MediaRecorder(stream, { mimeType: mime });
  const chunks = [];
  recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
  return new Promise((resolve, reject) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
    video.play();
    recorder.start(100);
    const fontSize = Math.round(canvas.height * 0.04);
    ctx.font = `bold ${fontSize}px -apple-system, sans-serif`;
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    const tw = ctx.measureText(overlayText).width;
    const pad = Math.round(canvas.width * 0.02);
    const draw = () => {
      if (video.ended) { recorder.stop(); return; }
      ctx.drawImage(video, 0, 0);
      ctx.fillText(overlayText, canvas.width - tw - pad, canvas.height - pad);
      requestAnimationFrame(draw);
    };
    draw();
    setTimeout(() => { if (recorder.state === 'recording') recorder.stop(); }, (duration + 2) * 1000);
  });
}