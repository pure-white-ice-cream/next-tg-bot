import { TelegramUpdate, CommandHandler } from "@/types/telegram";

const infoCommand: CommandHandler = {
    name: "info",
    description: "获取用户信息或机器人信息",
    execute: async (update: TelegramUpdate) => {
        const message = update.message;
        const chatId = message?.chat.id;
        const fromId = message?.from?.id;
        const messageId = message?.message_id;
        const chatType = message?.chat.type;

        if (!chatId) {
            console.error("Chat ID not found in info command.");
            return null;
        }

        // 情况1：引用了某个人的消息
        if (message?.reply_to_message && message.reply_to_message.from) {
            const repliedUser = message.reply_to_message.from;
            const infoText = `
<b>👤 用户信息卡</b>
--------------------------
<b>用户 ID:</b> <code>${repliedUser.id}</code>
<b>用户名:</b> ${repliedUser.username ? `@${repliedUser.username}` : "N/A"}
<b>名字:</b> ${repliedUser.first_name || "N/A"}
<b>姓氏:</b> ${repliedUser.last_name || "N/A"}
<b>是否为机器人:</b> ${repliedUser.is_bot ? "是 🤖" : "否"}
<b>语言代码:</b> ${repliedUser.language_code || "N/A"}
            `;

            return {
                method: "sendMessage",
                chat_id: chatId,
                text: infoText,
                parse_mode: "HTML",
                reply_to_message_id: messageId
            };
        }

        // 情况2：私聊机器人
        if (chatType === "private") {
            const infoText = `
<b>👤 您的个人信息</b>
--------------------------
<b>用户 ID:</b> <code>${fromId || "N/A"}</code>
<b>用户名:</b> ${message?.from?.username ? `@${message.from.username}` : "N/A"}
<b>名字:</b> ${message?.from?.first_name || "N/A"}
<b>姓氏:</b> ${message?.from?.last_name || "N/A"}
<b>语言代码:</b> ${message?.from?.language_code || "N/A"}
            `;

            return {
                method: "sendMessage",
                chat_id: chatId,
                text: infoText,
                parse_mode: "HTML"
            };
        }

        // 情况3：无引用且非私聊 - 显示使用教程
        const tutorialText = `
<b>📖 /info 指令使用教程</b>
--------------------------
<b>功能说明：</b>
此指令可用于查看用户信息。

<b>使用方法：</b>

<b>1️⃣ 查看他人信息</b>
   • 在群组中引用（回复）某个人的消息
   • 然后输入 <code>/info</code>
   • 机器人将显示被引用者的信息

<b>2️⃣ 查看自己的信息</b>
   • 在私聊中输入 <code>/info</code>
   • 机器人将显示您的个人信息

<b>3️⃣ 查看当前聊天信息</b>
   • 直接输入 <code>/info</code>（无引用）
   • 显示本条消息的基本信息

<b>📌 示例：</b>
   • 群组中：回复某条消息 → 输入 <code>/info</code>
   • 私聊中：直接输入 <code>/info</code>
        `;

        return {
            method: "sendMessage",
            chat_id: chatId,
            text: tutorialText,
            parse_mode: "HTML"
        };
    },
};

export default infoCommand;
