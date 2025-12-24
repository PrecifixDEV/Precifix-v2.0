import { useState } from 'react'
import Cropper from 'react-easy-crop'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Button } from '@/components/ui/button' // Fixed casing
import { Loader2 } from 'lucide-react'
import getCroppedImg from '../utils/imageUtils'

interface ImageCropperProps {
    open: boolean
    imageSrc: string | null
    onClose: () => void
    onCropComplete: (croppedBlob: Blob) => void
}

export const ImageCropper = ({ open, imageSrc, onClose, onCropComplete }: ImageCropperProps) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [rotation] = useState(0)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
    const [processing, setProcessing] = useState(false)

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop)
    }

    const onZoomChange = (zoom: number) => {
        setZoom(zoom)
    }

    const onCrChange = (_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }

    const handleSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return

        try {
            setProcessing(true)
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation)

            if (croppedImageBlob) {
                onCropComplete(croppedImageBlob)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setProcessing(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(openState) => !openState && !processing && onClose()}>
            <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 gap-0 bg-slate-900 border-slate-800 text-white">
                <DialogHeader className="p-4 border-b border-slate-800">
                    <DialogTitle>Ajustar Imagem</DialogTitle>
                </DialogHeader>

                <div className="relative w-full h-80 bg-black">
                    {imageSrc && (
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={onCropChange}
                            onCropComplete={onCrChange}
                            onZoomChange={onZoomChange}
                            cropShape="round"
                            showGrid={false}
                        />
                    )}
                </div>

                <div className="p-4 space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium w-12 text-slate-400">Zoom</span>
                        <Slider
                            value={[zoom]}
                            min={1}
                            max={3}
                            step={0.1}
                            onValueChange={(val: number[]) => setZoom(val[0])}
                            className="flex-1"
                        />
                    </div>
                </div>

                <DialogFooter className="p-4 bg-slate-900 border-t border-slate-800 gap-2">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={processing}
                        className="hover:bg-slate-800 text-slate-300"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={processing}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                        {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Salvar Recorte
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
