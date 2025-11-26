import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AIControls } from './AIControls';
import { AIMode, Message, Fan } from "../../types/chat";
import { SendIcon } from "./icons/SendIcon";
import { AgentOrchestratorOutput } from '../../types/agent';
import { MessageToolbar } from './MessageToolbar';
import { PriceLockModal } from './PriceLockModal';
import { MediaVaultModal, MediaItem } from './MediaVaultModal';
import { PriceLockBar } from './PriceLockBar';
import { MediaAttachmentBar, AttachedFile, isSupportedFile } from './MediaAttachmentBar';
import { useSocialAccounts } from '../../contexts/SocialAccountsContext';
import type { SocialAccount } from '../../lib/supabase';

interface MessageInputProps {
  onSendMessage: (content: string, sender: 'model' | 'ai') => void;
  conversationHistory: Message[];
  sendingMessage?: boolean;
  socialAccountId?: string;
  conversationId?: string; // New prop
  fan: Fan;
  onAgentAnalysisStart: () => void;
  onAgentAnalysisComplete: (insights: AgentOrchestratorOutput) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  conversationHistory,
  sendingMessage = false,
  socialAccountId,
  conversationId, // Destructure
  fan,
  onAgentAnalysisStart,
  onAgentAnalysisComplete
}) => {
  const [text, setText] = useState('');
  const [aiMode, setAiMode] = useState<AIMode>('suggest');
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [priceLockValue, setPriceLockValue] = useState<number | null>(null);
  const [isMediaVaultOpen, setIsMediaVaultOpen] = useState(false);
  const [, setAttachedMedia] = useState<MediaItem[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevSendingRef = useRef(false);
  const { accounts } = useSocialAccounts();

  const resolveAccount = (acc?: SocialAccount) => {
    if (!acc) return undefined;
    if (acc.platform.toLowerCase() !== 'onlyfans') return undefined;
    if (!acc.platform_user_id) return undefined;
    return acc;
  };

  const vaultAccount = useMemo(() => {
    if (socialAccountId) {
      const matched = resolveAccount(accounts.find((acc) => acc.id === socialAccountId));
      if (matched) return matched;
    }
    return resolveAccount(
      accounts.find(
        (acc) => acc.platform.toLowerCase() === 'onlyfans' && !!acc.platform_user_id,
      ),
    );
  }, [accounts, socialAccountId]);

  // Clear text when sending completes (sendingMessage changes from true to false)
  useEffect(() => {
    if (prevSendingRef.current && !sendingMessage) {
      // Was sending, now not sending - clear the text
      setText('');
    }
    prevSendingRef.current = sendingMessage;
  }, [sendingMessage]);

  const handleSend = () => {
    if (text.trim() && !sendingMessage) {
      onSendMessage(text, 'model'); // Assume manual sends are from the 'model'
      // Don't clear text here - keep it in the box while sending
    }
  };

  const handleToolbarAction = (actionKey: string) => {
    if (actionKey === 'ppv') {
      setIsPriceModalOpen(true);
    }
    if (actionKey === 'media') {
      setIsMediaVaultOpen(true);
    }
    if (actionKey === 'attach') {
      fileInputRef.current?.click();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const supportedFiles = files.filter(isSupportedFile);

    const newAttachments: AttachedFile[] = supportedFiles.map((file) => {
      const id = `${Date.now()}-${Math.random()}`;
      const previewUrl = URL.createObjectURL(file);
      return { id, file, previewUrl };
    });

    setAttachedFiles((prev) => [...prev, ...newAttachments]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (id: string) => {
    setAttachedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleAddMoreFiles = () => {
    fileInputRef.current?.click();
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      attachedFiles.forEach((file) => {
        URL.revokeObjectURL(file.previewUrl);
      });
    };
  }, [attachedFiles]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !sendingMessage) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div>
      <AIControls
        currentMode={aiMode}
        onModeChange={setAiMode}
        onSuggestionSelect={setText}
        conversationHistory={conversationHistory}
        socialAccountId={socialAccountId}
        conversationId={conversationId} // Pass to AIControls
        fan={fan}
        onAgentAnalysisStart={onAgentAnalysisStart}
        onAgentAnalysisComplete={onAgentAnalysisComplete}
      />
      {priceLockValue !== null && priceLockValue > 0 && (
        <PriceLockBar price={priceLockValue} onRemove={() => setPriceLockValue(null)} />
      )}
      <MediaAttachmentBar
        files={attachedFiles}
        onRemove={handleRemoveFile}
        onAdd={handleAddMoreFiles}
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.gif,.png,.heic,.mp4,.mov,.moov,.m4v,.mpg,.mpeg,.wmv,.avi,.webm,.mkv,.mp3,.wav,.ogg"
        onChange={handleFileSelect}
        className="hidden"
      />
      <div className="relative mt-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          rows={2}
          disabled={sendingMessage}
          className="w-full bg-surface border border-border-color rounded-lg p-3 pr-12 resize-none focus:ring-2 focus:ring-primary focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSend}
          className="absolute right-3 bottom-3 p-2 bg-primary text-white rounded-full hover:bg-purple-500 transition-colors disabled:bg-surface disabled:text-text-secondary disabled:cursor-not-allowed flex items-center justify-center"
          disabled={!text.trim() || sendingMessage}
        >
          {sendingMessage ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <SendIcon className="w-5 h-5" />
          )}
        </button>
      </div>
      <MessageToolbar characterCount={text.length} onActionClick={handleToolbarAction} />

      <PriceLockModal
        isOpen={isPriceModalOpen}
        initialValue={priceLockValue}
        onClose={() => setIsPriceModalOpen(false)}
        onSave={(price) => {
          setPriceLockValue(price);
          setIsPriceModalOpen(false);
        }}
      />
      <MediaVaultModal
        isOpen={isMediaVaultOpen}
        onClose={() => setIsMediaVaultOpen(false)}
        onAdd={(items) => {
          setAttachedMedia(items);
          setIsMediaVaultOpen(false);
        }}
        accountId={vaultAccount?.id}
        accountPlatform={vaultAccount?.platform}
        accountUserId={vaultAccount?.platform_user_id}
      />
    </div>
  );
};