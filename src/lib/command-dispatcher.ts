import { TelegramUpdate, BotCommand } from "@/types/telegram";
import { NextResponse } from "next/server";

class CommandDispatcher {
    private commands: Map<string, BotCommand>;

    constructor() {
        this.commands = new Map<string, BotCommand>();
    }

    registerCommand(command: BotCommand) {
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
            const commandText = text.substring(
                botCommandEntity.offset + 1, // +1 to skip the '/' character
                botCommandEntity.offset + botCommandEntity.length
            );
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

    getRegisteredCommands(): BotCommand[] {
        return Array.from(this.commands.values());
    }
}

export const commandDispatcher = new CommandDispatcher();
