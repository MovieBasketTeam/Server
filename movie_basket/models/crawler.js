var request = require("request");
var cheerio = require("cheerio");

function findContent (url, callback) {
    var message = {};
    request(url, function (error, res, body) {
        if (error) {
            return callback(error);
        }

        var $ = cheerio.load(body);
        var contents = $(".con_tx");
        var trimmedContent = contents.text().replace(/[\r\n]/g, "");
        var actorSel = $(".step3+dd").find("p");
        actors = actorSel.text().replace(/\([^)]+\)/g, "");
        message.content = trimmedContent;
        message.actor = actors;
        return callback(null, message);
    });
}

module.exports.findContent = findContent;
