export function useImageProcessor() {
  const processImage = async (imageBlob, overlayText) => {
    const img = await createImageBitmap(imageBlob);
    const w = img.width;
    const maxw = Math.round(w * 0.33);
    const aspectRatio = img.height / w;
    const newHeight = Math.round(maxw * aspectRatio);

    const canvas = document.createElement('canvas');
    canvas.width = maxw;
    canvas.height = newHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, maxw, newHeight);

    const fontSize = 36;
    ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    const padding = 16;
    const textWidth = ctx.measureText(overlayText).width;
    const x = maxw - textWidth - padding;
    const y = newHeight - padding;
    ctx.fillText(overlayText, x, y);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve({ blob, path: buildPathFromBlob(blob), width: maxw, height: newHeight });
      }, 'image/jpeg', 0.92);
    });
  };

  return { processImage };
}

function buildPathFromBlob(blob) {
  const date = new Date().toISOString().split('T')[0];
  return `/Shortcuts/ID/${date}.jpg`;
}