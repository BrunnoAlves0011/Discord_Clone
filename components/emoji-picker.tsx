"use client";

import { useEffect, useRef } from "react";
import { Smile } from "lucide-react";
import { useTheme } from "next-themes";
import { EmojiButton } from "@joeattardi/emoji-button";

import {
  Popover,
  PopoverTrigger
} from "@/components/ui/popover";

interface EmojiPickerProps {
  onChange: (value: string) => void;
}

export const EmojiPicker = ({
  onChange
}: EmojiPickerProps) => {
  const { resolvedTheme } = useTheme();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<EmojiButton | null>(null);

  useEffect(() => {
    const picker = new EmojiButton({
      theme: resolvedTheme === "dark" ? "dark" : "light",
      position: "right-start",
      autoHide: false,
    });

    picker.on("emoji", selection => {
      onChange(selection.emoji);
    });

    pickerRef.current = picker;

    const trigger = triggerRef.current;
    if (trigger) {
      const togglePicker = () => picker.togglePicker(trigger);
      trigger.addEventListener("click", togglePicker);

      return () => {
        trigger.removeEventListener("click", togglePicker);
      };
    }
  }, [resolvedTheme, onChange]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          ref={triggerRef}
          className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
          type="button"
        >
          <Smile />
        </button>
      </PopoverTrigger>
    </Popover>
  );
}
