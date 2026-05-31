import { useRef, useEffect, useState } from 'react';
import { usePostingStore } from '../stores/postingStore';
import useGeolocation from '../hooks/useGeolocation';
import { useImageProcessor } from '../hooks/useImageProcessor';
import { useStorage } from '../hooks/useStorage';
import { formatDateMedium } from '../utils/dateFormatter';

export default function CameraCapture({ mode }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const durationIntervalRef = useRef(null);

  const {
    postingId, setPhoto, setVideo, setLocationData, setDateData,
    setOverlayText, setSavedImage, setSavedVideo, overlayText, flowStep
  } = usePostingStore();

  const { getLocation, reverseGeocodeCity } = useGeolocation();
  const { processImage } = useImageProcessor();
  const { saveFile } = useStorage();

  useEffect(() => { startCamera(); return () => stopCamera(); }, [mode]);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      audio: mode === 'video'
    });
    streamRef.current = stream;
    if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    clearInterval(durationIntervalRef.current);
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.92));

    const location = await getLocation();
    const cityName = await reverseGeocodeCity(location);
    const dateRaw = new Date();
    const dateFormatted = formatDateMedium(dateRaw);
    const text = `${postingId} • ${cityName} • ${dateFormatted}`;

    setLocationData(location, cityName);
    setDateData(dateRaw, dateFormatted);
    setOverlayText(text);
    setPhoto(blob);

    const processed = await processImage(blob, text);
    const saved = await saveFile(processed.blob, processed.path);
    setSavedImage(saved);
  };

  const startVideoRecording = () => {
    const stream = streamRef.current;
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];
    recorder.ondataavailable = e => { if (e.data.size) chunksRef.current.push(e.data); };
    recorder.onstop = async () => {
      const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
      const duration = recordDuration;
      setVideo(videoBlob, duration);
      try {
        const { useVideoProcessor } = await import('../hooks/useVideoProcessor');
        const { processVideo } = useVideoProcessor();
        const result = await processVideo(videoBlob, overlayText, duration);
        const saved = await saveFile(result.blob, result.path);
        setSavedVideo(saved);
      } catch (e) {
        console.error(e);
        const saved = await saveFile(videoBlob, buildVideoPath());
        setSavedVideo(saved);
      }
    };
    setIsRecording(true);
    setRecordDuration(0);
    durationIntervalRef.current = setInterval(() => setRecordDuration(d => d + 1), 1000);
    recorder.start(100);
  };

  const stopVideoRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    clearInterval(durationIntervalRef.current);
  };

  if (mode === 'photo') {
    return (
      <div className="fixed inset-0 bg-black flex flex-col z-50">
        <video ref={videoRef} className="flex-1 object-cover w-full" playsInline muted />
        <div className="h-32 flex items-center justify-center">
          <button onClick={capturePhoto} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform">
            <div className="w-14 h-14 rounded-full bg-white" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      <video ref={videoRef} className="flex-1 object-cover w-full" playsInline muted={false} />
      {isRecording && (
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-white font-mono text-sm">{fmtDuration(recordDuration)}</span>
        </div>
      )}
      <div className="h-32 flex items-center justify-center">
        <button
          onClick={isRecording ? stopVideoRecording : startVideoRecording}
          className={`w-20 h-20 rounded-full border-4 flex items-center justify-center active:scale-95 transition-all ${isRecording ? 'border-red-500' : 'border-yellow-500'}`}
        >
          {isRecording ? <div className="w-8 h-8 rounded-sm bg-red-500" /> : <div className="w-14 h-14 rounded-full bg-yellow-500" />}
        </button>
      </div>
    </div>
  );
}

function fmtDuration(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function buildVideoPath() {
  const date = new Date().toISOString().split('T')[0];
  return `/Shortcuts/ID/${date}.webm`;
}