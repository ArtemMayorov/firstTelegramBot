const TelegramApi = require('node-telegram-bot-api')
const {againGameOptions, gameOptions} = require('./buttonOptions')
const token = '6929703629:AAH-W3ifu1JFjDpg6d-Q_FLmHH4MGsIR2qw';
const bot = new TelegramApi(token, {polling: true});
const chats = {}



const startGame = async (chatId) => {
    const randomNumber = Math.floor((Math.random() * 10))
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId,`Отгадывай!`, gameOptions)
};

const start = () => {


    bot.setMyCommands([
        {command: '/start', description: 'Первое приветствие'},
        {command: '/info', description: 'Информация'},
        {command: '/game', description: 'Запустить игру'},
    ])
    
    bot.on('message',    async (userMessage) => {
        const text = userMessage.text;
        const chatId = userMessage.chat.id
        if(text === '/start') {
            // await bot.sendSticker(chatId, 'https://avatars.cloudflare.steamstatic.com/b507fb8a40ac9ff4e344b89988ec222825e23a34_full.jpg')
            return bot.sendMessage(chatId,`Добро пожаловать!`)
        }
        if(text === '/info') {
            return bot.sendMessage(chatId,`Ты ${userMessage.from.first_name} ${userMessage.from.last_name || ''}`)
        }
        if(text === '/game') {
            await bot.sendMessage(chatId,`Я загадаю число от 0 до 9, а ты должен это число отгадать`)
            return startGame(chatId)
        }
        return bot.sendMessage(chatId,'Ты написал хуйню бро');
        // console.log(chatId, `message: ${JSON.stringify(userMessage,null,2)}`)
    });

    bot.on('callback_query', async msg => {
        const data = msg.data
        const chatId = msg.message.chat.id
        
        if(data === '/again') {
            return startGame(chatId)
        }
        
        if(data === chats[chatId]) {
            bot.sendMessage(chatId, `Бот загадал ${chats[chatId]}`)
            return bot.sendMessage(chatId, 'Ты угадал!')
        }else {
            await bot.sendMessage(chatId, 'Попробуй ещё раз!', againGameOptions)
        }
        // console.log('chats', JSON.stringify(chats, null,2))
        // console.log('chatId', chats[chatId])
    })

}


start();
