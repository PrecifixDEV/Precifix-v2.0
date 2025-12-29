export const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', (error) => reject(error))
        image.setAttribute('crossOrigin', 'anonymous') // needed to avoid cross-origin issues on CodeSandbox
        image.src = url
    })

export function getRadianAngle(degreeValue: number) {
    return (degreeValue * Math.PI) / 180
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width: number, height: number, rotation: number) {
    const rotRad = getRadianAngle(rotation)

    return {
        width:
            Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
        height:
            Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    }
}

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
export default async function getCroppedImg(
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number },
    rotation = 0,
    flip = { horizontal: false, vertical: false }
): Promise<Blob | null> {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
        return null
    }

    const rotRad = getRadianAngle(rotation)

    // calculate bounding box of the rotated image
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
        image.width,
        image.height,
        rotation
    )

    // set canvas size to match the bounding box
    canvas.width = bBoxWidth
    canvas.height = bBoxHeight

    // translate canvas context to a central location to allow rotating and flipping around the center
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
    ctx.rotate(rotRad)
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
    ctx.translate(-image.width / 2, -image.height / 2)

    // draw rotated image
    ctx.drawImage(image, 0, 0)

    // At this point, 'canvas' contains the fully rotated image at full resolution.
    // Now we create a new canvas for the final cropped area.
    const finalCanvas = document.createElement('canvas')

    // We want a standardized 400x400px output for avatars
    finalCanvas.width = 400
    finalCanvas.height = 400

    const finalCtx = finalCanvas.getContext('2d')
    if (!finalCtx) {
        return null
    }

    // Draw the cropped area from the source 'canvas' to the 'finalCanvas'
    // drawImage(source, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    finalCtx.drawImage(
        canvas,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        400,
        400
    )

    // Return as Blob
    return new Promise((resolve) => {
        finalCanvas.toBlob((blob) => {
            if (blob) {
                resolve(blob)
            } else {
                // Fallback to PNG if WebP fails (e.g. browser support, though unlikely for modern browsers)
                finalCanvas.toBlob((pngBlob) => {
                    resolve(pngBlob)
                }, 'image/png', 1)
            }
        }, 'image/webp', 0.8) // Using WebP for better compression
    })
}

export async function compressAndConvertToWebP(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Redimensionar se maior que 1200px
                const MAX_SIZE = 1200;
                if (width > MAX_SIZE || height > MAX_SIZE) {
                    if (width > height) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    } else {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Falha ao obter contexto do canvas'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // Converter para WebP com 80% de qualidade
                canvas.toBlob((blob) => {
                    if (blob) {
                        const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                        const newFile = new File([blob], newName, { type: 'image/webp' });
                        resolve(newFile);
                    } else {
                        reject(new Error('Falha na compressão da imagem'));
                    }
                }, 'image/webp', 0.8);
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
}
