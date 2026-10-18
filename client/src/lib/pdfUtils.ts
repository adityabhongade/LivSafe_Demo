export const loadCircularImageDataURL = (src: string, diameter: number, options?: { borderColor?: string; borderWidth?: number; }): Promise<string> => {
  const { borderColor = '#1f2937', borderWidth = 0 } = options || {};
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const d = diameter;
      canvas.width = d;
      canvas.height = d;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas 2D context not available'));

      // Compute cover crop to fill square
      const imgRatio = img.width / img.height;
      const targetSize = d;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (imgRatio > 1) {
        // wider than tall - crop sides
        sh = img.height;
        sw = sh; // square
        sx = (img.width - sw) / 2;
        sy = 0;
      } else if (imgRatio < 1) {
        // taller than wide - crop top/bottom
        sw = img.width;
        sh = sw; // square
        sx = 0;
        sy = (img.height - sh) / 2;
      } else {
        // already square
        sx = 0; sy = 0; sw = img.width; sh = img.height;
      }

      // Clip to circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(d / 2, d / 2, d / 2 - (borderWidth > 0 ? borderWidth : 0), 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Draw the image to fill the circle
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetSize, targetSize);
      ctx.restore();

      // Optional border
      if (borderWidth > 0) {
        ctx.beginPath();
        ctx.arc(d / 2, d / 2, d / 2 - borderWidth / 2, 0, Math.PI * 2);
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth;
        ctx.stroke();
      }

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = src;
  });
};
