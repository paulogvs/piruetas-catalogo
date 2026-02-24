import React from 'react';
import { Modal } from './Modal';

const EMOJIS = ['❤️', '🔥', '✨', '🛍️', '🏷️', '💸', '💃', '👗', '👠', '👑', '💄', '👛', '🌟', '💥', '💯', '✅', '🌈', '🍭', '🎀', '🎈'];

interface EmojiPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectEmoji: (emoji: string) => void;
}

export function EmojiPicker({ isOpen, onClose, onSelectEmoji }: EmojiPickerProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Añadir Emoticón">
            <div className="grid grid-cols-5 gap-3 p-2">
                {EMOJIS.map((emoji) => (
                    <button
                        key={emoji}
                        onClick={() => {
                            onSelectEmoji(emoji);
                            onClose();
                        }}
                        className="text-4xl p-3 hover:bg-gray-100 rounded-2xl transition-all active:scale-90 flex items-center justify-center border border-gray-50 shadow-sm"
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </Modal>
    );
}
