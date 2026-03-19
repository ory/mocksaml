/* eslint-disable react-hooks/exhaustive-deps */
import { SSOFormData } from 'pages/saml/sydney';
import { type FormEvent, useState, useEffect, useRef } from 'react';

const programOptions = [
  {
    nm: 'BUILDING HEALTHY FAMILIES',
    id: '1070431',
  },
  {
    nm: 'BUILDING HEALTHY FAMILIES COMPLETE WITHOUT DOULA',
    id: '1359586',
  },
  {
    nm: 'BUILDING HEALTHY FAMILIES COMPLETE WITH DOULA CARE',
    id: '1359585',
  },
];

const year = new Date().getFullYear();
const firstDay = new Date(year, 0, 1).toLocaleDateString('en-US', {
  month: '2-digit',
  day: '2-digit',
  year: 'numeric',
});
const lastDay = new Date(year, 11, 31).toLocaleDateString('en-US', {
  month: '2-digit',
  day: '2-digit',
  year: 'numeric',
});

export type EligibilitySpecificData = {
  zipCode: string;
  gender: string;
  subRelation: string;
  groupId: string;
  programId: string;
  brandCd: string;
  fundingTypeCd: string;
  underwritingStateCd: string;
  programNm: string;
  cvrgStartDt: string;
  cvrgEndDt: string;
};

export type EligibilityFormData = Omit<SSOFormData, 'fundingType'> & EligibilitySpecificData;

interface MockEligibilityProps {
  SSOFormData: SSOFormData;
  onSuccess?: () => void;
  onDataChange?: (eligibilityData: EligibilityFormData) => void;
  onMount?: (formData: EligibilityFormData) => void;
  eligibilityDataFromJson?: EligibilityFormData | null;
  hideSaveButton?: boolean;
}

