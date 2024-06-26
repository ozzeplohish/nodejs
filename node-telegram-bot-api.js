const TelegramBot = require('node-telegram-bot-api');
const token = '7070689688:AAG-xYrd5jXEL4LJ7CHSpJDZ3z5K27s6u24';
const bot = new TelegramBot(token, { polling: true });
const fs = require('fs');
const express = require('express');
const app = express();
function  createMainMenuKeyboard() {
    return {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Главное меню', callback_data: 'mainMenu' }
                ]
            ]
        }
    };
}
app.get('/myTransactions/:userId', (req, res) => {
    const userId = req.params.userId;
    const transactions = [];

    fs.readFile('transactions.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Ошибка чтения файла транзакций:', err);
            return res.status(500).send('Внутренняя ошибка сервера');
        }

        const lines = data.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.startsWith(`ID пользователя: ${userId}`)) {
                const transactionNumber = line.split('Номер транзакции: ')[1];
                transactions.push(transactionNumber);
            }
        }

        res.json(transactions);
    });
});

app.listen(3000, () => {
    console.log('Сервер работает на порту 3000');
});


bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.username;

    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Главное меню', callback_data: 'useButton' }
                ]
            ]
        }
    };

    bot.sendMessage(chatId, `Привет, ${username} 🙋🏼‍♂️!\n\nЯ твой надеждный посредник сделок купли-продажи NFT и токенов $NOT. 🌃 `, options);
});



