"use client";

const EMOJI = [
  "🙏", "❤️", "🔥", "👏", "🙌", "😊", "😂", "🥹", "😍", "🤗", "😮", "😢",
  "💯", "✨", "🌟", "💡", "📖", "✝️", "🕊️", "⛪", "🎉", "💪", "🤝", "👍",
  "🫶", "💛", "🌍", "🙂", "😇", "🤔", "😅", "🥳", "🎯", "🌱", "☀️", "🌈",
];

export default function EmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  return (
    <div
      role="dialog"
      aria-label="Pick an emoji"
      className="grid w-[17.5rem] grid-cols-8 gap-1 rounded-2xl border border-line bg-background p-2 shadow-lg"
    >
      {EMOJI.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onPick(emoji)}
          className="flex size-8 items-center justify-center rounded-lg text-lg transition-colors hover:bg-foreground/5"
          aria-label={`Insert ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
