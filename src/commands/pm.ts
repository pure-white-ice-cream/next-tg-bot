import { TelegramUpdate, CommandHandler } from "@/types/telegram";

const PaimonQuotes = [
    {"zh": "前面的区域，以后再来探索吧。", "ja": "この先のエリアは、また今度探検しようね。", "en": "Let's explore the area ahead later."},
    {"zh": "「欸嘿」是什么意思啊！", "ja": "「えへっ」ってどういう意味なの！？", "en": "What does 'ehe~' even mean!?"},
    {"zh": "每个惹我生气的人我都要给他取个难听的绰号！", "ja": "パイモンを怒らせた人には、みんな変なあだ名をつけてやるんだから！", "en": "Anyone who makes Paimon angry gets a weird nickname!"},
    {"zh": "喂，你不会在拿派蒙寻开心吧！", "ja": "ねぇ、パイモンで遊んでるんじゃないでしょうね！", "en": "Hey! You’re not making fun of Paimon, are you!?"},
    {"zh": "派蒙不是食物！", "ja": "パイモンは食べ物じゃないよ！", "en": "Paimon is not emergency food!"},
    {"zh": "欸？你要吃派蒙？！不可以！", "ja": "えっ？パイモンを食べるつもり！？だめだよ！", "en": "Eh? You want to eat Paimon?! No way!"},
    {"zh": "这个箱子里会不会有超稀有的宝藏？派蒙先打开看看！", "ja": "この箱の中、超レアなお宝があるかも！パイモンが先に開けてみるね！", "en": "Maybe there’s something super rare in this chest! Paimon will open it first!"},
    {"zh": "哼，派蒙才不是紧急食品呢！", "ja": "ふん、パイモンは非常食なんかじゃないもん！", "en": "Hmph! Paimon is *not* emergency food!"},
    {"zh": "旅行者～你是不是又偷偷乱花摩拉了？", "ja": "旅人～またこっそりモラを使っちゃったんでしょ？", "en": "Traveler~ Did you secretly spend all your Mora again?"},
    {"zh": "派蒙感觉，这次的冒险，肯定有不一样的收获！", "ja": "今回の冒険は、きっと特別なものになる予感！", "en": "Paimon has a feeling this adventure will be special!"},
    {"zh": "哇哦～这风景，派蒙要多拍几张留作纪念！", "ja": "わあ～この景色！写真をいっぱい撮って記念にしよう！", "en": "Wow~ What a view! Paimon’s taking a few pictures for memories!"},
    {"zh": "旅行者，派蒙觉得你看起来很可疑哦～", "ja": "旅人、なんか怪しいよ～", "en": "Traveler, you look kinda suspicious~"},
    {"zh": "派蒙可是超级可靠的向导呢！", "ja": "パイモンはとっても頼りになるガイドなんだから！", "en": "Paimon is a super reliable guide, you know!"},
    {"zh": "派蒙觉得，这种时候就该吃点甜甜花酿鸡！", "ja": "こういう時こそ、スイートフラワーのチキンを食べるべきだね！", "en": "This calls for some Sweet Madame!"},
    {"zh": "呼……派蒙累了，要休息一下！", "ja": "ふぅ……パイモン、ちょっと休憩するね。", "en": "Phew… Paimon’s tired. Time for a little rest!"},
    {"zh": "派蒙才不是贪吃鬼！只是刚好饿了而已！", "ja": "パイモンは食いしん坊じゃないよ！ちょっとお腹が空いただけ！", "en": "Paimon’s not a glutton! Just… a little hungry!"},
    {"zh": "派蒙听说璃月的美食特别多，我们快去看看吧！", "ja": "璃月の料理はすっごく美味しいって聞いたよ！早く行こう！", "en": "Paimon heard Liyue has amazing food! Let’s go check it out!"},
    {"zh": "欸嘿～派蒙是不是超厉害？", "ja": "えへへ～パイモンってすごいでしょ？", "en": "Ehehe~ Paimon’s amazing, right?"},
    {"zh": "派蒙要给这次冒险打满分！", "ja": "今回の冒険、満点だね！", "en": "Paimon gives this adventure a full score!"},
    {"zh": "旅行者，派蒙会一直陪着你的！", "ja": "旅人、パイモンはずっと一緒にいるよ！", "en": "Traveler, Paimon will always be with you!"}
];

const pmCommand: CommandHandler = {
    name: "pm",
    description: "随机回复一条派蒙语录",
    execute: async (update: TelegramUpdate, args?: string[]) => {
        const chatId = update.message?.chat.id;
        if (!chatId) return null;

        // 默认语言为中文
        let lang: "zh" | "ja" | "en" = "zh";
        
        if (args && args.length > 0) {
            const requestedLang = args[0].toLowerCase();
            if (requestedLang === "ja" || requestedLang === "jp") {
                lang = "ja";
            } else if (requestedLang === "en") {
                lang = "en";
            } else if (requestedLang === "zh" || requestedLang === "cn") {
                lang = "zh";
            }
        }

        const randomIndex = Math.floor(Math.random() * PaimonQuotes.length);
        const quote = PaimonQuotes[randomIndex][lang];

        return {
            method: "sendMessage",
            chat_id: chatId,
            text: quote,
        };
    },
};

export default pmCommand;
