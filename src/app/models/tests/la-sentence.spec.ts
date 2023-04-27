import { LaSentence } from '../la-sentence';

describe('LaSentence', () => {

  const data = {
    sentID: '1514004P26S1',
    text: 'PTSD and generalized anxiety disorder are related to service.',
    rhetRole: ['FindingSentence'],
    caseNumber: '1514004',
    paragraphNumber: '26',
    sentenceNumber: '1',
    id: 1,
    rhetClass: 'FindingSentence',
    attributions: [
      {
        type: 'Finding',
        object: 'PTSD and generalized anxiety disorder are related to service',
        cue: 'are related to service',
        polarity: 'positive'
      }
    ]
  };

  it('should create an instance', () => {
    expect(new LaSentence()).toBeTruthy();
  });

  it('should create attributions', () => {
    const sent = new LaSentence(data);
    const att = sent.attributions[0];

    expect(att.myType).toEqual('LaAttributionRelation');
    expect(att.type).toEqual('Finding');
    expect(att.cue).toEqual('are related to service');

    const poll = att.polarity;
    expect(poll).toEqual('positive');

  });
});
