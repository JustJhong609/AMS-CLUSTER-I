import { districtCoverage } from '../data/districtCoverage';
import { clusterCoverage } from '../data/clusterCoverage';
import { MunicipalityKey } from '../types';

const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');

const BARANGAY_ALIASES: Record<string, string> = {
  [normalizeText('Sil ipon')]: 'Sil-ipon',
  [normalizeText('Sil-ipon')]: 'Sil-ipon',
  [normalizeText('Siloo')]: 'Silo-o',
  [normalizeText('Silo-o')]: 'Silo-o',
  [normalizeText('Sta. Ines')]: 'Santa Ines',
  [normalizeText('Sta Ines')]: 'Santa Ines',
  [normalizeText('Kailangan')]: 'Kalilangan',
};

const allBarangays = clusterCoverage.flatMap((item) => item.barangays);

export const canonicalizeBarangay = (barangay: string): string => {
  if (!barangay) return barangay;

  const normalized = normalizeText(barangay);
  if (BARANGAY_ALIASES[normalized]) return BARANGAY_ALIASES[normalized];

  return allBarangays.find((name) => normalizeText(name) === normalized) ?? barangay;
};

export const getMunicipalityByBarangay = (barangay: string): MunicipalityKey | undefined => {
  const canonical = canonicalizeBarangay(barangay);
  return clusterCoverage.find((item) => item.barangays.includes(canonical))?.municipality;
};

export const getDistrictByBarangay = (barangay: string, municipality?: MunicipalityKey | ''): string | undefined => {
  const canonical = canonicalizeBarangay(barangay);
  const pool = municipality
    ? districtCoverage.filter((item) => item.municipality === municipality)
    : districtCoverage;

  return pool.find((item) => item.barangays.includes(canonical))?.district;
};

export const getDistrictOptions = (municipality?: MunicipalityKey | ''): string[] => {
  const list = municipality
    ? districtCoverage.filter((item) => item.municipality === municipality)
    : districtCoverage;
  return Array.from(new Set(list.map((item) => item.district)));
};

export const getBarangaysByMunicipalityDistrict = (municipality?: MunicipalityKey | '', district?: string): string[] => {
  if (!municipality) return [];

  if (!district) {
    return clusterCoverage.find((item) => item.municipality === municipality)?.barangays ?? [];
  }

  return districtCoverage.find((item) => item.municipality === municipality && item.district === district)?.barangays ?? [];
};
