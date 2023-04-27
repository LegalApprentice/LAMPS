
export const environment = {
  tag: 'development',
  launchServerURL: '',
  launchMarkerEndpoint: '',
  launchPadEndpoint: '',
  launchSearchEndpoint: '',
  hubURL: '',

  baseURL: 'https://localhost:44360',
  baseURLAPI: '',

  searchURL: '',
  searchURLAPI: '/api/ElasticSearch',

  predictURL: '',
  libraryURL: '',
  converterURL: '',
  loginURL: '',

  localDebug: false,
  localLogin: true,
  production: false,
  version: '8.1.3a',


  isLegalMarker: true,
  isLegalPad: false,
  isLegalSearch: false,

  featureflags: {
    useMockData: true
  },

  defaultTags: {
    "attribution": "type:[Finding,Evidence,LegalRule,Reasoning,Citation];cue;subject;object",
  },

  userTags: {
  },

  defaultPredictions: {
    rhetClass: {
      classification: 'Sentence',
      predictions: {
        FindingSentence: 0.0,
        EvidenceSentence: 0.0,
        LegalRuleSentence: 0.0,
        ReasoningSentence: 0.0,
        CitationSentence: 0.0,
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

