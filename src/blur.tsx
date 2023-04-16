import { useEffect, useRef } from "react";

import { encode, decode } from "blurhash";

const loadImage = async (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (...args) => reject(args);
    img.src = src;
  });

const getImageData = (image) => {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, image.width, image.height);
};

function getFileDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = function (event) {
      const dataURL = event.target.result;
      resolve(dataURL);
    };

    reader.onerror = function (error) {
      reject(error);
    };
  });
}

export async function getBlurhashFromFile(file) {
  const imageUrl = await getFileDataURL(file);
  const image = await loadImage(imageUrl);
  const imageData = getImageData(image);
  return {
    blurhash: encode(imageData.data, imageData.width, imageData.height, 4, 3),
    width: imageData.width,
    height: imageData.height,
  };
}

export function BlurhashImage({ blurhash, width, height, alt }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");

      const pixels = decode(blurhash, width, height);
      const imageData = ctx.createImageData(width, height);
      imageData.data.set(pixels);
      ctx.putImageData(imageData, 0, 0);
    }
  }, [blurhash, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} alt={alt} />;
}
