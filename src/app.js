const fetch = require('node-fetch');
const sql = require('mssql');
const { DBconfig } = require('./database');
const { objProx } = require('./sessionData');


const { Headers } = fetch;

const Authenticate = async (obj) => {
    let data;
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    myHeaders.append("Authorization", "Bearer {{Token}}");

    var urlencoded = new URLSearchParams();
    urlencoded.append("username", obj['userName']);
    urlencoded.append("password", obj['password']);
    urlencoded.append("grant_type", "password");

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow'
    };

    await fetch("https://api.checkbox.com/v1/nvivid/oauth2/token", requestOptions)
        .then(function (response) {

            if(response.status !== 200){
                data = null;
            }else{
                data = response.text();
            }

        })
        .catch(error => console.log('error', error));

    return data;
}

const FetchSurvey = async () => {

    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + objProx.token);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch("https://api.checkbox.com/v1/nvivid/surveys", requestOptions)
        .then(response => response.text())
        .then(function(response) {
            let json_obj = JSON.parse(response);
            SaveSurveyList(json_obj);
            //console.log(json_obj.items);
        })
        .catch(error => console.log('error', error));
}

async function doAuth(obj) {
    let json_obj = JSON.parse(obj)
    sql.connect(DBconfig).then(pool => {

        // Stored procedure
        return pool.request()
            .input('access_token', sql.VarChar(500), json_obj.access_token)
            .input('token_type', sql.VarChar(200), json_obj.token_type)
            .input('expires_in', sql.Int, json_obj.expires_in)
            .input('user_name', sql.VarChar(200), json_obj.user_name)
            .input('roles', sql.VarChar(200), json_obj.roles)
            .input('account_name', sql.VarChar(200), json_obj.account_name)
            .input('hosts', sql.VarChar(200), json_obj.hosts)
            .execute('SP_ADD_USERS')
    }).then(result => {
        let val = result.recordset;
        objProx.userID = val[0].USERID;
        objProx.token = json_obj.access_token;
        //console.log( objProx.userID);

        FetchSurvey();

    }).catch(err => {
        console.dir(err);
    });
}

async function SaveSurveyList(obj) {
    console.log(obj); //contains the json string
    for (var key in obj.items) {
        console.log(obj.items[key]);

        let json_obj = obj.items[key];

        sql.connect(DBconfig).then(pool => {

            // Stored procedure
            return pool.request()
                .input('ID', sql.Int, json_obj.id)
                .input('external_id', sql.VarChar(200), json_obj.external_id)
                .input('survey_folder_id', sql.Int, json_obj.survey_folder_id)
                .input('name', sql.VarChar(200), json_obj.name)
                .input('description', sql.VarChar(200), json_obj.description)
                .input('status', sql.VarChar(200), json_obj.status)
                .input('style_template_id', sql.Int, json_obj.style_template_id)
                .input('created_by', sql.DateTime, json_obj.created_by)
                .input('created_date', sql.DateTime, json_obj.created_date)
                .input('allow_edit_while_active', sql.Bit, json_obj.allow_edit_while_active)
                .input('custom_url', sql.VarChar(200), json_obj.custom_url)
                .input('google_analytics_tracking_id', sql.VarChar(200), json_obj.google_analytics_tracking_id)
                .input('security_type', sql.VarChar(200), json_obj.security_type)
                .input('FK_User', sql.Int, objProx.userID)
                .execute('SP_ADD_SURVEY_HEADER')
        }).then(result => {
            console.log("Survey Fetched");
        }).catch(err => {
            console.dir(err);
        });

    }

}


module.exports = { Authenticate, FetchSurvey, doAuth }
