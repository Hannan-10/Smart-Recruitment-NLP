import { useState, useRef, useEffect, useCallback } from 'react'
import './ImageCropper.css'

const CROP_SIZE = 240   // px — diameter of the circular viewport

function ImageCropper({ src, onCrop, onCancel }) {
  const loadedImg    = useRef(null)
  const dragStart    = useRef(null)

  const [imgSize, setImgSize] = useState({ w: 0, h: 0 })
  const [scale,   setScale]   = useState(1)
  const [offset,  setOffset]  = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)

  // Load image, compute initial fit-to-fill scale and centering
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      loadedImg.current = img
      const minDim   = Math.min(img.width, img.height)
      const initScale = CROP_SIZE / minDim
      const iw = img.width  * initScale
      const ih = img.height * initScale
      setImgSize({ w: img.width, h: img.height })
      setScale(initScale)
      setOffset({ x: -(iw - CROP_SIZE) / 2, y: -(ih - CROP_SIZE) / 2 })
    }
    img.src = src
  }, [src])

  // Keep image covering the full circle at all times
  const clamp = useCallback((ox, oy, sc) => {
    const iw = imgSize.w * sc
    const ih = imgSize.h * sc
    return {
      x: Math.max(Math.min(0, CROP_SIZE - iw), Math.min(0, ox)),
      y: Math.max(Math.min(0, CROP_SIZE - ih), Math.min(0, oy)),
    }
  }, [imgSize])

  // ── drag ──────────────────────────────────────────────────────────────
  const clientPos = (e) => {
    const src = e.touches ? e.touches[0] : e
    return { cx: src.clientX, cy: src.clientY }
  }

  const onPointerDown = (e) => {
    e.preventDefault()
    setDragging(true)
    const { cx, cy } = clientPos(e)
    dragStart.current = { cx, cy, ox: offset.x, oy: offset.y }
  }

  const onPointerMove = useCallback((e) => {
    if (!dragging || !dragStart.current) return
    const { cx, cy } = clientPos(e)
    const dx = cx - dragStart.current.cx
    const dy = cy - dragStart.current.cy
    setOffset(clamp(dragStart.current.ox + dx, dragStart.current.oy + dy, scale))
  }, [dragging, scale, clamp])

  const onPointerUp = useCallback(() => setDragging(false), [])

  useEffect(() => {
    window.addEventListener('mousemove', onPointerMove)
    window.addEventListener('mouseup',   onPointerUp)
    window.addEventListener('touchmove', onPointerMove, { passive: false })
    window.addEventListener('touchend',  onPointerUp)
    return () => {
      window.removeEventListener('mousemove', onPointerMove)
      window.removeEventListener('mouseup',   onPointerUp)
      window.removeEventListener('touchmove', onPointerMove)
      window.removeEventListener('touchend',  onPointerUp)
    }
  }, [onPointerMove, onPointerUp])

  // ── zoom slider ───────────────────────────────────────────────────────
  const minScale = imgSize.w
    ? CROP_SIZE / Math.min(imgSize.w, imgSize.h)
    : 0.5

  const handleZoom = (e) => {
    const newScale = Number(e.target.value)
    // zoom toward center
    const cx = CROP_SIZE / 2
    const cy = CROP_SIZE / 2
    const relX = (cx - offset.x) / scale
    const relY = (cy - offset.y) / scale
    setScale(newScale)
    setOffset(clamp(cx - relX * newScale, cy - relY * newScale, newScale))
  }

  // ── confirm crop ──────────────────────────────────────────────────────
  const handleCrop = () => {
    const img = loadedImg.current
    if (!img) return

    const OUT = 320
    const ratio = OUT / CROP_SIZE

    const canvas = document.createElement('canvas')
    canvas.width  = OUT
    canvas.height = OUT
    const ctx = canvas.getContext('2d')

    ctx.beginPath()
    ctx.arc(OUT / 2, OUT / 2, OUT / 2, 0, Math.PI * 2)
    ctx.clip()

    ctx.drawImage(
      img,
      offset.x * ratio,
      offset.y * ratio,
      imgSize.w * scale * ratio,
      imgSize.h * scale * ratio,
    )

    onCrop(canvas.toDataURL('image/jpeg', 0.92))
  }

  const displayW = imgSize.w * scale
  const displayH = imgSize.h * scale

  return (
    <div className="ic-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="ic-modal">
        <h3 className="ic-title">Adjust Your Photo</h3>
        <p className="ic-hint">Drag to reposition · slider to zoom</p>

        <div
          className="ic-viewport"
          onMouseDown={onPointerDown}
          onTouchStart={onPointerDown}
          style={{ cursor: dragging ? 'grabbing' : 'grab' }}
        >
          {displayW > 0 && (
            <img
              src={src}
              alt=""
              draggable={false}
              style={{
                position: 'absolute',
                left: offset.x,
                top: offset.y,
                width: displayW,
                height: displayH,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            />
          )}
          {/* circular guide ring */}
          <div className="ic-ring" />
        </div>

        <div className="ic-zoom-row">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="range"
            min={minScale}
            max={minScale * 3}
            step={0.01}
            value={scale}
            onChange={handleZoom}
            className="ic-slider"
          />
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        </div>

        <div className="ic-actions">
          <button type="button" className="ic-btn ic-btn--cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="ic-btn ic-btn--confirm" onClick={handleCrop}>
            Use Photo
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImageCropper
