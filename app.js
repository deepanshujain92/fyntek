var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var config = require('./config');

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

    if (action === 'balance' && body.result.actionIncomplete === false)
    {
        var request = require("request");
        console.log(config);
        var options = {
            method: 'POST',
            url: 'http://52.172.213.166:8080/sbi/Account_List/api/EnqBancsAccountsList/',
            headers:
                    {
                        apikey: config.apiKey,
                    },
            body: {AccountNumber: config.AccountNumber}, json: true};
        console.log(options);

        request(options, function (error, response) {
            var apires = response.body;
            var params = body.result.parameters;
            var accountDetails = "";
            for (var i = 0; i < apires.ac_details.length; i++)
            {
                if (config.Accounts[params.AccountType] === apires.ac_details[i].AccountNumber)
                {
                    accountDetails = apires.ac_details[i];
                    break;
                }
            }
            console.log(body);
            var speech;
            // if(params.AccountType==="Savings") 
            speech = "Here is balance for your " + params.AccountType + " Account " + accountDetails.AvailableBalance + accountDetails.Currency;
//        else speech = "Here is Approved Sanctioned Amount for your "+params.AccountType+" Account" + accountDetails.ApprovedSanctionedAmount;
            if (error)
                throw new Error(error);
            var json = {
                "speech": speech,
                "displayText": "",
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
                        apikey: config.apiKey,
                        'content-type': 'application/json'
                    },
            body: {AccountNumber: '00000030001512992'},
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
    } else if (action === 'loanenquiry' && body.result.actionIncomplete === false)
    {
        var request = require("request");
        console.log(config);
        var options = {
            method: 'POST',
            url: 'http://52.172.213.166:8080/sbi/Loan_Enquiry/api/EnqLoan',
            headers:
                    {
                        apikey: config.apiKey
                    },
            body: {AccountNumber: config.LoanEnquiryAccount}, json: true};
        console.log(options);

        request(options, function (error, response) {
            var apires = response.body;

            console.log(body);
            var speech;
            // if(params.AccountType==="Savings") 
            speech = "Your loan a/c " + apires.AccountNo + " for purpose " + apires.Purpose + " has " + apires.LoanAmount + "INR loan, with " + apires.Outstanding + ".\n";
            speech = speech + "Installment due date: " + apires.InstallmentDueDate + "\n" + "Interest Rate:" + apires.RateofInterest;
//        else speech = "Here is Approved Sanctioned Amount for your "+params.AccountType+" Account" + accountDetails.ApprovedSanctionedAmount;
            if (error)
                throw new Error(error);
            var json = {
                "speech": speech,
                "displayText": speech,
                "source": "DuckDuckGo"
            };
            res.set("Content-type", "application/json")
            res.send(json);
        });

        //console.log(body);



    } else if (action === 'customerdetails' && body.result.actionIncomplete === false)
    {
        var request = require("request");
        console.log(config);
        var options = {
            method: 'POST',
            url: 'http://52.172.213.166:8080/sbi/CustDet/api/EnqCustomerDetails',
            headers:
                    {
                        apikey: config.apiKey
                    },
            body: {AccountNumber: config.CoustomerDetailsAccountNumber}, json: true};
        console.log(options);

        request(options, function (error, response) {
            var apires = response.body;

            console.log(body);
            var speech;
            // if(params.AccountType==="Savings") 
            speech = "Hey, " + apires.FirstName + " " + apires.LastName + "! Here are your details:\n\n\
            DOB: " + apires.DateOFBirth.toString().substring(0, 2) + "-" + apires.DateOFBirth.toString().substring(2, 4) + "-" + apires.DateOFBirth.toString().substring(4, 8) + "\nMobile Number: " + apires.MobileNumber + "\n";
            speech = speech + "\nNominee: " + apires.RelativeName + "\n" + "Relation:" + apires.RelativeIndicator + ".\n";

            speech = speech + "PAN: " + apires.PANNumber;
//        else speech = "Here is Approved Sanctioned Amount for your "+params.AccountType+" Account" + accountDetails.ApprovedSanctionedAmount;
            if (error)
                throw new Error(error);
            var json = {
                "speech": speech,
                "displayText": speech,
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
                        apikey: config.apiKey,
                        'content-type': 'application/json'
                    },
            body: {AccountNumber: '00000030001512992'},
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
    } else if (action === 'accntstatement' && body.result.actionIncomplete === false)
    {
        var request = require("request");
        var Period = body.result.parameters.Period;
        console.log(Period);
        var FromDate = new Date(Period[0].split('/')[0]).toLocaleDateString();
        var ToDate = new Date(Period[0].split('/')[1]).toLocaleDateString();

        console.log(JSON.stringify(Period));
        var options = {
            method: 'POST',
            url: 'http://52.172.213.166:8080/sbi/Detail/api/EnqINBAccountStatement',
            headers:
                    {
                        'cache-control': 'no-cache',
                        apikey: config.apiKey,
                        'content-type': 'application/json'
                    },
            body:
                    {AccountNumber: config.AccountNumber,
                        FromAmount: "1000",
                        FromDate: FromDate,
                        ToAmount: "10000",
                        ToDate: ToDate,
                        TransactionNumber: 150},
            json: true};
        console.log(options);
        request(options, function (error, response, body) {
            if (error)
                throw new Error(error);
            console.log(body);
            var speech = "Sure. Here are your transactions between :" + FromDate + " - " + ToDate;
            for (var i = 0; i < body.StatementDetails.length; i++)
            {
                speech = speech + "\n\
" + (i + 1) + ". " + body.StatementDetails[i].Amount + body.StatementDetails[i].INBStatement + " " + body.StatementDetails[i].ValueDate + " " + body.StatementDetails[i].Narration + "\n";
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
    } else if (action === 'customerlockerenquiry' && body.result.actionIncomplete === false)
    {
        var request = require("request");
        var options = {
            method: 'POST',
            url: 'http://52.172.213.166:8080/sbi/Locker/customerLocker/enquiry',
            headers:
                    {
                        'cache-control': 'no-cache',
                        apikey: config.apiKey,
                        'content-type': 'application/json'
                    },
            body:
                    {"CUSTOMER_NO": config.CustomerNumber},
            json: true};
        console.log(options);
        request(options, function (error, response) {
            if (error)
                throw new Error(error);
            console.log(response.body);
            var speech = "Your locker # " + response.body.LOCKER_ACCOUNT_NO + " (" + response.body.LOCKER_TYPE + ") has total #" + response.body.TOTAL_ARREARS + " arrears and #" + response.body.TOTAL_VISITS + " visits.";

            var json = {
                "speech": speech,
                "displayText": speech,
                "source": "Bot"
            };
            res.set("Content-type", "application/json");
            res.send(json);
        });
        //console.log(body);
    } else if (action === 'fundtransfer' && body.result.actionIncomplete === false)
    {
        var request = require("request");
        var BeneficiaryName = body.result.parameters.BeneficiaryName;
        var BenificiaryDetails ;
        for(var k=0;k<config.Beneficiaries.length;k++)
        {
            console.log(BeneficiaryName+"----"+config.Beneficiaries[k].REMNAME)
            if(BeneficiaryName===config.Beneficiaries[k].REMNAME)
            {
                BenificiaryDetails = config.Beneficiaries[k];
                break;
            }
        }
        console.log(JSON.stringify(Period));
        var options = {
            method: 'POST',
            url: 'http://52.172.213.166:8080/sbi/NEFT/api/TxnNEFT',
            headers:
                    {
                        'cache-control': 'no-cache',
                         apikey: config.apiKey,
                        'content-type': 'application/json'
                    },
            body:
                    {  "REMTACCTNO":BenificiaryDetails.REMTACCTNO,  
    "REMNAME":BenificiaryDetails.REMNAME,  
    "MOBNUMBER":BenificiaryDetails.MOBNUMBER,  
    "BENFACCTNO":BenificiaryDetails.BENFACCTNO,  
    "BENFNAME":BenificiaryDetails.BENFNAME,  
    "RECBNKIFSC":BenificiaryDetails.RECBNKIFSC,  
    "SNDIFSC":BenificiaryDetails.SNDIFSC, 
    "TXNAMT":  BenificiaryDetails.TXNAMT
},
            json: true};
        console.log(options);
        request(options, function (error, response) {
            if (error)
                throw new Error(error);
            var speech = "Sure! Your transaction of Rs#"+body.result.parameters.Amount+" to "+body.result.parameters.BeneficiaryName+" has been initiated. Your transaction number is "+response.body.CBSReferenceNumber;

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
