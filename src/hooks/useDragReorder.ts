'use client'

import { useState, useCallback } from 'react'

interface UseDragReorderOptions<T extends { id: string }> {
  items: T[]
  onReorder: (reorderedItems: T[]) => void
}

export function useDragReorder<T extends { id: string }>({ items, onReorder }: UseDragReorderOptions<T>) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedId(null)
    setOverId(null)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!draggedId) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [draggedId])

  const handleDragEnter = useCallback((_e: React.DragEvent, id: string) => {
    if (draggedId && draggedId !== id) {
      setOverId(id)
    }
  }, [draggedId])

  const handleDragLeave = useCallback(() => {
    setOverId(null)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null)
      setOverId(null)
      return
    }

    const currentOrder = items.map((item) => item.id)
    const draggedIndex = currentOrder.indexOf(draggedId)
    const targetIndex = currentOrder.indexOf(targetId)

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedId(null)
      setOverId(null)
      return
    }

    const reordered = [...items]
    const [moved] = reordered.splice(draggedIndex, 1)
    reordered.splice(targetIndex, 0, moved)

    onReorder(reordered)
    setDraggedId(null)
    setOverId(null)
  }, [draggedId, items, onReorder])

  const getDragProps = useCallback((id: string) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => handleDragStart(e, id),
    onDragEnd: handleDragEnd,
    onDragOver: handleDragOver,
    onDragEnter: (e: React.DragEvent) => handleDragEnter(e, id),
    onDragLeave: handleDragLeave,
    onDrop: (e: React.DragEvent) => handleDrop(e, id),
  }), [handleDragStart, handleDragEnd, handleDragOver, handleDragEnter, handleDragLeave, handleDrop])

  const getItemState = useCallback((id: string) => ({
    isDragging: draggedId === id,
    isOver: overId === id,
  }), [draggedId, overId])

  return { getDragProps, getItemState, draggedId }
}
