import { TelegramUpdate, CommandHandler } from "@/types/telegram";

interface ChatMemberResponse {
    ok: boolean;
    result?: {
        status: string;
    };
}

const submissionCommand: CommandHandler = {
    name: "t",
    description: "投稿指令：回复一条消息将其转发到频道",
    execute: async (update: TelegramUpdate) => {
        const message = update.message;
        if (!message || !message.reply_to_message) {
            return null;
        }

        const chatId = message.chat.id;
        const sourceGroupId = process.env.SOURCE_GROUP_ID;
        const targetChannelId = process.env.TARGET_CHANNEL_ID;

        // 1. 验证来源群组
        if (sourceGroupId && chatId.toString() !== sourceGroupId) {
            return {
                method: "sendMessage",
                chat_id: chatId,
                text: `❌ 该群组未配置到环境变量 SOURCE_GROUP_ID 中，无法使用投稿指令。`,
                reply_to_message_id: message.message_id
            };
        }

        // 2. 验证管理员权限
        // 注意：在 Webhook 模式下，直接获取管理员列表需要调用 getChatMember
        // 这里我们先假设调用者是管理员，或者通过 Telegram API 验证
        // 为了简化，我们可以在这里发起一个 getChatMember 请求
        const botToken = process.env.BOT_TOKEN;
        if (!botToken) {
            console.error("BOT_TOKEN is not set");
            return {
                method: "sendMessage",
                chat_id: chatId,
                text: "❌ 未配置 BOT_TOKEN 环境变量。",
                reply_to_message_id: message.message_id
            };
        }

        const fromId = message.from?.id;
        if (!fromId) return null;

        // 2. 验证管理员权限
        try {
            const memberResponse = await fetch(`https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${chatId}&user_id=${fromId}`);
            const memberData = (await memberResponse.json()) as ChatMemberResponse;

            if (!memberData.ok || !memberData.result || !['administrator', 'creator'].includes(memberData.result.status)) {
                return {
                    method: "sendMessage",
                    chat_id: chatId,
                    text: "❌ 只有管理员可以使用此指令。",
                    reply_to_message_id: message.message_id
                };
            }
        } catch (error) {
            console.error("Failed to verify admin status:", error);
            return {
                method: "sendMessage",
                chat_id: chatId,
                text: "❌ 验证管理员权限时出错。",
                reply_to_message_id: message.message_id
            };
        }

        // 3. 处理转发逻辑
        const repliedMsg = message.reply_to_message;
        const submitter = repliedMsg.from;
        const submitterName = submitter ? (submitter.username ? `@${submitter.username}` : `${submitter.first_name} ${submitter.last_name || ""}`.trim()) : "未知";
        const creditText = `\n\n👤 投稿人: ${submitterName}`;

        if (!targetChannelId) {
            return {
                method: "sendMessage",
                chat_id: chatId,
                text: "❌ 未配置目标频道 ID (TARGET_CHANNEL_ID)。",
                reply_to_message_id: message.message_id
            };
        }

        // 根据消息类型转发
        if (repliedMsg.text) {
            return {
                method: "sendMessage",
                chat_id: targetChannelId,
                text: repliedMsg.text + creditText,
                parse_mode: "HTML"
            };
        } else if (repliedMsg.photo && repliedMsg.photo.length > 0) {
            const photo = repliedMsg.photo[repliedMsg.photo.length - 1]; // 获取最高分辨率
            return {
                method: "sendPhoto",
                chat_id: targetChannelId,
                photo: photo.file_id,
                caption: (repliedMsg.caption || "") + creditText,
                parse_mode: "HTML"
            };
        } else if (repliedMsg.video) {
            return {
                method: "sendVideo",
                chat_id: targetChannelId,
                video: repliedMsg.video.file_id,
                caption: (repliedMsg.caption || "") + creditText,
                parse_mode: "HTML"
            };
        }

        return {
            method: "sendMessage",
            chat_id: chatId,
            text: "❌ 不支持的消息类型（仅支持文本、图片和视频）。",
            reply_to_message_id: message.message_id
        };
    },
};

export default submissionCommand;