bot.onText(/\/mainMenu/, (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.username;

    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'NFT', callback_data: 'nft' }
                ],
                [
                    { text: '$NOT (скоро появится)', callback_data: 'notcoin' }
                ],
                [
                    { text: 'Поддержка', url: 'https://t.me/ggmarket_support' }
                ],
                [
                    { text: 'Как пользоваться?', callback_data: 'button1' }
                ],
                [
                    { text: 'Мои сделки', callback_data: 'myTransactions' }
                ],
                [
                    { text: 'Реферальная программа', callback_data: 'referral' }
                ]
            ]
        }
    };

    bot.sendMessage(chatId, 'Вы вернулись в главное меню.\n\nВыберите действие:', options);
});

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data === 'mainMenu') {
        const options = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: 'NFT', callback_data: 'nft' }
                    ],
                    [
                        { text: '$NOT (скоро появится)', callback_data: 'notcoin' }
                    ],
                    [
                        { text: 'Поддержка', url: 'https://t.me/ggmarket_support' }
                    ],
                    [
                        { text: 'Как пользоваться?', callback_data: 'button1' }
                    ],
                    [
                        { text: 'Мои сделки', callback_data: 'myTransactions' }
                    ],
                    [
                        { text: 'Реферальная программа', callback_data: 'referral' }
                    ]
                ]
            }
        };

        bot.sendMessage(chatId, 'Вы вернулись в главное меню\n\nВыберите действие:', options);
    }
});
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data === 'myTransactions') {
        const userId = chatId; // Используем chatId пользователя как userId

        // Читаем файл с транзакциями
        fs.readFile('transactions.txt', 'utf8', (err, data) => {
            if (err) {
                console.error('Ошибка чтения файла транзакций:', err);
                return bot.sendMessage(chatId, 'Произошла ошибка. Попробуйте еще раз позже.');
            }

            const transactions = [];
            const lines = data.split('\n');

            // Ищем сделки, привязанные к указанному userId
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.startsWith(`ID пользователя: ${userId}`)) {
                    const transactionNumber = line.split('Номер транзакции: ')[1];
                    const transactionStatus = line.split('Статус: ')[1];
                    const transaction = `№${transactionNumber} (Статус: ожидание проверки...)`;
                    transactions.push(transaction);
                }
            }

            // Создаем клавиатуру с кнопкой "Назад"
            const keyboard = {
                inline_keyboard: [
                    [{ text: 'Назад', callback_data: 'mainMenu' }]
                ]
            };

            // Отправляем сообщение с сделками и клавиатурой
            if (transactions.length > 0) {
                bot.sendMessage(chatId, `Ваши сделки:\n\n${transactions.join('\n')}`, { reply_markup: keyboard });
            } else {
                bot.sendMessage(chatId, 'У вас пока нет сделок.', { reply_markup: keyboard });
            }

            // Удаляем данные из файла через минуту
            setTimeout(() => {
                fs.writeFile('transactions.txt', '', (err) => {
                    if (err) {
                        console.error('Ошибка удаления данных из файла транзакций:', err);
                        return;
                    }
                    console.log('Данные успешно удалены из файла транзакций.');
                });
            }, 1500000); // Задержка в 60000 миллисекунд (1 минута)
        });
    }
});
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const buttonPressed = query.data;

    switch (buttonPressed) {
        case 'button1':
            bot.sendMessage(chatId, 'Я работаю следующим образом: \n\n1. С моей помощью вы вступаете в сделку с покупателем или продавцом, в зависимости от ваших целей. 🔁 \n\n2. Сделки осуществляются в NFT и NOTCOIN сферах, а конкретно, покупка и продажа NFT и токенов $NOT.💼 \n\n3. Операции проходят без взятия комиссии от общей стоимости NFT и токенов $NOT, как при покупке так и при продаже.📄 \n\n4. Я гарантирую вам надёжность сделки и исключу всевозможные попытки мошенничества, так как являюсь автоматизированным посредником этих операций. 🔐\n\nP.s: Я являюсь посредником сделки, с целью обезопасить обоих её участников и при этом ничего не потерять. В случае попытки обмана с одной из сторон сделки, она аннулируется, честный участник ничего не потеряет, а потенциальный мошенник будет наказан.🔒 \n\nЧтобы ознакомится с последовательностью проведения сделок, выберите "NFT" или "$NOT", в зависимости от того, что вас интересует.💁🏼‍♂️', {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: 'Вернуться в главное меню', callback_data: 'mainMenu' }
                        ]
                    ]
                }
            });
            break;

        case 'nft':
            const options = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: 'NotcoinPre-Market☑️', callback_data: 'voucher' }
                        ],
                        [
                            { text: 'Назад', callback_data: 'mainMenu' }
                        ]
                    ]
                }
            };
            bot.sendMessage(chatId, 'Выберите коллекцию NFT которая вас интересует:', options);
            break;
        case 'voucher':
            const voucherOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: 'Покупка NFT', callback_data: 'button2' },
                            { text: 'Продажа NFT', callback_data: 'button3' }
                        ],
                        [
                            { text: 'Назад', callback_data: 'nft' }
                        ]
                    ]
                }
            };

            const voucherText = 'Продавайте и покупайте *10,000 $NOT Voucher* надёжно и без комиссии:';
            const photoUrl = 'c7faeee9970a5521.png'; // URL картинки

            bot.sendPhoto(chatId, photoUrl, { caption: voucherText, parse_mode: 'Markdown', reply_markup: voucherOptions.reply_markup });

            break;
        case 'notcoin':
            const notcoinOptions = { reply_markup: {
                    inline_keyboard: [

                        [
                            { text: 'Главное меню', callback_data: 'mainMenu' }
                        ]
                    ]
                }  };
            const notcoinText = 'Ожидаем листинга $NOT.';
            const photoUr = 'photo_2024-03-27_02-30-46.jpg';

            bot.sendPhoto(chatId, photoUr, { caption: notcoinText, parse_mode: 'Markdown', reply_markup: notcoinOptions.reply_markup });
            break;



        case 'button2':
            const buyOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: 'Купить', callback_data: 'buy' }
                        ],
                        [
                            { text: 'Назад', callback_data: 'voucher' }
                        ]
                    ]
                }
            };
            bot.sendMessage(chatId, '1. С помощью сформировавшейся базы данных, я автоматически подберу для вас сделку, с актуальной на данный момент стоимостью. 📊\n\n2. После вступления в сделку, вы получите мой текущий адрес кошелька, куда необходимо отправить оплату. А продавец в свою очередь, отправляет NFT на мой текущий адрес GetGems.♻️\n\n3. После отправления оплаты, отправьте свой текущий адрес GetGems в чат со мной и ожидайте получения NFT. ✅\n\nСреднее время проведения сделки: 3-10 минут.⏱\n\n              ⚠️!!!ВНИМАНИЕ!!!⚠️\n\nНи в коем случае не отменяйте и не завершайте сделку до получения NFT. В таком случае, сделка будет остановлена и я не смогу отправить вам NFT!🛑', buyOptions);
            break;

        case 'confirmCancel':
            // Получение номера транзакции из текста сообщения
            const transactionNumberCancel = query.message.text.split(' ')[3];

            // Чтение файла и удаление строки с номером транзакции
            fs.readFile('transactions.txt', 'utf8', (err, data) => {
                if (err) {
                    console.error('Ошибка чтения файла:', err);
                    return;
                }
                // Поиск строки с номером транзакции
                const lines = data.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (line.includes(`Номер транзакции: ${transactionNumberCancel}`)) {
                        // Удаление строки из массива
                        lines.splice(i, 1);
                        break;
                    }
                }
                // Запись обновленного содержимого файла
                fs.writeFile('transactions.txt', lines.join('\n'), (err) => {
                    if (err) {
                        console.error('Ошибка записи файла:', err);
                    }
                });
            });

            bot.sendMessage(chatId, 'Транзакция отменена❌', {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: 'В главное меню', callback_data: 'mainMenu' }
                        ]
                    ]
                }
            });
            break;
        case 'buy':
            const transactionNumberBuy = Math.floor(100000 + Math.random() * 900000); // Генерировать случайное шестизначное число
            fs.appendFileSync('transactions.txt', `ID пользователя: ${chatId}, Номер транзакции: ${transactionNumberBuy}\n`);

            const confirmPaymentOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Завершить сделку', callback_data: 'confirmPayment' }],
                        [{ text: 'Отменить сделку', callback_data: 'CancelPayment' }]
                    ]
                }
            };

            const buyMessage = `Ваша сделка: № ${transactionNumberBuy}\n\n🌅 NFT: *10,000 $NOT Voucher*\n\n⚖️ Стоимость: 11.3 TON\n\n1. Отправьте оплату на этот адрес: \`EQCV3C9W1jExJVNCCWWvjfkCPr_vh3MkQ-b-Quv-tD4w8Yi2 \`\n\n2. Отправьте свой текущий адрес кошелька GetGems в чат со мной (сюда, в этот чат).\n\n3. Завершайте сделку после получения NFT.\n\nЕсли у вас возникли проблемы, перейдите на "Поддержка" в главном меню.📨`;

            bot.sendMessage(chatId, buyMessage, { parse_mode: 'Markdown', ...confirmPaymentOptions });
            break;
        case 'confirmPayment':
            bot.sendMessage(chatId, 'Сделка завершена✅\n\nПоздравляю вас с успешной покупкой NFT! 🎊\n\nЕсли у вас возникли проблемы, перейдите на "Поддержка" в главном меню.📨', {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: 'Вернуться в главное меню', callback_data: 'mainMenu' }
                        ]
                    ]
                }
            });

            break;

        case 'CancelPayment':
            bot.sendMessage(chatId, 'Транзакция отменена❌', {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: 'Вернуться в главное меню', callback_data: 'mainMenu' }
                        ]
                    ]
                }
            });
            break;
        case 'sell':
            const transactionNumberSell = Math.floor(100000 + Math.random() * 900000); // Генерировать случайное шестизначное число
            fs.appendFileSync('transactions.txt', `ID пользователя: ${chatId}, Номер транзакции: ${transactionNumberSell}\n`);

            const confirmOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Завершить сделку', callback_data: 'confirmTransfer' }],
                        [{ text: 'Отменить сделку', callback_data: 'confirmCancel' }]
                    ]
                }
            };

            const sellMessage = `Ваша сделка № ${transactionNumberSell}\n\n🌅 NFT: *10,000 $NOT Voucher*\n\n⚖️ Стоимость: 11.3 TON\n\n1. Отправьте NFT по этому адресу: \`EQCV3C9W1jExJVNCCWWvjfkCPr_vh3MkQ-b-Quv-tD4w8Yi2\`\n\n2. Отправьте свой текущий адрес кошелька в чат со мной (сюда, в этот чат).\n\n3. Завершайте сделку только после получения оплаты.\n\nЕсли у вас возникли проблемы, перейдите на "Поддержка" в главном меню.📨`;

            bot.sendMessage(chatId, sellMessage, { parse_mode: 'Markdown', ...confirmOptions });
            break;

        case 'confirmTransfer':
            bot.sendMessage(chatId, 'Сделка завершена✅\n\nПоздравляю вас с успешной продажей NFT! 🎊\n\nЕсли у вас возникли проблемы, перейдите на "Поддержка" в главном меню.📨', {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: 'Вернуться в главное меню', callback_data: 'mainMenu' }
                        ]
                    ]
                }
            });
            break;
        case 'confirmCancel':
            bot.sendMessage(chatId, 'Сделка отменена❌\n\nВы успешно отменили сделку!⛔️\n\nЕсли у вас возникли проблемы, перейдите на "Поддержка" в главном меню.📨', {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: 'Вернуться в главное меню', callback_data: 'mainMenu' }
                        ]
                    ]
                }
            });
            break;

        case 'button3':
            const sellOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: 'Продать', callback_data: 'sell' }
                        ],
                        [
                            { text: 'Назад', callback_data: 'voucher' }
                        ]
                    ]
                }
            };
            bot.sendMessage(chatId, '\n\n1. С помощью сформировавшейся базы данных, я автоматически подберу для вас сделку, с актуальной на данный момент стоимостью. 📊\n\n2. После вступления в сделку, вы получите мой текущий адрес кошелька на GetGems, куда необходимо отправить NFT. А покупатель в свою очередь, отправляет оплату на мой текущий адрес кошелька. ♻️\n\n3. После отправления NFT, отправьте адрес кошелька в чат со мной на который вы хотите получить средства и ожидайте получения оплаты. ✅\n\nСреднее время проведения сделки: 3-10 минут.⏱\n\n              ⚠️!!!ВНИМАНИЕ!!⚠️\n\nНи в коем случае не отменяйте и не завершайте сделку до получения оплаты. В таком случае, сделка будет остановлена и я не смогу отправить вам средства!🛑', sellOptions);
            break;

        case 'useButton':
            const mainMenuOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: 'NFT', callback_data: 'nft' }
                        ],
                        [
                            { text: '$NOT (скоро появится)', callback_data: 'notcoin' }
                        ],
                        [
                            { text: 'Поддержка', url: 'https://t.me/ggmarket_support' }
                        ],
                        [
                            { text: 'Как пользоваться?', callback_data: 'button1' }
                        ],
                        [
                            { text: 'Мои сделки', callback_data: 'myTransactions' }
                        ],
                        [
                            { text: 'Реферальная программа', callback_data: 'referral' }
                        ]
                    ]
                }
            };
            bot.sendMessage(chatId, 'Главное меню \n\nЧтобы полностью познакомиться со мной и моим функционалом, выбери "Как пользоваться?"⬇️\n\n', mainMenuOptions);
            break;

    }
});
let lastMessageId = null; // Переменная для хранения ID предыдущего сообщения

