require('dotenv').config();
const Twitter = require('twit');
const fs = require("fs");
const waifulabs = require('waifulabs');

const Tweet = new Twitter({
    consumer_key: process.env.API_KEY,
    consumer_secret: process.env.API_SECRET_KEY,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

const getWaifu = async () => {
    const waifus = await waifulabs.generateWaifus();
    const waifu = waifus[0];
    const bigWaifu = await waifulabs.generateBigWaifu(waifu);
    const imageData = bigWaifu.image;

    const image = Buffer.from(imageData, 'base64');
    fs.writeFile('waifu.png', image, console.error);

}


const bot = async () => {
    await getWaifu();

    const pngCheck = setInterval(() => {
        const pngExists = fs.existsSync("waifu.png")
        if (pngExists) {
            const media = fs.readFileSync("waifu.png", { encoding: 'base64' });
            clearInterval(pngCheck)

            // (2) If image uploaded, post tweet
            const uploaded = (err, data, response) => {
                const id = data.media_id_string;
                const tweet = {
                    status: "#waifubot",
                    media_ids: [id]
                }
                console.log("[Tweet] Image Uploaded!");
                Tweet.post('statuses/update', tweet, tweeted);
            }

            // (3) If tweet posted, log response
            const tweeted = (err, data, response) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("[Tweet] Tweet Sent!");
                    fs.unlinkSync("waifu.png")
                }
            }

            // (1) Upload media to twitter
            Tweet.post('media/upload', {
                media_data: media
            }, uploaded);

        }
        console.log("Checking png...");
    }, 2000); // 2 seconds interval for png check


    // Run once every 30 minutes
    setTimeout(bot, 1800000);
}

//Cycle start
bot();
