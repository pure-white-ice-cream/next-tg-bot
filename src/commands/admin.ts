import { TelegramUpdate, CommandHandler } from "@/types/telegram";

const adminCommand: CommandHandler = {
    name: "admin",
    description: "管理员命令，校验管理员身份",
    execute: async (update: TelegramUpdate) => {
        const message = update.message;
        const chatId = message?.chat.id;
        const fromId = message?.from?.id;

        if (!chatId) {
            console.error("Chat ID not found in admin command.");
            return null;
        }

        // 从环境变量读取 ADMIN_ID
        // 在 Cloudflare Workers 中，环境变量可以通过 process.env 访问（如果配置了兼容性）
        // 或者通过 getCloudflareContext() 获取。
        // 根据项目结构，这里尝试从 process.env 读取。
        const adminIdStr = process.env.ADMIN_ID;
        
        if (!adminIdStr) {
            return {
                method: "sendMessage",
                chat_id: chatId,
                text: "❌ 未配置管理员 ID 环境变量 (ADMIN_ID)。",
                parse_mode: "HTML"
            };
        }

        const isAdmin = fromId?.toString() === adminIdStr.trim();

        if (isAdmin) {
            return {
                method: "sendMessage",
                chat_id: chatId,
                text: "✅ <b>身份验证成功</b>\n您是系统管理员。",
                parse_mode: "HTML"
            };
        } else {
            return {
                method: "sendMessage",
                chat_id: chatId,
                text: `❌ <b>权限拒绝</b>\n您的 ID (<code>${fromId}</code>) 不是管理员。`,
                parse_mode: "HTML"
            };
        }
    },
};

export default adminCommand;
