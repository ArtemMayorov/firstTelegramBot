const TelegramApi = require("node-telegram-bot-api");
const { againGameOptions, gameOptions } = require("./buttonOptions");
const token = "6929703629:AAH-W3ifu1JFjDpg6d-Q_FLmHH4MGsIR2qw";
const sequelize = require("./db");
const UserModel = require("./model");
const bot = new TelegramApi(token, { polling: true });

const chats = {};

const startGame = async (chatId) => {
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await bot.sendMessage(chatId, `Отгадывай!`, gameOptions);
};

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  } catch (e) {
    console.log("ошибка", e);
  }
  try {
    bot.setMyCommands([
      { command: "/start", description: "Первое приветствие" },
      { command: "/info", description: "Информация" },
      { command: "/game", description: "Запустить игру" },
      { command: "/stop", description: "Если что-то пошло не так" },
    ]);

    bot.on("message", async (userMessage) => {
      const text = userMessage.text;
      const chatId = userMessage.chat.id;
      if (text === "/start") {
          const user = await UserModel.findOne({ chatId });
        console.log('useeeeer', JSON.stringify(user, null, 2))
          await bot.sendMessage(chatId, `Добро пожаловать!`);
        //   await bot.sendSticker(chatId, 'https://avatars.cloudflare.steamstatic.com/b507fb8a40ac9ff4e344b89988ec222825e23a34_full.jpg')
          if(!user?.chatId) {
              await UserModel.create({ chatId });
          }
          return null
      }
      if (text === "/info") {
        const user = await UserModel.findOne({ chatId });
        return bot.sendMessage(
          chatId,
          `Ты ${userMessage.from.first_name} ${
            userMessage.from.last_name || ""
          } в игре у тебя правильных ${user.right}  и неправильных ${
            user.wrong
          }`
        );
      }
      if (text === "/game") {
        await bot.sendMessage(
          chatId,
          `Я загадаю число от 0 до 9, а ты должен это число отгадать`
        );

        return startGame(chatId);
      }
      if (text === "/stop") {
      const user = await UserModel.findOne({ chatId });
      if (user) {
        // Сбрасываем значения
        user.right = 0;
        user.wrong = 0;
        // Сохраняем изменения в базу данных
        await user.save();
      }

      return bot.sendMessage(chatId, "Я всё удалил к чертям собачьим");

    }
      return bot.sendMessage(chatId, "Ты написал хуйню бро");
      // console.log(chatId, `message: ${JSON.stringify(userMessage,null,2)}`)
    });

    bot.on("callback_query", async (msg) => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        const user = await UserModel.findOne({ chatId });

      if (data === "/again") {
        return startGame(chatId);
      }


      if (data == chats[chatId]) {
        user.right += 1
        bot.sendMessage(chatId, `Бот загадал ${chats[chatId]}`);

        await bot.sendMessage(chatId, "Ты угадал!");
      } else {
        user.wrong += 1;
        await bot.sendMessage(chatId, "Попробуй ещё раз!", againGameOptions);
      }
     await user.save()
    });
  } catch (e) {
    console.log("ошибка:", e);
    await bot.sendMessage(chatId, "Ошибка:", e);
  }
};

start();
