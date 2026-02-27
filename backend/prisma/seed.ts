import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/hash.utils';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@smartsuport.com' },
    update: {},
    create: {
      email: 'admin@smartsuport.com',
      password: await hashPassword('admin123'),
      name: 'Administrador',
      role: 'ADMIN',
      phone: '+5511999999999',
      isEmailVerified: true,
      isActive: true,
    },
  });

  console.log('Admin criado:', admin.email);

  const providersData = [
    { email: 'provider@smartsuport.com', password: 'provider123', name: 'Dr. João Silva', phone: '+5511888888888' },
    { email: 'provider2@smartsuport.com', password: 'provider123', name: 'Dra. Ana Costa', phone: '+5511888888881' },
    { email: 'provider3@smartsuport.com', password: 'provider123', name: 'Carlos Mendes', phone: '+5511888888882' },
    { email: 'provider4@smartsuport.com', password: 'provider123', name: 'Dra. Fernanda Lima', phone: '+5511888888883' },
    { email: 'provider5@smartsuport.com', password: 'provider123', name: 'Ricardo Oliveira', phone: '+5511888888884' },
    { email: 'provider6@smartsuport.com', password: 'provider123', name: 'Dra. Patrícia Rocha', phone: '+5511888888885' },
    { email: 'provider7@smartsuport.com', password: 'provider123', name: 'Marcos Souza', phone: '+5511888888886' },
  ];

  const daysOfWeek = [1, 2, 3, 4, 5]; // Segunda a Sexta
  const availabilityData = {
    startTime: '09:00',
    endTime: '17:00',
    isRecurring: true,
    slotDuration: 60,
    bufferTime: 0,
    maxBookingsPerSlot: 1,
    isActive: true,
    timezone: 'America/Sao_Paulo',
  };

  for (const p of providersData) {
    const provider = await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: {
        email: p.email,
        password: await hashPassword(p.password),
        name: p.name,
        role: 'PROVIDER',
        phone: p.phone,
        isEmailVerified: true,
        isActive: true,
      },
    });
    console.log('Provider criado:', provider.email);

    await prisma.availability.deleteMany({
      where: { providerId: provider.id },
    });

    for (const dayOfWeek of daysOfWeek) {
      await prisma.availability.create({
        data: {
          providerId: provider.id,
          dayOfWeek,
          ...availabilityData,
        },
      });
    }
  }

  console.log('Disponibilidades criadas para todos os providers');

  // Criar Client de exemplo
  const client = await prisma.user.upsert({
    where: { email: 'client@smartsuport.com' },
    update: {},
    create: {
      email: 'client@smartsuport.com',
      password: await hashPassword('client123'),
      name: 'Maria Santos',
      role: 'CLIENT',
      phone: '+5511777777777',
      isEmailVerified: true,
      isActive: true,
    },
  });

  console.log('Client criado:', client.email);

  console.log('\nCredenciais criadas:');
  console.log('\nADMIN:');
  console.log('   Email: admin@smartsuport.com');
  console.log('   Senha: admin123');
  console.log('\nPROVIDERS (todos usam senha: provider123):');
  providersData.forEach((p) => console.log(`   ${p.name}: ${p.email}`));
  console.log('\nCLIENT:');
  console.log('   Email: client@smartsuport.com');
  console.log('   Senha: client123');
  console.log('\nSeed concluído!');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
