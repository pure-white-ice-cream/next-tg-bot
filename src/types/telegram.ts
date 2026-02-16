/**
 * 定义 Telegram 消息中的基础对象
 */
export interface Chat {
    id: number;
    type: 'private' | 'group' | 'supergroup' | 'channel';
    username?: string;
    first_name?: string;
    last_name?: string;
    title?: string;
}

export interface User {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
}

export interface Message {
    message_id: number;
    from?: User;
    sender_chat?: Chat;
    date: number;
    chat: Chat;
    text?: string;
    entities?: MessageEntity[];
    // 可以根据需要添加更多字段，例如 photo, audio, document, video, sticker, etc.
}

export interface MessageEntity {
    type: 'mention' | 'hashtag' | 'cashtag' | 'bot_command' | 'url' | 'email' | 'bold' | 'italic' | 'code' | 'pre' | 'text_link' | 'text_mention';
    offset: number;
    length: number;
    url?: string;
    user?: User;
    language?: string;
}

/**
 * 核心：Telegram Webhook 推送的根对象
 */
export interface TelegramUpdate {
    update_id: number;
    message?: Message;
    edited_message?: Message;
    channel_post?: Message;
    edited_channel_post?: Message;
    callback_query?: CallbackQuery;
    // 可以根据需要添加更多类型的更新，例如 inline_query, chosen_inline_result, shipping_query, pre_checkout_query, poll, poll_answer, my_chat_member, chat_member, chat_join_request, etc.
}

export interface CallbackQuery {
    id: string;
    from: User;
    message?: Message;
    inline_message_id?: string;
    chat_instance: string;
    data?: string;
    game_short_name?: string;
}

/**
 * Webhook 的详细状态信息
 */
export interface WebhookInfo {
    url: string;
    has_custom_certificate: boolean;
    pending_update_count: number;
    ip_address?: string;
    last_error_date?: number;
    last_error_message?: string;
    last_synchronization_error_date?: number;
    max_connections?: number;
    allowed_updates?: string[];
}

/**
 * 定义 BotCommand 接口，用于 Telegram API 交互
 */
export interface BotCommand {
    command: string; // 指令名称，例如 'start', 'info'
    description: string; // 指令描述
}

/**
 * 定义指令处理器接口，用于代码逻辑拆分
 */
export interface CommandHandler {
    name: string;
    description: string;
    execute: (update: TelegramUpdate, args?: string[]) => Promise<any>;
}
