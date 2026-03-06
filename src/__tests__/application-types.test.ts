import { describe, it, expect } from 'vitest';
import {
  APPLICATION_STATUS_CONFIG,
  APPLICATION_STATUSES,
} from '@/types/application';
import type { ApplicationStatus, RenterSnapshot } from '@/types/application';

describe('APPLICATION_STATUS_CONFIG', () => {
  it('has config for all statuses', () => {
    const statuses: ApplicationStatus[] = [
      'applied', 'viewing_scheduled', 'under_review', 'accepted', 'declined',
    ];
    for (const status of statuses) {
      expect(APPLICATION_STATUS_CONFIG[status]).toBeDefined();
      expect(APPLICATION_STATUS_CONFIG[status].label).toBeTruthy();
      expect(APPLICATION_STATUS_CONFIG[status].color).toBeTruthy();
      expect(APPLICATION_STATUS_CONFIG[status].bgColor).toBeTruthy();
    }
  });

  it('has correct labels', () => {
    expect(APPLICATION_STATUS_CONFIG.applied.label).toBe('Applied');
    expect(APPLICATION_STATUS_CONFIG.viewing_scheduled.label).toBe('Viewing Scheduled');
    expect(APPLICATION_STATUS_CONFIG.under_review.label).toBe('Under Review');
    expect(APPLICATION_STATUS_CONFIG.accepted.label).toBe('Accepted');
    expect(APPLICATION_STATUS_CONFIG.declined.label).toBe('Declined');
  });

  it('has color classes for each status', () => {
    for (const status of APPLICATION_STATUSES) {
      expect(APPLICATION_STATUS_CONFIG[status].color).toMatch(/^text-/);
      expect(APPLICATION_STATUS_CONFIG[status].bgColor).toMatch(/^bg-/);
    }
  });
});

describe('APPLICATION_STATUSES', () => {
  it('contains all 5 statuses', () => {
    expect(APPLICATION_STATUSES).toHaveLength(5);
  });

  it('is ordered correctly (pipeline order)', () => {
    expect(APPLICATION_STATUSES[0]).toBe('applied');
    expect(APPLICATION_STATUSES[1]).toBe('viewing_scheduled');
    expect(APPLICATION_STATUSES[2]).toBe('under_review');
    expect(APPLICATION_STATUSES[3]).toBe('accepted');
    expect(APPLICATION_STATUSES[4]).toBe('declined');
  });

  it('matches the config keys', () => {
    const configKeys = Object.keys(APPLICATION_STATUS_CONFIG);
    expect(APPLICATION_STATUSES).toEqual(expect.arrayContaining(configKeys));
    expect(configKeys).toEqual(expect.arrayContaining([...APPLICATION_STATUSES]));
  });
});

describe('RenterSnapshot type', () => {
  it('can construct a valid snapshot', () => {
    const snapshot: RenterSnapshot = {
      full_name: 'John Doe',
      email: 'john@example.com',
      phone: '+386 40 123 456',
      employment_status: 'employed',
      employment_other: null,
      monthly_income_range: '2000-3000',
      move_in_timeline: 'asap',
      household_size: 2,
      has_pets: true,
      pet_details: '1 small dog',
      is_smoker: false,
      looking_duration: 'a_year',
      age_bracket: '25-34',
      nationality: 'Slovenian',
      occupation: 'Software engineer',
      bio: 'Looking for a quiet apartment.',
      default_cover_letter: null,
    };
    expect(snapshot.full_name).toBe('John Doe');
    expect(snapshot.has_pets).toBe(true);
    expect(snapshot.is_smoker).toBe(false);
  });

  it('allows null fields', () => {
    const snapshot: RenterSnapshot = {
      full_name: null,
      email: null,
      phone: null,
      employment_status: null,
      employment_other: null,
      monthly_income_range: null,
      move_in_timeline: null,
      household_size: null,
      has_pets: false,
      pet_details: null,
      is_smoker: false,
      looking_duration: null,
      age_bracket: null,
      nationality: null,
      occupation: null,
      bio: null,
      default_cover_letter: null,
    };
    expect(snapshot.full_name).toBeNull();
    expect(snapshot.household_size).toBeNull();
  });
});
