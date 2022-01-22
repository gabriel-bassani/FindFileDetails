const axios = require('axios');
require('dotenv').config()

const api = axios.create({
    baseURL: 'https://api.dnacenter.com.br/v2'
});

module.exports = api;