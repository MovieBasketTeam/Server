var jwt = require('jwt-simple');
var secret = 'dudghk';


function makeToken (value) {
    var token = jwt.encode(value, secret);
    return token;
}

function decodeToken (token) {
    var decoded = jwt.decode(token, secret);
    return decoded;
}


module.exports.makeToken = makeToken;
module.exports.decodeToken = decodeToken;
