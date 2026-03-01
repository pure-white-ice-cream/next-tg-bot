import { TelegramUpdate, CommandHandler } from "@/types/telegram";
import { NextResponse } from "next/server";

class CommandDispatcher {
    private commands: Map<string, CommandHandler>;

    constructor() {
        this.commands = new Map<string, CommandHandler>();
    }

    registerCommand(command: CommandHandler) {
        this.commands.set(command.name.toLowerCase(), command);
    }

    async dispatch(update: TelegramUpdate): Promise<NextResponse | null> {
        if (!update.message || !update.message.text) {
            return null;
        }

        const text = update.message.text;
        const chatId = update.message.chat.id;

        // 检查是否是 Bot 命令
        const botCommandEntity = update.message.entities?.find(
            entity => entity.type === 'bot_command'
        );

        if (botCommandEntity) {
            let commandText = text.substring(
                botCommandEntity.offset + 1, // +1 to skip the '/' character
                botCommandEntity.offset + botCommandEntity.length
            );

            // 如果命令包含 @，说明是针对特定机器人的命令，如 /original@bot_username
            // 我们只需要前面的命令部分
            if (commandText.includes('@')) {
                commandText = commandText.split('@')[0];
            }
            const args = text.substring(botCommandEntity.offset + botCommandEntity.length).trim().split(/\s+/).filter(s => s.length > 0);

            const command = this.commands.get(commandText.toLowerCase());
            if (command) {
                const result = await command.execute(update, args);
                // 假设 execute 方法返回一个用于 NextResponse 的对象
                if (result) {
                    return NextResponse.json(result);
                }
            }
        }

        // 如果不是命令或者命令没有返回响应，可以返回默认响应或 null
        return null;
    }

    getRegisteredCommands(): CommandHandler[] {
        return Array.from(this.commands.values());
    }
}

export const commandDispatcher = new CommandDispatcher();
