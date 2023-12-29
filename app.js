require('dotenv').config();
const express = require('express');
const app = express();
const Nightmare = require('nightmare'); //nightmare will help to find the url and price value in the url block
const nightmare = Nightmare({ waitTimeout : 200000 });
const nodemailer = require('nodemailer');
const port = process.env.port || 3000;
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// Configure Nodemailer with SMTP settings using environment variables
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Use environment variable for email
        pass: process.env.EMAIL_PASS // Use environment variable for password
    }
});

// Function to send email using Nodemailer
function sendEmail(userEmail, url, price) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Price has dropped',
        text: `The price on ${url} has dropped below ${price}`,
        html: `<strong>The price on ${url} has dropped below ${price}</strong>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Email sending failed:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}


const checkPrice = async (url, price, userEmail) => {
    try {
        console.log(url);
        let priceInString = await nightmare
            .goto(url)
            .wait('.a-offscreen')
            .evaluate(() => document.getElementsByClassName('a-price-whole')[0].innerText)
            .end();
        
        console.log(priceInString);
        let priceInValue = parseFloat(priceInString.replace(',', ''));
        if (priceInValue < price) {
            console.log(`New Price: ${price}`);
            console.log(`Actual Price: ${priceInValue}`);
            await sendEmail(userEmail, url, price);
            console.log('Email has been sent');
        }
        else {
            console.log('Price is still higher');
        }
    } catch (err) {
        console.log(err);
    }
}

app.post('/products', (req, res) => {
    console.log(req.body.email + ' sent a request');
    checkPrice(req.body.prodUrl, req.body.price, req.body.email);
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