export default function MockEligibility(props: MockEligibilityProps) {
  const { SSOFormData, onSuccess, onDataChange, onMount, eligibilityDataFromJson, hideSaveButton } = props;
  const [hasError, setHasError] = useState(false);
  const [loading, setLoading] = useState(false);

  const { fundingType, ...SSOFormDataWithoutFundingType } = SSOFormData; // remove funding type
  const [formData, setFormData] = useState<EligibilityFormData>({
    ...SSOFormDataWithoutFundingType,
    zipCode: '98101',
    gender: 'F',
    subRelation: 'SCRBR',
    groupId: '98101',
    programId: programOptions[0].id,
    brandCd: 'ABCBS',
    fundingTypeCd: SSOFormData.fundingType,
    underwritingStateCd: SSOFormData.stateCode,
    programNm: programOptions[0].nm,
    cvrgStartDt: firstDay,
    cvrgEndDt: lastDay,
  });

  useEffect(() => {
    const { fundingType, ...SSOFormDataWithoutFundingType } = SSOFormData;
    const updatedFormData = {
      ...formData,
      ...SSOFormDataWithoutFundingType,
      fundingTypeCd: SSOFormData.fundingType,
      underwritingStateCd: SSOFormData.stateCode,
    };
    setFormData(updatedFormData);
    onDataChange?.(updatedFormData);
  }, [SSOFormData]);

  useEffect(() => {
    const updatedFormData = {
      ...formData,
      programId: programOptions.find((opt) => formData.programNm === opt.nm)?.id || '',
    };
    setFormData(updatedFormData);
    onDataChange?.(updatedFormData);
  }, [formData.programNm]);

  useEffect(() => {
    if (Object.keys(formData).some((key) => formData[key as keyof typeof formData] === '')) {
      setHasError(true);
    } else {
      setHasError(false);
    }
  }, [formData]);

  useEffect(() => {
    if (onMount) {
      onMount(formData);
    }
  }, []); // Empty dependency array = run once on mount

  // Update form data when eligibility data is pasted from JSON
  useEffect(() => {
    if (eligibilityDataFromJson) {
      setFormData(eligibilityDataFromJson);
    }
  }, [eligibilityDataFromJson]);

  const handleChange = (e: FormEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.currentTarget;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
    onDataChange?.(updatedFormData);
  };

  // Deprecated, leaving in place in case prior functionality is requested
  // the parent form "SSO Form" now calls this endpoint and waits before submitting the SSO request
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const mockEligibilityUrl = '/api/saml/mock-eligibility';
    const response = await fetch(mockEligibilityUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
      }),
    });
    setLoading(false);
    if (response.ok) {
      onSuccess && onSuccess();
      alert((await response.json()).message);
    } else {
      alert('Error in saved Mock Response');
    }
  };

  return (
    <div className='mt-6'>
      <form onSubmit={handleSubmit} className='border-2 bg-white p-6 rounded-lg w-full space-y-6'>
        <h1 className='text-2xl font-bold text-gray-800'>Mock Eligibility</h1>

        <div className='flex flex-col sm:flex-row gap-3'>
          <div className='form-control flex-1'>
            <label className='label'>
              <span className='label-text font-bold'>First Name</span>
            </label>
            <input
              name='firstName'
              id='firstName'
              autoComplete='off'
              type='text'
              value={formData.firstName}
              onChange={handleChange}
              className='input input-bordered w-full'
              title='Please provide a mock first name'
              disabled
            />
          </div>

          <div className='form-control flex-1'>
            <label className='label'>
              <span className='label-text font-bold'>Last Name</span>
            </label>
            <input
              name='lastName'
              id='lastName'
              autoComplete='off'
              type='text'
              value={formData.lastName}
              onChange={handleChange}
              className='input input-bordered w-full'
              title='Please provide a mock last name'
              disabled
            />
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-3'>
          <div className='form-control flex-1'>
            <label className='label'>
              <span className='label-text font-bold'>DOB</span>
            </label>
            <input
              name='dob'
              id='dob'
              autoComplete='off'
              type='text'
              value={formData.dob}
              onChange={handleChange}
              className='input input-bordered w-full'
              title='Please provide a mock dob'
              disabled
            />
          </div>

          <div className='form-control flex-1'>
            <label className='label'>
              <span className='label-text font-bold'>HCID</span>
            </label>
            <input
              name='hcid'
              id='hcid'
              autoComplete='off'
              type='text'
              value={formData.hcid}
              onChange={handleChange}
              className='input input-bordered w-full'
              title='Please provide a mock hcid'
              disabled
            />
          </div>
        </div>

        <div className='form-control'>
          <label className='label'>
            <span className='label-text font-bold'>Email</span>
          </label>
          <input
            name='email'
            id='email'
            autoComplete='off'
            type='text'
            value={formData.email}
            onChange={handleChange}
            className='input input-bordered w-full'
            title='Please provide a mock email address'
            disabled
          />
        </div>

        <div className='form-control'>
          <label className='label'>
            <span className='label-text font-bold'>Proxy Id</span>
          </label>
          <input
            name='proxyId'
            id='proxyId'
            autoComplete='off'
            type='text'
            value={formData.proxyId}
            onChange={handleChange}
            className='input input-bordered w-full'
            title='Please provide a mock proxy Id'
            disabled
          />
        </div>
        <div className='flex flex-col sm:flex-row gap-3'>
          <div className='form-control flex-1'>
            <label className='label'>
              <span className='label-text font-bold'>Zip Code</span>
            </label>
            <input
              name='zipCode'
              id='zipCode'
              autoComplete='off'
              type='text'
              placeholder='98101'
              value={formData.zipCode}
              onChange={handleChange}
              className='input input-bordered w-full'
              title='Please provide a mock zip code'
            />
          </div>

          <div className='form-control flex-1'>
            <label className='label'>
              <span className='label-text font-bold'>Gender</span>
            </label>
            <select
              name='gender'
              value={formData.gender}
              onChange={handleChange}
              className='w-full select select-bordered'>
              <option value=''>Select Gender</option>
              <option value='F'>F</option>
              <option value='M'>M</option>
            </select>
          </div>
        </div>
        <div className='flex flex-col sm:flex-row gap-3'>
          <div className='form-control w-full md:w-1/2'>
            <label className='label'>
              <span className='label-text font-bold'>subRelation</span>
            </label>
            <select
              name='subRelation'
              value={formData.subRelation}
              onChange={handleChange}
              className='w-full select select-bordered'>
              <option value=''>Select Sub Relation</option>
              <option value='SCRBR'>SCRBR</option>
              <option value='SPOUS'>SPOUS</option>
            </select>
          </div>
        </div>
        <section className='border border-gray-300 p-6 rounded-lg'>
          <h2 className='text-sm font-bold mb-4'>Contract</h2>
          <div className='flex flex-col sm:flex-row gap-3'>
            <div className='form-control flex-1'>
              <label className='label'>
                <span className='label-text font-bold'>State Code</span>
              </label>
              <input
                name='stateCode'
                id='stateCode'
                autoComplete='off'
                type='text'
                value={formData.stateCode}
                onChange={handleChange}
                className='input input-bordered w-full'
                title='Please provide a mock state code'
              />
            </div>
          </div>
          <div className='flex flex-col sm:flex-row gap-3'>
            <div className='form-control flex-1'>
              <label className='label'>
                <span className='label-text font-bold'>BrandCd</span>
              </label>
              <input
                name='brandCd'
                id='brandCd'
                autoComplete='off'
                type='text'
                placeholder='ABCBS'
                value={formData.brandCd}
                onChange={handleChange}
                className='input input-bordered w-full'
                title='Please provide a mock brandcd'
              />
            </div>

            <div className='form-control flex-1'>
              <label className='label'>
                <span className='label-text font-bold'>GroupId</span>
              </label>
              <input
                name='groupId'
                id='groupId'
                autoComplete='off'
                type='text'
                placeholder='98101'
                value={formData.groupId}
                onChange={handleChange}
                className='input input-bordered w-full'
                title='Please provide a mock GroupId'
              />
            </div>
          </div>
          <div className='flex flex-col sm:flex-row gap-3'>
            <div className='form-control flex-1'>
              <label className='label'>
                <span className='label-text font-bold'>underwritingStateCd</span>
              </label>
              <input
                name='underwritingStateCd'
                id='underwritingStateCd'
                autoComplete='off'
                type='text'
                value={formData.underwritingStateCd}
                onChange={handleChange}
                className='input input-bordered w-full'
                title='Please provide a mock underwritingStateCd'
              />
            </div>

            <div className='form-control flex-1'>
              <label className='label'>
                <span className='label-text font-bold'>fundingTypeCd</span>
              </label>
              <input
                name='fundingTypeCd'
                id='fundingTypeCd'
                autoComplete='off'
                type='text'
                value={formData.fundingTypeCd}
                onChange={handleChange}
                className='input input-bordered w-full'
                title='Please provide a mock fundingTypeCd'
              />
            </div>
          </div>
          <div className='flex flex-col sm:flex-row gap-3'>
            <div className='form-control flex-1'>
              <label className='label'>
                <span className='label-text font-bold'>cvrgStartDt</span>
              </label>
              <input
                name='cvrgStartDt'
                id='cvrgStartDt'
                autoComplete='off'
                type='text'
                placeholder='01/01/2025'
                value={formData.cvrgStartDt}
                onChange={handleChange}
                className='input input-bordered w-full'
                title='Please provide a mock cvrgStartDt'
              />
            </div>

            <div className='form-control flex-1'>
              <label className='label'>
                <span className='label-text font-bold'>cvrgEndDt</span>
              </label>
              <input
                name='cvrgEndDt'
                id='cvrgEndDt'
                autoComplete='off'
                type='text'
                placeholder='12/31/2025'
                value={formData.cvrgEndDt}
                onChange={handleChange}
                className='input input-bordered w-full'
                title='Please provide a mock cvrgEndDt'
              />
            </div>
          </div>
          <div className='flex flex-col sm:flex-row gap-3'>
            <div className='form-control flex-1'>
              <label className='label'>
                <span className='label-text font-bold'>programNm</span>
              </label>
              <select
                name='programNm'
                value={formData.programNm}
                onChange={handleChange}
                className='w-full select select-bordered'>
                {programOptions.map((option) => (
                  <option value={option.nm} key={option.id}>
                    {option.nm}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className='flex flex-col sm:flex-row gap-3'>
            <div className='form-control flex-1'>
              <label className='label'>
                <span className='label-text font-bold'>programId</span>
              </label>
              <input
                name='programId'
                id='programId'
                autoComplete='off'
                type='text'
                placeholder='ABCBS'
                value={formData.programId}
                onChange={handleChange}
                className='input input-bordered w-full'
                title='Please provide a mock programId'
                disabled
              />
            </div>
          </div>
        </section>

        {!hideSaveButton && (
          <button
            type='submit'
            className='btn btn-primary mt-4 w-full flex items-center justify-center'
            disabled={hasError || loading}>
            {loading && (
              <svg
                className='animate-spin h-5 w-5 mr-2 text-white'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'>
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z'></path>
              </svg>
            )}
            {loading ? 'Loading...' : 'Save'}
          </button>
        )}
      </form>
    </div>
  );
}
