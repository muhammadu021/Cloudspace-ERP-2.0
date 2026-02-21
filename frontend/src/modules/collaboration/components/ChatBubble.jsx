import React from 'react';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

const ChatBubble = ({ message, isOwnMessage, showAvatar = true, employee }) => {
  const formatMessageTime = (date) => {
    const messageDate = new Date(date);
    if (isToday(messageDate)) {
      return format(messageDate, 'HH:mm');
    } else if (isYesterday(messageDate)) {
      return `Yesterday ${format(messageDate, 'HH:mm')}`;
    } else {
      return format(messageDate, 'MMM dd, HH:mm');
    }
  };

  const getStatusIcon = () => {
    if (message.status === 'sending') {
      return <Clock className="w-4 h-4 text-gray-400" />;
    } else if (message.status === 'failed') {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    } else if (message.status === 'sent') {
      return <Check className="w-4 h-4 text-gray-400" />;
    } else if (message.status === 'delivered') {
      return <CheckCheck className="w-4 h-4 text-gray-400" />;
    } else if (message.status === 'read') {
      return <CheckCheck className="w-4 h-4 text-primary" />;
    }
    return null;
  };

  const renderAttachment = (attachment) => {
    if (attachment.type === 'image') {
      return (
        <img
          src={attachment.url}
          alt={attachment.name}
          className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => window.open(attachment.url, '_blank')}
        />
      );
    } else if (attachment.type === 'video') {
      return (
        <video
          src={attachment.url}
          controls
          className="max-w-xs rounded-lg"
        />
      );
    } else if (attachment.type === 'audio') {
      return (
        <audio
          src={attachment.url}
          controls
          className="max-w-xs"
        />
      );
    } else {
      return (
        <a
          href={attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all"
        >
          <div className="flex-1">
            <div className="font-medium">{attachment.name}</div>
            <div className="text-xs opacity-75">{attachment.size}</div>
          </div>
        </a>
      );
    }
  };

  // Get sender name
  const senderName = employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown User';
  const senderInitials = employee ? `${employee.first_name?.[0] || ''}${employee.last_name?.[0] || ''}` : 'U';

  return (
    <div className={`flex gap-2 mb-4 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar - ALWAYS show for received messages */}
      {showAvatar && !isOwnMessage && (
        <div className="flex-shrink-0">
          {employee?.avatar ? (
            <img
              src={employee.avatar}
              alt={senderName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
              {senderInitials}
            </div>
          )}
        </div>
      )}

      {/* Message bubble */}
      <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        {/* Sender name - ALWAYS show for received messages */}
        {!isOwnMessage && (
          <div className="text-xs font-semibold text-primary dark:text-blue-400 mb-1 px-2">
            {senderName}
          </div>
        )}

        {/* Reply preview */}
        {message.reply_to_message_id && message.replyToMessage && (
          <div className={`text-xs p-2 rounded-t-lg border-l-4 ${
            isOwnMessage
              ? 'bg-green-100 dark:bg-green-900 border-green-500'
              : 'bg-gray-100 dark:bg-gray-700 border-blue-500'
          }`}>
            <div className="font-semibold opacity-75">
              {message.replyToMessage.sender ? 
                `${message.replyToMessage.sender.first_name} ${message.replyToMessage.sender.last_name}` : 
                'Unknown User'}
            </div>
            <div className="opacity-60 truncate">
              {message.replyToMessage.content}
            </div>
          </div>
        )}

        {/* Main message bubble - CLEAR VISUAL DISTINCTION */}
        <div
          className={`rounded-lg px-4 py-2 shadow-md ${
            isOwnMessage
              ? 'bg-green-500 text-white rounded-tr-none'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-none border border-gray-200 dark:border-gray-700'
          } ${message.reply_to_message_id ? 'rounded-t-none' : ''}`}
        >
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mb-2 space-y-2">
              {message.attachments.map((attachment, index) => (
                <div key={index}>
                  {renderAttachment(attachment)}
                </div>
              ))}
            </div>
          )}

          {/* Message content */}
          {message.content && (
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
          )}

          {/* Message footer (time + status) */}
          <div className={`flex items-center gap-1 mt-1 text-xs ${
            isOwnMessage ? 'text-white text-opacity-70' : 'text-gray-500 dark:text-gray-400'
          }`}>
            <span>{formatMessageTime(message.created_at)}</span>
            {message.is_edited && (
              <span className="italic">• edited</span>
            )}
            {isOwnMessage && (
              <span className="ml-1">
                {getStatusIcon()}
              </span>
            )}
          </div>
        </div>

        {/* Reactions */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {Object.entries(message.reactions).map(([emoji, users]) => (
              users.length > 0 && (
                <div
                  key={emoji}
                  className="bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1 text-xs flex items-center gap-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title={users.map(u => u.name).join(', ')}
                >
                  <span>{emoji}</span>
                  <span className="text-gray-600 dark:text-gray-400">{users.length}</span>
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {/* Spacer for own messages to maintain alignment */}
      {showAvatar && isOwnMessage && (
        <div className="w-8 flex-shrink-0" />
      )}
    </div>
  );
};

export default ChatBubble;
