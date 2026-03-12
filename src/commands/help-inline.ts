import { InlineQuery, InlineQueryHandler, InlineQueryResultArticle } from "@/types/telegram";

const helpInlineHandler: InlineQueryHandler = {
    name: "help",
    execute: async (query: InlineQuery) => {
        const results: InlineQueryResultArticle[] = [
            {
                type: "article",
                id: "help_pm",
                title: "使用派蒙语录 (pm)",
                description: "输入 'pm' 获取派蒙经典语录。可选参数: zh, ja, en",
                input_message_content: {
                    message_text: "使用方法: @机器人 pm [语言]\n例如: @机器人 pm ja",
                },
            },
            {
                type: "article",
                id: "help_usage",
                title: "内联模式使用教程",
                description: "点击查看如何在任何聊天中使用此机器人",
                input_message_content: {
                    message_text: "如何在任何聊天中使用此机器人：\n1. 在输入框输入 @机器人名称\n2. 输入指令（如 pm）\n3. 从弹出的列表中选择结果",
                },
            }
        ];
        return results;
    },
};

export default helpInlineHandler;
