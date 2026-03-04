import { TelegramUpdate, CommandHandler } from "@/types/telegram";

const TELEGRAM_API_BASE = "https://api.telegram.org/bot";

/** getChatMember 返回的 ChatMember 结构（仅关心 status） */
interface ChatMemberResult {
    ok: boolean;
    result?: { status: string };
}

const settingCommand: CommandHandler = {
    name: "setting",
    description: "设置命令，仅管理员可访问示例设置界面",
    execute: async (update: TelegramUpdate) => {
        const message = update.message;
        const chatId = message?.chat.id;
        const chatType = message?.chat.type;
        const fromId = message?.from?.id;

        if (!chatId) {
            console.error("Chat ID not found in setting command.");
            return null;
        }

        // 如果是私聊，通常认为发起者就是“管理员”（或者可以根据需求增加白名单校验）
        // 但为了演示一致性，我们这里主要处理群组逻辑，私聊直接允许
        let isAdmin = chatType === "private";

        if (chatType === "group" || chatType === "supergroup") {
            if (fromId == null) {
                return {
                    method: "sendMessage",
                    chat_id: chatId,
                    text: "❌ 无法获取发送者信息。",
                    parse_mode: "HTML",
                };
            }

            const token = process.env.BOT_TOKEN;
            if (!token) {
                return {
                    method: "sendMessage",
                    chat_id: chatId,
                    text: "❌ 未配置 BOT_TOKEN 环境变量，无法校验权限。",
                    parse_mode: "HTML",
                };
            }

            // 调用 getChatMember 判断是否为群聊管理员
            const url = `${TELEGRAM_API_BASE}${token}/getChatMember?chat_id=${encodeURIComponent(String(chatId))}&user_id=${fromId}`;
            try {
                const res = await fetch(url);
                const data = (await res.json()) as ChatMemberResult;
                if (data?.ok && data.result) {
                    const status = data.result.status;
                    isAdmin = status === "creator" || status === "administrator";
                }
            } catch (e) {
                console.error("getChatMember failed:", e);
                return {
                    method: "sendMessage",
                    chat_id: chatId,
                    text: "❌ 校验管理员身份时发生错误，请稍后重试。",
                    parse_mode: "HTML",
                };
            }
        }

        if (!isAdmin) {
            return {
                method: "sendMessage",
                chat_id: chatId,
                text: `❌ <b>权限拒绝</b>\n只有管理员才能使用此命令。`,
                parse_mode: "HTML",
            };
        }

        // 管理员校验通过，弹出设置界面（使用 Inline Keyboard 配合 Web App）
        // 注意：这里的 url 需要是部署后的实际地址，或者是用户可以访问的地址
        // 作为一个样例，我们假设设置页面在 /setting
        const webAppUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'}/setting/example`;

        return {
            method: "sendMessage",
            chat_id: chatId,
            text: "⚙️ <b>控制面板</b>\n\n点击下方按钮进入设置界面。这是一个示例界面，用于演示管理员权限校验及 Web App 集成。",
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "打开设置界面",
                            web_app: {
                                url: webAppUrl
                            }
                        }
                    ]
                ]
            }
        };
    },
};

export default settingCommand;
