import { TelegramUpdate, CommandHandler } from "@/types/telegram";

const TELEGRAM_API_BASE = "https://api.telegram.org/bot";

/** getChatMember 返回的 ChatMember 结构（仅关心 status） */
interface ChatMemberResult {
	ok: boolean;
	result?: { status: string };
}

const adminCommand: CommandHandler = {
	name: "admin",
	description: "管理员命令，校验当前群聊管理员身份（仅群组/超级群组有效）",
	execute: async (update: TelegramUpdate) => {
		const message = update.message;
		const chatId = message?.chat.id;
		const chatType = message?.chat.type;
		const fromId = message?.from?.id;

		if (!chatId) {
			console.error("Chat ID not found in admin command.");
			return null;
		}

		// 私聊：仅返回命令描述
		if (chatType === "private") {
			const desc = `
<b>📖 /admin 命令说明</b>
--------------------------
<b>功能：</b>
在群组或超级群组中，用于校验您是否为该群聊的<u>管理员</u>（群主或管理员）。

<b>使用方式：</b>
• 请将机器人拉入群组，并在<u>群聊中</u>发送 <code>/admin</code>
• 机器人会通过 Telegram 的 getChatMember 接口判断您是否为该群管理员

<b>注意：</b>
• 本命令仅在群组/超级群组中有效
• 在私聊中使用将只显示本说明
			`.trim();

			return {
				method: "sendMessage",
				chat_id: chatId,
				text: desc,
				parse_mode: "HTML",
			};
		}

		// 非群组/超级群组（如 channel）不校验
		if (chatType !== "group" && chatType !== "supergroup") {
			return {
				method: "sendMessage",
				chat_id: chatId,
				text: "❌ /admin 仅支持在群组或超级群组中使用。",
				parse_mode: "HTML",
			};
		}

		if (fromId == null) {
			return {
				method: "sendMessage",
				chat_id: chatId,
				text: "❌ 无法获取发送者信息。",
				parse_mode: "HTML",
			};
		}

		// 从 process.env.test.BOT_TOKEN 获取环境变量
		const token = process.env.BOT_TOKEN;

		if (!token) {
			return {
				method: "sendMessage",
				chat_id: chatId,
				text: "❌ 未配置 BOT_TOKEN 环境变量。",
				parse_mode: "HTML",
			};
		}

		// 调用 getChatMember 判断是否为群聊管理员
		const url = `${TELEGRAM_API_BASE}${token}/getChatMember?chat_id=${encodeURIComponent(String(chatId))}&user_id=${fromId}`;
		let isAdmin = false;
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

		if (isAdmin) {
			return {
				method: "sendMessage",
				chat_id: chatId,
				text: "✅ <b>身份验证成功</b>\n您是本群的管理员。",
				parse_mode: "HTML",
			};
		}

		return {
			method: "sendMessage",
			chat_id: chatId,
			text: `❌ <b>权限拒绝</b>\n您的 ID (<code>${fromId}</code>) 不是本群管理员。`,
			parse_mode: "HTML",
		};
	},
};

export default adminCommand;
