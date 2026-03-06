import {
  Key, ShoppingCart, Home, Building2,
  Briefcase, User, GraduationCap, Clock, Users,
} from 'lucide-react';

// ── Intent options ──────────────────────────────────────────────────────────
export const INTENT_OPTIONS = [
  { value: 'rent', label: 'I want to rent', description: 'Looking for a place to rent', icon: Key },
  { value: 'buy', label: 'I want to buy', description: 'Looking to purchase property', icon: ShoppingCart },
  { value: 'renting_out', label: "I'm renting out", description: 'I have property to rent', icon: Home },
  { value: 'selling', label: "I'm selling", description: 'I have property to sell', icon: Building2 },
] as const;

// ── Renter options ──────────────────────────────────────────────────────────
export const EMPLOYMENT_OPTIONS = [
  { value: 'employed', label: 'Employed', icon: Briefcase },
  { value: 'self_employed', label: 'Self-employed', icon: User },
  { value: 'student', label: 'Student', icon: GraduationCap },
  { value: 'retired', label: 'Retired', icon: Clock },
  { value: 'other', label: 'Other', icon: Users },
] as const;

export const TIMELINE_OPTIONS = [
  { value: 'asap', label: 'ASAP' },
  { value: '1_month', label: 'Within 1 month' },
  { value: '2_3_months', label: '2-3 months' },
  { value: '3_6_months', label: '3-6 months' },
  { value: 'flexible', label: 'Flexible' },
] as const;

export const LOOKING_DURATION_OPTIONS = [
  { value: 'few_months', label: 'A few months' },
  { value: 'a_year', label: 'About a year' },
  { value: 'indefinite', label: 'As long as possible' },
  { value: 'until_date', label: 'Until a date' },
] as const;

// ── Optional detail options ─────────────────────────────────────────────────
export const AGE_BRACKET_OPTIONS = [
  '18-24', '25-34', '35-44', '45-54', '55-64', '65+',
] as const;

export const MARITAL_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'partner', label: 'Partner' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
] as const;

export const EDUCATION_OPTIONS = [
  { value: 'high_school', label: 'High school' },
  { value: 'bachelors', label: 'Bachelors' },
  { value: 'masters', label: 'Masters' },
  { value: 'phd', label: 'PhD' },
  { value: 'other', label: 'Other' },
] as const;

// ── Landlord options ────────────────────────────────────────────────────────
export const MANAGEMENT_OPTIONS = [
  { value: 'private', label: 'Private owner' },
  { value: 'company', label: 'Management company' },
] as const;

export const RESPONSE_TIME_OPTIONS = [
  { value: 'within_hour', label: 'Within an hour' },
  { value: 'same_day', label: 'Same day' },
  { value: 'next_day', label: 'Next business day' },
] as const;