// Обработчик нажатия кнопки "рефы"
bot.on('callback_query', query => {
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const messageText = 'За каждого приглашённого пользователя вы получаете 0.008 $TON \n\nВаш баланс составляет: ';
    const messageTex = 'Вывод от 0.2 $TON (25 приглашённых пользователей)\n\n1. Отправте свой адрес кошелька в сети TON.\n2. Нажмите кнопку перевести. \n\nВаш баланс составляет: ';
    if (query.data === 'referral') { // Проверяем, была ли нажата кнопка "рефы"
        // Проверяем, существует ли уже файл базы данных
        if (!fs.existsSync('referrals.txt')) {
            bot.sendMessage(chatId, messageText + '0 $TON', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Вывод', callback_data: 'output' }],
                        [{ text: 'Главное меню', callback_data: 'useButton' }]
                    ]
                }
            }).then(sentMessage => {
                lastMessageId = sentMessage.message_id; // Сохраняем ID отправленного сообщения
            });
            return;
        }

        // Загружаем данные из файла базы данных
        const data = fs.readFileSync('referrals.txt', 'utf8');

        // Разделяем данные на строки
        const lines = data.split('\n');

        // Ищем запись о текущем пользователе
        const userLine = lines.find(line => {
            const [username] = line.split(':');
            return username === query.from.username;
        });

        if (userLine) {
            const [_, userReferralCode, count] = userLine.split(':');
            const invitedCount = parseInt(count) || 0;
            const totalInvites = invitedCount * 0.008 ; // Умножаем количество приглашенных пользователей на 2
            const referralLink = `https://t.me/getgems_market_bot?start=${userReferralCode}`; // Генерируем ссылку
            bot.sendMessage(chatId, `${messageText + totalInvites} $TON\n\nВаша реферальная ссылка: ${referralLink}`, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Вывод', callback_data: 'output' }],
                        [{ text: 'Главное меню', callback_data: 'mainMenu' }]
                    ]
                }
            }).then(sentMessage => {
                lastMessageId = sentMessage.message_id; // Сохраняем ID отправленного сообщения
            });
        } else {
            // Генерируем новый реферальный код
            const newReferralCode = generateReferralCode();

            // Сохраняем нового пользователя в базе данных
            const newUserLine = `${query.from.username}:${newReferralCode}:0\n`;
            fs.appendFileSync('referrals.txt', newUserLine);

            const referralLink = `https://t.me/getgems_market_bot?start=${newReferralCode}`; // Генерируем ссылку
            bot.sendMessage(chatId, `${messageText}0 $TON\n\nВаша реферальная ссылка: ${referralLink}`, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Вывод', callback_data: 'output' }],
                        [{ text: 'Главное меню', callback_data: 'mainMenu' }]
                    ]
                }
            }).then(sentMessage => {
                lastMessageId = sentMessage.message_id; // Сохраняем ID отправленного сообщения
            });
        }
    } else if (query.data === 'output') { // Проверяем, была ли нажата кнопка "вывод"
        // Выполняем вычисление количества приглашенных пользователей у текущего пользователя и отправляем сообщение
        const data = fs.readFileSync('referrals.txt', 'utf8');
        const lines = data.split('\n');
        const userLine = lines.find(line => {
            const [username] = line.split(':');
            return username === query.from.username;
        });

        if (userLine) {
            let [_, __, count] = userLine.split(':');
            let invitedCount = parseInt(count) || 0;

            // Если пользователь достиг 25 приглашенных пользователей, обнуляем счет
            if (invitedCount >= 25) {
                invitedCount = 0;
                lines[lines.indexOf(userLine)] = `${query.from.username}:${userReferralCode}:0`;
                fs.writeFileSync('referrals.txt', lines.join('\n'));
            }

            const totalInvites = invitedCount * 0.008; // Умножаем количество приглашенных пользователей на 0.008
            bot.sendMessage(chatId, `${messageTex + totalInvites} $TON`, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Перевести', callback_data: 'transfer' }],
                        [{ text: 'Назад', callback_data: 'referral' }]
                    ]
                }
            }).then(sentMessage => {
                lastMessageId = sentMessage.message_id; // Сохраняем ID отправленного сообщения
            });
        } else {
            bot.sendMessage(chatId, `${messageText}0 $TON`, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Назад', callback_data: 'referral' }]
                    ]
                }
            }).then(sentMessage => {
                lastMessageId = sentMessage.message_id; // Сохраняем ID отправленного сообщения
            });
        }
    }  if (query.data === 'referral') { // Проверяем, была ли нажата кнопка "рефы"
        // Оставляем ваш существующий код без изменений

    } else if (query.data === 'output') { // Проверяем, была ли нажата кнопка "вывод"
        // Оставляем ваш существующий код без изменений

    } else if (query.data === 'transfer') { // Проверяем, была ли нажата кнопка "transfer"
        // Выполняем вычисление количества приглашенных пользователей у текущего пользователя и отправляем сообщение
        const data = fs.readFileSync('referrals.txt', 'utf8');
        const lines = data.split('\n');
        const userLine = lines.find(line => {
            const [username] = line.split(':');
            return username === query.from.username;
        });

        if (userLine) {
            const [_, __, count] = userLine.split(':');
            const invitedCount = parseInt(count) || 0;
            const totalInvites = invitedCount * 0.008; // Умножаем количество приглашенных пользователей на 2

            if (totalInvites >= 0.2) {
                bot.sendMessage(chatId, `Перевод выполнен, ожидайте пополнения!`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Назад', callback_data: 'referral' }]
                        ]
                    }
                }).then(sentMessage => {
                    lastMessageId = sentMessage.message_id; // Сохраняем ID отправленного сообщения
                });
            } else {
                bot.sendMessage(chatId, `Недостаточно средств для перевода`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Назад', callback_data: 'referral' }]
                        ]
                    }
                }).then(sentMessage => {
                    lastMessageId = sentMessage.message_id; // Сохраняем ID отправленного сообщения
                });
            }
        } else {
            bot.sendMessage(chatId, `Недостаточно средств для перевода`, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Назад', callback_data: 'referral' }]
                    ]
                }
            }).then(sentMessage => {
                lastMessageId = sentMessage.message_id; // Сохраняем ID отправленного сообщения
            });
        }
    }
});

