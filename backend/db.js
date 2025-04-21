
const {Connection} = require('monetdb');
 
const opt = {database: 'demo'};

module.exports = () => {
    const conn = new Connection(opt)
    return conn;
};
