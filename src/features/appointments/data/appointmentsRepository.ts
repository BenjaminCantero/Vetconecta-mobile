// Responsabilidad: acceso a datos de citas (capa DATA).
// Llama a la API externa vía httpClient (GET, solo lectura) y mapea los
// DTO recibidos a la entidad del dominio Appointment.

import { httpClient } from '../../../core/api/httpClient';
import { ENDPOINTS } from '../../../core/api/endpoints';
import type { Appointment, AppointmentStatus } from '../domain/Appointment';
import type { AppointmentDto } from './appointmentsDto';

function toAppointment(dto: AppointmentDto): Appointment {
  return {
    id: dto.id,
    petId: dto.id_mascota,
    date: dto.fecha,
    reason: dto.motivo,
    status: dto.estado as AppointmentStatus,
    veterinarian: dto.veterinario,
  };
}

export const appointmentsRepository = {
  async getAppointments(): Promise<Appointment[]> {
    const { data } = await httpClient.get<AppointmentDto[]>(ENDPOINTS.APPOINTMENTS.LIST);
    return data.map(toAppointment);
  },
};
