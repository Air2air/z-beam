import { describe, expect, it } from '@jest/globals';

import { getEquipmentRentalPriceTable } from '@/app/utils/pricing/getEquipmentRentalPriceTable';

describe('getEquipmentRentalPriceTable', () => {
  it('builds a single pricing table from canonical hourly rates', () => {
    const table = getEquipmentRentalPriceTable();

    expect(table.table.columns).toEqual([
      'Rental Period',
      'Savings',
      'Residential',
      'Commercial',
    ]);
    expect(table.table.rows[0].savings).toBe('N/A');
    expect(table.table.rows[0].rentalPeriod).toBe('Half-Day');
    expect(table.table.rows[0].description).toBe('Up to 4 hours');
    expect(table.table.rows[0].residentialRate).toBe('$200/hr');
    expect(table.table.rows[0].commercialRate).toBe('$300/hr');
    expect(table.table.rows[1].rentalPeriod).toBe('Full-Day');
    expect(table.table.rows[1].residentialRate).toBe('$186/hr');
    expect(table.table.rows[1].commercialRate).toBe('$279/hr');
    expect(table.table.rows[1].savings).toBe('7%');
    expect(table.table.rows[2].rentalPeriod).toBe('Multi-Day');
    expect(table.table.rows[2].residentialRate).toBe('$170/hr');
    expect(table.table.rows[2].commercialRate).toBe('$255/hr');
    expect(table.table.rows[2].savings).toBe('15%');
    expect(table.table.rows[3].rentalPeriod).toBe('Weekend');
    expect(table.table.rows[3].residentialRate).toBe('$176/hr');
    expect(table.table.rows[3].commercialRate).toBe('$264/hr');
    expect(table.table.rows[3].savings).toBe('12%');
    expect(table.table.rows[4].savings).toBe('Call');
    expect(table.table.rows[4].residentialRate).toBe('Call');
    expect(table.table.rows[4].commercialRate).toBe('Call');
    expect(table.table.rows[4].callToActionHref).toBe('/contact');
  });
});