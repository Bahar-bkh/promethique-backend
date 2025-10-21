const { customAlphabet } = require('nanoid');
const { v4: uuid } = require('uuid');

const nano13 = customAlphabet('0123456789', 13);

function makePeerCode(){ return uuid(); }
function makeBarcode16(prefix='707'){ return prefix + nano13(); } // مجموع 16 رقم

module.exports = { makePeerCode, makeBarcode16 };
