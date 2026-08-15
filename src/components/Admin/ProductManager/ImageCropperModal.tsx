import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import './ImageCropperModal.css';

interface ImageCropperModalProps {
  imageSrc: string;
  onCropComplete: (croppedBase64: string) => void;
  onCancel: () => void;
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ imageSrc, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const handleCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async () => {
    try {
      const canvas = document.createElement('canvas');
      const image = new Image();
      image.src = imageSrc;
      
      await new Promise((resolve) => {
        image.onload = resolve;
      });

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Kunci ukuran menjadi 1:1, misal 500x500
      canvas.width = 500;
      canvas.height = 500;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        500,
        500
      );

      const base64Image = canvas.toDataURL('image/jpeg', 0.85);
      onCropComplete(base64Image);
    } catch (e) {
      console.error(e);
      alert('Gagal memotong gambar.');
      onCancel();
    }
  };

  return (
    <div className="crop-modal-overlay">
      <div className="crop-modal-box">
        <h3>Sesuaikan Posisi & Ukuran Foto</h3>
        <p>Silakan geser atau perbesar (zoom) gambar agar ukurannya seragam (1:1).</p>
        
        <div className="crop-container">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div className="crop-controls">
          <label>Zoom:</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="zoom-slider"
          />
        </div>

        <div className="crop-actions">
          <button onClick={onCancel} className="btn-cancel">Batal</button>
          <button onClick={createCroppedImage} className="btn-save">Terapkan Foto</button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;
