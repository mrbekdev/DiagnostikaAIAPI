"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = require("helmet");
const compression = require("compression");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Helix24-Backend');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));
    app.use(compression());
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Helix24 — SI-Mobil Diagnostika API')
        .setDescription('Helix24: O‘zbekistonning olis va chekka hududlari uchun Milliy Telemeditsina va Mobil Sun’iy Intellekt Diagnostika Platformasi Backend API hujjati.\n\n' +
        '**Asosiy imkoniyatlar:**\n' +
        '- 🩺 Bemorlar va Mobil Brigadalar GPS Telemetriyasi\n' +
        '- 🩻 Rentgen (MONAI/TorchXRayVision Grad-CAM), EKG va Qon tahlili SI konveyeri\n' +
        '- 👨‍⚕️ Toshkentdagi yetakchi shifokorlar ish stoli va ERI raqamli imzosi\n' +
        '- 🛰️ Oflayn rejim (tog‘li hududlar) va avtomatik sinxronizatsiya\n' +
        '- 📹 WebRTC Jonli video telemeditsina konsultatsiyalari\n' +
        '- 🎙️ Whisper asosidagi O‘zbekcha ovozli tibbiy triaj')
        .setVersion('1.0.0')
        .addBearerAuth()
        .addTag('Authentication & Authorization', 'JWT va Refresh token orqali xavfsiz autentifikatsiya')
        .addTag('Patients Management', 'Olis hududlardagi bemorlarni ro‘yxatga olish va tibbiy kartalar')
        .addTag('Mobile Clinics', 'Mobil klinikalarning jonli GPS koordinatalari va brigada boshqaruvi')
        .addTag('Diagnostics & File Uploads', 'Tibbiy fayllarni yuklash (MinIO S3) va SI navbatiga qo‘yish')
        .addTag('Medical AI Engine', 'Ko‘krak qafasi rentgeni, EKG ritmi va laboratoriya tahlillari')
        .addTag('Doctor Review & Tele-Consultation', 'Shifokor xulosalari, raqamli imzo va ikkinchi fikr')
        .addTag('Telemedicine & Live Video Consultations', 'WebRTC jonli audio/video konsultatsiya sessiyalari')
        .addTag('Uzbekistan Map & GIS Telemetry', 'Respublika bo‘yicha mobil skrining qamrovi va jonli xarita')
        .addTag('Rural Offline Synchronization', 'Internet aloqasi bo‘lmagan joylarda to‘plangan ma’lumotlarni sinxronlash')
        .addTag('Notifications', 'Real vaqtda Socket.IO va SMS xabarnomalar')
        .addTag('Security & Audit Logs', 'Barcha tibbiy harakatlarning xavfsiz audit jurnali')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            filter: true,
            displayRequestDuration: true,
        },
    });
    const port = process.env.PORT || 3001;
    await app.listen(port, '0.0.0.0');
    logger.log(`🚀 Hududiy SI-Mobil Diagnostika Backend running on: http://0.0.0.0:${port}/api/v1`);
    logger.log(`📱 Local Network Access: http://172.16.9.7:${port}/api/v1`);
    logger.log(`📖 Swagger API Documentation available at: http://172.16.9.7:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map