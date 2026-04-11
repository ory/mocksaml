export interface CignaTestUser {
  password: string;
  sub: string;
  given_name: string;
  family_name: string;
  email: string;
  birthdate: string;
  gender: string;
  employer_id: string;
  employer_name: string;
  products: string[];
}

export const TEST_USERS: Record<string, CignaTestUser> = {
  JoePlayer: {
    password: 'nflmycigna1',
    sub: 'MOCK-MEMBER-001',
    given_name: 'Joe',
    family_name: 'Player',
    email: 'joeplayer@test.cigna.com',
    birthdate: '1990-01-15T00:00:00Z',
    gender: 'female',
    employer_id: '3174704',
    employer_name: 'Cigna',
    products: [],
  },
  testfujifilm: {
    password: 'Fujifilm1',
    sub: 'MOCK-MEMBER-002',
    given_name: 'Test',
    family_name: 'Fujifilm',
    email: 'testfujifilm@test.cigna.com',
    birthdate: '1988-06-20T00:00:00Z',
    gender: 'female',
    employer_id: '3209976',
    employer_name: 'Fujifilm',
    products: ['/cigna/eligibility/feature/benefit/cignahealthypregnanciesandbabies'],
  },
  Holt25: {
    password: 'Titans35',
    sub: 'MOCK-MEMBER-003',
    given_name: 'Holt',
    family_name: 'Twenty-Five',
    email: 'holt25@test.cigna.com',
    birthdate: '1992-03-10T00:00:00Z',
    gender: 'female',
    employer_id: '3333770',
    employer_name: 'MNPS',
    products: ['/cigna/eligibility/feature/benefit/cignahealthypregnanciesandbabies'],
  },
  Testcitizens: {
    password: 'Citizens2015',
    sub: 'MOCK-MEMBER-004',
    given_name: 'Test',
    family_name: 'Citizens',
    email: 'testcitizens@test.cigna.com',
    birthdate: '1985-11-05T00:00:00Z',
    gender: 'female',
    employer_id: '3331040',
    employer_name: 'Citizens',
    products: ['/cigna/eligibility/feature/benefit/cignahealthypregnanciesandbabies'],
  },
};
