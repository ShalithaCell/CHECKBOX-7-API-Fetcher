const fetch = require('node-fetch');
const sql = require('mssql');
const { DBconfig, checkBoxCredentials } = require('./database');

const { Headers } = fetch;

const Authenticate = async () => {
    let data;
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    myHeaders.append("Authorization", "Bearer {{Token}}");

    var urlencoded = new URLSearchParams();
    const { username, password, grant_type } = checkBoxCredentials;
    urlencoded.append("username", username);
    urlencoded.append("password", password);
    urlencoded.append("grant_type", grant_type);

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow'
    };

    await fetch("https://api.checkbox.com/v1/nvivid/oauth2/token", requestOptions)
        .then(response => response.text())
        .then(result => data = result)
        .catch(error => console.log('error', error));

    return data;
}

module.exports = { Authenticate }
