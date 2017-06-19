var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.post('/webhook', function (req, res) {
    var body = req.body;
    var action = (body.result.action);
    console.log(body);

    if (action === 'getaccountdetails' && body.result.actionIncomplete === false)
    {
        var request = require("request");

        var options = {
            method: 'POST',
            url: 'http://52.172.213.166:8080/sbi/Account_List/api/EnqBancsAccountsList/',
            headers:
                    {'postman-token': '2f62145f-9dea-cfb4-1b28-253d5f096ab7',
                        'cache-control': 'no-cache',
                        apikey: 'ywr4rQdbjSOVDtr',
                        'content-type': 'application/json'},
            body: {AccountNumber: body.result.parameters.AccountNumber},
            json: true};

        request(options, function (error, response, body) {
            console.log(body)
            if (error)
                throw new Error(error);
            var json = {
                "speech": "Welcome!" + body.main_ac.CIFname + ",\nYour PFid is " + body.main_ac.PFId,
                "displayText": "Barack Hussein Obama II is the 44th and current President of the United States, and the first African American to hold the office. Born in Honolulu, Hawaii, Obama is a graduate of Columbia University   and Harvard Law School, where ",
                "source": "DuckDuckGo"
            };
            res.set("Content-type", "application/json")
            res.send(json);
        });

        //console.log(body);



    } else if (action === 'ministatement' && body.result.actionIncomplete === false)
    {
        var request = require("request");

        var options = {
            method: 'POST',
            url: 'http://52.172.213.166:8080/sbi/Mini/api/EnqMiniStatement',
            headers:
                    {
                        'cache-control': 'no-cache',
                        apikey: 'ywr4rQdbjSOVDtr',
                        'content-type': 'application/json'
                    },
            body: {AccountNumber: "00000030001512992"},
            json: true
        };
        request(options, function (error, response, body) {
            if (error)
                throw new Error(error);
            console.log(body);
            var speech = "Sure, Your current balance is " + body.CurrentBalance + ". Here is your last 5 transactions  :";
            for (var i = 0; i < body.StatementInfo.length; i++)
            {
                speech = speech + "\n\
" + (i + 1) + ". " + body.StatementInfo[i].Amount + " " + body.StatementInfo[i].TransactionDate + " " + body.StatementInfo[i].TransactionType + "\n";
            }
            var json = {
                "speech": speech,
                "displayText": "Barack Hussein Obama II is the 44th and current President of the United States, and the first African American to hold the office. Born in Honolulu, Hawaii, Obama is a graduate of Columbia University   and Harvard Law School, where ",
                "source": "DuckDuckGo"
            };
            res.set("Content-type", "application/json");
            res.send(json);
        });
        //console.log(body);
    } else if (action === 'accntstatement' && body.result.actionIncomplete === false)
    {
        var request = require("request");
        var Period = body.result.parameters.Period;
        console.log(JSON.stringify(Period));
        var options = {
            method: 'POST',
            url: 'http://52.172.213.166:8080/sbi/Detail/api/EnqINBAccountStatement',
            headers:
                    {
                        'cache-control': 'no-cache',
                        apikey: 'ywr4rQdbjSOVDtr',
                        'content-type': 'application/json'
                    },
           body: 
   { AccountNumber: '30001512992',
     FromAmount: 1000,
     FromDate: '0',
     ToAmount: '10000',
     ToDate: '0',
     TransactionNumber: 150 },
  json: true };
        console.log(options);
        request(options, function (error, response, body) {
            if (error)
                throw new Error(error);
            console.log(body);
            var speech = "Sure, Your account  balance is . Here are your transactions during :";
            for (var i = 0; i < body.StatementDetails.length; i++)
            {
                speech = speech + "\n\
" + (i + 1) + ". " + body.StatementDetails[i].Amount + " " + body.StatementDetails[i].ValueDate + " " + body.StatementDetails[i].Narration + "\n";
            }
            var json = {
                "speech": speech,
                "displayText": speech,
                "source": "Bot"
            };
            res.set("Content-type", "application/json");
            res.send(json);
        });
        //console.log(body);
    } else
    {
        var json = {
            "speech": body.result.fulfillment.speech,
            "displayText": body.result.fulfillment.speech,
            "source": "Bot"
        };
        res.set("Content-type", "application/json")
        res.send(json);
    }

});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
