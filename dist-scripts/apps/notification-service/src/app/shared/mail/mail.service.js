"use strict";
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = tslib_1.__importStar(require("nodemailer"));
let MailService = MailService_1 = class MailService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(MailService_1.name);
        this.transporter = nodemailer.createTransport({
            host: config.get('MAIL_HOST') || 'smtp.mailtrap.io',
            port: Number(config.get('MAIL_PORT')) || 2525,
            auth: {
                user: config.get('MAIL_USER'),
                pass: config.get('MAIL_PASS')
            }
        });
    }
    async sendMail(to, subject, text) {
        try {
            await this.transporter.sendMail({
                from: '"Kanban Board" <no-reply@kanban.app>',
                to,
                subject,
                text
            });
            this.logger.log(`📧 Email sent to ${to} (${subject})`);
        }
        catch (err) {
            this.logger.error(`Failed to send email to ${to}`, err.stack);
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map