"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const MailConfig_1 = __importDefault(require("./MailConfig"));
async function sendMail(subject, text, html, reciver) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    //let testAccount = await nodemailer.createTestAccount();
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer_1.default.createTransport({
        host: MailConfig_1.default.host,
        port: MailConfig_1.default.port,
        //secure: true, // true for 465, false for other ports
        auth: {
            user: MailConfig_1.default.user,
            pass: MailConfig_1.default.pass,
        },
    });
    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: MailConfig_1.default.user,
        to: reciver,
        subject: subject,
        text: text,
        html: html,
    });
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    // Preview only available when sending through an Ethereal account
    //console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}
//main().catch(console.error);
exports.default = sendMail;
//# sourceMappingURL=Mailer.js.map