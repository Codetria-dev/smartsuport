/**
 * Utilitários para manipulação de datas e horários
 */

/**
 * Converte string HH:mm para minutos desde meia-noite
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Converte minutos desde meia-noite para string HH:mm
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Adiciona minutos a um horário
 */
export function addMinutes(time: string, minutes: number): string {
  const totalMinutes = timeToMinutes(time) + minutes;
  return minutesToTime(totalMinutes);
}

/**
 * Verifica se um horário está entre dois horários
 */
export function isTimeBetween(time: string, start: string, end: string): boolean {
  const timeMinutes = timeToMinutes(time);
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
}

/**
 * Gera slots de tempo baseado em intervalo e duração
 */
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  slotDuration: number,
  bufferTime: number = 0
): string[] {
  const slots: string[] = [];
  let currentTime = startTime;
  const endMinutes = timeToMinutes(endTime);

  while (timeToMinutes(currentTime) + slotDuration <= endMinutes) {
    slots.push(currentTime);
    const nextSlot = timeToMinutes(currentTime) + slotDuration + bufferTime;
    currentTime = minutesToTime(nextSlot);
  }

  return slots;
}

/**
 * Obtém o dia da semana de uma data (0 = Domingo, 6 = Sábado)
 */
export function getDayOfWeek(date: Date): number {
  return date.getDay();
}

/**
 * Formata data para string ISO
 */
export function formatDateISO(date: Date): string {
  return date.toISOString();
}

/**
 * Cria uma data combinando data e hora
 */
export function combineDateTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

/**
 * Verifica se duas datas/horários se sobrepõem
 */
export function hasOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && start2 < end1;
}
