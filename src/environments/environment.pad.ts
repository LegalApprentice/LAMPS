export const environment = {
  tag: 'production',
  launchServerURL: '',
  launchMarkerEndpoint: '',
  launchPadEndpoint: '',
  launchSearchEndpoint: '',
  hubURL: '',

  baseURL: '',
  baseURLAPI: '',

  searchURL: '',
  searchURLAPI: '/api/ElasticSearch',

  predictURL: '',
  libraryURL: '',
  converterURL: '',
  loginURL: '',

  localDebug: false,
  localLogin: true,
  production: true,
  version: '8.2.1',


  isLegalMarker: false,
  isLegalPad: true,
  isLegalSearch: false,

  featureflags: {
    useMockData: false
  },

  userTags: {
  },

  defaultTags: {
  },

  defaultPredictions: {
    rhetClass: {
      classification: 'Sentence',
      predictions: {
        CitationSentence: 0.0,
        EvidenceSentence: 0.0,
        FindingSentence: 0.0,
        LegalRuleSentence: 0.0,
        ReasoningSentence: 0.0,
        Sentence: 0.0
      }
    },
    polarity: {
      classification: 'undefined',
      predictions: { negative: 0.0, neutral: 0.0, positive: 0.0 }
    },
    ruleID: {
      classification: 'undefined',
      predictions: { 'SC_1': 0.0, 'SC_1.1': 0.0, 'SC_1.2': 0.0, 'SC_1.3': 0.0 }
    }
  }
};
