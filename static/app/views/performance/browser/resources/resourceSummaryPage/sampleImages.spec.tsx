import {OrganizationFixture} from 'sentry-fixture/organization';
import {ProjectFixture} from 'sentry-fixture/project';

import {render, screen, waitForElementToBeRemoved} from 'sentry-test/reactTestingLibrary';

import ProjectsStore from 'sentry/stores/projectsStore';
import {DetailedOrganization} from 'sentry/types';
import {useLocation} from 'sentry/utils/useLocation';
import useOrganization from 'sentry/utils/useOrganization';
import usePageFilters from 'sentry/utils/usePageFilters';
import SampleImages from 'sentry/views/performance/browser/resources/resourceSummaryPage/sampleImages';
import {SpanMetricsField} from 'sentry/views/starfish/types';

const {SPAN_GROUP, HTTP_RESPONSE_CONTENT_LENGTH, SPAN_DESCRIPTION} = SpanMetricsField;

jest.mock('sentry/utils/useLocation');
jest.mock('sentry/utils/usePageFilters');
jest.mock('sentry/utils/useOrganization');

describe('SampleImages', function () {
  const organization = OrganizationFixture({
    features: [
      'starfish-browser-resource-module-ui',
      'starfish-view',
      'performance-database-view',
    ],
  });

  beforeEach(() => {
    setupMocks(organization);
  });

  afterEach(function () {
    jest.resetAllMocks();
  });

  describe('When project setting is enabled', () => {
    beforeEach(() => {
      setupMockRequests(organization, {enableImages: true});
    });
    it('should render images', async () => {
      render(<SampleImages groupId="group123" projectId={2} />);
      await waitForElementToBeRemoved(() => screen.queryAllByTestId('loading-indicator'));

      expect(screen.queryByTestId('sample-image')).toHaveAttribute(
        'src',
        'https://cdn.com/image.png'
      );
    });
  });

  describe('When project setting is disabled', () => {
    beforeEach(() => {
      setupMockRequests(organization, {enableImages: false});
    });

    it('should ask to enable images', async () => {
      render(<SampleImages groupId="group123" projectId={2} />);
      await waitForElementToBeRemoved(() => screen.queryAllByTestId('loading-indicator'));
      expect(screen.queryByTestId('sample-image')).not.toBeInTheDocument();
      expect(screen.queryByTestId('enable-sample-images-button')).toBeInTheDocument();
    });
  });
});

const setupMocks = (organization: DetailedOrganization) => {
  const mockProjects = [ProjectFixture()];
  ProjectsStore.loadInitialData(mockProjects);

  jest.mocked(usePageFilters).mockReturnValue({
    isReady: true,
    desyncedFilters: new Set(),
    pinnedFilters: new Set(),
    shouldPersist: true,
    selection: {
      datetime: {
        period: '10d',
        start: null,
        end: null,
        utc: false,
      },
      environments: [],
      projects: [2],
    },
  });

  jest.mocked(useLocation).mockReturnValue({
    pathname: '',
    search: '',
    query: {statsPeriod: '10d'},
    hash: '',
    state: undefined,
    action: 'PUSH',
    key: '',
  });

  jest.mocked(useOrganization).mockReturnValue(organization);
};

const setupMockRequests = (
  organization: DetailedOrganization,
  settings: {enableImages: boolean} = {enableImages: true}
) => {
  const {enableImages} = settings;

  MockApiClient.addMockResponse({
    url: `/organizations/${organization.slug}/events/`,
    method: 'GET',
    match: [
      MockApiClient.matchQuery({referrer: 'api.performance.resources.sample-images'}),
    ],
    body: {
      data: [
        {
          [SPAN_GROUP]: 'group123',
          [`measurements.${HTTP_RESPONSE_CONTENT_LENGTH}`]: 1234,
          project: 'javascript',
          [SPAN_DESCRIPTION]: 'https://cdn.com/image.png',
          'any(id)': 'anyId123',
        },
      ],
    },
  });
  MockApiClient.addMockResponse({
    url: `/api/0/projects/org-slug/project-slug/performance/configure/`,
    method: 'GET',
    body: {
      enable_images: enableImages,
    },
  });
};
