import { RefObject, useEffect, useRef, useState } from "react";
import { clamp } from "../utils/helpers";

type Position = { x: number; y: number };

type UseMascotDragArgs = {
  containerRef: RefObject<HTMLElement | null>;
  storageKey: string;
  mascotSize: { w: number; h: number };
  enabled: boolean;
};

const DEFAULT_POSITION: Position = { x: 58, y: 52 };

export function useMascotDrag({
  containerRef,
  storageKey,
  mascotSize,
  enabled,
}: UseMascotDragArgs) {
  const [position, setPosition] = useState<Position>(() => {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return DEFAULT_POSITION;
    }
    try {
      const parsed = JSON.parse(raw) as Position;
      return {
        x: Number.isFinite(parsed.x) ? parsed.x : DEFAULT_POSITION.x,
        y: Number.isFinite(parsed.y) ? parsed.y : DEFAULT_POSITION.y,
      };
    } catch {
      return DEFAULT_POSITION;
    }
  });

  const dragOffsetRef = useRef<Position>({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(position));
  }, [position, storageKey]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const rect = container.getBoundingClientRect();
    setPosition((prev) => ({
      x: clamp(prev.x, 0, Math.max(0, rect.width - mascotSize.w)),
      y: clamp(prev.y, 0, Math.max(0, rect.height - mascotSize.h)),
    }));
  }, [containerRef, mascotSize.h, mascotSize.w]);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (!enabled || !isDraggingRef.current) {
        return;
      }
      const container = containerRef.current;
      if (!container) {
        return;
      }
      const rect = container.getBoundingClientRect();
      const x = clamp(
        event.clientX - rect.left - dragOffsetRef.current.x,
        0,
        Math.max(0, rect.width - mascotSize.w)
      );
      const y = clamp(
        event.clientY - rect.top - dragOffsetRef.current.y,
        0,
        Math.max(0, rect.height - mascotSize.h)
      );
      setPosition({ x, y });
    };

    const up = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [containerRef, mascotSize.h, mascotSize.w, enabled]);

  const startDrag = (event: React.PointerEvent<HTMLElement>) => {
    if (!enabled || event.button !== 0) {
      return;
    }
    const current = event.currentTarget.getBoundingClientRect();
    dragOffsetRef.current = {
      x: event.clientX - current.left,
      y: event.clientY - current.top,
    };
    isDraggingRef.current = true;
  };

  return { position, startDrag };
}