// Функция для генерации реферального кода
function generateReferralCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}


// Обработчик нажатия кнопки "Главное меню" и удаление предыдущего сообщения
bot.on('callback_query', query => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id; // Идентификатор сообщения
    const data = query.data;

    if (data === 'useButton' && lastMessageId) {
        bot.deleteMessage(chatId, lastMessageId)
            .catch((error) => {
                console.log('Ошибка при удалении сообщения:', error);
            });
    } else if (data === 'backButton' && lastMessageId) {
        bot.deleteMessage(chatId, lastMessageId)
            .catch((error) => {
                console.log('Ошибка при удалении сообщения:', error);
            });
    }
});



bot.on('callback_query', (query) => {
    const data = query.data;

    if (data === 'useButton') {
        // Игнорировать нажатие кнопки "useButton"
        return;
    }

    // Обработка нажатия других кнопок

    // Удаление сообщения
    bot.deleteMessage(query.message.chat.id, query.message.message_id)
        .catch((error) => {
            console.log('Ошибка при удалении сообщения:', error);
        });
});


bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    // Проверяем, является ли сообщение известной командой
    if (messageText === '/start') {
        // Обработка команды /start
    } else {
        // Проверяем текст сообщения с помощью регулярного выражения
        const regex = /^[A-Za-z0-9\-_+=]+$/;

        if (regex.test(messageText)) {
            // Удаляем сообщение
            bot.deleteMessage(chatId, msg.message_id);

            // Проверяем длину сообщения
            if (messageText.length >= 26 && messageText.length <= 35) {
                // Отправляем ответное сообщение
                bot.sendMessage(chatId, 'Ваш адрес принят ✅');

                // Удаляем свое ответное сообщение через 4 секунды
                setTimeout(() => {
                    bot.deleteMessage(chatId, msg.message_id + 1); // +1, потому что предыдущее сообщение уже было удалено
                }, 4000);
            }
        } else {
            // Проверяем, была ли нажата кнопка
            if (msg.reply_to_message && msg.reply_to_message.text === 'Неизвестная команда') {
                // Удаляем сообщение об ошибке
                bot.deleteMessage(chatId, msg.message_id);
                return;
            }

            // Проверяем длину сообщения
            if (messageText.length >= 26 && messageText.length <= 35) {
                // Удаляем сообщение
                bot.deleteMessage(chatId, msg.message_id);
                return;
            }

        }
    }
});


