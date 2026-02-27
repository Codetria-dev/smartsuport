import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

export interface ClientListItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
}

/**
 * Lista clientes: para PROVIDER só os que ele cadastrou; para ADMIN todos com role CLIENT.
 */
export async function getClients(
  userId: string,
  role: string
): Promise<ClientListItem[]> {
  const isAdmin = role === 'ADMIN';

  const users = await prisma.user.findMany({
    where: {
      role: 'CLIENT',
      ...(isAdmin ? {} : { registeredByUserId: userId }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    createdAt: u.createdAt.toISOString(),
  }));
}

/**
 * Retorna um cliente por ID se pertencer ao provider ou for ADMIN.
 */
export async function getClientById(
  clientId: string,
  userId: string,
  role: string
): Promise<ClientListItem | null> {
  const isAdmin = role === 'ADMIN';
  const user = await prisma.user.findFirst({
    where: {
      id: clientId,
      role: 'CLIENT',
      ...(isAdmin ? {} : { registeredByUserId: userId }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
    },
  });
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    createdAt: user.createdAt.toISOString(),
  };
}

/**
 * Exclui um cliente (apenas quem cadastrou ou ADMIN). Não remove usuário do sistema,
 * apenas desvincula ou desativa conforme política; aqui removemos o usuário CLIENT.
 */
export async function deleteClient(
  clientId: string,
  userId: string,
  role: string
): Promise<void> {
  const isAdmin = role === 'ADMIN';
  const client = await prisma.user.findFirst({
    where: {
      id: clientId,
      role: 'CLIENT',
      ...(isAdmin ? {} : { registeredByUserId: userId }),
    },
  });
  if (!client) {
    throw new AppError('Cliente não encontrado ou você não tem permissão para excluí-lo', 404);
  }
  await prisma.user.delete({
    where: { id: clientId },
  });
}
