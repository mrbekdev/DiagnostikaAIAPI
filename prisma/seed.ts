import { PrismaClient, UserRole, Gender, ExaminationStatus, FileType, RiskLevel, DoctorDecision } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Hududiy SI-Mobil Diagnostika...');

  // 1. Clean existing data in reverse order of foreign keys
  await prisma.notification.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.telemedicineSession.deleteMany({});
  await prisma.doctorReview.deleteMany({});
  await prisma.aiResult.deleteMany({});
  await prisma.upload.deleteMany({});
  await prisma.examination.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.mobileClinic.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('Admin12345!', 10);

  // 2. Seed Users
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@telemed.uz',
      passwordHash,
      fullName: 'Dr. Alisher Shokirov',
      phone: '+998901234567',
      role: UserRole.SUPER_ADMIN,
      specialty: 'Bosh Administrator',
      licenseNumber: 'UZ-ADM-001',
    },
  });

  const nurse1 = await prisma.user.create({
    data: {
      email: 'nurse.surxondaryo@telemed.uz',
      passwordHash,
      fullName: 'Dilnoza Karimova',
      phone: '+998935551122',
      role: UserRole.NURSE,
      specialty: 'Hamshira - Mobil Brigada #1',
      licenseNumber: 'UZ-NRS-1082',
    },
  });

  const nurse2 = await prisma.user.create({
    data: {
      email: 'nurse.qoraqalpoq@telemed.uz',
      passwordHash,
      fullName: 'Gulzira Ospanova',
      phone: '+998947778899',
      role: UserRole.NURSE,
      specialty: 'Hamshira - Mobil Brigada #2',
      licenseNumber: 'UZ-NRS-2041',
    },
  });

  const radiologist = await prisma.user.create({
    data: {
      email: 'radiologist.tashkent@telemed.uz',
      passwordHash,
      fullName: 'Prof. Jamshid Xodjayev',
      phone: '+998971112233',
      role: UserRole.RADIOLOGIST,
      specialty: 'Radiologiya va Pulmonologiya Eksperti',
      licenseNumber: 'UZ-RAD-7789',
      digitalSignature: 'ED25519-SIG-7789-JAMSHID-XODJAYEV-TASHKENT-REPUBLIC-MED',
    },
  });

  const cardiologist = await prisma.user.create({
    data: {
      email: 'cardiologist.tashkent@telemed.uz',
      passwordHash,
      fullName: 'Dr. Shahnoza Rustamova',
      phone: '+998909998877',
      role: UserRole.CARDIOLOGIST,
      specialty: 'Kardiologiya va Funktsional Diagnostika',
      licenseNumber: 'UZ-CARD-4421',
      digitalSignature: 'ED25519-SIG-4421-SHAHNOZA-RUSTAMOVA-TASHKENT-REPUBLIC-MED',
    },
  });

  const patientUser = await prisma.user.create({
    data: {
      email: 'bemor@telemed.uz',
      passwordHash,
      fullName: 'Anvar Karimov',
      phone: '+998901239988',
      role: UserRole.USER,
      specialty: 'Bemor / Fuqaro',
    },
  });

  const patientUserAlt = await prisma.user.create({
    data: {
      email: 'user@telemed.uz',
      passwordHash,
      fullName: 'Otabek Rahimov',
      phone: '+998931112233',
      role: UserRole.USER,
      specialty: 'Bemor / Fuqaro',
    },
  });

  console.log('✅ Users seeded.');

  // 3. Seed Mobile Clinics (Uzbekistan remote regions)
  const clinic1 = await prisma.mobileClinic.create({
    data: {
      name: 'Mobil Brigada #1 - Surxondaryo (Boysun)',
      plateNumber: '75 041 AAA',
      region: 'Surxondaryo',
      district: 'Boysun',
      currentLat: 38.2064,
      currentLng: 67.2028,
      isOnline: true,
      lastPing: new Date(),
      assignedNurseId: nurse1.id,
    },
  });

  const clinic2 = await prisma.mobileClinic.create({
    data: {
      name: 'Mobil Brigada #2 - Qoraqalpog\'iston (Mo\'ynoq)',
      plateNumber: '95 712 BBA',
      region: "Qoraqalpog'iston",
      district: "Mo'ynoq",
      currentLat: 43.7683,
      currentLng: 59.0214,
      isOnline: true,
      lastPing: new Date(),
      assignedNurseId: nurse2.id,
    },
  });

  const clinic3 = await prisma.mobileClinic.create({
    data: {
      name: 'Mobil Brigada #3 - Jizzax (Zomin tog\'li hududi)',
      plateNumber: '25 330 CCA',
      region: 'Jizzax',
      district: 'Zomin',
      currentLat: 39.9606,
      currentLng: 68.3958,
      isOnline: false,
      lastPing: new Date(Date.now() - 3600 * 1000 * 4),
    },
  });

  console.log('✅ Mobile Clinics seeded.');

  // 4. Seed Patients in remote villages
  const patient1 = await prisma.patient.create({
    data: {
      fullName: 'Sobirov Ergash Normurodovich',
      pinfl: '31508740120015',
      passport: 'AA4829104',
      birthDate: new Date('1964-08-15'),
      age: 62,
      gender: Gender.MALE,
      region: 'Surxondaryo',
      district: 'Boysun',
      village: 'Derbent qishlog‘i',
      latitude: 38.1921,
      longitude: 67.0145,
      phone: '+998912345678',
      complaints: '3 kundan beri nafas qisishi, 38.5 daraja isitma va ko‘krak qafasida sanchuvchi og‘riq.',
      createdById: nurse1.id,
    },
  });

  const patient2 = await prisma.patient.create({
    data: {
      fullName: 'Jumaniyazova Roziya Kenjayevna',
      pinfl: '42205690830022',
      passport: 'AB9921443',
      birthDate: new Date('1959-05-22'),
      age: 67,
      gender: Gender.FEMALE,
      region: "Qoraqalpog'iston",
      district: "Mo'ynoq",
      village: 'Uchsay qishlog‘i',
      latitude: 43.8512,
      longitude: 59.0833,
      phone: '+998943332211',
      complaints: 'Yurak urishi tezlashishi, bosh aylanishi va tez charchash.',
      createdById: nurse2.id,
    },
  });

  const patient3 = await prisma.patient.create({
    data: {
      fullName: 'Karimov Anvar Saidovich',
      pinfl: '32001850450033',
      passport: 'AC1234567',
      birthDate: new Date('1985-01-20'),
      age: 41,
      gender: Gender.MALE,
      region: 'Qashqadaryo',
      district: 'Dehqonobod',
      village: 'Qorashina qishlog‘i',
      latitude: 38.3300,
      longitude: 66.4900,
      phone: '+998901239988',
      complaints: 'Bel sohasida o‘tkir sanchuvchi og‘riq, o‘ng oyoqqa tortib berish.',
      createdById: nurse1.id,
    },
  });

  const patient4 = await prisma.patient.create({
    data: {
      fullName: 'Rustamova Shahnoza Baxtiyorovna',
      pinfl: '41804920670044',
      passport: 'AD7654321',
      birthDate: new Date('1992-04-18'),
      age: 34,
      gender: Gender.FEMALE,
      region: 'Jizzax',
      district: 'Zomin',
      village: 'Duoba qishlog‘i',
      latitude: 39.6700,
      longitude: 68.5100,
      phone: '+998935558899',
      complaints: 'Kuchli bosh og‘rig‘i, qon bosimi 150/95 ga ko‘tarilishi va holsizlik.',
      createdById: nurse1.id,
    },
  });

  const patient5 = await prisma.patient.create({
    data: {
      fullName: 'Xoliqov Bobur Murodovich',
      pinfl: '31006780910055',
      passport: 'AE5544332',
      birthDate: new Date('1978-06-10'),
      age: 48,
      gender: Gender.MALE,
      region: 'Samarqand',
      district: 'Urgut',
      village: 'G‘o‘s qishlog‘i',
      latitude: 39.4000,
      longitude: 67.2400,
      phone: '+998971114455',
      complaints: 'Oshqozonda achishish, ovqatdan so‘ng og‘irlik va jig‘ildon qaynashi.',
      createdById: nurse1.id,
    },
  });

  const patient6 = await prisma.patient.create({
    data: {
      fullName: 'Omonova Feruza Ilhom qizi',
      pinfl: '40509980120066',
      passport: 'AF9988776',
      birthDate: new Date('1998-09-05'),
      age: 28,
      gender: Gender.FEMALE,
      region: 'Xorazm',
      district: 'Xonqa',
      village: 'Navxos qishlog‘i',
      latitude: 41.4800,
      longitude: 60.7700,
      phone: '+998993337711',
      complaints: 'Quruq yo‘tal, tomoqda qichishish va tana harorati 37.8 daraja.',
      createdById: nurse2.id,
    },
  });

  console.log('✅ Patients seeded.');

  // 5. Seed Examinations, Uploads & AI Results
  const exam1 = await prisma.examination.create({
    data: {
      patientId: patient1.id,
      clinicId: clinic1.id,
      nurseId: nurse1.id,
      status: ExaminationStatus.DOCTOR_REVIEW,
      priority: 4, // CRITICAL
      riskLevel: RiskLevel.CRITICAL,
      nurseNotes: 'Bemorning holati o‘rtacha og‘ir, puls 98, SpO2 91%. Rentgen tekshiruvi amalga oshirildi.',
    },
  });

  const upload1 = await prisma.upload.create({
    data: {
      examinationId: exam1.id,
      fileType: FileType.XRAY,
      originalName: 'chest_xray_ergash_sobirov.png',
      mimeType: 'image/png',
      fileSize: 4194304,
      minioKey: 'uploads/2026/09/xray_ergash_sobirov_01.png',
      previewKey: 'previews/2026/09/xray_ergash_sobirov_01_thumb.png',
      metadata: {
        modality: 'CR',
        bodyPart: 'CHEST',
        viewPosition: 'PA',
        dimensions: { width: 2048, height: 2048 },
      },
    },
  });

  await prisma.aiResult.create({
    data: {
      examinationId: exam1.id,
      uploadId: upload1.id,
      confidence: 97.4,
      riskLevel: RiskLevel.CRITICAL,
      findings: [
        {
          name: 'Possible left lower lobe consolidation/opacity',
          confidence: 97.4,
          region: 'Left lower zone',
          urgency: 'HIGH',
        },
        {
          name: 'Possible pleural effusion signs',
          confidence: 84.1,
          region: 'Left costophrenic angle',
          urgency: 'MEDIUM',
        },
      ],
      overlayImageUrl: 'heatmaps/2026/09/xray_ergash_sobirov_01_gradcam.png',
      highlightedRegions: {
        bbox: [0.15, 0.45, 0.42, 0.78],
        intensityMax: 0.98,
      },
      technicalSummary: 'Left lower lobe opacity detected with 97.4% model confidence. Radiographic pattern shows focal dense airspace opacity compatible with lobar pneumonia. Clinical correlation and immediate physician evaluation recommended.',
      patientExplanationUzbek: 'Rentgen tasvirida chap o‘pkaning pastki qismida zudlik bilan shifokor ko‘rigini talab qiladigan o‘pka shamollashi (pnevmoniya ehtimoli) belgilari aniqlandi. Bu yakuniy tashxis emas. Toshkentdagi yetakchi mutaxassis natijani tekshirmoqda. Iltimos, shifokor tavsiyasini kuting va o‘zboshimchalik bilan dori qabul qilmang.',
      modelVersion: 'TorchXRayVision-v2.1+DenseNet121',
      latencyMs: 1240,
    },
  });

  // Doctor Review for Exam 1
  await prisma.doctorReview.create({
    data: {
      examinationId: exam1.id,
      doctorId: radiologist.id,
      specialty: 'Radiologiya va Pulmonologiya',
      decision: DoctorDecision.APPROVED,
      finalDiagnosis: 'Chap tomonlama o‘tkir pnevmoniya, o‘rtacha og‘ir kechishi (J18.0).',
      recommendations: 'Antibiotikoterapiya (Sefriakson 1.0g kunda 2 marta m/o), mukolitiklar, ko‘p suyuqlik ichish va 5 kundan so‘ng nazorat rentgen tekshiruvi.',
      notes: 'AI tahlili rentgenologik belgilar bilan to‘liq mos keldi. Bemorga zudlik bilan davo choralari tayinlandi.',
      digitalSignature: 'ED25519-SIG-7789-JAMSHID-XODJAYEV-TASHKENT-REPUBLIC-MED',
    },
  });

  // Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: nurse1.id,
      action: 'PATIENT_REGISTERED',
      resource: 'Patient',
      resourceId: patient1.id,
      ipAddress: '185.139.137.45',
      userAgent: 'MobileClinic-Tablet/1.0',
      details: { village: 'Derbent', region: 'Surxondaryo' },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: nurse1.id,
      action: 'XRAY_UPLOADED_TO_QUEUE',
      resource: 'Upload',
      resourceId: upload1.id,
      ipAddress: '185.139.137.45',
      userAgent: 'MobileClinic-Tablet/1.0',
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: radiologist.id,
      action: 'DOCTOR_REVIEW_SUBMITTED',
      resource: 'DoctorReview',
      resourceId: exam1.id,
      details: { decision: 'APPROVED', specialty: 'Radiologiya' },
    },
  });

  console.log('🌱 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
