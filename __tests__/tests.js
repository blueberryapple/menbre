import expected from './expected.json';
import request from './request.json';
import { testableSkill } from '../index.js';

const { userAgent, ...expectedNoUserAgent } = expected;

describe('handler', () => {
    test('launch request matches', async () => {
        const { userAgent, ...resp } = await testableSkill.invoke(request);
        expect(resp).toEqual(expectedNoUserAgent);
    });
});
