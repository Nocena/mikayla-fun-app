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
import { EmojiPicker } from './EmojiPicker';
import { useSocialAccounts } from '../../contexts/SocialAccountsContext';
import { useWebviews } from '../../contexts/WebviewContext';
import { filterAllowedHeaders } from '../../services/onlyfansChatsService';
import { createSignedUploadUrlScript, convertUploadedFileScript, uploadFileToS3 } from '../../services/onlyfansUploadService';
import type { SocialAccount } from '../../lib/supabase';

interface MessageInputProps {
  onSendMessage: (
    content: string,
    sender: 'model' | 'ai',
    options?: {
      price?: number;
      lockedText?: boolean;
      attachments?: Array<{
        type: 'uploaded' | 'vault';
        vaultImageId?: string;
        uploadResult?: {
          processId: string;
          host: string;
          extra: string;
          sourceUrl?: string;
        };
        file?: {
          name: string;
        };
      }>;
    }
  ) => void;
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
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevSendingRef = useRef(false);
  const { accounts } = useSocialAccounts();
  const { webviewRefs } = useWebviews();

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

  // Clear text, attachments, and price when sending completes (sendingMessage changes from true to false)
  useEffect(() => {
    if (prevSendingRef.current && !sendingMessage) {
      // Was sending, now not sending - clear the text, attachments, and price
      setText('');
      setAttachedFiles([]);
      setPriceLockValue(null);
    }
    prevSendingRef.current = sendingMessage;
  }, [sendingMessage]);

  const handleSend = () => {
    if ((text.trim() || attachedFiles.length > 0) && !sendingMessage) {
      // Format attachments for sending
      const formattedAttachments = attachedFiles
        .filter((file) => {
          // Only include completed uploads or vault media
          if (file.type === 'vault') return true;
          if (file.type === 'uploaded' && file.uploadStatus === 'completed' && file.uploadResult) {
            return true;
          }
          return false;
        })
        .map((file) => {
          if (file.type === 'vault') {
            return {
              type: 'vault' as const,
              vaultImageId: file.vaultImageId,
            };
          } else {
            return {
              type: 'uploaded' as const,
              uploadResult: file.uploadResult,
              file: file.file ? { name: file.file.name } : undefined,
            };
          }
        });

      onSendMessage(text, 'model', {
        price: priceLockValue && priceLockValue > 0 ? priceLockValue : undefined,
        lockedText: priceLockValue && priceLockValue > 0 ? true : undefined,
        attachments: formattedAttachments.length > 0 ? formattedAttachments : undefined,
      });
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
    if (actionKey === 'emoji') {
      setIsEmojiPickerOpen((prev) => !prev);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = text.substring(0, start) + emoji + text.substring(end);
      setText(newText);
      
      // Set cursor position after the inserted emoji
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      setText((prev) => prev + emoji);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const supportedFiles = files.filter(isSupportedFile);

    const newAttachments: AttachedFile[] = supportedFiles.map((file) => {
      const id = `upload-${Date.now()}-${Math.random()}`;
      const previewUrl = URL.createObjectURL(file);
      return {
        id,
        type: 'uploaded' as const,
        file,
        previewUrl,
        uploadStatus: 'pending' as const,
      };
    });

    setAttachedFiles((prev) => [...prev, ...newAttachments]);

    // Start upload for new files
    newAttachments.forEach((attachment) => {
      uploadFile(attachment);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (attachment: AttachedFile) => {
    // Only upload files, not vault media
    if (attachment.type === 'vault' || !attachment.file) {
      return;
    }

    if (!vaultAccount?.id || !vaultAccount?.platform_user_id) {
      updateFileStatus(attachment.id, 'error', 0, 'No OnlyFans account available');
      return;
    }

    const accountId = vaultAccount.id;
    const userId = vaultAccount.platform_user_id;
    const partitionName = `persist:${vaultAccount.platform.toLowerCase()}-${accountId}`;

    try {
      // Update status to uploading
      updateFileStatus(attachment.id, 'uploading', 10);

      // Step 1: Create signed upload URL
      const headers = await window.electronAPI.headers.get(partitionName);
      const allowedHeaders = filterAllowedHeaders(
        headers.success && headers.data ? headers.data : {},
      );
      if (Object.keys(allowedHeaders).length === 0) {
        throw new Error('Missing authentication headers');
      }

      const webviewRef = webviewRefs.current[accountId];
      if (!webviewRef) {
        throw new Error('OnlyFans browser session is not ready');
      }

      const createScript = createSignedUploadUrlScript(
        allowedHeaders,
        userId,
        attachment.file.type,
        attachment.file.name,
      );
      const createResponse = await webviewRef.executeScript(createScript);

      if (!createResponse?.ok || !createResponse.data) {
        throw new Error('Failed to create upload URL');
      }

      const { putUrl, getUrl } = createResponse.data;
      const key = createResponse.key || `upload/${Date.now()}/${attachment.file.name}`;

      updateFileStatus(attachment.id, 'uploading', 30);

      // Step 2: Upload file to S3
      await uploadFileToS3(putUrl, attachment.file);
      updateFileStatus(attachment.id, 'converting', 60);

      console.log("getUrl", getUrl)

      // Step 3: Convert file
      const convertScript = convertUploadedFileScript(getUrl, key, attachment.file.name, userId);
      const convertResponse = await webviewRef.executeScript(convertScript);

      console.log("convertScript", convertScript, convertResponse)

      if (!convertResponse?.ok || !convertResponse.data) {
        throw new Error('Failed to convert file');
      }

      const convertData = convertResponse.data;
      updateFileStatus(
        attachment.id,
        'completed',
        100,
        undefined,
        {
          sourceUrl: convertData.sourceUrl,
          processId: convertData.processId,
          extra: convertData.extra,
          host: convertData.host,
        },
      );
    } catch (error) {
      updateFileStatus(
        attachment.id,
        'error',
        0,
        error instanceof Error ? error.message : 'Upload failed',
      );
    }
  };

  const updateFileStatus = (
    id: string,
    status: AttachedFile['uploadStatus'],
    progress?: number,
    error?: string,
    result?: AttachedFile['uploadResult'],
  ) => {
    setAttachedFiles((prev) =>
      prev.map((file) =>
        file.id === id
          ? {
              ...file,
              uploadStatus: status,
              uploadProgress: progress,
              uploadError: error,
              uploadResult: result,
            }
          : file,
      ),
    );
  };

  const handleRemoveFile = (id: string) => {
    setAttachedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove && fileToRemove.type === 'uploaded' && fileToRemove.previewUrl) {
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
        if (file.type === 'uploaded' && file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
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
          ref={textareaRef}
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
      {isEmojiPickerOpen && (
        <EmojiPicker
          onEmojiSelect={handleEmojiSelect}
          onClose={() => setIsEmojiPickerOpen(false)}
        />
      )}
      <MessageToolbar
        characterCount={text.length}
        onActionClick={handleToolbarAction}
        activeAction={isEmojiPickerOpen ? 'emoji' : undefined}
      />

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
          const vaultAttachments: AttachedFile[] = items.map((item) => ({
            id: `vault-${item.id}-${Date.now()}`,
            type: 'vault' as const,
            vaultImageId: item.id,
            thumbnailUrl: item.thumbnailUrl,
          }));
          setAttachedFiles((prev) => [...prev, ...vaultAttachments]);
          setIsMediaVaultOpen(false);
        }}
        accountId={vaultAccount?.id}
        accountPlatform={vaultAccount?.platform}
        accountUserId={vaultAccount?.platform_user_id}
      />
    </div>
  );
};