// Обработчик команды /referrals
bot.onText(/\/referrals/, (msg) => {
    const chatId = msg.chat.id;

    // Проверяем, существует ли уже файл базы данных
    if (!fs.existsSync('referrals.txt')) {
        fs.writeFileSync('referrals.txt', '');
    }

    // Загружаем данные из файла базы данных
    const data = fs.readFileSync('referrals.txt', 'utf8');

    // Разделяем данные на строки
    const lines = data.split('\n');

    // Проверяем, есть ли уже записи о рефералах для пользователя
    let referralCodes = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Разделяем строку на имя пользователя, реферальный код и количество приглашенных пользователей
        const [username, code, count] = line.split(':');

        // Если имя пользователя совпадает, добавляем реферальный код и количество в список
        if (username === msg.from.username) {
            referralCodes.push({ code, count });
        }
    }

    // Если есть реферальные коды, отправляем ссылки на них и количество приглашенных пользователей
    if (referralCodes.length > 0) {
        const filteredReferralCodes = referralCodes.filter(({ code }) => code !== msg.from.username); // Фильтрация реферальных кодов
        const referralLinks = filteredReferralCodes.map(({ code, count }) => {
            return `https://t.me/getgems_market_bot?start=${code}\nПриглашенных пользователей: ${count}`;
        });
        bot.sendMessage(chatId, `Ваша реферальная ссылка:\n${referralLinks.join('\n\n')}`);
    } else {
        // Создание реферальной ссылки
        const newReferralCode = generateReferralCode();
        const newReferralLink = `https://t.me/getgems_market_bot?start=${newReferralCode}`;

        // Сохранение реферальной ссылки и количества приглашенных пользователей в базе данных
        const newData = `${msg.from.username}:${newReferralCode}:0\n`;
        fs.appendFileSync('referrals.txt', newData);

        bot.sendMessage(chatId, `Ваша реферальная ссылка для приглашения: ${newReferralLink}\nПриглашенных пользователей: 0`);
    }
});
// Объект для хранения информации о пользователях и их приглашениях
const invitedUsers = {};

