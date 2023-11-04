const TelegramBot = require('node-telegram-bot-api');
const ytdl= require('ytdl-core');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const token = '6851761427:AAEfysdeNNBFUlEy3nztjCZU_DGMzgwkHwo'; // Replace with your bot's API token
const bot = new TelegramBot(token, { polling: true });


// Handle the /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const text = 'Welcome to the Youtube Audio Download Bot! Send /download to download audio from any link';
  const options = {
    reply_markup: {
      keyboard: [['/download', '/stopbot']],
    },
  };

  bot.sendMessage(chatId, text, options);
});

// Handle the /download command
bot.onText(/\/download/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Please send the URL from which you want to download.');
  // Listen for text messages
  bot.on('text', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
  
    if (text.startsWith('http') || text.startsWith('https')) {
      downloadAudio(chatId, text);
    } else {
      bot.sendMessage(chatId, 'This is not a valid URL. Please enter a valid URL.');
    }
  });
});

// Handle the /stopbot command
bot.onText(/\/stopbot/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Bot stopped. You can start it again with /start.', {
    reply_markup: {
      remove_keyboard: true,
    },
  });
});



function downloadAudio(chatId, url){
  // var _title="audio";
  // request(url ,(error, response, html)=>{
  //   if(!error && response.statusCode===200){
  //     const $ = cheerio.load(html);
  //     _title = $('title').text();
  //     console.log(_title);
  //   }
  // })

  // console.log(_title);
  

  
  const dest = fs.createWriteStream(`./files/audio${chatId}.mp3`);

  const options = {
    reply_markup: {
      keyboard: [['/start', '/stopbot']],
    },
  };

  ytdl(url,{
      format : 'mp3',
      quality: 'highestaudio'
  }).pipe(dest)
  dest.on( 'finish' ,()=>{
    bot.sendAudio(chatId, `./files/audio${chatId}.mp3`)
      .then(() => {
        console.log('Audio sent successfully.');
        fs.unlink(`./files/audio${chatId}.mp3`, (err) => {
          if (err) {
            console.error(err);
          } else {
            console.log('File is deleted.');
          }
        });
      })
      .then(()=>{
        bot.sendMessage(chatId, 'To restart the bot or use other commands, send /start.', options);
      })        
      .catch((error) => {
        console.error('Error sending audio:', error);
      });
  })

}
