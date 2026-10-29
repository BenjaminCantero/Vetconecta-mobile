/* global jest, it, expect */
import React from 'react';
import { act, create } from 'react-test-renderer';
import { useMedicationReminders } from '../useMedicationReminders';

it('separa las pautas por id incluso cuando las mascotas tienen el mismo nombre', async () => {
  const first = { id: 'pauta-1', petId: 'mascota-1', petName: 'Luna' };
  const second = { id: 'pauta-2', petId: 'mascota-2', petName: 'Luna' };
  const repository = { getReminders: jest.fn().mockResolvedValue([first, second]) };
  let result;
  let tree;
  function Probe({ petId }) {
    result = useMedicationReminders(repository, petId);
    return null;
  }

  try {
    await act(async () => {
      tree = create(<Probe petId="mascota-1" />);
    });
    expect(result.reminders).toEqual([first]);

    act(() => tree.update(<Probe petId="mascota-2" />));
    expect(result.reminders).toEqual([second]);

    act(() => tree.update(<Probe petId="sin-pauta" />));
    expect(result.reminders).toEqual([]);

    act(() => tree.update(<Probe petId={null} />));
    expect(result.reminders).toEqual([]);
  } finally {
    if (tree) act(() => tree.unmount());
  }
});