// Обработчик команды /start
bot.onText(/\/start (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const referralCode = match[1];
    const userId = msg.from.id;

    // Проверяем, был ли уже обработан этот код для текущего пользователя
    if (invitedUsers[userId] && invitedUsers[userId] === referralCode) {
        return;
    }

    // Проверяем, существует ли уже файл базы данных
    if (!fs.existsSync('referrals.txt')) {
        fs.writeFileSync('referrals.txt', '');
    }

    // Загружаем данные из файла базы данных
    const data = fs.readFileSync('referrals.txt', 'utf8');

    // Разделяем данные на строки
    const lines = data.split('\n');

    // Получаем реферальный код из ссылки
    const inviterReferralCode = referralCode.split(' ')[0];

    // Проверяем, приглашался ли уже текущий пользователь с этим кодом
    const invitedLineIndex = lines.findIndex(line => {
        const [username, code] = line.split(':');
        return username === msg.from.username && code === inviterReferralCode;
    });

    // Если текущий пользователь уже приглашался с этим кодом, прерываем выполнение кода
    if (invitedLineIndex !== -1) {
        // Сохраняем информацию о том, что этот пользователь уже использовал этот код
        invitedUsers[userId] = referralCode;
        return;
    }

    // Проверяем, есть ли пользователь с таким реферальным кодом
    const inviterLineIndex = lines.findIndex(line => {
        const [username, code] = line.split(':');
        return code === inviterReferralCode;
    });

    // Если пользователь найден
    if (inviterLineIndex !== -1) {
        const inviterLine = lines[inviterLineIndex];
        const [inviterUsername, inviterCode, inviterCount] = inviterLine.split(':');

        // Обновляем количество приглашенных пользователей, если текущий пользователь еще не приглашался
        if (invitedLineIndex === -1) {
            const newCount = parseInt(inviterCount) + 1;
            lines[inviterLineIndex] = `${inviterUsername}:${inviterCode}:${newCount}`;
            fs.writeFileSync('referrals.txt', lines.join('\n'));

            // Отправляем уведомление пользователю, который был приглашен
            bot.sendMessage(chatId, `Вы были приглашены пользователем @${inviterUsername}!`);
        }

        // Сохраняем информацию о том, что этот пользователь уже использовал этот код
        invitedUsers[userId] = referralCode;

        // Прерываем выполнение кода
        return;
    }

    // Если пользователь не найден, добавляем его в базу данных
    const newUserData = `${msg.from.username}:${inviterReferralCode}:1\n`;
    fs.appendFileSync('referrals.txt', newUserData);

    // Отправляем уведомление пользователю, который был приглашен
    bot.sendMessage(chatId, `Вы были приглашены пользователем с реферальным кодом ${inviterReferralCode}!`);

    // Сохраняем информацию о том, что этот пользователь уже использовал этот код
    invitedUsers[userId] = referralCode;
});

function generateReferralCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}
